"""
Tests for Reinforcement Learning Agent
"""

import pytest
import numpy as np
import torch
from unittest.mock import MagicMock, patch, PropertyMock
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sei_dlp_ai.models.rl_agent import RLAgent, VaultActionSpace, observation_to_tensor
from sei_dlp_ai.models.rl_environment import VaultEnvironment


class TestVaultActionSpace:
    """Test VaultActionSpace class"""

    def test_initialization(self):
        """Test action space initialization"""
        action_space = VaultActionSpace()
        assert action_space.n_actions == 5
        assert len(action_space.actions) == 5
        assert 'HOLD' in action_space.actions
        assert 'EXPAND_RANGE' in action_space.actions

    def test_get_action(self):
        """Test action retrieval"""
        action_space = VaultActionSpace()
        assert action_space.get_action(0) == 'HOLD'
        assert action_space.get_action(1) == 'EXPAND_RANGE'
        assert action_space.get_action(4) == 'HARVEST_FEES'

    def test_invalid_action(self):
        """Test invalid action index"""
        action_space = VaultActionSpace()
        with pytest.raises(IndexError):
            action_space.get_action(5)
        with pytest.raises(IndexError):
            action_space.get_action(-1)


class TestObservationToTensor:
    """Test observation conversion function"""

    def test_numpy_to_tensor(self, sample_observation):
        """Test numpy array to tensor conversion"""
        tensor = observation_to_tensor(sample_observation)
        assert isinstance(tensor, torch.Tensor)
        assert tensor.shape == (9,)
        assert tensor.dtype == torch.float32

    def test_list_to_tensor(self):
        """Test list to tensor conversion"""
        obs_list = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
        tensor = observation_to_tensor(obs_list)
        assert isinstance(tensor, torch.Tensor)
        assert tensor.shape == (9,)

    def test_tensor_passthrough(self):
        """Test that tensors are returned unchanged"""
        tensor = torch.randn(9)
        result = observation_to_tensor(tensor)
        assert torch.equal(result, tensor)


