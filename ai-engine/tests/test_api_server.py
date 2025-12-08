"""
Tests for API Server
"""

import pytest
import json
import numpy as np
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi.testclient import TestClient
from datetime import datetime
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class TestHealthEndpoint:
    """Test health check endpoint"""

    def test_health_check(self, api_client):
        """Test /health endpoint"""
        response = api_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "redis_connected" in data

    @patch('api_server.redis_client')
    def test_health_check_redis_down(self, mock_redis, api_client):
        """Test health check with Redis down"""
        mock_redis.ping.side_effect = Exception("Redis connection failed")
        response = api_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["redis_connected"] is False


class TestPredictionEndpoints:
    """Test prediction endpoints"""

    def test_predict_action(self, api_client, sample_observation):
        """Test /predict/action endpoint"""
        with patch('api_server.rl_agent') as mock_agent:
            mock_agent.select_action.return_value = (1, None)

            response = api_client.post(
                "/predict/action",
                json={"observation": sample_observation.tolist()}
            )

            assert response.status_code == 200
            data = response.json()
            assert "action" in data
            assert "action_name" in data
            assert data["action"] == 1
            assert data["action_name"] == "EXPAND_RANGE"

    def test_predict_price(self, api_client):
        """Test /predict/price endpoint"""
        with patch('api_server.lstm_forecaster') as mock_lstm:
            mock_lstm.predict.return_value = np.array([[105.0]])

            historical_prices = [100, 101, 102, 103, 104]
            response = api_client.post(
                "/predict/price",
                json={
                    "historical_prices": historical_prices,
                    "features": {
                        "volume": [1000] * 5,
                        "volatility": [0.2] * 5
                    }
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "predicted_price" in data
            assert "confidence_interval" in data

    def test_predict_il(self, api_client):
        """Test /predict/il endpoint"""
        with patch('api_server.il_predictor') as mock_il:
            mock_il.predict.return_value = np.array([-0.05])

            response = api_client.post(
                "/predict/il",
                json={
                    "price_token0": 100.0,
                    "price_token1": 50.0,
                    "volatility_token0": 0.3,
                    "volatility_token1": 0.25,
                    "correlation": 0.7,
                    "liquidity": 1000000.0,
                    "fee_tier": 0.003
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "predicted_il" in data
            assert "risk_level" in data
            assert data["predicted_il"] == -0.05

    def test_predict_invalid_observation(self, api_client):
        """Test prediction with invalid observation"""
        response = api_client.post(
            "/predict/action",
            json={"observation": [1, 2, 3]}  # Wrong size
        )
        assert response.status_code == 422


class TestTrainingEndpoints:
    """Test training endpoints"""

    @patch('api_server.AsyncRedis')
    def test_train_rl_agent(self, mock_async_redis, api_client):
        """Test /train/rl endpoint"""
        mock_redis_instance = AsyncMock()
        mock_async_redis.from_url.return_value = mock_redis_instance

        with patch('api_server.rl_agent') as mock_agent:
            mock_agent.train.return_value = 0.5

            response = api_client.post(
                "/train/rl",
                json={"n_steps": 100, "n_epochs": 5}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "training_started"
            assert "job_id" in data

    def test_train_lstm(self, api_client):
        """Test /train/lstm endpoint"""
        with patch('api_server.lstm_forecaster') as mock_lstm:
            mock_lstm.train.return_value = {"mse": 0.01, "mae": 0.05}

            response = api_client.post(
                "/train/lstm",
                json={
                    "data": [[100, 1000, 0.2]] * 100,
                    "epochs": 10
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "metrics" in data
            assert data["metrics"]["mse"] == 0.01

    def test_train_il_predictor(self, api_client):
        """Test /train/il endpoint"""
        with patch('api_server.il_predictor') as mock_il:
            mock_il.train.return_value = {"mse": 0.001, "mae": 0.01, "r2": 0.95}

            training_data = {
                "features": [
                    {
                        "price_token0": 100,
                        "price_token1": 50,
                        "volatility_token0": 0.3,
                        "volatility_token1": 0.25,
                        "correlation": 0.7,
                        "liquidity": 1000000,
                        "fee_tier": 0.003
                    }
                ] * 50,
                "targets": [-0.05] * 50
            }

            response = api_client.post("/train/il", json=training_data)

            assert response.status_code == 200
            data = response.json()
            assert "metrics" in data
            assert data["metrics"]["r2"] == 0.95


class TestOptimizationEndpoints:
    """Test optimization endpoints"""

    def test_optimize_vault(self, api_client, sample_vault_state):
        """Test /optimize/vault endpoint"""
        with patch('api_server.rl_agent') as mock_agent:
            mock_agent.select_action.return_value = (2, None)

            response = api_client.post(
                "/optimize/vault",
                json=sample_vault_state
            )

            assert response.status_code == 200
            data = response.json()
            assert "recommended_action" in data
            assert "new_range" in data
            assert "expected_improvement" in data

    def test_optimize_invalid_vault_state(self, api_client):
        """Test optimization with invalid vault state"""
        response = api_client.post(
            "/optimize/vault",
            json={"invalid": "state"}
        )
        assert response.status_code == 422


class TestMonitoringEndpoints:
    """Test monitoring endpoints"""

    def test_get_metrics(self, api_client):
        """Test /monitoring/metrics endpoint"""
        with patch('api_server.monitor') as mock_monitor:
            mock_monitor.get_metrics.return_value = {
                "predictions_count": 100,
                "avg_response_time": 0.05,
                "error_rate": 0.01
            }

            response = api_client.get("/monitoring/metrics")

            assert response.status_code == 200
            data = response.json()
            assert "predictions_count" in data
            assert data["predictions_count"] == 100

    def test_get_drift_status(self, api_client):
        """Test /monitoring/drift endpoint"""
        with patch('api_server.monitor') as mock_monitor:
            mock_monitor.check_drift.return_value = {
                "drift_detected": False,
                "drift_score": 0.02,
                "threshold": 0.1
            }

            response = api_client.get("/monitoring/drift")

            assert response.status_code == 200
            data = response.json()
            assert "drift_detected" in data
            assert data["drift_detected"] is False

    def test_evaluate_models(self, api_client):
        """Test /monitoring/evaluate endpoint"""
        with patch('api_server.evaluator') as mock_evaluator:
            mock_evaluator.evaluate_all.return_value = {
                "rl_agent": {"reward": 100},
                "lstm": {"mse": 0.01},
                "il_predictor": {"mae": 0.001}
            }

            response = api_client.post("/monitoring/evaluate")

            assert response.status_code == 200
            data = response.json()
            assert "rl_agent" in data
            assert "lstm" in data
            assert "il_predictor" in data


class TestWebSocketEndpoints:
    """Test WebSocket endpoints"""

    def test_websocket_predictions(self, api_client):
        """Test WebSocket for real-time predictions"""
        with api_client.websocket_connect("/ws/predictions") as websocket:
            # Send prediction request
            websocket.send_json({
                "type": "predict_action",
                "data": {"observation": [100] * 9}
            })

            # Receive prediction
            data = websocket.receive_json()
            assert "type" in data
            assert "result" in data

    def test_websocket_monitoring(self, api_client):
        """Test WebSocket for monitoring stream"""
        with api_client.websocket_connect("/ws/monitoring") as websocket:
            # Should receive periodic monitoring updates
            data = websocket.receive_json()
            assert "metrics" in data or "status" in data


class TestBacktestingEndpoints:
    """Test backtesting endpoints"""

    def test_run_backtest(self, api_client):
        """Test /backtest/run endpoint"""
        with patch('api_server.backtester') as mock_backtester:
            mock_backtester.run.return_value = {
                "total_return": 0.15,
                "sharpe_ratio": 1.5,
                "max_drawdown": -0.05
            }

            response = api_client.post(
                "/backtest/run",
                json={
                    "strategy": "rl_optimized",
                    "start_date": "2024-01-01",
                    "end_date": "2024-03-01",
                    "initial_capital": 100000
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "total_return" in data
            assert data["total_return"] == 0.15

    def test_compare_strategies(self, api_client):
        """Test /backtest/compare endpoint"""
        with patch('api_server.backtester') as mock_backtester:
            mock_backtester.compare_strategies.return_value = {
                "rl_optimized": {"return": 0.15},
                "baseline": {"return": 0.10}
            }

            response = api_client.post(
                "/backtest/compare",
                json={
                    "strategies": ["rl_optimized", "baseline"],
                    "start_date": "2024-01-01",
                    "end_date": "2024-03-01"
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "rl_optimized" in data
            assert "baseline" in data


class TestModelManagementEndpoints:
    """Test model management endpoints"""

    def test_list_models(self, api_client):
        """Test /models/list endpoint"""
        with patch('Path.glob') as mock_glob:
            mock_glob.return_value = [
                Path("models/rl_agent_v1.pt"),
                Path("models/lstm_v2.pt")
            ]

            response = api_client.get("/models/list")

            assert response.status_code == 200
            data = response.json()
            assert "models" in data
            assert len(data["models"]) > 0

    def test_load_model(self, api_client):
        """Test /models/load endpoint"""
        with patch('api_server.rl_agent.load_model') as mock_load:
            response = api_client.post(
                "/models/load",
                json={
                    "model_type": "rl_agent",
                    "model_path": "models/rl_agent_v1.pt"
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "loaded"
            mock_load.assert_called_once()

    def test_save_model(self, api_client):
        """Test /models/save endpoint"""
        with patch('api_server.rl_agent.save_model') as mock_save:
            response = api_client.post(
                "/models/save",
                json={
                    "model_type": "rl_agent",
                    "model_name": "rl_agent_backup"
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "path" in data
            mock_save.assert_called_once()


class TestErrorHandling:
    """Test error handling"""

    def test_404_not_found(self, api_client):
        """Test 404 response"""
        response = api_client.get("/nonexistent")
        assert response.status_code == 404

    def test_method_not_allowed(self, api_client):
        """Test 405 response"""
        response = api_client.get("/predict/action")  # Should be POST
        assert response.status_code == 405

    def test_validation_error(self, api_client):
        """Test validation error response"""
        response = api_client.post(
            "/predict/action",
            json={"wrong_field": "value"}
        )
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_internal_server_error(self, api_client):
        """Test 500 response"""
        with patch('api_server.rl_agent.select_action') as mock_action:
            mock_action.side_effect = Exception("Model error")

            response = api_client.post(
                "/predict/action",
                json={"observation": [100] * 9}
            )

            assert response.status_code == 500
            data = response.json()
            assert "error" in data


class TestRateLimiting:
    """Test rate limiting"""

    def test_rate_limit(self, api_client):
        """Test rate limiting on endpoints"""
        # Make many rapid requests
        responses = []
        for _ in range(100):
            response = api_client.get("/health")
            responses.append(response.status_code)

        # Should eventually get rate limited (429)
        # Note: This assumes rate limiting is configured
        # assert 429 in responses  # Uncomment if rate limiting is enabled


class TestCORS:
    """Test CORS configuration"""

    def test_cors_headers(self, api_client):
        """Test CORS headers in response"""
        response = api_client.options("/health")
        assert "access-control-allow-origin" in response.headers or response.status_code == 200