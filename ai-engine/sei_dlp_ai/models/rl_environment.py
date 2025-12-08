"""
Reinforcement Learning Environment for DeFi Vault Strategy Optimization
Implements a custom Gymnasium environment for training RL agents
"""

import numpy as np
import gymnasium as gym
from gymnasium import spaces
from typing import Dict, Any, Tuple, Optional, List
from dataclasses import dataclass
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

@dataclass
class VaultState:
    """Current state of the vault"""
    current_price: float
    lower_bound: float
    upper_bound: float
    liquidity: float
    fees_earned: float
    impermanent_loss: float
    utilization_rate: float
    volatility: float
    volume_24h: float
    timestamp: int


class DeFiTradingEnv(gym.Env):
    """
    Custom Environment for DeFi Vault Strategy Optimization

    Action Space:
    - Continuous: [new_lower_range, new_upper_range, rebalance_amount]

    Observation Space:
    - price_ratio: current_price / initial_price
    - range_utilization: how much of the range is being used
    - volatility: rolling volatility (normalized)
    - volume: 24h volume (normalized)
    - fees_earned: cumulative fees (normalized)
    - impermanent_loss: current IL (normalized)
    - time_in_range: percentage of time price was in range
    - price_momentum: price change momentum
    - liquidity_depth: current liquidity depth
    """

    metadata = {"render_modes": ["human"], "name": "DeFiVaultStrategy-v1"}

    def __init__(self,
                 historical_data: Optional[np.ndarray] = None,
                 initial_capital: float = 10000.0,
                 fee_tier: float = 0.003,
                 gas_cost: float = 5.0,
                 max_steps: int = 1000,
                 render_mode: Optional[str] = None):
        """
        Initialize the DeFi trading environment

        Args:
            historical_data: Historical price/volume data
            initial_capital: Starting capital in USD
            fee_tier: Trading fee tier (0.3% = 0.003)
            gas_cost: Gas cost per rebalance in USD
            max_steps: Maximum steps per episode
            render_mode: Rendering mode
        """
        super().__init__()

        self.initial_capital = initial_capital
        self.fee_tier = fee_tier
        self.gas_cost = gas_cost
        self.max_steps = max_steps
        self.render_mode = render_mode

        # Historical data for simulation
        if historical_data is None:
            # Generate synthetic data for testing
            self.historical_data = self._generate_synthetic_data()
        else:
            self.historical_data = historical_data

        # Define action space: [lower_range_adjustment, upper_range_adjustment, rebalance_ratio]
        # All normalized to [-1, 1]
        self.action_space = spaces.Box(
            low=np.array([-1.0, -1.0, -1.0]),
            high=np.array([1.0, 1.0, 1.0]),
            dtype=np.float32
        )

        # Define observation space (9 features)
        self.observation_space = spaces.Box(
            low=np.array([0.0, 0.0, 0.0, 0.0, -1.0, -1.0, 0.0, -1.0, 0.0]),
            high=np.array([10.0, 1.0, 1.0, 10.0, 10.0, 0.0, 1.0, 1.0, 10.0]),
            dtype=np.float32
        )

        # Initialize state variables
        self.current_step = 0
        self.current_capital = initial_capital
        self.position_value = 0.0
        self.fees_collected = 0.0
        self.total_gas_spent = 0.0
        self.current_price = 100.0
        self.lower_bound = 90.0
        self.upper_bound = 110.0
        self.time_in_range = 0
        self.total_il = 0.0

        # Performance tracking
        self.episode_rewards = []
        self.price_history = []
        self.action_history = []

    def _generate_synthetic_data(self) -> np.ndarray:
        """Generate synthetic price data for testing"""
        np.random.seed(42)
        n_steps = self.max_steps

        # Generate price data with trend and volatility
        returns = np.random.normal(0.0001, 0.02, n_steps)
        prices = 100 * np.exp(np.cumsum(returns))

        # Generate volume data
        volumes = np.random.lognormal(15, 1, n_steps)

        # Combine into dataset
        data = np.column_stack([prices, volumes])
        return data

    def _calculate_impermanent_loss(self, price_start: float, price_end: float) -> float:
        """Calculate impermanent loss for a price movement"""
        price_ratio = price_end / price_start
        il = 2 * np.sqrt(price_ratio) / (1 + price_ratio) - 1
        return il

    def _calculate_fees(self, volume: float, in_range: bool) -> float:
        """Calculate fees earned based on volume and range"""
        if not in_range:
            return 0.0

        # Simplified fee calculation
        # In reality, this would depend on liquidity concentration
        concentration_multiplier = 1.0 / (self.upper_bound - self.lower_bound) * 20
        fees = volume * self.fee_tier * concentration_multiplier
        return min(fees, volume * 0.01)  # Cap at 1% of volume

    def _get_observation(self) -> np.ndarray:
        """Get current observation state"""
        # Calculate normalized features
        price_ratio = self.current_price / 100.0  # Normalized to initial price

        # Range utilization
        if self.lower_bound <= self.current_price <= self.upper_bound:
            range_position = (self.current_price - self.lower_bound) / (self.upper_bound - self.lower_bound)
            range_utilization = 1.0 - abs(range_position - 0.5) * 2  # Higher when centered
        else:
            range_utilization = 0.0

        # Calculate volatility (simplified)
        if self.current_step > 20:
            recent_prices = self.price_history[-20:]
            returns = np.diff(recent_prices) / recent_prices[:-1]
            volatility = np.std(returns)
        else:
            volatility = 0.02

        # Normalize volume
        current_volume = self.historical_data[self.current_step, 1]
        normalized_volume = np.log10(current_volume + 1) / 20.0

        # Normalize fees and IL
        normalized_fees = self.fees_collected / self.initial_capital
        normalized_il = self.total_il

        # Time in range ratio
        time_in_range_ratio = self.time_in_range / max(self.current_step, 1)

        # Price momentum
        if len(self.price_history) > 10:
            price_momentum = (self.current_price - self.price_history[-10]) / self.price_history[-10]
        else:
            price_momentum = 0.0

        # Liquidity depth (simplified)
        liquidity_depth = self.current_capital / self.initial_capital

        observation = np.array([
            price_ratio,
            range_utilization,
            volatility,
            normalized_volume,
            normalized_fees,
            normalized_il,
            time_in_range_ratio,
            price_momentum,
            liquidity_depth
        ], dtype=np.float32)

        return observation

    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        """
        Execute one step in the environment

        Args:
            action: [lower_adjustment, upper_adjustment, rebalance_ratio]

        Returns:
            observation: New state observation
            reward: Reward for the action
            terminated: Whether episode is done
            truncated: Whether episode was truncated
            info: Additional information
        """
        # Parse actions
        lower_adjustment = action[0] * 10  # Scale to price units
        upper_adjustment = action[1] * 10
        rebalance_ratio = (action[2] + 1) / 2  # Convert to [0, 1]

        # Store previous values
        prev_capital = self.current_capital
        prev_price = self.current_price

        # Update price from historical data
        self.current_step += 1
        if self.current_step >= len(self.historical_data):
            self.current_step = len(self.historical_data) - 1

        self.current_price = self.historical_data[self.current_step, 0]
        current_volume = self.historical_data[self.current_step, 1]
        self.price_history.append(self.current_price)

        # Check if rebalancing (action magnitude determines if rebalancing)
        rebalance_threshold = 0.3
        is_rebalancing = abs(action[0]) > rebalance_threshold or abs(action[1]) > rebalance_threshold

        if is_rebalancing:
            # Apply gas cost
            self.total_gas_spent += self.gas_cost
            self.current_capital -= self.gas_cost

            # Update range
            self.lower_bound = max(self.current_price * 0.5, self.current_price + lower_adjustment)
            self.upper_bound = min(self.current_price * 1.5, self.current_price + upper_adjustment)

            # Ensure valid range
            if self.lower_bound >= self.upper_bound:
                self.lower_bound = self.current_price * 0.9
                self.upper_bound = self.current_price * 1.1

        # Check if price is in range
        in_range = self.lower_bound <= self.current_price <= self.upper_bound
        if in_range:
            self.time_in_range += 1

        # Calculate fees
        fees = self._calculate_fees(current_volume, in_range)
        self.fees_collected += fees
        self.current_capital += fees

        # Calculate impermanent loss
        il = self._calculate_impermanent_loss(prev_price, self.current_price)
        self.total_il += il
        il_cost = abs(il) * self.position_value * 0.5  # Simplified IL cost
        self.current_capital -= il_cost

        # Update position value
        self.position_value = self.current_capital * rebalance_ratio

        # Calculate reward
        reward = self._calculate_reward(
            fees=fees,
            il_cost=il_cost,
            gas_cost=self.gas_cost if is_rebalancing else 0,
            in_range=in_range
        )

        # Check termination conditions
        terminated = False
        if self.current_capital <= 0:
            terminated = True
            reward -= 100  # Penalty for bankruptcy

        truncated = self.current_step >= self.max_steps - 1

        # Get new observation
        observation = self._get_observation()

        # Additional info
        info = {
            "current_price": self.current_price,
            "lower_bound": self.lower_bound,
            "upper_bound": self.upper_bound,
            "fees_collected": self.fees_collected,
            "total_il": self.total_il,
            "capital": self.current_capital,
            "in_range": in_range,
            "time_in_range_ratio": self.time_in_range / self.current_step if self.current_step > 0 else 0
        }

        return observation, reward, terminated, truncated, info

    def _calculate_reward(self, fees: float, il_cost: float, gas_cost: float, in_range: bool) -> float:
        """
        Calculate step reward based on multiple factors

        Reward components:
        - Fees earned (positive)
        - Impermanent loss (negative)
        - Gas costs (negative)
        - Time in range bonus (positive)
        - Capital preservation bonus (positive)
        """
        # Fee reward (scaled)
        fee_reward = fees * 10

        # IL penalty (scaled)
        il_penalty = -il_cost * 5

        # Gas penalty
        gas_penalty = -gas_cost * 0.1

        # In-range bonus
        range_bonus = 1.0 if in_range else -0.5

        # Capital preservation bonus
        capital_ratio = self.current_capital / self.initial_capital
        if capital_ratio > 1.0:
            capital_bonus = (capital_ratio - 1.0) * 10
        else:
            capital_bonus = (capital_ratio - 1.0) * 20  # Larger penalty for losses

        # Total reward
        reward = fee_reward + il_penalty + gas_penalty + range_bonus + capital_bonus

        return reward

    def reset(self, *, seed: Optional[int] = None, options: Optional[Dict[str, Any]] = None) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Reset the environment to initial state

        Args:
            seed: Random seed for reproducibility
            options: Additional options for reset

        Returns:
            observation: Initial observation
            info: Additional information
        """
        # Call parent reset with seed
        super().reset(seed=seed, options=options)

        # Reset state variables
        self.current_step = 0
        self.current_capital = self.initial_capital
        self.position_value = self.initial_capital * 0.5
        self.fees_collected = 0.0
        self.total_gas_spent = 0.0
        self.current_price = self.historical_data[0, 0] if len(self.historical_data) > 0 else 100.0
        self.lower_bound = self.current_price * 0.9
        self.upper_bound = self.current_price * 1.1
        self.time_in_range = 0
        self.total_il = 0.0

        # Reset tracking
        self.episode_rewards = []
        self.price_history = [self.current_price]
        self.action_history = []

        observation = self._get_observation()
        info = {
            "current_price": self.current_price,
            "initial_capital": self.initial_capital
        }

        return observation, info

    def render(self):
        """Render the environment (for debugging)"""
        if self.render_mode == "human":
            print(f"\n=== Step {self.current_step} ===")
            print(f"Price: ${self.current_price:.2f} (Range: ${self.lower_bound:.2f} - ${self.upper_bound:.2f})")
            print(f"Capital: ${self.current_capital:.2f}")
            print(f"Fees Collected: ${self.fees_collected:.2f}")
            print(f"Impermanent Loss: {self.total_il:.4f}")
            print(f"Time in Range: {self.time_in_range}/{self.current_step} ({self.time_in_range/max(self.current_step,1)*100:.1f}%)")

    def close(self):
        """Clean up environment"""
        pass