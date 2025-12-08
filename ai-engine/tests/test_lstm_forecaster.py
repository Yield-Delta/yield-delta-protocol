"""
Tests for LSTM Price Forecaster
"""

import pytest
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sei_dlp_ai.models.lstm_forecaster import (
    LSTMForecaster,
    PriceDataPreprocessor,
    create_sequences,
    calculate_volatility
)


class TestPriceDataPreprocessor:
    """Test PriceDataPreprocessor class"""

    def test_initialization(self):
        """Test preprocessor initialization"""
        preprocessor = PriceDataPreprocessor(sequence_length=60)
        assert preprocessor.sequence_length == 60
        assert preprocessor.scaler is not None

    def test_preprocess_data(self, sample_price_data):
        """Test data preprocessing"""
        preprocessor = PriceDataPreprocessor(sequence_length=24)
        X, y = preprocessor.preprocess(sample_price_data)

        assert X is not None
        assert y is not None
        assert X.shape[0] == y.shape[0]
        assert X.shape[1] == 24  # sequence length
        assert X.shape[2] == sample_price_data.shape[1]  # features

    def test_feature_engineering(self, sample_price_data):
        """Test feature engineering"""
        preprocessor = PriceDataPreprocessor(sequence_length=24)
        enhanced_data = preprocessor.engineer_features(sample_price_data)

        # Check for new features
        expected_features = [
            'returns', 'log_returns', 'ma_7', 'ma_30',
            'rsi', 'bollinger_upper', 'bollinger_lower'
        ]
        for feature in expected_features:
            assert feature in enhanced_data.columns

    def test_normalization(self, sample_price_data):
        """Test data normalization"""
        preprocessor = PriceDataPreprocessor()
        normalized = preprocessor.normalize(sample_price_data.values)

        assert normalized.shape == sample_price_data.shape
        assert np.all(normalized >= -3) and np.all(normalized <= 3)  # Roughly normalized

    def test_inverse_transform(self, sample_price_data):
        """Test inverse transformation"""
        preprocessor = PriceDataPreprocessor()
        normalized = preprocessor.normalize(sample_price_data[['price']].values)
        denormalized = preprocessor.inverse_transform(normalized)

        np.testing.assert_array_almost_equal(
            sample_price_data[['price']].values,
            denormalized,
            decimal=5
        )

    def test_handle_missing_data(self):
        """Test handling of missing data"""
        data = pd.DataFrame({
            'price': [100, np.nan, 102, 103, np.nan, 105],
            'volume': [1000, 2000, np.nan, 4000, 5000, 6000]
        })

        preprocessor = PriceDataPreprocessor()
        cleaned = preprocessor.handle_missing_data(data)

        assert not cleaned.isnull().any().any()


class TestCreateSequences:
    """Test sequence creation function"""

    def test_sequence_creation(self):
        """Test basic sequence creation"""
        data = np.random.randn(100, 5)
        X, y = create_sequences(data, seq_length=10)

        assert X.shape[0] == 90  # 100 - 10
        assert X.shape[1] == 10  # sequence length
        assert X.shape[2] == 5   # features
        assert y.shape[0] == 90

    def test_short_data(self):
        """Test with data shorter than sequence length"""
        data = np.random.randn(5, 3)
        X, y = create_sequences(data, seq_length=10)

        assert X.shape[0] == 0
        assert y.shape[0] == 0

    def test_exact_sequence_length(self):
        """Test with data exactly equal to sequence length"""
        data = np.random.randn(10, 3)
        X, y = create_sequences(data, seq_length=10)

        assert X.shape[0] == 1
        assert y.shape[0] == 1


class TestCalculateVolatility:
    """Test volatility calculation"""

    def test_volatility_calculation(self):
        """Test basic volatility calculation"""
        prices = pd.Series([100, 102, 101, 103, 102, 104, 103, 105])
        volatility = calculate_volatility(prices, window=5)

        assert len(volatility) == len(prices)
        assert volatility.iloc[:4].isna().all()  # First 4 should be NaN
        assert volatility.iloc[4:].notna().all()  # Rest should have values

    def test_constant_prices(self):
        """Test volatility with constant prices"""
        prices = pd.Series([100] * 20)
        volatility = calculate_volatility(prices, window=5)

        assert volatility.iloc[4:].abs().max() < 1e-10  # Should be ~0

    def test_trending_prices(self):
        """Test volatility with trending prices"""
        prices = pd.Series(range(100, 120))
        volatility = calculate_volatility(prices, window=5)

        assert volatility.iloc[4:].min() > 0  # Should have some volatility


