"""
LSTM Time-Series Forecasting Model for DeFi Price Predictions
Implements multi-variate LSTM with attention mechanism for price forecasting
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from typing import Dict, Any, Tuple, Optional, List, Union
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, mean_absolute_percentage_error
import logging
import os
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)


class DeFiPriceDataset(Dataset):
    """Custom Dataset for DeFi price time series"""

    def __init__(self, data: np.ndarray, sequence_length: int, prediction_horizon: int):
        """
        Initialize dataset

        Args:
            data: Numpy array of shape (n_samples, n_features)
            sequence_length: Number of past timesteps to use
            prediction_horizon: Number of future timesteps to predict
        """
        self.data = torch.FloatTensor(data)
        self.sequence_length = sequence_length
        self.prediction_horizon = prediction_horizon
        self.n_samples = len(data) - sequence_length - prediction_horizon + 1

    def __len__(self):
        return self.n_samples

    def __getitem__(self, idx):
        # Get sequence
        x = self.data[idx:idx + self.sequence_length]
        # Get target (next prediction_horizon values)
        y = self.data[idx + self.sequence_length:idx + self.sequence_length + self.prediction_horizon, 0]  # Only price
        return x, y


class AttentionLSTM(nn.Module):
    """LSTM with Attention Mechanism for Time Series Forecasting"""

    def __init__(self,
                 input_dim: int,
                 hidden_dim: int,
                 num_layers: int,
                 output_dim: int,
                 prediction_horizon: int,
                 dropout: float = 0.2):
        """
        Initialize LSTM with Attention

        Args:
            input_dim: Number of input features
            hidden_dim: Hidden layer dimension
            num_layers: Number of LSTM layers
            output_dim: Output dimension (usually 1 for price)
            prediction_horizon: Number of timesteps to predict
            dropout: Dropout rate
        """
        super(AttentionLSTM, self).__init__()

        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.prediction_horizon = prediction_horizon

        # LSTM layers
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True,
            bidirectional=True
        )

        # Attention mechanism
        self.attention = nn.MultiheadAttention(
            embed_dim=hidden_dim * 2,  # Bidirectional
            num_heads=8,
            dropout=dropout,
            batch_first=True
        )

        # Feature extraction layers
        self.feature_extractor = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout)
        )

        # Output layers for multi-step prediction
        self.output_layers = nn.ModuleList([
            nn.Linear(hidden_dim // 2, output_dim)
            for _ in range(prediction_horizon)
        ])

        # Additional components for uncertainty estimation
        self.uncertainty_layer = nn.Linear(hidden_dim // 2, prediction_horizon)

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Forward pass

        Args:
            x: Input tensor of shape (batch_size, sequence_length, input_dim)

        Returns:
            predictions: Predicted values (batch_size, prediction_horizon, output_dim)
            uncertainty: Uncertainty estimates (batch_size, prediction_horizon)
        """
        batch_size = x.size(0)

        # LSTM forward pass
        lstm_out, (hidden, cell) = self.lstm(x)

        # Apply attention
        attended_out, attention_weights = self.attention(lstm_out, lstm_out, lstm_out)

        # Combine LSTM output with attention
        combined = lstm_out + attended_out  # Residual connection

        # Take the last timestep output
        last_output = combined[:, -1, :]

        # Extract features
        features = self.feature_extractor(last_output)

        # Generate predictions for each timestep
        predictions = []
        for i in range(self.prediction_horizon):
            pred = self.output_layers[i](features)
            predictions.append(pred)

        predictions = torch.stack(predictions, dim=1)

        # Estimate uncertainty
        uncertainty = torch.sigmoid(self.uncertainty_layer(features))

        return predictions, uncertainty