class TestRLAgent:
    """Test RLAgent class"""

    @pytest.fixture
    def mock_env(self):
        """Create mock environment"""
        env = MagicMock(spec=VaultEnvironment)
        env.observation_space = MagicMock()
        env.observation_space.shape = (9,)
        env.action_space = MagicMock()
        env.action_space.n = 5
        return env

    @pytest.fixture
    def agent(self, mock_env, test_config):
        """Create RL agent with mock environment"""
        with patch('sei_dlp_ai.models.rl_agent.VaultEnvironment', return_value=mock_env):
            agent = RLAgent(config=test_config)
            agent.env = mock_env
            return agent

    def test_initialization(self, agent, test_config):
        """Test agent initialization"""
        assert agent.config == test_config
        assert agent.device == 'cpu'
        assert agent.model is not None
        assert agent.action_space.n_actions == 5

    def test_select_action_exploration(self, agent, sample_observation):
        """Test action selection with exploration"""
        action, log_prob = agent.select_action(sample_observation, explore=True)
        assert 0 <= action < 5
        assert log_prob is None or isinstance(log_prob, torch.Tensor)

    def test_select_action_exploitation(self, agent, sample_observation):
        """Test action selection without exploration"""
        with patch.object(agent.model, 'forward') as mock_forward:
            mock_policy = torch.nn.functional.softmax(torch.randn(1, 5), dim=-1)
            mock_value = torch.tensor([[1.0]])
            mock_forward.return_value = (mock_policy, mock_value)

            action, log_prob = agent.select_action(sample_observation, explore=False)
            assert 0 <= action < 5
            assert isinstance(log_prob, torch.Tensor)

    def test_train_step(self, agent, mock_env):
        """Test single training step"""
        mock_env.reset.return_value = (np.random.randn(9), {})
        mock_env.step.return_value = (np.random.randn(9), 10.0, False, False, {})

        with patch.object(agent, '_collect_rollouts') as mock_collect:
            mock_collect.return_value = (
                [torch.randn(128, 9)],  # states
                [torch.randint(0, 5, (128,))],  # actions
                [torch.randn(128)],  # rewards
                [torch.randn(128)],  # values
                [torch.randn(128)]   # log_probs
            )

            loss = agent.train(n_steps=128)
            assert isinstance(loss, float)
            mock_collect.assert_called_once()

    def test_evaluate(self, agent, mock_env):
        """Test agent evaluation"""
        mock_env.reset.return_value = (np.random.randn(9), {})
        mock_env.step.return_value = (np.random.randn(9), 10.0, True, False, {})

        rewards, actions = agent.evaluate(n_episodes=5)
        assert len(rewards) == 5
        assert len(actions) == 5
        assert all(isinstance(r, (int, float)) for r in rewards)

    def test_save_load_model(self, agent, tmp_path, sample_observation):
        """Test model saving and loading"""
        # Save model
        save_path = tmp_path / "test_model.pt"
        agent.save_model(str(save_path))
        assert save_path.exists()

        # Get prediction before loading
        action1, _ = agent.select_action(sample_observation, explore=False)

        # Create new agent and load model
        with patch('sei_dlp_ai.models.rl_agent.VaultEnvironment', return_value=agent.env):
            new_agent = RLAgent(config=agent.config)
            new_agent.load_model(str(save_path))

            # Get prediction after loading
            action2, _ = new_agent.select_action(sample_observation, explore=False)

            # Should produce same action with same observation
            assert action1 == action2

    def test_update_epsilon(self, agent):
        """Test epsilon decay"""
        initial_epsilon = agent.epsilon
        agent.update_epsilon()
        assert agent.epsilon < initial_epsilon

        # Test minimum epsilon
        agent.epsilon = 0.01
        agent.update_epsilon()
        assert agent.epsilon == 0.01

    def test_compute_gae(self, agent):
        """Test Generalized Advantage Estimation"""
        rewards = torch.tensor([1.0, 2.0, 3.0, 4.0, 5.0])
        values = torch.tensor([0.9, 1.9, 2.9, 3.9, 4.9])
        dones = torch.tensor([0.0, 0.0, 0.0, 1.0, 0.0])

        advantages = agent._compute_gae(rewards, values, dones)
        assert advantages.shape == rewards.shape
        assert advantages.dtype == torch.float32

    def test_collect_rollouts(self, agent, mock_env):
        """Test rollout collection"""
        mock_env.reset.return_value = (np.random.randn(9), {})
        mock_env.step.return_value = (np.random.randn(9), 10.0, False, False, {})

        states, actions, rewards, values, log_probs = agent._collect_rollouts(n_steps=10)

        assert len(states) == 10
        assert len(actions) == 10
        assert len(rewards) == 10
        assert len(values) == 10
        assert len(log_probs) == 10

    def test_compute_returns(self, agent):
        """Test return computation"""
        rewards = torch.tensor([1.0, 2.0, 3.0, 4.0, 5.0])
        dones = torch.tensor([0.0, 0.0, 0.0, 1.0, 0.0])

        returns = agent._compute_returns(rewards, dones)
        assert returns.shape == rewards.shape
        assert returns[-1] == rewards[-1]  # Last return should equal last reward

    def test_action_mapping(self, agent):
        """Test action to string mapping"""
        actions = {
            0: 'HOLD',
            1: 'EXPAND_RANGE',
            2: 'NARROW_RANGE',
            3: 'SHIFT_RANGE',
            4: 'HARVEST_FEES'
        }

        for action_idx, action_name in actions.items():
            assert agent.action_space.get_action(action_idx) == action_name

    @patch('sei_dlp_ai.models.rl_agent.PPO')
    def test_stable_baselines_integration(self, mock_ppo, mock_env):
        """Test integration with stable-baselines3"""
        agent = RLAgent(config={'use_sb3': True})
        mock_ppo.assert_called_once()

    def test_invalid_observation_shape(self, agent):
        """Test handling of invalid observation shapes"""
        invalid_obs = np.random.randn(5)  # Wrong shape
        with pytest.raises(Exception):
            agent.select_action(invalid_obs)

    def test_gradient_accumulation(self, agent):
        """Test gradient accumulation during training"""
        initial_params = [p.clone() for p in agent.model.parameters()]

        # Mock rollout data
        with patch.object(agent, '_collect_rollouts') as mock_collect:
            mock_collect.return_value = (
                [torch.randn(10, 9)],
                [torch.randint(0, 5, (10,))],
                [torch.randn(10)],
                [torch.randn(10)],
                [torch.randn(10)]
            )

            agent.train(n_steps=10)

            # Check that parameters have been updated
            current_params = [p for p in agent.model.parameters()]
            params_changed = any(
                not torch.equal(init_p, curr_p)
                for init_p, curr_p in zip(initial_params, current_params)
            )
            assert params_changed or len(initial_params) == 0