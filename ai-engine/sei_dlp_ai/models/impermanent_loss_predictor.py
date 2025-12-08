"""
Enhanced Random Forest Model for Impermanent Loss Prediction
Features advanced feature engineering and ensemble methods
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.feature_selection import SelectKBest, f_regression, RFE
import xgboost as xgb
import lightgbm as lgb
from typing import Dict, Any, List, Optional, Tuple
import logging
import joblib
import os
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)


class ImpermanentLossPredictor:
    """
    Advanced ML model for predicting impermanent loss in DeFi liquidity pools
    Uses ensemble of Random Forest, XGBoost, and LightGBM with feature engineering
    """

    def __init__(self,
                 model_name: str = "il_predictor",
                 use_ensemble: bool = True,
                 feature_engineering: bool = True,
                 n_estimators: int = 200,
                 max_depth: int = 15,
                 min_samples_split: int = 5,
                 random_state: int = 42):
        """
        Initialize the Impermanent Loss Predictor

        Args:
            model_name: Name for saving/loading model
            use_ensemble: Whether to use ensemble of models
            feature_engineering: Whether to apply feature engineering
            n_estimators: Number of trees in the forest
            max_depth: Maximum depth of trees
            min_samples_split: Minimum samples to split internal node
            random_state: Random seed for reproducibility
        """
        self.model_name = model_name
        self.use_ensemble = use_ensemble
        self.feature_engineering = feature_engineering
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.random_state = random_state

        # Initialize models
        self.models = {}
        self.scaler = StandardScaler()
        self.poly_features = PolynomialFeatures(degree=2, include_bias=False)
        self.feature_selector = None
        self.feature_names = []
        self.selected_features = []
        self.feature_importance = {}

        # Model performance metrics
        self.training_metrics = {}
        self.validation_metrics = {}

        # Paths for saving
        self.save_path = f"models/il_predictor/{model_name}"
        os.makedirs(self.save_path, exist_ok=True)

        self._initialize_models()

    def _initialize_models(self):
        """Initialize the ensemble of models"""
        # Random Forest
        self.models['random_forest'] = RandomForestRegressor(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            min_samples_split=self.min_samples_split,
            min_samples_leaf=2,
            max_features='sqrt',
            bootstrap=True,
            oob_score=True,
            n_jobs=-1,
            random_state=self.random_state,
            verbose=0
        )

        if self.use_ensemble:
            # XGBoost
            self.models['xgboost'] = xgb.XGBRegressor(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                gamma=0.01,
                reg_alpha=0.1,
                reg_lambda=1.0,
                objective='reg:squarederror',
                n_jobs=-1,
                random_state=self.random_state
            )

            # LightGBM
            self.models['lightgbm'] = lgb.LGBMRegressor(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                learning_rate=0.05,
                num_leaves=31,
                subsample=0.8,
                colsample_bytree=0.8,
                min_child_weight=0.001,
                min_child_samples=20,
                reg_alpha=0.1,
                reg_lambda=1.0,
                objective='regression',
                metric='rmse',
                boosting_type='gbdt',
                n_jobs=-1,
                random_state=self.random_state,
                verbose=-1
            )

            # Gradient Boosting
            self.models['gradient_boosting'] = GradientBoostingRegressor(
                n_estimators=self.n_estimators // 2,  # Fewer trees as it's slower
                max_depth=self.max_depth,
                learning_rate=0.05,
                subsample=0.8,
                min_samples_split=self.min_samples_split,
                min_samples_leaf=2,
                max_features='sqrt',
                loss='squared_error',
                random_state=self.random_state
            )

            # Extra Trees
            self.models['extra_trees'] = ExtraTreesRegressor(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                min_samples_leaf=2,
                max_features='sqrt',
                bootstrap=False,
                n_jobs=-1,
                random_state=self.random_state
            )

    def _engineer_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Engineer advanced features for IL prediction

        Args:
            X: Input features DataFrame

        Returns:
            DataFrame with engineered features
        """
        X_eng = X.copy()

        # Price-based features
        if 'price_token0' in X.columns and 'price_token1' in X.columns:
            # Price ratio and its transformations
            X_eng['price_ratio'] = X['price_token0'] / (X['price_token1'] + 1e-8)
            X_eng['log_price_ratio'] = np.log1p(X_eng['price_ratio'])
            X_eng['sqrt_price_ratio'] = np.sqrt(X_eng['price_ratio'])
            X_eng['price_ratio_squared'] = X_eng['price_ratio'] ** 2

            # Price divergence from initial
            if 'initial_price_token0' in X.columns and 'initial_price_token1' in X.columns:
                initial_ratio = X['initial_price_token0'] / (X['initial_price_token1'] + 1e-8)
                X_eng['price_divergence'] = np.abs(X_eng['price_ratio'] - initial_ratio) / initial_ratio
                X_eng['price_divergence_squared'] = X_eng['price_divergence'] ** 2

        # Volatility-based features
        if 'volatility_token0' in X.columns and 'volatility_token1' in X.columns:
            X_eng['volatility_product'] = X['volatility_token0'] * X['volatility_token1']
            X_eng['volatility_ratio'] = X['volatility_token0'] / (X['volatility_token1'] + 1e-8)
            X_eng['max_volatility'] = np.maximum(X['volatility_token0'], X['volatility_token1'])
            X_eng['volatility_diff'] = np.abs(X['volatility_token0'] - X['volatility_token1'])

        # Correlation features
        if 'correlation' in X.columns:
            X_eng['correlation_squared'] = X['correlation'] ** 2
            X_eng['correlation_inverse'] = 1 / (np.abs(X['correlation']) + 0.1)
            X_eng['decorrelation'] = 1 - np.abs(X['correlation'])

        # Volume-based features
        if 'volume_token0' in X.columns and 'volume_token1' in X.columns:
            X_eng['volume_ratio'] = X['volume_token0'] / (X['volume_token1'] + 1e-8)
            X_eng['total_volume'] = X['volume_token0'] + X['volume_token1']
            X_eng['volume_imbalance'] = np.abs(X['volume_token0'] - X['volume_token1']) / (X_eng['total_volume'] + 1e-8)

        # Liquidity features
        if 'liquidity' in X.columns:
            X_eng['log_liquidity'] = np.log1p(X['liquidity'])
            X_eng['liquidity_sqrt'] = np.sqrt(X['liquidity'])

            # Liquidity concentration
            if 'range_lower' in X.columns and 'range_upper' in X.columns:
                X_eng['range_width'] = X['range_upper'] - X['range_lower']
                X_eng['liquidity_concentration'] = X['liquidity'] / (X_eng['range_width'] + 1)

        # Time-based features
        if 'time_in_pool' in X.columns:
            X_eng['time_in_pool_sqrt'] = np.sqrt(X['time_in_pool'])
            X_eng['time_in_pool_log'] = np.log1p(X['time_in_pool'])

        # Fee tier features
        if 'fee_tier' in X.columns:
            X_eng['fee_impact'] = X['fee_tier'] * 10000  # Convert to basis points
            if 'volatility_token0' in X_eng.columns:
                X_eng['fee_to_volatility_ratio'] = X['fee_tier'] / (X_eng['max_volatility'] + 1e-8)

        # Market conditions
        if 'market_trend' in X.columns:
            X_eng['abs_market_trend'] = np.abs(X['market_trend'])
            X_eng['market_trend_squared'] = X['market_trend'] ** 2

        # Risk metrics
        if 'var_95' in X.columns:  # Value at Risk
            X_eng['risk_normalized'] = X['var_95'] / (X_eng['total_volume'] + 1e-8) if 'total_volume' in X_eng.columns else X['var_95']

        return X_eng

    def _calculate_impermanent_loss(self, initial_ratio: float, current_ratio: float) -> float:
        """
        Calculate actual impermanent loss

        Args:
            initial_ratio: Initial price ratio
            current_ratio: Current price ratio

        Returns:
            Impermanent loss percentage
        """
        price_ratio = current_ratio / initial_ratio
        il = 2 * np.sqrt(price_ratio) / (1 + price_ratio) - 1
        return il

    def prepare_training_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Prepare data for training including feature engineering and IL calculation

        Args:
            df: Raw data DataFrame

        Returns:
            Features DataFrame and target Series
        """
        # Engineer features
        if self.feature_engineering:
            X = self._engineer_features(df)
        else:
            X = df.copy()

        # Calculate target (impermanent loss) if not present
        if 'impermanent_loss' not in df.columns:
            if 'initial_price_ratio' in df.columns and 'current_price_ratio' in df.columns:
                y = df.apply(lambda row: self._calculate_impermanent_loss(
                    row['initial_price_ratio'],
                    row['current_price_ratio']
                ), axis=1)
            else:
                raise ValueError("Cannot calculate impermanent loss: missing price ratio columns")
        else:
            y = df['impermanent_loss']

        # Remove target and non-feature columns from X
        columns_to_drop = ['impermanent_loss', 'timestamp', 'pool_address', 'pair_name']
        X = X.drop(columns=[col for col in columns_to_drop if col in X.columns], errors='ignore')

        # Store feature names
        self.feature_names = X.columns.tolist()

        return X, y

    def train(self,
              X: pd.DataFrame,
              y: pd.Series,
              validation_split: float = 0.2,
              optimize_hyperparameters: bool = False,
              feature_selection: bool = True,
              cv_folds: int = 5):
        """
        Train the impermanent loss prediction model

        Args:
            X: Feature DataFrame
            y: Target Series (impermanent loss)
            validation_split: Validation set size
            optimize_hyperparameters: Whether to perform hyperparameter optimization
            feature_selection: Whether to perform feature selection
            cv_folds: Number of cross-validation folds
        """
        logger.info(f"Training IL predictor with {len(X)} samples and {len(X.columns)} features")

        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=validation_split, random_state=self.random_state
        )

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)

        # Feature selection
        if feature_selection and len(X.columns) > 20:
            logger.info("Performing feature selection...")

            # Use Random Forest for initial feature importance
            rf_selector = RandomForestRegressor(n_estimators=100, random_state=self.random_state, n_jobs=-1)
            rf_selector.fit(X_train_scaled, y_train)

            # Get feature importance
            feature_importance = pd.DataFrame({
                'feature': X.columns,
                'importance': rf_selector.feature_importances_
            }).sort_values('importance', ascending=False)

            # Select top features
            n_features = min(50, len(X.columns))
            self.selected_features = feature_importance.head(n_features)['feature'].tolist()
            self.feature_importance = feature_importance.set_index('feature')['importance'].to_dict()

            # Filter features
            X_train_scaled = X_train[self.selected_features].values
            X_val_scaled = X_val[self.selected_features].values

            logger.info(f"Selected {len(self.selected_features)} features")

        # Hyperparameter optimization
        if optimize_hyperparameters:
            logger.info("Optimizing hyperparameters...")
            self._optimize_hyperparameters(X_train_scaled, y_train, cv_folds)

        # Train models
        logger.info("Training models...")
        for name, model in self.models.items():
            logger.info(f"Training {name}...")

            # Train model
            model.fit(X_train_scaled, y_train)

            # Evaluate on training set
            train_pred = model.predict(X_train_scaled)
            train_mse = mean_squared_error(y_train, train_pred)
            train_mae = mean_absolute_error(y_train, train_pred)
            train_r2 = r2_score(y_train, train_pred)

            # Evaluate on validation set
            val_pred = model.predict(X_val_scaled)
            val_mse = mean_squared_error(y_val, val_pred)
            val_mae = mean_absolute_error(y_val, val_pred)
            val_r2 = r2_score(y_val, val_pred)

            # Store metrics
            self.training_metrics[name] = {
                'mse': train_mse,
                'mae': train_mae,
                'r2': train_r2
            }

            self.validation_metrics[name] = {
                'mse': val_mse,
                'mae': val_mae,
                'r2': val_r2
            }

            logger.info(f"{name} - Train R2: {train_r2:.4f}, Val R2: {val_r2:.4f}")

        # Get feature importance from all models
        self._aggregate_feature_importance()

        logger.info("Training complete!")

    def _optimize_hyperparameters(self, X_train: np.ndarray, y_train: np.ndarray, cv_folds: int):
        """Optimize hyperparameters using GridSearchCV"""
        # Random Forest parameters
        rf_params = {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 15, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }

        rf_grid = GridSearchCV(
            self.models['random_forest'],
            rf_params,
            cv=cv_folds,
            scoring='neg_mean_squared_error',
            n_jobs=-1,
            verbose=0
        )
        rf_grid.fit(X_train, y_train)
        self.models['random_forest'] = rf_grid.best_estimator_

        logger.info(f"Best RF params: {rf_grid.best_params_}")

        if self.use_ensemble:
            # XGBoost parameters
            xgb_params = {
                'n_estimators': [100, 200],
                'max_depth': [5, 10, 15],
                'learning_rate': [0.01, 0.05, 0.1],
                'subsample': [0.6, 0.8, 1.0]
            }

            xgb_grid = GridSearchCV(
                self.models['xgboost'],
                xgb_params,
                cv=3,  # Fewer folds for speed
                scoring='neg_mean_squared_error',
                n_jobs=-1,
                verbose=0
            )
            xgb_grid.fit(X_train, y_train)
            self.models['xgboost'] = xgb_grid.best_estimator_

    def _aggregate_feature_importance(self):
        """Aggregate feature importance from all models"""
        importance_dict = {}

        # Get importance from each model
        for name, model in self.models.items():
            if hasattr(model, 'feature_importances_'):
                features = self.selected_features if self.selected_features else self.feature_names
                for i, feature in enumerate(features):
                    if feature not in importance_dict:
                        importance_dict[feature] = []
                    importance_dict[feature].append(model.feature_importances_[i])

        # Average importance
        self.feature_importance = {
            feature: np.mean(scores) for feature, scores in importance_dict.items()
        }

    def predict(self, X: pd.DataFrame, return_individual: bool = False) -> np.ndarray:
        """
        Predict impermanent loss

        Args:
            X: Feature DataFrame
            return_individual: Whether to return individual model predictions

        Returns:
            Predicted impermanent loss values
        """
        # Engineer features
        if self.feature_engineering:
            X = self._engineer_features(X)

        # Select features
        if self.selected_features:
            X = X[self.selected_features]
        else:
            X = X[self.feature_names]

        # Scale features
        X_scaled = self.scaler.transform(X)

        # Get predictions from each model
        predictions = {}
        for name, model in self.models.items():
            predictions[name] = model.predict(X_scaled)

        if return_individual:
            return predictions

        # Ensemble prediction (weighted average)
        if self.use_ensemble:
            # Weight by validation R2 score
            weights = []
            for name in predictions:
                weight = max(0, self.validation_metrics[name]['r2'])
                weights.append(weight)

            weights = np.array(weights)
            weights = weights / np.sum(weights)  # Normalize

            ensemble_pred = np.zeros(len(X))
            for i, name in enumerate(predictions):
                ensemble_pred += predictions[name] * weights[i]

            return ensemble_pred
        else:
            return predictions['random_forest']

    def predict_with_uncertainty(self, X: pd.DataFrame, n_estimations: int = 100) -> Dict[str, np.ndarray]:
        """
        Predict with uncertainty estimation using bootstrapping

        Args:
            X: Feature DataFrame
            n_estimations: Number of bootstrap estimations

        Returns:
            Dictionary with predictions, lower and upper bounds
        """
        predictions = []

        for _ in range(n_estimations):
            # Random subsample of trees (for Random Forest)
            if 'random_forest' in self.models:
                n_trees = len(self.models['random_forest'].estimators_)
                tree_indices = np.random.choice(n_trees, n_trees, replace=True)

                # Get predictions from subsampled trees
                tree_predictions = []
                for idx in tree_indices[:n_trees//2]:  # Use half the trees
                    tree = self.models['random_forest'].estimators_[idx]
                    X_processed = X[self.selected_features] if self.selected_features else X[self.feature_names]
                    X_scaled = self.scaler.transform(X_processed)
                    tree_predictions.append(tree.predict(X_scaled))

                predictions.append(np.mean(tree_predictions, axis=0))

        predictions = np.array(predictions)

        return {
            'prediction': np.mean(predictions, axis=0),
            'lower_bound': np.percentile(predictions, 2.5, axis=0),
            'upper_bound': np.percentile(predictions, 97.5, axis=0),
            'std': np.std(predictions, axis=0)
        }

    def save_model(self, suffix: str = ""):
        """Save the trained models"""
        save_name = f"{self.model_name}_{suffix}" if suffix else self.model_name

        # Save models
        for name, model in self.models.items():
            model_path = os.path.join(self.save_path, f"{save_name}_{name}.pkl")
            joblib.dump(model, model_path)

        # Save scaler
        scaler_path = os.path.join(self.save_path, f"{save_name}_scaler.pkl")
        joblib.dump(self.scaler, scaler_path)

        # Save metadata
        metadata = {
            'model_name': self.model_name,
            'timestamp': datetime.now().isoformat(),
            'feature_names': self.feature_names,
            'selected_features': self.selected_features,
            'feature_importance': self.feature_importance,
            'training_metrics': self.training_metrics,
            'validation_metrics': self.validation_metrics,
            'use_ensemble': self.use_ensemble,
            'feature_engineering': self.feature_engineering
        }

        metadata_path = os.path.join(self.save_path, f"{save_name}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        logger.info(f"Models saved to {self.save_path}")

    def load_model(self, model_path: str):
        """Load trained models"""
        # Extract base path
        base_path = os.path.dirname(model_path)
        base_name = os.path.basename(model_path).replace('.pkl', '')

        # Load models
        for name in self.models.keys():
            model_file = os.path.join(base_path, f"{base_name}_{name}.pkl")
            if os.path.exists(model_file):
                self.models[name] = joblib.load(model_file)

        # Load scaler
        scaler_path = os.path.join(base_path, f"{base_name}_scaler.pkl")
        if os.path.exists(scaler_path):
            self.scaler = joblib.load(scaler_path)

        # Load metadata
        metadata_path = os.path.join(base_path, f"{base_name}_metadata.json")
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
                self.feature_names = metadata.get('feature_names', [])
                self.selected_features = metadata.get('selected_features', [])
                self.feature_importance = metadata.get('feature_importance', {})
                self.training_metrics = metadata.get('training_metrics', {})
                self.validation_metrics = metadata.get('validation_metrics', {})

        logger.info(f"Models loaded from {base_path}")