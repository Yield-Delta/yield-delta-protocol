"""
Reinforcement Learning Agent for DeFi Vault Strategy
Uses PPO (Proximal Policy Optimization) for continuous action space
"""

import numpy as np
import torch
import torch.nn as nn
from stable_baselines3 import PPO
from stable_baselines3.common.callbacks import BaseCallback, EvalCallback, CheckpointCallback
from stable_baselines3.common.vec_env import DummyVecEnv, VecNormalize
from stable_baselines3.common.evaluation import evaluate_policy
from stable_baselines3.common.monitor import Monitor
from typing import Dict, Any, Optional, Tuple, List
import logging
import os
from datetime import datetime
import json

from .rl_environment import DeFiTradingEnv

logger = logging.getLogger(__name__)


class CustomPolicy(nn.Module):
    """
    Custom policy network for DeFi trading
    Incorporates domain knowledge into the architecture
    """

    def __init__(self, observation_dim: int, action_dim: int, hidden_dim: int = 256):
        super().__init__()

        # Feature extraction layers
        self.feature_extractor = nn.Sequential(
            nn.Linear(observation_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1)
        )

        # Attention mechanism for feature importance
        self.attention = nn.MultiheadAttention(hidden_dim, num_heads=4, batch_first=True)

        # Policy head (actor)
        self.policy_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, action_dim * 2)  # Mean and std for each action
        )

        # Value head (critic)
        self.value_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1)
        )

    def forward(self, obs: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        # Extract features
        features = self.feature_extractor(obs)

        # Apply self-attention
        features_reshaped = features.unsqueeze(1)  # Add sequence dimension
        attended_features, _ = self.attention(features_reshaped, features_reshaped, features_reshaped)
        features = features + attended_features.squeeze(1)  # Residual connection

        # Get policy parameters
        policy_params = self.policy_head(features)
        action_dim = policy_params.shape[-1] // 2
        mean = policy_params[:, :action_dim]
        log_std = policy_params[:, action_dim:]
        log_std = torch.clamp(log_std, -20, 2)  # Stability

        # Get value estimate
        value = self.value_head(features)

        return mean, torch.exp(log_std), value


class TensorBoardCallback(BaseCallback):
    """Custom callback for TensorBoard logging"""

    def __init__(self, verbose=0):
        super().__init__(verbose)
        self.episode_rewards = []
        self.episode_lengths = []

    def _on_step(self) -> bool:
        # Log custom metrics
        if self.locals.get("infos"):
            for info in self.locals["infos"]:
                if "episode" in info:
                    self.logger.record("rollout/ep_reward", info["episode"]["r"])
                    self.logger.record("rollout/ep_length", info["episode"]["l"])

                # Log custom DeFi metrics
                if "fees_collected" in info:
                    self.logger.record("defi/fees_collected", info["fees_collected"])
                if "total_il" in info:
                    self.logger.record("defi/impermanent_loss", info["total_il"])
                if "time_in_range_ratio" in info:
                    self.logger.record("defi/time_in_range", info["time_in_range_ratio"])
                if "capital" in info:
                    self.logger.record("defi/capital", info["capital"])

        return True


class DeFiRLAgent:
    """
    Reinforcement Learning Agent for DeFi Vault Management
    """

    def __init__(self,
                 model_name: str = "defi_ppo_agent",
                 learning_rate: float = 3e-4,
                 batch_size: int = 64,
                 n_steps: int = 2048,
                 n_epochs: int = 10,
                 gamma: float = 0.99,
                 device: str = "auto"):
        """
        Initialize the RL agent

        Args:
            model_name: Name for saving/loading model
            learning_rate: Learning rate for PPO
            batch_size: Batch size for training
            n_steps: Number of steps to collect before update
            n_epochs: Number of epochs for PPO update
            gamma: Discount factor
            device: Device to use (cpu/cuda/auto)
        """
        self.model_name = model_name
        self.learning_rate = learning_rate
        self.batch_size = batch_size
        self.n_steps = n_steps
        self.n_epochs = n_epochs
        self.gamma = gamma
        self.device = device

        self.model: Optional[PPO] = None
        self.env: Optional[DeFiTradingEnv] = None
        self.vec_env: Optional[VecNormalize] = None

        # Paths for saving
        self.save_path = f"models/rl/{model_name}"
        os.makedirs(self.save_path, exist_ok=True)

    def create_environment(self, historical_data: Optional[np.ndarray] = None) -> DeFiTradingEnv:
        """Create and return the DeFi trading environment"""
        env = DeFiTradingEnv(
            historical_data=historical_data,
            initial_capital=10000.0,
            fee_tier=0.003,
            gas_cost=5.0,
            max_steps=1000
        )
        return env

    def setup_training(self, historical_data: Optional[np.ndarray] = None):
        """Setup environment and model for training"""
        # Create environment
        self.env = self.create_environment(historical_data)

        # Wrap in monitor for logging
        self.env = Monitor(self.env)

        # Create vectorized environment
        vec_env = DummyVecEnv([lambda: self.env])

        # Normalize observations and rewards
        self.vec_env = VecNormalize(vec_env, norm_obs=True, norm_reward=True, gamma=self.gamma)

        # Create PPO model
        self.model = PPO(
            policy="MlpPolicy",
            env=self.vec_env,
            learning_rate=self.learning_rate,
            n_steps=self.n_steps,
            batch_size=self.batch_size,
            n_epochs=self.n_epochs,
            gamma=self.gamma,
            gae_lambda=0.95,
            clip_range=0.2,
            clip_range_vf=None,
            ent_coef=0.01,  # Entropy coefficient for exploration
            vf_coef=0.5,  # Value function coefficient
            max_grad_norm=0.5,
            use_sde=True,  # State Dependent Exploration
            sde_sample_freq=4,
            tensorboard_log=f"./tensorboard/{self.model_name}",
            device=self.device,
            verbose=1
        )

        logger.info(f"Training environment setup complete for {self.model_name}")

    def train(self,
              total_timesteps: int = 1000000,
              eval_freq: int = 10000,
              save_freq: int = 50000,
              historical_data: Optional[np.ndarray] = None):
        """
        Train the RL agent

        Args:
            total_timesteps: Total training timesteps
            eval_freq: Frequency of evaluation
            save_freq: Frequency of model saving
            historical_data: Historical price/volume data for training
        """
        if self.model is None:
            self.setup_training(historical_data)

        # Setup callbacks
        callbacks = []

        # Evaluation callback
        eval_env = self.create_environment(historical_data)
        eval_env = Monitor(eval_env)
        eval_callback = EvalCallback(
            eval_env,
            best_model_save_path=os.path.join(self.save_path, "best"),
            log_path=os.path.join(self.save_path, "eval"),
            eval_freq=eval_freq,
            deterministic=True,
            render=False,
            n_eval_episodes=10
        )
        callbacks.append(eval_callback)

        # Checkpoint callback
        checkpoint_callback = CheckpointCallback(
            save_freq=save_freq,
            save_path=os.path.join(self.save_path, "checkpoints"),
            name_prefix=self.model_name,
            save_replay_buffer=True,
            save_vecnormalize=True
        )
        callbacks.append(checkpoint_callback)

        # TensorBoard callback
        tb_callback = TensorBoardCallback()
        callbacks.append(tb_callback)

        # Train the model
        logger.info(f"Starting training for {total_timesteps} timesteps...")
        self.model.learn(
            total_timesteps=total_timesteps,
            callback=callbacks,
            log_interval=100,
            tb_log_name=f"{self.model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        )

        # Save final model
        self.save_model("final")
        logger.info("Training complete!")

    def save_model(self, suffix: str = ""):
        """Save the trained model"""
        if self.model is None:
            logger.error("No model to save")
            return

        save_name = f"{self.model_name}_{suffix}" if suffix else self.model_name
        model_path = os.path.join(self.save_path, f"{save_name}.zip")
        vec_norm_path = os.path.join(self.save_path, f"{save_name}_vec_norm.pkl")

        # Save model
        self.model.save(model_path)

        # Save normalization statistics
        if self.vec_env is not None:
            self.vec_env.save(vec_norm_path)

        # Save metadata
        metadata = {
            "model_name": self.model_name,
            "timestamp": datetime.now().isoformat(),
            "learning_rate": self.learning_rate,
            "batch_size": self.batch_size,
            "n_steps": self.n_steps,
            "n_epochs": self.n_epochs,
            "gamma": self.gamma
        }

        metadata_path = os.path.join(self.save_path, f"{save_name}_metadata.json")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        logger.info(f"Model saved to {model_path}")

    def load_model(self, model_path: str):
        """Load a trained model"""
        # Load model
        self.model = PPO.load(model_path, device=self.device)

        # Try to load normalization statistics
        vec_norm_path = model_path.replace(".zip", "_vec_norm.pkl")
        if os.path.exists(vec_norm_path):
            # Create dummy env for loading vec_norm
            env = self.create_environment()
            vec_env = DummyVecEnv([lambda: env])
            self.vec_env = VecNormalize.load(vec_norm_path, vec_env)
            self.model.set_env(self.vec_env)

        logger.info(f"Model loaded from {model_path}")

    def predict(self, observation: np.ndarray, deterministic: bool = True) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Make a prediction using the trained model

        Args:
            observation: Current observation state
            deterministic: Whether to use deterministic policy

        Returns:
            action: Predicted action
            info: Additional information
        """
        if self.model is None:
            raise ValueError("No model loaded. Train or load a model first.")

        # Normalize observation if vec_env exists
        if self.vec_env is not None:
            observation = self.vec_env.normalize_obs(observation)

        # Predict action
        action, _states = self.model.predict(observation, deterministic=deterministic)

        # Prepare info
        info = {
            "lower_adjustment": float(action[0] * 10),  # Convert back to price units
            "upper_adjustment": float(action[1] * 10),
            "rebalance_ratio": float((action[2] + 1) / 2),  # Convert to [0, 1]
            "should_rebalance": abs(action[0]) > 0.3 or abs(action[1]) > 0.3
        }

        return action, info

    def evaluate(self, n_eval_episodes: int = 100, render: bool = False) -> Dict[str, float]:
        """
        Evaluate the trained model

        Args:
            n_eval_episodes: Number of evaluation episodes
            render: Whether to render the environment

        Returns:
            metrics: Evaluation metrics
        """
        if self.model is None:
            raise ValueError("No model loaded. Train or load a model first.")

        # Create evaluation environment
        eval_env = self.create_environment()
        if render:
            eval_env.render_mode = "human"

        # Evaluate
        mean_reward, std_reward = evaluate_policy(
            self.model,
            eval_env,
            n_eval_episodes=n_eval_episodes,
            render=render,
            deterministic=True,
            return_episode_rewards=False
        )

        # Collect detailed metrics
        metrics = {
            "mean_reward": mean_reward,
            "std_reward": std_reward,
            "episodes_evaluated": n_eval_episodes
        }

        # Run episodes to collect DeFi-specific metrics
        total_fees = 0
        total_il = 0
        total_capital_ratio = 0
        total_time_in_range = 0

        for _ in range(min(10, n_eval_episodes)):
            obs, _ = eval_env.reset()
            done = False

            while not done:
                action, _ = self.model.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = eval_env.step(action)
                done = terminated or truncated

            # Collect episode metrics
            total_fees += info["fees_collected"]
            total_il += abs(info["total_il"])
            total_capital_ratio += info["capital"] / eval_env.initial_capital
            total_time_in_range += info["time_in_range_ratio"]

        # Average metrics
        n_detailed = min(10, n_eval_episodes)
        metrics.update({
            "avg_fees_collected": total_fees / n_detailed,
            "avg_impermanent_loss": total_il / n_detailed,
            "avg_capital_ratio": total_capital_ratio / n_detailed,
            "avg_time_in_range": total_time_in_range / n_detailed
        })

        logger.info(f"Evaluation Results:\n{json.dumps(metrics, indent=2)}")
        return metrics