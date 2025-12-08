"""
Tests for Impermanent Loss Predictor
"""

import pytest
import numpy as np
import pandas as pd
import torch
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from unittest.mock import MagicMock, patch, mock_open
from pathlib import Path
import sys
import json

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sei_dlp_ai.models.il_predictor import (
    ILPredictor,
    calculate_il,
    prepare_il_features,
    ILFeatureEngineering
)


class TestCalculateIL:
    """Test impermanent loss calculation"""

    def test_no_price_change(self):
        """Test IL when prices don't change"""
        il = calculate_il(
            initial_price0=100,
            initial_price1=50,
            current_price0=100,
            current_price1=50
        )
        assert abs(il) < 1e-10  # Should be ~0

    def test_proportional_price_change(self):
        """Test IL when prices change proportionally"""
        il = calculate_il(
            initial_price0=100,
            initial_price1=50,
            current_price0=200,
            current_price1=100
        )
        assert abs(il) < 1e-10  # Should be ~0

    def test_divergent_price_change(self):
        """Test IL when prices diverge"""
        il = calculate_il(
            initial_price0=100,
            initial_price1=100,
            current_price0=200,
            current_price1=100
        )
        assert il < 0  # Should have IL
        assert abs(il + 0.0557) < 0.001  # ~5.57% IL

    def test_inverse_price_change(self):
        """Test IL with inverse price movements"""
        il = calculate_il(
            initial_price0=100,
            initial_price1=100,
            current_price0=150,
            current_price1=66.67
        )
        assert il < 0  # Should have IL

    def test_extreme_divergence(self):
        """Test IL with extreme price divergence"""
        il = calculate_il(
            initial_price0=100,
            initial_price1=100,
            current_price0=1000,
            current_price1=100
        )
        assert il < -0.2  # Should have significant IL


class TestPrepareILFeatures:
    """Test feature preparation for IL prediction"""

    def test_basic_features(self):
        """Test basic feature preparation"""
        features = prepare_il_features(
            price0=100,
            price1=50,
            volatility0=0.3,
            volatility1=0.25,
            correlation=0.7,
            liquidity=1000000,
            fee_tier=0.003
        )

        assert 'price_ratio' in features
        assert 'volatility_ratio' in features
        assert 'correlation' in features
        assert 'log_liquidity' in features
        assert features['price_ratio'] == 2.0

    def test_additional_features(self):
        """Test additional feature preparation"""
        features = prepare_il_features(
            price0=100,
            price1=50,
            volatility0=0.3,
            volatility1=0.25,
            correlation=0.7,
            liquidity=1000000,
            fee_tier=0.003,
            volume0=500000,
            volume1=250000,
            time_in_pool=24
        )

        assert 'volume_ratio' in features
        assert 'time_in_pool' in features
        assert features['volume_ratio'] == 2.0

    def test_feature_scaling(self):
        """Test feature value ranges"""
        features = prepare_il_features(
            price0=1000000,
            price1=0.001,
            volatility0=2.0,
            volatility1=0.01,
            correlation=-1.0,
            liquidity=1e12,
            fee_tier=0.01
        )

        # Check that features are in reasonable ranges
        assert 0 < features['log_liquidity'] < 30
        assert -1 <= features['correlation'] <= 1


class TestILFeatureEngineering:
    """Test IL feature engineering class"""

    def test_initialization(self):
        """Test feature engineering initialization"""
        fe = ILFeatureEngineering()
        assert fe.scaler is not None
        assert fe.feature_names is not None

    def test_create_features(self, sample_il_features):
        """Test feature creation"""
        fe = ILFeatureEngineering()
        features = fe.create_features(sample_il_features)

        expected_features = [
            'price_ratio', 'volatility_ratio', 'volatility_product',
            'price_volatility_interaction', 'correlation_squared'
        ]

        for feature in expected_features:
            assert feature in features.columns

    def test_polynomial_features(self, sample_il_features):
        """Test polynomial feature creation"""
        fe = ILFeatureEngineering(use_polynomial=True)
        features = fe.create_polynomial_features(sample_il_features)

        # Should have more features than original
        assert features.shape[1] > sample_il_features.shape[1]

    def test_fit_transform(self, sample_il_features):
        """Test fit and transform pipeline"""
        fe = ILFeatureEngineering()

        # Fit on data
        fe.fit(sample_il_features)

        # Transform data
        transformed = fe.transform(sample_il_features)

        assert transformed.shape[0] == sample_il_features.shape[0]
        assert transformed.shape[1] > sample_il_features.shape[1]


