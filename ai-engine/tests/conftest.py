"""
Pytest configuration and fixtures for AI Engine tests
"""

import pytest
import os
import sys
import numpy as np
import pandas as pd
from pathlib import Path
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set test environment
os.environ['TESTING'] = 'true'
os.environ['LOG_LEVEL'] = 'ERROR'
os.environ['SKIP_MODEL_TRAINING'] = 'true'

@pytest.fixture
def mock_redis():
    """Mock Redis client for testing"""
    with patch('redis.StrictRedis') as mock:
        client = MagicMock()
        client.ping.return_value = True
        client.get.return_value = None
        client.set.return_value = True
        client.setex.return_value = True
        mock.return_value = client
        yield client

@pytest.fixture
def sample_observation():
    """Sample observation for RL agent"""
    return np.array([
        100.0,  # current_price / 100
        0.5,    # price position in range
        0.3,    # volatility
        0.5,    # volume (log normalized)
        0.1,    # fees_earned / 10000
        -0.02,  # impermanent_loss
        0.8,    # time_in_range_ratio
        0.01,   # price_momentum
        1.0     # liquidity / 1000000
    ], dtype=np.float32)

@pytest.fixture
def sample_vault_state():
    """Sample vault state for testing"""
    return {
        'current_price': 100.0,
        'lower_bound': 90.0,
        'upper_bound': 110.0,
        'liquidity': 1000000.0,
        'volume_24h': 500000.0,
        'volatility': 0.3,
        'fees_earned': 1000.0,
        'impermanent_loss': 0.02
    }

@pytest.fixture
def sample_price_data():
    """Sample price data for LSTM testing"""
    dates = pd.date_range(end=datetime.now(), periods=200, freq='h')
    return pd.DataFrame({
        'timestamp': dates,
        'price': np.random.normal(100, 10, 200),
        'volume': np.random.lognormal(15, 1, 200),
        'volatility': np.random.uniform(0.1, 0.5, 200),
        'high': np.random.normal(105, 10, 200),
        'low': np.random.normal(95, 10, 200)
    }).set_index('timestamp')

@pytest.fixture
def sample_il_features():
    """Sample features for IL prediction"""
    return pd.DataFrame([{
        'price_token0': 100.0,
        'price_token1': 50.0,
        'volatility_token0': 0.3,
        'volatility_token1': 0.25,
        'correlation': 0.7,
        'liquidity': 1000000.0,
        'fee_tier': 0.003,
        'initial_price_token0': 100.0,
        'initial_price_token1': 50.0,
        'volume_token0': 100000.0,
        'volume_token1': 100000.0,
        'time_in_pool': 24,
        'market_trend': 0.0
    }])

@pytest.fixture
def mock_model():
    """Mock ML model for testing"""
    model = MagicMock()
    model.predict.return_value = np.array([0.1, -0.1, 0.5])
    model.evaluate.return_value = (100.0, 10.0)
    return model

@pytest.fixture
def test_config():
    """Test configuration"""
    return {
        'model_name': 'test_model',
        'learning_rate': 0.001,
        'batch_size': 32,
        'n_steps': 128,
        'n_epochs': 5,
        'gamma': 0.99,
        'device': 'cpu'
    }

@pytest.fixture
def api_client():
    """Test client for FastAPI"""
    from fastapi.testclient import TestClient
    from api_server import app

    return TestClient(app)