class TestLSTMForecaster:
    """Test LSTMForecaster class"""

    @pytest.fixture
    def forecaster(self):
        """Create LSTM forecaster"""
        config = {
            'input_size': 5,
            'hidden_size': 64,
            'num_layers': 2,
            'dropout': 0.2,
            'sequence_length': 24,
            'learning_rate': 0.001
        }
        return LSTMForecaster(config)

    def test_initialization(self, forecaster):
        """Test forecaster initialization"""
        assert forecaster.config['input_size'] == 5
        assert forecaster.config['hidden_size'] == 64
        assert forecaster.model is not None
        assert forecaster.optimizer is not None
        assert forecaster.criterion is not None

    def test_forward_pass(self, forecaster):
        """Test model forward pass"""
        batch_size = 32
        seq_length = 24
        input_size = 5

        x = torch.randn(batch_size, seq_length, input_size)
        output = forecaster.model(x)

        assert output.shape == (batch_size, 1)

    def test_train_model(self, forecaster, sample_price_data):
        """Test model training"""
        preprocessor = PriceDataPreprocessor(sequence_length=24)
        X, y = preprocessor.preprocess(sample_price_data)

        # Convert to tensors
        X_tensor = torch.FloatTensor(X)
        y_tensor = torch.FloatTensor(y)

        initial_loss = forecaster._calculate_loss(X_tensor[:32], y_tensor[:32])

        # Train for a few epochs
        losses = []
        for _ in range(5):
            loss = forecaster.train_step(X_tensor[:32], y_tensor[:32])
            losses.append(loss)

        assert losses[-1] < initial_loss  # Loss should decrease

    def test_predict(self, forecaster, sample_price_data):
        """Test prediction"""
        preprocessor = PriceDataPreprocessor(sequence_length=24)
        X, _ = preprocessor.preprocess(sample_price_data)

        predictions = forecaster.predict(X[:10])

        assert predictions.shape[0] == 10
        assert predictions.shape[1] == 1

    def test_forecast_multi_step(self, forecaster, sample_price_data):
        """Test multi-step forecasting"""
        preprocessor = PriceDataPreprocessor(sequence_length=24)
        X, _ = preprocessor.preprocess(sample_price_data)

        forecast = forecaster.forecast(X[0], n_steps=5)

        assert len(forecast) == 5
        assert all(isinstance(val, (int, float, np.number)) for val in forecast)

    def test_save_load_model(self, forecaster, tmp_path):
        """Test model saving and loading"""
        # Save model
        save_path = tmp_path / "lstm_model.pt"
        forecaster.save_model(str(save_path))
        assert save_path.exists()

        # Create new forecaster and load model
        new_forecaster = LSTMForecaster(forecaster.config)
        new_forecaster.load_model(str(save_path))

        # Compare model states
        for p1, p2 in zip(forecaster.model.parameters(), new_forecaster.model.parameters()):
            assert torch.equal(p1, p2)

    def test_evaluate(self, forecaster, sample_price_data):
        """Test model evaluation"""
        preprocessor = PriceDataPreprocessor(sequence_length=24)
        X, y = preprocessor.preprocess(sample_price_data)

        X_tensor = torch.FloatTensor(X)
        y_tensor = torch.FloatTensor(y)

        metrics = forecaster.evaluate(X_tensor, y_tensor)

        assert 'mse' in metrics
        assert 'mae' in metrics
        assert 'rmse' in metrics
        assert all(val >= 0 for val in metrics.values())

    def test_confidence_intervals(self, forecaster, sample_price_data):
        """Test prediction with confidence intervals"""
        preprocessor = PriceDataPreprocessor(sequence_length=24)
        X, _ = preprocessor.preprocess(sample_price_data)

        predictions, lower, upper = forecaster.predict_with_confidence(X[:10], confidence=0.95)

        assert predictions.shape[0] == 10
        assert lower.shape[0] == 10
        assert upper.shape[0] == 10
        assert np.all(lower <= predictions)
        assert np.all(predictions <= upper)

    def test_attention_weights(self, forecaster):
        """Test attention mechanism if implemented"""
        if hasattr(forecaster.model, 'attention'):
            x = torch.randn(1, 24, 5)
            output, attention_weights = forecaster.model.forward_with_attention(x)

            assert attention_weights.shape[1] == 24
            assert torch.allclose(attention_weights.sum(dim=1), torch.ones(1))

    def test_gradient_clipping(self, forecaster):
        """Test gradient clipping during training"""
        x = torch.randn(32, 24, 5)
        y = torch.randn(32, 1)

        # Create large gradients
        y_pred = forecaster.model(x) * 1000
        loss = forecaster.criterion(y_pred, y)
        loss.backward()

        # Check gradients are clipped
        max_grad = 0
        for param in forecaster.model.parameters():
            if param.grad is not None:
                max_grad = max(max_grad, param.grad.abs().max().item())

        assert max_grad <= 1.0  # Assuming gradient clipping at 1.0

    def test_early_stopping(self, forecaster, sample_price_data):
        """Test early stopping during training"""
        preprocessor = PriceDataPreprocessor(sequence_length=24)
        X, y = preprocessor.preprocess(sample_price_data)

        X_train = torch.FloatTensor(X[:100])
        y_train = torch.FloatTensor(y[:100])
        X_val = torch.FloatTensor(X[100:150])
        y_val = torch.FloatTensor(y[100:150])

        best_loss = float('inf')
        patience_counter = 0
        patience = 5

        for epoch in range(50):
            train_loss = forecaster.train_step(X_train, y_train)
            val_loss = forecaster._calculate_loss(X_val, y_val)

            if val_loss < best_loss:
                best_loss = val_loss
                patience_counter = 0
            else:
                patience_counter += 1

            if patience_counter >= patience:
                break

        assert epoch < 49  # Should stop early

    def test_handle_outliers(self, forecaster):
        """Test outlier handling in predictions"""
        # Create data with outliers
        normal_data = np.random.randn(100, 5)
        normal_data[50, 0] = 100  # Outlier

        predictions = forecaster.predict(normal_data)

        # Check that predictions are reasonable despite outlier
        assert np.percentile(np.abs(predictions), 95) < 10

    def test_model_complexity(self, forecaster):
        """Test model parameter count"""
        total_params = sum(p.numel() for p in forecaster.model.parameters())
        trainable_params = sum(p.numel() for p in forecaster.model.parameters() if p.requires_grad)

        assert total_params > 0
        assert trainable_params > 0
        assert total_params == trainable_params  # All params should be trainable

    def test_batch_prediction(self, forecaster):
        """Test batch prediction efficiency"""
        # Single prediction
        single_input = torch.randn(1, 24, 5)
        single_output = forecaster.model(single_input)

        # Batch prediction
        batch_input = torch.randn(64, 24, 5)
        batch_output = forecaster.model(batch_input)

        assert batch_output.shape[0] == 64
        assert batch_output.shape[1] == single_output.shape[1]