class TestILPredictor:
    """Test ILPredictor class"""

    @pytest.fixture
    def predictor(self):
        """Create IL predictor"""
        config = {
            'model_type': 'random_forest',
            'n_estimators': 100,
            'max_depth': 10,
            'min_samples_split': 5,
            'feature_engineering': True
        }
        return ILPredictor(config)

    def test_initialization(self, predictor):
        """Test predictor initialization"""
        assert predictor.config['model_type'] == 'random_forest'
        assert isinstance(predictor.model, RandomForestRegressor)
        assert predictor.feature_engineer is not None

    def test_gradient_boosting_initialization(self):
        """Test initialization with gradient boosting"""
        config = {'model_type': 'gradient_boosting'}
        predictor = ILPredictor(config)
        assert isinstance(predictor.model, GradientBoostingRegressor)

    def test_train(self, predictor, sample_il_features):
        """Test model training"""
        # Create target variable
        y = np.random.uniform(-0.1, 0, len(sample_il_features))

        metrics = predictor.train(sample_il_features, y)

        assert 'mse' in metrics
        assert 'mae' in metrics
        assert 'r2' in metrics
        assert predictor.is_trained

    def test_predict(self, predictor, sample_il_features):
        """Test prediction"""
        # Train first
        y = np.random.uniform(-0.1, 0, len(sample_il_features))
        predictor.train(sample_il_features, y)

        # Make predictions
        predictions = predictor.predict(sample_il_features)

        assert len(predictions) == len(sample_il_features)
        assert all(-1 <= p <= 0 for p in predictions)  # IL should be negative

    def test_predict_single(self, predictor, sample_il_features):
        """Test single prediction"""
        # Train first
        y = np.random.uniform(-0.1, 0, len(sample_il_features))
        predictor.train(sample_il_features, y)

        # Single prediction
        single_features = sample_il_features.iloc[0:1]
        prediction = predictor.predict(single_features)

        assert len(prediction) == 1

    def test_feature_importance(self, predictor, sample_il_features):
        """Test feature importance extraction"""
        # Train first
        y = np.random.uniform(-0.1, 0, len(sample_il_features))
        predictor.train(sample_il_features, y)

        importance = predictor.get_feature_importance()

        assert importance is not None
        assert len(importance) > 0
        assert all(val >= 0 for val in importance.values())

    def test_save_load_model(self, predictor, sample_il_features, tmp_path):
        """Test model saving and loading"""
        # Train model
        y = np.random.uniform(-0.1, 0, len(sample_il_features))
        predictor.train(sample_il_features, y)

        # Save model
        save_path = tmp_path / "il_model.pkl"
        predictor.save_model(str(save_path))
        assert save_path.exists()

        # Load model
        new_predictor = ILPredictor(predictor.config)
        new_predictor.load_model(str(save_path))

        # Compare predictions
        pred1 = predictor.predict(sample_il_features)
        pred2 = new_predictor.predict(sample_il_features)
        np.testing.assert_array_almost_equal(pred1, pred2)

    def test_cross_validation(self, predictor, sample_il_features):
        """Test cross-validation"""
        # Create more samples for CV
        features = pd.concat([sample_il_features] * 20, ignore_index=True)
        y = np.random.uniform(-0.1, 0, len(features))

        cv_scores = predictor.cross_validate(features, y, cv=3)

        assert 'mse_scores' in cv_scores
        assert 'mae_scores' in cv_scores
        assert len(cv_scores['mse_scores']) == 3

    def test_hyperparameter_tuning(self, predictor, sample_il_features):
        """Test hyperparameter tuning"""
        # Create more samples
        features = pd.concat([sample_il_features] * 20, ignore_index=True)
        y = np.random.uniform(-0.1, 0, len(features))

        param_grid = {
            'n_estimators': [50, 100],
            'max_depth': [5, 10]
        }

        best_params = predictor.tune_hyperparameters(features, y, param_grid)

        assert 'n_estimators' in best_params
        assert 'max_depth' in best_params

    def test_prediction_intervals(self, predictor, sample_il_features):
        """Test prediction with confidence intervals"""
        # Train with multiple trees for uncertainty
        y = np.random.uniform(-0.1, 0, len(sample_il_features))
        predictor.train(sample_il_features, y)

        predictions, lower, upper = predictor.predict_with_intervals(sample_il_features)

        assert len(predictions) == len(sample_il_features)
        assert len(lower) == len(sample_il_features)
        assert len(upper) == len(sample_il_features)
        assert all(lower[i] <= predictions[i] <= upper[i] for i in range(len(predictions)))

    def test_online_learning(self, predictor, sample_il_features):
        """Test online learning / incremental updates"""
        # Initial training
        y_initial = np.random.uniform(-0.1, 0, len(sample_il_features))
        predictor.train(sample_il_features, y_initial)
        initial_pred = predictor.predict(sample_il_features)

        # Incremental update
        new_features = sample_il_features.copy()
        y_new = np.random.uniform(-0.15, -0.05, len(new_features))
        predictor.update(new_features, y_new)
        updated_pred = predictor.predict(sample_il_features)

        # Predictions should change after update
        assert not np.array_equal(initial_pred, updated_pred)

    def test_ensemble_prediction(self):
        """Test ensemble of multiple models"""
        configs = [
            {'model_type': 'random_forest', 'n_estimators': 50},
            {'model_type': 'gradient_boosting', 'n_estimators': 50}
        ]

        predictors = [ILPredictor(config) for config in configs]

        # Train all models
        features = pd.DataFrame({
            'price_token0': np.random.uniform(50, 150, 100),
            'price_token1': np.random.uniform(25, 75, 100),
            'volatility_token0': np.random.uniform(0.1, 0.5, 100),
            'volatility_token1': np.random.uniform(0.1, 0.4, 100),
            'correlation': np.random.uniform(-1, 1, 100),
            'liquidity': np.random.uniform(1e5, 1e7, 100),
            'fee_tier': np.random.choice([0.001, 0.003, 0.005], 100)
        })
        y = np.random.uniform(-0.1, 0, 100)

        for predictor in predictors:
            predictor.train(features, y)

        # Ensemble prediction
        predictions = [predictor.predict(features[:10]) for predictor in predictors]
        ensemble_pred = np.mean(predictions, axis=0)

        assert len(ensemble_pred) == 10

    def test_handle_missing_values(self, predictor):
        """Test handling of missing values"""
        features = pd.DataFrame({
            'price_token0': [100, np.nan, 102],
            'price_token1': [50, 51, np.nan],
            'volatility_token0': [0.3, 0.31, 0.32],
            'volatility_token1': [np.nan, 0.26, 0.27],
            'correlation': [0.7, 0.71, 0.72],
            'liquidity': [1e6, 1.1e6, 1.2e6],
            'fee_tier': [0.003, 0.003, 0.003]
        })

        # Should handle missing values gracefully
        cleaned_features = predictor._handle_missing_values(features)
        assert not cleaned_features.isnull().any().any()

    def test_feature_selection(self, predictor, sample_il_features):
        """Test automatic feature selection"""
        # Add some noise features
        features = sample_il_features.copy()
        for i in range(5):
            features[f'noise_{i}'] = np.random.randn(len(features))

        y = np.random.uniform(-0.1, 0, len(features))

        # Train with feature selection
        predictor.config['feature_selection'] = True
        predictor.train(features, y)

        # Check that important features are selected
        selected_features = predictor.selected_features
        assert len(selected_features) < features.shape[1]