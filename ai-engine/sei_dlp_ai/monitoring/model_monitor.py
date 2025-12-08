"""
Model Monitoring and Evaluation System
Provides real-time monitoring, performance tracking, and alerting for ML models
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field, asdict
import json
import logging
import asyncio
from pathlib import Path
import warnings
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns
from collections import deque
import redis
import pickle

logger = logging.getLogger(__name__)

@dataclass
class ModelMetrics:
    """Container for model performance metrics"""
    timestamp: datetime
    model_name: str
    model_type: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    mse: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None
    custom_metrics: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict:
        """Convert metrics to dictionary"""
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data


@dataclass
class DriftMetrics:
    """Metrics for detecting model/data drift"""
    timestamp: datetime
    feature_drift: Dict[str, float]
    prediction_drift: float
    performance_drift: float
    is_drifting: bool
    drift_severity: str  # "none", "low", "medium", "high"

    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data


class PerformanceMonitor:
    """
    Real-time performance monitoring for ML models
    """

    def __init__(self,
                 window_size: int = 1000,
                 drift_threshold: float = 0.1,
                 redis_host: Optional[str] = None,
                 redis_port: int = 6379):
        """
        Initialize performance monitor

        Args:
            window_size: Size of rolling window for metrics
            drift_threshold: Threshold for detecting drift
            redis_host: Redis host for caching metrics
            redis_port: Redis port
        """
        self.window_size = window_size
        self.drift_threshold = drift_threshold

        # Metrics storage
        self.metrics_history: Dict[str, deque] = {}
        self.predictions_history: Dict[str, deque] = {}
        self.feature_distributions: Dict[str, Dict] = {}

        # Drift detection
        self.baseline_metrics: Dict[str, ModelMetrics] = {}
        self.baseline_distributions: Dict[str, Dict] = {}

        # Redis for distributed monitoring
        self.redis_client = None
        if redis_host:
            try:
                self.redis_client = redis.StrictRedis(
                    host=redis_host,
                    port=redis_port,
                    decode_responses=False
                )
                self.redis_client.ping()
                logger.info("Connected to Redis for metrics storage")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}. Using in-memory storage.")
                self.redis_client = None

    def track_prediction(self,
                        model_name: str,
                        prediction: np.ndarray,
                        ground_truth: Optional[np.ndarray] = None,
                        features: Optional[np.ndarray] = None,
                        metadata: Optional[Dict] = None):
        """
        Track a model prediction

        Args:
            model_name: Name of the model
            prediction: Model prediction
            ground_truth: Actual value (if available)
            features: Input features
            metadata: Additional metadata
        """
        timestamp = datetime.now()

        # Initialize storage if needed
        if model_name not in self.predictions_history:
            self.predictions_history[model_name] = deque(maxlen=self.window_size)
            self.metrics_history[model_name] = deque(maxlen=self.window_size)

        # Store prediction
        pred_record = {
            'timestamp': timestamp,
            'prediction': prediction,
            'ground_truth': ground_truth,
            'features': features,
            'metadata': metadata or {}
        }

        self.predictions_history[model_name].append(pred_record)

        # Cache to Redis if available
        if self.redis_client:
            key = f"prediction:{model_name}:{timestamp.timestamp()}"
            self.redis_client.setex(
                key,
                86400,  # 24 hour TTL
                pickle.dumps(pred_record)
            )

        # Calculate metrics if ground truth available
        if ground_truth is not None:
            metrics = self._calculate_metrics(model_name, prediction, ground_truth)
            self.metrics_history[model_name].append(metrics)

            # Check for drift
            if features is not None:
                drift_metrics = self._check_drift(model_name, features, prediction)
                if drift_metrics.is_drifting:
                    self._trigger_alert(model_name, drift_metrics)

    def _calculate_metrics(self,
                          model_name: str,
                          prediction: np.ndarray,
                          ground_truth: np.ndarray) -> ModelMetrics:
        """Calculate performance metrics"""

        # Regression metrics
        mse = mean_squared_error(ground_truth, prediction)
        mae = mean_absolute_error(ground_truth, prediction)
        rmse = np.sqrt(mse)
        r2 = r2_score(ground_truth, prediction)

        # Create metrics object
        metrics = ModelMetrics(
            timestamp=datetime.now(),
            model_name=model_name,
            model_type="regression",
            mse=mse,
            mae=mae,
            rmse=rmse,
            r2=r2
        )

        return metrics

    def _check_drift(self,
                    model_name: str,
                    features: np.ndarray,
                    prediction: np.ndarray) -> DriftMetrics:
        """
        Check for model/data drift

        Args:
            model_name: Model name
            features: Input features
            prediction: Model prediction

        Returns:
            DriftMetrics object
        """
        # Initialize baseline if not exists
        if model_name not in self.baseline_distributions:
            self._set_baseline(model_name, features, prediction)
            return DriftMetrics(
                timestamp=datetime.now(),
                feature_drift={},
                prediction_drift=0.0,
                performance_drift=0.0,
                is_drifting=False,
                drift_severity="none"
            )

        # Calculate feature drift (KL divergence approximation)
        feature_drift = {}
        baseline_dist = self.baseline_distributions[model_name]

        for i in range(features.shape[-1]):
            feature_values = features[..., i].flatten()
            baseline_values = baseline_dist['features'][i]

            # Simple distribution comparison
            drift_score = self._calculate_distribution_drift(
                feature_values,
                baseline_values
            )
            feature_drift[f"feature_{i}"] = drift_score

        # Calculate prediction drift
        prediction_drift = self._calculate_distribution_drift(
            prediction.flatten(),
            baseline_dist['predictions']
        )

        # Calculate performance drift
        recent_metrics = list(self.metrics_history.get(model_name, []))[-100:]
        if recent_metrics and model_name in self.baseline_metrics:
            baseline_perf = self.baseline_metrics[model_name].mae or 0
            recent_perf = np.mean([m.mae or 0 for m in recent_metrics])
            performance_drift = abs(recent_perf - baseline_perf) / (baseline_perf + 1e-8)
        else:
            performance_drift = 0.0

        # Determine if drifting
        max_feature_drift = max(feature_drift.values()) if feature_drift else 0
        is_drifting = (
            max_feature_drift > self.drift_threshold or
            prediction_drift > self.drift_threshold or
            performance_drift > self.drift_threshold
        )

        # Determine severity
        max_drift = max(max_feature_drift, prediction_drift, performance_drift)
        if max_drift < self.drift_threshold:
            drift_severity = "none"
        elif max_drift < self.drift_threshold * 2:
            drift_severity = "low"
        elif max_drift < self.drift_threshold * 3:
            drift_severity = "medium"
        else:
            drift_severity = "high"

        return DriftMetrics(
            timestamp=datetime.now(),
            feature_drift=feature_drift,
            prediction_drift=prediction_drift,
            performance_drift=performance_drift,
            is_drifting=is_drifting,
            drift_severity=drift_severity
        )

    def _calculate_distribution_drift(self,
                                     current: np.ndarray,
                                     baseline: np.ndarray) -> float:
        """Calculate drift between two distributions using Wasserstein distance"""
        from scipy.stats import wasserstein_distance

        try:
            # Normalize arrays
            current = current.flatten()
            baseline = baseline.flatten()

            # Calculate Wasserstein distance
            drift = wasserstein_distance(current, baseline)

            # Normalize to [0, 1] range
            drift = min(drift / (np.std(baseline) + 1e-8), 1.0)

            return drift
        except Exception as e:
            logger.warning(f"Error calculating distribution drift: {e}")
            return 0.0

    def _set_baseline(self,
                     model_name: str,
                     features: np.ndarray,
                     predictions: np.ndarray):
        """Set baseline distributions for drift detection"""

        # Store feature distributions
        feature_distributions = []
        for i in range(features.shape[-1]):
            feature_distributions.append(features[..., i].flatten())

        self.baseline_distributions[model_name] = {
            'features': feature_distributions,
            'predictions': predictions.flatten(),
            'timestamp': datetime.now()
        }

        # Set baseline metrics
        if self.metrics_history.get(model_name):
            recent_metrics = list(self.metrics_history[model_name])[-100:]
            if recent_metrics:
                # Average recent metrics as baseline
                avg_mae = np.mean([m.mae or 0 for m in recent_metrics])
                avg_mse = np.mean([m.mse or 0 for m in recent_metrics])
                avg_r2 = np.mean([m.r2 or 0 for m in recent_metrics])

                self.baseline_metrics[model_name] = ModelMetrics(
                    timestamp=datetime.now(),
                    model_name=model_name,
                    model_type="regression",
                    mae=avg_mae,
                    mse=avg_mse,
                    r2=avg_r2
                )

    def _trigger_alert(self, model_name: str, drift_metrics: DriftMetrics):
        """Trigger alert for model drift"""
        alert_msg = f"""
        ⚠️ Model Drift Detected for {model_name}
        Severity: {drift_metrics.drift_severity}
        Prediction Drift: {drift_metrics.prediction_drift:.3f}
        Performance Drift: {drift_metrics.performance_drift:.3f}
        Max Feature Drift: {max(drift_metrics.feature_drift.values()):.3f}
        Timestamp: {drift_metrics.timestamp}
        """

        logger.warning(alert_msg)

        # Store alert in Redis
        if self.redis_client:
            alert_key = f"alert:{model_name}:{drift_metrics.timestamp.timestamp()}"
            self.redis_client.setex(
                alert_key,
                86400,  # 24 hour TTL
                json.dumps(drift_metrics.to_dict())
            )

    def get_model_metrics(self,
                         model_name: str,
                         time_window: Optional[timedelta] = None) -> List[ModelMetrics]:
        """
        Get metrics for a model

        Args:
            model_name: Model name
            time_window: Time window for metrics

        Returns:
            List of metrics
        """
        if model_name not in self.metrics_history:
            return []

        metrics = list(self.metrics_history[model_name])

        if time_window:
            cutoff_time = datetime.now() - time_window
            metrics = [m for m in metrics if m.timestamp > cutoff_time]

        return metrics

    def generate_report(self, model_name: str) -> Dict[str, Any]:
        """
        Generate performance report for a model

        Args:
            model_name: Model name

        Returns:
            Performance report
        """
        metrics = self.get_model_metrics(model_name)

        if not metrics:
            return {"error": f"No metrics found for model {model_name}"}

        # Calculate statistics
        mae_values = [m.mae for m in metrics if m.mae is not None]
        mse_values = [m.mse for m in metrics if m.mse is not None]
        r2_values = [m.r2 for m in metrics if m.r2 is not None]

        report = {
            "model_name": model_name,
            "report_timestamp": datetime.now().isoformat(),
            "metrics_count": len(metrics),
            "time_range": {
                "start": metrics[0].timestamp.isoformat(),
                "end": metrics[-1].timestamp.isoformat()
            },
            "performance": {
                "mae": {
                    "mean": np.mean(mae_values) if mae_values else None,
                    "std": np.std(mae_values) if mae_values else None,
                    "min": np.min(mae_values) if mae_values else None,
                    "max": np.max(mae_values) if mae_values else None
                },
                "mse": {
                    "mean": np.mean(mse_values) if mse_values else None,
                    "std": np.std(mse_values) if mse_values else None,
                    "min": np.min(mse_values) if mse_values else None,
                    "max": np.max(mse_values) if mse_values else None
                },
                "r2": {
                    "mean": np.mean(r2_values) if r2_values else None,
                    "std": np.std(r2_values) if r2_values else None,
                    "min": np.min(r2_values) if r2_values else None,
                    "max": np.max(r2_values) if r2_values else None
                }
            }
        }

        # Check for recent drift
        if model_name in self.baseline_distributions:
            recent_predictions = list(self.predictions_history.get(model_name, []))[-10:]
            if recent_predictions and recent_predictions[-1].get('features') is not None:
                drift = self._check_drift(
                    model_name,
                    recent_predictions[-1]['features'],
                    recent_predictions[-1]['prediction']
                )
                report['drift'] = {
                    "is_drifting": drift.is_drifting,
                    "severity": drift.drift_severity,
                    "prediction_drift": drift.prediction_drift,
                    "performance_drift": drift.performance_drift
                }

        return report

    def plot_metrics(self,
                    model_name: str,
                    save_path: Optional[str] = None):
        """
        Plot model metrics over time

        Args:
            model_name: Model name
            save_path: Path to save plot
        """
        metrics = self.get_model_metrics(model_name)

        if not metrics:
            logger.warning(f"No metrics to plot for {model_name}")
            return

        # Prepare data
        timestamps = [m.timestamp for m in metrics]
        mae_values = [m.mae for m in metrics if m.mae is not None]
        mse_values = [m.mse for m in metrics if m.mse is not None]
        r2_values = [m.r2 for m in metrics if m.r2 is not None]

        # Create subplots
        fig, axes = plt.subplots(3, 1, figsize=(12, 10))

        # Plot MAE
        if mae_values:
            axes[0].plot(timestamps[:len(mae_values)], mae_values, 'b-', label='MAE')
            axes[0].set_ylabel('MAE')
            axes[0].set_title(f'Model Performance: {model_name}')
            axes[0].legend()
            axes[0].grid(True, alpha=0.3)

        # Plot MSE
        if mse_values:
            axes[1].plot(timestamps[:len(mse_values)], mse_values, 'r-', label='MSE')
            axes[1].set_ylabel('MSE')
            axes[1].legend()
            axes[1].grid(True, alpha=0.3)

        # Plot R2
        if r2_values:
            axes[2].plot(timestamps[:len(r2_values)], r2_values, 'g-', label='R²')
            axes[2].set_ylabel('R² Score')
            axes[2].set_xlabel('Time')
            axes[2].legend()
            axes[2].grid(True, alpha=0.3)

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=100, bbox_inches='tight')
            logger.info(f"Metrics plot saved to {save_path}")

        plt.show()


class ModelEvaluator:
    """
    Comprehensive model evaluation system
    """

    def __init__(self):
        """Initialize model evaluator"""
        self.evaluation_results: Dict[str, List[Dict]] = {}
        self.comparison_results: Dict[str, Dict] = {}

    async def evaluate_rl_agent(self,
                               agent,
                               env,
                               n_episodes: int = 100) -> Dict[str, Any]:
        """
        Evaluate RL agent performance

        Args:
            agent: RL agent
            env: Environment
            n_episodes: Number of evaluation episodes

        Returns:
            Evaluation results
        """
        results = {
            'rewards': [],
            'episode_lengths': [],
            'fees_collected': [],
            'impermanent_loss': [],
            'capital_ratio': [],
            'time_in_range': []
        }

        for episode in range(n_episodes):
            obs, _ = env.reset()
            done = False
            episode_reward = 0
            episode_length = 0

            while not done:
                action, _ = agent.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, info = env.step(action)
                done = terminated or truncated

                episode_reward += reward
                episode_length += 1

            # Collect episode stats
            results['rewards'].append(episode_reward)
            results['episode_lengths'].append(episode_length)
            results['fees_collected'].append(info.get('fees_collected', 0))
            results['impermanent_loss'].append(info.get('total_il', 0))
            results['capital_ratio'].append(info.get('capital', 10000) / 10000)
            results['time_in_range'].append(info.get('time_in_range_ratio', 0))

        # Calculate statistics
        evaluation = {
            'model_type': 'rl_agent',
            'timestamp': datetime.now().isoformat(),
            'n_episodes': n_episodes,
            'reward': {
                'mean': np.mean(results['rewards']),
                'std': np.std(results['rewards']),
                'min': np.min(results['rewards']),
                'max': np.max(results['rewards'])
            },
            'fees': {
                'mean': np.mean(results['fees_collected']),
                'total': np.sum(results['fees_collected'])
            },
            'impermanent_loss': {
                'mean': np.mean(results['impermanent_loss']),
                'max': np.max(results['impermanent_loss'])
            },
            'capital_preservation': {
                'mean': np.mean(results['capital_ratio']),
                'min': np.min(results['capital_ratio'])
            },
            'efficiency': {
                'time_in_range': np.mean(results['time_in_range']),
                'avg_episode_length': np.mean(results['episode_lengths'])
            }
        }

        # Store results
        if 'rl_agent' not in self.evaluation_results:
            self.evaluation_results['rl_agent'] = []
        self.evaluation_results['rl_agent'].append(evaluation)

        return evaluation

    async def evaluate_lstm_forecaster(self,
                                      model,
                                      test_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Evaluate LSTM forecaster

        Args:
            model: LSTM model
            test_data: Test dataset

        Returns:
            Evaluation results
        """
        predictions = []
        actuals = []
        uncertainties = []

        # Generate predictions
        window_size = 168  # 1 week of hourly data
        prediction_horizon = 24  # 24 hours ahead

        for i in range(len(test_data) - window_size - prediction_horizon):
            input_window = test_data.iloc[i:i+window_size]
            actual_values = test_data.iloc[i+window_size:i+window_size+prediction_horizon]['price'].values

            # Get prediction
            result = model.predict(input_window, return_uncertainty=True)

            predictions.append(result['predictions'])
            actuals.append(actual_values)
            if 'uncertainty' in result:
                uncertainties.append(result['uncertainty'])

        predictions = np.array(predictions)
        actuals = np.array(actuals)

        # Calculate metrics
        mse = mean_squared_error(actuals.flatten(), predictions.flatten())
        mae = mean_absolute_error(actuals.flatten(), predictions.flatten())
        rmse = np.sqrt(mse)
        r2 = r2_score(actuals.flatten(), predictions.flatten())

        # Directional accuracy
        pred_direction = np.diff(predictions, axis=1) > 0
        actual_direction = np.diff(actuals, axis=1) > 0
        directional_accuracy = np.mean(pred_direction == actual_direction)

        evaluation = {
            'model_type': 'lstm_forecaster',
            'timestamp': datetime.now().isoformat(),
            'test_size': len(predictions),
            'metrics': {
                'mse': mse,
                'mae': mae,
                'rmse': rmse,
                'r2': r2,
                'directional_accuracy': directional_accuracy
            },
            'horizons': {
                '1h': {'mae': mean_absolute_error(actuals[:, 0], predictions[:, 0])},
                '6h': {'mae': mean_absolute_error(actuals[:, 5], predictions[:, 5])},
                '12h': {'mae': mean_absolute_error(actuals[:, 11], predictions[:, 11])},
                '24h': {'mae': mean_absolute_error(actuals[:, -1], predictions[:, -1])}
            }
        }

        # Store results
        if 'lstm_forecaster' not in self.evaluation_results:
            self.evaluation_results['lstm_forecaster'] = []
        self.evaluation_results['lstm_forecaster'].append(evaluation)

        return evaluation

    async def evaluate_il_predictor(self,
                                   model,
                                   test_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Evaluate IL predictor

        Args:
            model: IL prediction model
            test_data: Test dataset with features and actual IL

        Returns:
            Evaluation results
        """
        # Prepare features
        feature_cols = [col for col in test_data.columns if col != 'actual_il']
        X_test = test_data[feature_cols]
        y_test = test_data['actual_il']

        # Get predictions with uncertainty
        results = model.predict_with_uncertainty(X_test)
        predictions = results['prediction']
        lower_bounds = results['lower_bound']
        upper_bounds = results['upper_bound']

        # Calculate metrics
        mse = mean_squared_error(y_test, predictions)
        mae = mean_absolute_error(y_test, predictions)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, predictions)

        # Coverage of confidence intervals
        coverage = np.mean((y_test >= lower_bounds) & (y_test <= upper_bounds))

        # Risk stratification accuracy
        predicted_risk = pd.cut(predictions, bins=[-np.inf, 0.01, 0.05, np.inf],
                              labels=['low', 'medium', 'high'])
        actual_risk = pd.cut(y_test, bins=[-np.inf, 0.01, 0.05, np.inf],
                           labels=['low', 'medium', 'high'])
        risk_accuracy = np.mean(predicted_risk == actual_risk)

        evaluation = {
            'model_type': 'il_predictor',
            'timestamp': datetime.now().isoformat(),
            'test_size': len(predictions),
            'metrics': {
                'mse': mse,
                'mae': mae,
                'rmse': rmse,
                'r2': r2,
                'confidence_interval_coverage': coverage,
                'risk_classification_accuracy': risk_accuracy
            },
            'feature_importance': model.feature_importance if hasattr(model, 'feature_importance') else None
        }

        # Store results
        if 'il_predictor' not in self.evaluation_results:
            self.evaluation_results['il_predictor'] = []
        self.evaluation_results['il_predictor'].append(evaluation)

        return evaluation

    def compare_models(self, model_names: List[str]) -> Dict[str, Any]:
        """
        Compare performance across models

        Args:
            model_names: List of model names to compare

        Returns:
            Comparison results
        """
        comparison = {
            'timestamp': datetime.now().isoformat(),
            'models': {}
        }

        for model_name in model_names:
            if model_name in self.evaluation_results:
                latest_eval = self.evaluation_results[model_name][-1]

                if model_name == 'rl_agent':
                    comparison['models'][model_name] = {
                        'avg_reward': latest_eval['reward']['mean'],
                        'fees_collected': latest_eval['fees']['mean'],
                        'capital_preservation': latest_eval['capital_preservation']['mean'],
                        'time_in_range': latest_eval['efficiency']['time_in_range']
                    }
                elif model_name == 'lstm_forecaster':
                    comparison['models'][model_name] = {
                        'mae': latest_eval['metrics']['mae'],
                        'r2': latest_eval['metrics']['r2'],
                        'directional_accuracy': latest_eval['metrics']['directional_accuracy']
                    }
                elif model_name == 'il_predictor':
                    comparison['models'][model_name] = {
                        'mae': latest_eval['metrics']['mae'],
                        'r2': latest_eval['metrics']['r2'],
                        'risk_accuracy': latest_eval['metrics']['risk_classification_accuracy']
                    }

        # Determine best model for each metric
        comparison['best_performers'] = self._identify_best_performers(comparison['models'])

        self.comparison_results[datetime.now().isoformat()] = comparison

        return comparison

    def _identify_best_performers(self, models: Dict) -> Dict[str, str]:
        """Identify best performing model for each metric"""
        best_performers = {}

        # For RL-specific metrics
        if 'rl_agent' in models:
            best_performers['vault_optimization'] = 'rl_agent'

        # For prediction accuracy
        prediction_models = ['lstm_forecaster', 'il_predictor']
        mae_scores = {m: models[m].get('mae', float('inf'))
                     for m in prediction_models if m in models}
        if mae_scores:
            best_performers['prediction_accuracy'] = min(mae_scores, key=mae_scores.get)

        return best_performers

    def generate_evaluation_report(self) -> Dict[str, Any]:
        """Generate comprehensive evaluation report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'models_evaluated': list(self.evaluation_results.keys()),
            'evaluation_summary': {},
            'recommendations': []
        }

        # Summarize each model
        for model_name, evaluations in self.evaluation_results.items():
            if evaluations:
                latest = evaluations[-1]
                report['evaluation_summary'][model_name] = {
                    'last_evaluated': latest['timestamp'],
                    'performance': latest.get('metrics', latest.get('reward', {}))
                }

        # Generate recommendations
        if 'rl_agent' in self.evaluation_results:
            latest_rl = self.evaluation_results['rl_agent'][-1]
            if latest_rl['capital_preservation']['mean'] < 0.95:
                report['recommendations'].append(
                    "RL Agent showing capital loss - consider retraining with conservative reward shaping"
                )

        if 'lstm_forecaster' in self.evaluation_results:
            latest_lstm = self.evaluation_results['lstm_forecaster'][-1]
            if latest_lstm['metrics']['directional_accuracy'] < 0.55:
                report['recommendations'].append(
                    "LSTM directional accuracy below threshold - consider adding more features or longer training"
                )

        if 'il_predictor' in self.evaluation_results:
            latest_il = self.evaluation_results['il_predictor'][-1]
            if latest_il['metrics']['risk_classification_accuracy'] < 0.7:
                report['recommendations'].append(
                    "IL risk classification needs improvement - consider ensemble voting or threshold tuning"
                )

        return report


