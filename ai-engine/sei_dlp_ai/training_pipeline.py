"""
Comprehensive Training Pipeline for all ML Models
Orchestrates training of RL, LSTM, and Random Forest models
"""

import numpy as np
import pandas as pd
import asyncio
import logging
import json
import os
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import yfinance as yf
import ta
from pathlib import Path

from sei_dlp_ai.models.rl_agent import DeFiRLAgent
from sei_dlp_ai.models.lstm_forecaster import LSTMForecaster
from sei_dlp_ai.models.impermanent_loss_predictor import ImpermanentLossPredictor
from sei_dlp_ai.models.rl_environment import DeFiTradingEnv

logger = logging.getLogger(__name__)


class MLTrainingPipeline:
    """
    Complete training pipeline for all ML models
    Handles data collection, preprocessing, training, and evaluation
    """

    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize training pipeline

        Args:
            config_path: Path to configuration file
        """
        self.config = self._load_config(config_path)
        self.data_path = Path(self.config.get('data_path', 'data/'))
        self.models_path = Path(self.config.get('models_path', 'models/'))

        # Ensure directories exist
        self.data_path.mkdir(parents=True, exist_ok=True)
        self.models_path.mkdir(parents=True, exist_ok=True)

        # Initialize models
        self.rl_agent = None
        self.lstm_forecaster = None
        self.il_predictor = None

        # Data storage
        self.historical_data = None  # Will be populated with DataFrame after fetch
        self.processed_data = {}

    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Load configuration from file or use defaults"""
        default_config = {
            'data_path': 'data/',
            'models_path': 'models/',
            'symbols': ['SEI-USD', 'ETH-USD', 'BTC-USD', 'USDC-USD'],
            'data_period': '6mo',
            'data_interval': '1h',
            'train_test_split': 0.8,
            'validation_split': 0.2,
            'rl_config': {
                'total_timesteps': 100000,
                'eval_freq': 5000,
                'save_freq': 10000
            },
            'lstm_config': {
                'sequence_length': 168,  # 7 days
                'prediction_horizon': 24,  # 24 hours
                'epochs': 100,
                'batch_size': 32
            },
            'il_config': {
                'n_estimators': 200,
                'optimize_hyperparameters': True,
                'feature_selection': True
            }
        }

        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)

        return default_config

    async def fetch_historical_data(self, symbols: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Fetch historical price data for training

        Args:
            symbols: List of symbols to fetch (e.g., ['SEI-USD', 'ETH-USD'])

        Returns:
            Combined DataFrame with all price data
        """
        if symbols is None:
            symbols = self.config['symbols']

        logger.info(f"Fetching historical data for {symbols}")

        all_data = []

        for symbol in symbols:
            try:
                # Fetch data using yfinance
                ticker = yf.Ticker(symbol)
                df = ticker.history(
                    period=self.config['data_period'],
                    interval=self.config['data_interval']
                )

                if not df.empty:
                    # Add technical indicators
                    df['returns'] = df['Close'].pct_change()
                    df['volatility'] = df['returns'].rolling(window=24).std()
                    df['volume_ma'] = df['Volume'].rolling(window=24).mean()

                    # Add more technical indicators using ta library
                    df['rsi'] = ta.momentum.RSIIndicator(df['Close'], window=14).rsi()
                    df['macd'] = ta.trend.MACD(df['Close']).macd()
                    df['bb_upper'] = ta.volatility.BollingerBands(df['Close']).bollinger_hband()
                    df['bb_lower'] = ta.volatility.BollingerBands(df['Close']).bollinger_lband()
                    df['atr'] = ta.volatility.AverageTrueRange(df['High'], df['Low'], df['Close']).average_true_range()

                    # Store with symbol prefix
                    df.columns = [f"{symbol}_{col}" for col in df.columns]
                    all_data.append(df)

                    logger.info(f"Fetched {len(df)} records for {symbol}")
                else:
                    logger.warning(f"No data received for {symbol}")

            except Exception as e:
                logger.error(f"Error fetching data for {symbol}: {e}")

        if all_data:
            # Combine all dataframes
            combined_df = pd.concat(all_data, axis=1)
            combined_df.ffill(inplace=True)
            combined_df.bfill(inplace=True)

            # Save to disk
            data_file = self.data_path / f"historical_data_{datetime.now().strftime('%Y%m%d')}.csv"
            combined_df.to_csv(data_file)
            logger.info(f"Saved historical data to {data_file}")

            self.historical_data = combined_df
            return combined_df
        else:
            raise ValueError("No data fetched for any symbol")

    def prepare_rl_data(self) -> np.ndarray:
        """
        Prepare data for reinforcement learning training

        Returns:
            Numpy array with price and volume data
        """
        if self.historical_data is None or self.historical_data.empty:
            raise ValueError("No historical data available. Run fetch_historical_data first.")

        # Extract SEI data for RL environment
        sei_cols = [col for col in self.historical_data.columns if 'SEI' in col]

        if not sei_cols:
            # Use first available symbol
            symbol_prefix = self.config['symbols'][0].replace('-USD', '')
            sei_cols = [col for col in self.historical_data.columns if symbol_prefix in col]

        # Get price and volume columns
        price_col = [col for col in sei_cols if 'Close' in col][0]
        volume_col = [col for col in sei_cols if 'Volume' in col][0]

        # Prepare data array
        rl_data = np.column_stack([
            self.historical_data[price_col].values,
            self.historical_data[volume_col].values
        ])

        # Remove NaN values
        rl_data = rl_data[~np.isnan(rl_data).any(axis=1)]

        self.processed_data['rl'] = rl_data
        logger.info(f"Prepared RL data with shape: {rl_data.shape}")

        return rl_data

    def prepare_lstm_data(self) -> pd.DataFrame:
        """
        Prepare data for LSTM training

        Returns:
            DataFrame with features for LSTM
        """
        if self.historical_data is None or self.historical_data.empty:
            raise ValueError("No historical data available. Run fetch_historical_data first.")

        # Select relevant features for LSTM
        lstm_features = []
        for symbol in self.config['symbols']:
            symbol_prefix = symbol.replace('-USD', '')
            for feature in ['Close', 'Volume', 'volatility', 'rsi', 'macd']:
                col = f"{symbol}_{feature}"
                if col in self.historical_data.columns:
                    lstm_features.append(col)

        lstm_data = self.historical_data[lstm_features].copy()

        # Rename columns for simplicity
        lstm_data.columns = [col.replace('-USD_', '_') for col in lstm_data.columns]

        # Add the main price column (first symbol's close)
        main_symbol = self.config['symbols'][0].replace('-USD', '')
        lstm_data['price'] = self.historical_data[f"{self.config['symbols'][0]}_Close"]
        lstm_data['volume'] = self.historical_data[f"{self.config['symbols'][0]}_Volume"]
        lstm_data['high'] = self.historical_data.get(f"{self.config['symbols'][0]}_High", lstm_data['price'])
        lstm_data['low'] = self.historical_data.get(f"{self.config['symbols'][0]}_Low", lstm_data['price'])
        lstm_data['volatility'] = self.historical_data.get(f"{self.config['symbols'][0]}_volatility", 0)

        # Remove NaN values
        lstm_data.dropna(inplace=True)

        self.processed_data['lstm'] = lstm_data
        logger.info(f"Prepared LSTM data with shape: {lstm_data.shape}")

        return lstm_data

    def prepare_il_data(self) -> pd.DataFrame:
        """
        Prepare data for Impermanent Loss prediction

        Returns:
            DataFrame with IL features
        """
        if self.historical_data is None or self.historical_data.empty:
            raise ValueError("No historical data available. Run fetch_historical_data first.")

        il_data = pd.DataFrame()

        # Create pairs for IL calculation
        # Example: SEI-USDC pair
        if 'SEI-USD_Close' in self.historical_data.columns and 'USDC-USD_Close' in self.historical_data.columns:
            il_data['price_token0'] = self.historical_data['SEI-USD_Close']
            il_data['price_token1'] = self.historical_data.get('USDC-USD_Close', 1.0)  # USDC is stable

            il_data['volatility_token0'] = self.historical_data.get('SEI-USD_volatility', 0.3)
            il_data['volatility_token1'] = 0.01  # USDC has low volatility

            il_data['volume_token0'] = self.historical_data['SEI-USD_Volume']
            il_data['volume_token1'] = self.historical_data.get('USDC-USD_Volume', il_data['volume_token0'] * 0.5)

            # Calculate price ratios
            il_data['initial_price_token0'] = il_data['price_token0'].iloc[0]
            il_data['initial_price_token1'] = il_data['price_token1'].iloc[0]
            il_data['initial_price_ratio'] = il_data['initial_price_token0'] / il_data['initial_price_token1']
            il_data['current_price_ratio'] = il_data['price_token0'] / il_data['price_token1']

            # Correlation (simplified)
            il_data['correlation'] = il_data['price_token0'].rolling(window=24).corr(il_data['price_token1'])

            # Liquidity and fees
            il_data['liquidity'] = 1000000  # Example liquidity
            il_data['fee_tier'] = 0.003  # 0.3% fee

            # Time in pool
            il_data['time_in_pool'] = range(len(il_data))

            # Market conditions
            il_data['market_trend'] = il_data['price_token0'].pct_change().rolling(window=24).mean()

            # Calculate actual impermanent loss
            il_data['impermanent_loss'] = il_data.apply(
                lambda row: self._calculate_il(row['initial_price_ratio'], row['current_price_ratio']),
                axis=1
            )

        # ETH-USDC pair
        if 'ETH-USD_Close' in self.historical_data.columns:
            eth_il_data = il_data.copy()
            eth_il_data['price_token0'] = self.historical_data['ETH-USD_Close']
            eth_il_data['volatility_token0'] = self.historical_data.get('ETH-USD_volatility', 0.4)
            eth_il_data['volume_token0'] = self.historical_data['ETH-USD_Volume']

            # Recalculate IL for ETH
            eth_il_data['initial_price_token0'] = eth_il_data['price_token0'].iloc[0]
            eth_il_data['initial_price_ratio'] = eth_il_data['initial_price_token0'] / eth_il_data['initial_price_token1']
            eth_il_data['current_price_ratio'] = eth_il_data['price_token0'] / eth_il_data['price_token1']

            eth_il_data['impermanent_loss'] = eth_il_data.apply(
                lambda row: self._calculate_il(row['initial_price_ratio'], row['current_price_ratio']),
                axis=1
            )

            # Combine datasets
            il_data = pd.concat([il_data, eth_il_data], ignore_index=True)

        # Remove NaN values
        il_data.dropna(inplace=True)

        self.processed_data['il'] = il_data
        logger.info(f"Prepared IL data with shape: {il_data.shape}")

        return il_data

    def _calculate_il(self, initial_ratio: float, current_ratio: float) -> float:
        """Calculate impermanent loss"""
        if initial_ratio == 0:
            return 0
        price_ratio = current_ratio / initial_ratio
        if price_ratio <= 0:
            return 0
        il = 2 * np.sqrt(price_ratio) / (1 + price_ratio) - 1
        return il

    async def train_rl_agent(self):
        """Train the Reinforcement Learning agent"""
        logger.info("Starting RL agent training...")

        # Fetch historical data if not available
        if self.historical_data is None:
            logger.info("Fetching historical data...")
            await self.fetch_historical_data()

        # Prepare data
        rl_data = self.prepare_rl_data()

        # Initialize agent
        self.rl_agent = DeFiRLAgent(
            model_name="defi_vault_strategy",
            learning_rate=self.config.get('rl_learning_rate', 3e-4),
            batch_size=64,
            n_steps=2048,
            n_epochs=10
        )

        # Train agent
        self.rl_agent.train(
            total_timesteps=self.config['rl_config']['total_timesteps'],
            eval_freq=self.config['rl_config']['eval_freq'],
            save_freq=self.config['rl_config']['save_freq'],
            historical_data=rl_data
        )

        # Evaluate
        metrics = self.rl_agent.evaluate(n_eval_episodes=10)
        logger.info(f"RL Agent Metrics: {metrics}")

        return metrics

    async def train_lstm_forecaster(self):
        """Train the LSTM forecasting model"""
        logger.info("Starting LSTM forecaster training...")

        # Fetch historical data if not available
        if self.historical_data is None:
            logger.info("Fetching historical data...")
            await self.fetch_historical_data()

        # Prepare data
        lstm_data = self.prepare_lstm_data()

        # Split data
        split_idx = int(len(lstm_data) * self.config['train_test_split'])
        train_data = lstm_data[:split_idx]
        test_data = lstm_data[split_idx:]

        # Further split train into train/val
        val_split_idx = int(len(train_data) * (1 - self.config['validation_split']))
        val_data = train_data[val_split_idx:]
        train_data = train_data[:val_split_idx]

        # Initialize forecaster
        self.lstm_forecaster = LSTMForecaster(
            model_name="price_forecaster",
            sequence_length=self.config['lstm_config']['sequence_length'],
            prediction_horizon=self.config['lstm_config']['prediction_horizon'],
            batch_size=self.config['lstm_config']['batch_size']
        )

        # Define features
        feature_columns = ['price', 'volume', 'volatility', 'high', 'low']

        # Train model
        self.lstm_forecaster.train(
            train_data=train_data,
            val_data=val_data,
            feature_columns=feature_columns,
            epochs=self.config['lstm_config']['epochs']
        )

        # Evaluate on test data
        metrics = self.lstm_forecaster.evaluate(test_data, feature_columns)
        logger.info(f"LSTM Forecaster Metrics: {metrics}")

        return metrics

    async def train_il_predictor(self):
        """Train the Impermanent Loss predictor"""
        logger.info("Starting IL predictor training...")

        # Fetch historical data if not available
        if self.historical_data is None:
            logger.info("Fetching historical data...")
            await self.fetch_historical_data()

        # Prepare data
        il_data = self.prepare_il_data()

        # Initialize predictor
        self.il_predictor = ImpermanentLossPredictor(
            model_name="il_predictor",
            use_ensemble=True,
            feature_engineering=True,
            n_estimators=self.config['il_config']['n_estimators']
        )

        # Prepare features and target
        X, y = self.il_predictor.prepare_training_data(il_data)

        # Train model
        self.il_predictor.train(
            X=X,
            y=y,
            validation_split=self.config['validation_split'],
            optimize_hyperparameters=self.config['il_config']['optimize_hyperparameters'],
            feature_selection=self.config['il_config']['feature_selection']
        )

        # Get metrics
        metrics = {
            'training': self.il_predictor.training_metrics,
            'validation': self.il_predictor.validation_metrics,
            'feature_importance': dict(sorted(
                self.il_predictor.feature_importance.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10])  # Top 10 features
        }

        logger.info(f"IL Predictor Metrics: {json.dumps(metrics, indent=2)}")

        return metrics

    async def run_complete_pipeline(self):
        """Run the complete training pipeline"""
        logger.info("Starting complete ML training pipeline...")

        try:
            # Step 1: Fetch historical data
            await self.fetch_historical_data()

            # Step 2: Train all models in parallel
            results = await asyncio.gather(
                self.train_rl_agent(),
                self.train_lstm_forecaster(),
                self.train_il_predictor(),
                return_exceptions=True
            )

            # Step 3: Compile results
            pipeline_results = {
                'timestamp': datetime.now().isoformat(),
                'config': self.config,
                'results': {
                    'rl_agent': results[0] if not isinstance(results[0], Exception) else str(results[0]),
                    'lstm_forecaster': results[1] if not isinstance(results[1], Exception) else str(results[1]),
                    'il_predictor': results[2] if not isinstance(results[2], Exception) else str(results[2])
                }
            }

            # Save results
            results_file = self.models_path / f"training_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(results_file, 'w') as f:
                json.dump(pipeline_results, f, indent=2)

            logger.info(f"Training pipeline completed. Results saved to {results_file}")

            return pipeline_results

        except Exception as e:
            logger.error(f"Error in training pipeline: {e}")
            raise

    def save_all_models(self):
        """Save all trained models"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        if self.rl_agent:
            self.rl_agent.save_model(f"final_{timestamp}")

        if self.lstm_forecaster:
            self.lstm_forecaster.save_model(f"final_{timestamp}")

        if self.il_predictor:
            self.il_predictor.save_model(f"final_{timestamp}")

        logger.info(f"All models saved with timestamp: {timestamp}")


# Example usage
async def main():
    """Example of running the training pipeline"""
    # Create configuration
    config = {
        'symbols': ['SEI-USD', 'ETH-USD', 'USDC-USD'],
        'data_period': '3mo',
        'rl_config': {
            'total_timesteps': 50000,  # Reduced for example
            'eval_freq': 5000,
            'save_freq': 10000
        },
        'lstm_config': {
            'epochs': 50,  # Reduced for example
            'batch_size': 32
        }
    }

    # Save config
    config_path = 'training_config.json'
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

    # Initialize pipeline
    pipeline = MLTrainingPipeline(config_path)

    # Run training
    results = await pipeline.run_complete_pipeline()

    # Save models
    pipeline.save_all_models()

    print("Training complete!")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())