class LSTMForecaster:
    """
    LSTM-based Time Series Forecaster for DeFi Price Predictions
    """

    def __init__(self,
                 model_name: str = "lstm_price_forecaster",
                 sequence_length: int = 168,  # 7 days of hourly data
                 prediction_horizon: int = 24,  # Predict next 24 hours
                 hidden_dim: int = 256,
                 num_layers: int = 3,
                 learning_rate: float = 0.001,
                 batch_size: int = 32,
                 device: str = "auto"):
        """
        Initialize LSTM Forecaster

        Args:
            model_name: Name for saving/loading model
            sequence_length: Number of past timesteps to use
            prediction_horizon: Number of future timesteps to predict
            hidden_dim: Hidden layer dimension
            num_layers: Number of LSTM layers
            learning_rate: Learning rate
            batch_size: Batch size for training
            device: Device to use (cpu/cuda/auto)
        """
        self.model_name = model_name
        self.sequence_length = sequence_length
        self.prediction_horizon = prediction_horizon
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.learning_rate = learning_rate
        self.batch_size = batch_size

        # Set device
        if device == "auto":
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)

        self.model: Optional[AttentionLSTM] = None
        self.scaler: Optional[MinMaxScaler] = None
        self.feature_names: List[str] = []
        self.training_history: List[Dict[str, float]] = []

        # Paths for saving
        self.save_path = f"models/lstm/{model_name}"
        os.makedirs(self.save_path, exist_ok=True)

        logger.info(f"LSTM Forecaster initialized on device: {self.device}")

    def prepare_data(self, df: pd.DataFrame, feature_columns: List[str]) -> np.ndarray:
        """
        Prepare data for LSTM training

        Args:
            df: DataFrame with time series data
            feature_columns: List of feature column names

        Returns:
            Scaled numpy array
        """
        # Extract features
        data = df[feature_columns].values
        self.feature_names = feature_columns

        # Initialize and fit scaler
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = self.scaler.fit_transform(data)

        return scaled_data

    def create_model(self, input_dim: int) -> AttentionLSTM:
        """Create LSTM model"""
        model = AttentionLSTM(
            input_dim=input_dim,
            hidden_dim=self.hidden_dim,
            num_layers=self.num_layers,
            output_dim=1,  # Predicting price
            prediction_horizon=self.prediction_horizon,
            dropout=0.2
        )
        model.to(self.device)
        return model

    def train(self,
              train_data: pd.DataFrame,
              val_data: Optional[pd.DataFrame] = None,
              feature_columns: Optional[List[str]] = None,
              epochs: int = 100,
              early_stopping_patience: int = 10):
        """
        Train the LSTM model

        Args:
            train_data: Training DataFrame
            val_data: Validation DataFrame
            feature_columns: Feature columns to use
            epochs: Number of training epochs
            early_stopping_patience: Patience for early stopping
        """
        # Default features if not specified
        if feature_columns is None:
            feature_columns = ['price', 'volume', 'volatility', 'high', 'low']

        # Prepare data
        train_scaled = self.prepare_data(train_data, feature_columns)

        # Create dataset and dataloader
        train_dataset = DeFiPriceDataset(train_scaled, self.sequence_length, self.prediction_horizon)
        train_loader = DataLoader(train_dataset, batch_size=self.batch_size, shuffle=True)

        # Validation setup
        val_loader = None
        if val_data is not None:
            val_scaled = self.scaler.transform(val_data[feature_columns].values)
            val_dataset = DeFiPriceDataset(val_scaled, self.sequence_length, self.prediction_horizon)
            val_loader = DataLoader(val_dataset, batch_size=self.batch_size, shuffle=False)

        # Create model
        input_dim = len(feature_columns)
        self.model = self.create_model(input_dim)

        # Loss function and optimizer
        criterion = nn.MSELoss()
        optimizer = optim.AdamW(self.model.parameters(), lr=self.learning_rate, weight_decay=1e-5)
        scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=5, factor=0.5)

        # Training loop
        best_val_loss = float('inf')
        patience_counter = 0

        logger.info(f"Starting LSTM training for {epochs} epochs...")

        for epoch in range(epochs):
            # Training phase
            self.model.train()
            train_loss = 0.0
            train_batches = 0

            for batch_x, batch_y in train_loader:
                batch_x = batch_x.to(self.device)
                batch_y = batch_y.to(self.device)

                optimizer.zero_grad()

                # Forward pass
                predictions, uncertainty = self.model(batch_x)
                predictions = predictions.squeeze(-1)  # Remove last dimension

                # Calculate loss
                loss = criterion(predictions, batch_y)

                # Add uncertainty regularization
                uncertainty_reg = 0.01 * torch.mean(uncertainty)
                total_loss = loss + uncertainty_reg

                # Backward pass
                total_loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                optimizer.step()

                train_loss += loss.item()
                train_batches += 1

            avg_train_loss = train_loss / train_batches

            # Validation phase
            val_loss = 0.0
            if val_loader is not None:
                self.model.eval()
                val_batches = 0

                with torch.no_grad():
                    for batch_x, batch_y in val_loader:
                        batch_x = batch_x.to(self.device)
                        batch_y = batch_y.to(self.device)

                        predictions, _ = self.model(batch_x)
                        predictions = predictions.squeeze(-1)

                        loss = criterion(predictions, batch_y)
                        val_loss += loss.item()
                        val_batches += 1

                avg_val_loss = val_loss / val_batches
                scheduler.step(avg_val_loss)

                # Early stopping
                if avg_val_loss < best_val_loss:
                    best_val_loss = avg_val_loss
                    patience_counter = 0
                    self.save_model("best")
                else:
                    patience_counter += 1

                if patience_counter >= early_stopping_patience:
                    logger.info(f"Early stopping at epoch {epoch+1}")
                    break

            # Log progress
            log_info = {
                "epoch": epoch + 1,
                "train_loss": avg_train_loss,
                "val_loss": avg_val_loss if val_loader else None,
                "learning_rate": optimizer.param_groups[0]['lr']
            }
            self.training_history.append(log_info)

            if (epoch + 1) % 10 == 0:
                logger.info(f"Epoch {epoch+1}/{epochs} - Train Loss: {avg_train_loss:.6f}" +
                           (f" - Val Loss: {avg_val_loss:.6f}" if val_loader else ""))

        # Save final model
        self.save_model("final")
        logger.info("LSTM training complete!")

    def predict(self,
                data: Union[pd.DataFrame, np.ndarray],
                return_uncertainty: bool = True) -> Dict[str, np.ndarray]:
        """
        Make predictions using the trained model

        Args:
            data: Input data (DataFrame or numpy array)
            return_uncertainty: Whether to return uncertainty estimates

        Returns:
            Dictionary with predictions and optionally uncertainty
        """
        if self.model is None:
            raise ValueError("No model loaded. Train or load a model first.")

        self.model.eval()

        # Prepare data
        if isinstance(data, pd.DataFrame):
            data = data[self.feature_names].values

        # Scale data
        scaled_data = self.scaler.transform(data)

        # Ensure we have enough data for sequence
        if len(scaled_data) < self.sequence_length:
            raise ValueError(f"Need at least {self.sequence_length} timesteps for prediction")

        # Take last sequence_length timesteps
        sequence = scaled_data[-self.sequence_length:]
        sequence_tensor = torch.FloatTensor(sequence).unsqueeze(0).to(self.device)

        # Make prediction
        with torch.no_grad():
            predictions, uncertainty = self.model(sequence_tensor)

        # Convert to numpy
        predictions_np = predictions.cpu().numpy().squeeze()
        uncertainty_np = uncertainty.cpu().numpy().squeeze()

        # Inverse transform predictions (only for price column)
        # Create dummy array with correct shape
        dummy = np.zeros((len(predictions_np), len(self.feature_names)))
        dummy[:, 0] = predictions_np  # Assuming price is first feature
        predictions_original = self.scaler.inverse_transform(dummy)[:, 0]

        result = {
            "predictions": predictions_original,
            "prediction_horizons": list(range(1, self.prediction_horizon + 1))
        }

        if return_uncertainty:
            result["uncertainty"] = uncertainty_np

        return result

    def evaluate(self, test_data: pd.DataFrame, feature_columns: Optional[List[str]] = None) -> Dict[str, float]:
        """
        Evaluate model performance on test data

        Args:
            test_data: Test DataFrame
            feature_columns: Feature columns to use

        Returns:
            Dictionary with evaluation metrics
        """
        if self.model is None:
            raise ValueError("No model loaded. Train or load a model first.")

        if feature_columns is None:
            feature_columns = self.feature_names

        # Prepare test data
        test_scaled = self.scaler.transform(test_data[feature_columns].values)
        test_dataset = DeFiPriceDataset(test_scaled, self.sequence_length, self.prediction_horizon)
        test_loader = DataLoader(test_dataset, batch_size=self.batch_size, shuffle=False)

        self.model.eval()

        all_predictions = []
        all_targets = []

        with torch.no_grad():
            for batch_x, batch_y in test_loader:
                batch_x = batch_x.to(self.device)

                predictions, _ = self.model(batch_x)
                predictions = predictions.squeeze(-1)

                all_predictions.append(predictions.cpu().numpy())
                all_targets.append(batch_y.numpy())

        # Concatenate all predictions
        predictions_concat = np.concatenate(all_predictions, axis=0)
        targets_concat = np.concatenate(all_targets, axis=0)

        # Calculate metrics for different horizons
        metrics = {}

        for horizon in [1, 6, 12, 24]:
            if horizon <= self.prediction_horizon:
                horizon_idx = horizon - 1
                y_true = targets_concat[:, horizon_idx]
                y_pred = predictions_concat[:, horizon_idx]

                metrics[f"mse_{horizon}h"] = mean_squared_error(y_true, y_pred)
                metrics[f"mae_{horizon}h"] = mean_absolute_error(y_true, y_pred)
                metrics[f"mape_{horizon}h"] = mean_absolute_percentage_error(y_true, y_pred)
                metrics[f"rmse_{horizon}h"] = np.sqrt(metrics[f"mse_{horizon}h"])

        # Overall metrics
        metrics["avg_mse"] = mean_squared_error(targets_concat.flatten(), predictions_concat.flatten())
        metrics["avg_mae"] = mean_absolute_error(targets_concat.flatten(), predictions_concat.flatten())
        metrics["avg_rmse"] = np.sqrt(metrics["avg_mse"])

        logger.info(f"Evaluation Results:\n{json.dumps(metrics, indent=2)}")
        return metrics

    def save_model(self, suffix: str = ""):
        """Save the trained model"""
        if self.model is None:
            logger.error("No model to save")
            return

        save_name = f"{self.model_name}_{suffix}" if suffix else self.model_name

        # Save model state
        model_path = os.path.join(self.save_path, f"{save_name}.pt")
        torch.save({
            "model_state_dict": self.model.state_dict(),
            "model_config": {
                "input_dim": len(self.feature_names),
                "hidden_dim": self.hidden_dim,
                "num_layers": self.num_layers,
                "prediction_horizon": self.prediction_horizon
            }
        }, model_path)

        # Save scaler
        scaler_path = os.path.join(self.save_path, f"{save_name}_scaler.pkl")
        import joblib
        joblib.dump(self.scaler, scaler_path)

        # Save metadata
        metadata = {
            "model_name": self.model_name,
            "timestamp": datetime.now().isoformat(),
            "sequence_length": self.sequence_length,
            "prediction_horizon": self.prediction_horizon,
            "feature_names": self.feature_names,
            "training_history": self.training_history
        }

        metadata_path = os.path.join(self.save_path, f"{save_name}_metadata.json")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        logger.info(f"Model saved to {model_path}")

    def load_model(self, model_path: str):
        """Load a trained model"""
        # Load model state
        checkpoint = torch.load(model_path, map_location=self.device)

        # Create model with saved config
        config = checkpoint["model_config"]
        self.model = self.create_model(config["input_dim"])
        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.eval()

        # Load scaler
        scaler_path = model_path.replace(".pt", "_scaler.pkl")
        if os.path.exists(scaler_path):
            import joblib
            self.scaler = joblib.load(scaler_path)

        # Load metadata
        metadata_path = model_path.replace(".pt", "_metadata.json")
        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                metadata = json.load(f)
                self.feature_names = metadata.get("feature_names", [])
                self.sequence_length = metadata.get("sequence_length", self.sequence_length)
                self.prediction_horizon = metadata.get("prediction_horizon", self.prediction_horizon)

        logger.info(f"Model loaded from {model_path}")