# Monitoring Dashboard API Extension
class MonitoringAPI:
    """API endpoints for monitoring dashboard"""

    def __init__(self, monitor: PerformanceMonitor, evaluator: ModelEvaluator):
        self.monitor = monitor
        self.evaluator = evaluator

    async def get_realtime_metrics(self, model_name: str) -> Dict:
        """Get real-time metrics for dashboard"""
        return {
            'model_name': model_name,
            'timestamp': datetime.now().isoformat(),
            'recent_metrics': [m.to_dict() for m in self.monitor.get_model_metrics(model_name)[-10:]],
            'performance_report': self.monitor.generate_report(model_name)
        }

    async def get_drift_status(self, model_name: str) -> Dict:
        """Get drift detection status"""
        # Get latest prediction to check drift
        predictions = list(self.monitor.predictions_history.get(model_name, []))
        if not predictions or not predictions[-1].get('features'):
            return {'status': 'no_data', 'model_name': model_name}

        latest = predictions[-1]
        drift = self.monitor._check_drift(
            model_name,
            latest['features'],
            latest['prediction']
        )

        return {
            'model_name': model_name,
            'timestamp': datetime.now().isoformat(),
            'drift_metrics': drift.to_dict(),
            'alert': drift.is_drifting,
            'severity': drift.drift_severity
        }

    async def trigger_evaluation(self, model_name: str, model, test_data) -> Dict:
        """Trigger model evaluation"""
        if model_name == 'rl_agent':
            return await self.evaluator.evaluate_rl_agent(model, test_data)
        elif model_name == 'lstm_forecaster':
            return await self.evaluator.evaluate_lstm_forecaster(model, test_data)
        elif model_name == 'il_predictor':
            return await self.evaluator.evaluate_il_predictor(model, test_data)
        else:
            return {'error': f'Unknown model: {model_name}'}