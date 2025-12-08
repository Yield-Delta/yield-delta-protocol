# SEI DLP Machine Learning System Documentation

## Overview

Complete ML infrastructure for DeFi vault optimization with three core models:
1. **Reinforcement Learning (RL)** - PPO agent for vault strategy optimization
2. **LSTM Forecasting** - Time-series prediction for price movements
3. **Impermanent Loss Prediction** - Ensemble model for IL risk assessment

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Server (FastAPI)                     │
├───────────────┬────────────────┬──────────────┬─────────────┤
│   RL Agent    │ LSTM Forecaster│ IL Predictor │  Monitoring │
├───────────────┴────────────────┴──────────────┴─────────────┤
│                    Training Pipeline                          │
├───────────────────────────────────────────────────────────────┤
│                    Model Persistence                          │
└───────────────────────────────────────────────────────────────┘
```

## Components

### 1. Reinforcement Learning Agent (`rl_agent.py`)
- **Algorithm**: Proximal Policy Optimization (PPO)
- **Environment**: Custom Gymnasium environment for DeFi trading
- **Action Space**: Continuous (range adjustments, rebalance ratio)
- **Observation Space**: 9 features including price ratios, volatility, fees
- **Features**:
  - Custom policy network with attention mechanism
  - State-dependent exploration (SDE)
  - TensorBoard integration
  - Reward shaping for capital preservation

### 2. LSTM Price Forecaster (`lstm_forecaster.py`)
- **Architecture**: Bidirectional LSTM with attention
- **Features**:
  - Multi-step ahead forecasting (24 hours)
  - Uncertainty estimation via Monte Carlo Dropout
  - Support/resistance level calculation
  - Trend analysis
- **Input**: Historical price, volume, volatility data
- **Output**: Price predictions with confidence intervals

### 3. Impermanent Loss Predictor (`impermanent_loss_predictor.py`)
- **Architecture**: Ensemble of 5 models:
  - Random Forest
  - XGBoost
  - LightGBM
  - Gradient Boosting
  - Extra Trees
- **Features**:
  - Advanced feature engineering (26 features)
  - Uncertainty quantification
  - Risk stratification (low/medium/high)
  - Feature importance analysis
- **Input**: Token prices, volatilities, correlation, liquidity
- **Output**: IL prediction with confidence intervals

### 4. Training Pipeline (`training_pipeline.py`)
- **Data Source**: Yahoo Finance (yfinance)
- **Features**:
  - Parallel training with asyncio
  - Automatic data preprocessing
  - Model versioning
  - Hyperparameter configuration
- **Training Modes**:
  - Individual model training
  - Complete pipeline training
  - Incremental updates

### 5. Model Monitoring (`monitoring/model_monitor.py`)
- **Performance Monitoring**:
  - Real-time metrics tracking
  - Rolling window statistics
  - Redis integration for distributed systems
- **Drift Detection**:
  - Feature drift monitoring (Wasserstein distance)
  - Prediction drift detection
  - Performance degradation alerts
  - Severity classification (none/low/medium/high)
- **Model Evaluation**:
  - Comprehensive metrics for each model type
  - Cross-model comparison
  - Automated reporting

## API Endpoints

### Prediction Endpoints
- `POST /api/rl/predict` - Get optimal vault strategy actions
- `POST /api/lstm/predict` - Get price predictions
- `POST /api/il/predict` - Predict impermanent loss

### Evaluation Endpoints
- `POST /api/rl/evaluate` - Evaluate RL agent performance
- `GET /api/models/status` - Check model loading status

### Training Endpoints
- `POST /api/train` - Trigger model training (rl/lstm/il/all)

### Monitoring Endpoints
- `GET /api/monitoring/metrics/{model_name}` - Real-time metrics
- `GET /api/monitoring/drift/{model_name}` - Drift detection status
- `GET /api/monitoring/report/{model_name}` - Performance report
- `GET /api/monitoring/evaluation/report` - Comprehensive evaluation
- `POST /api/monitoring/evaluate/{model_name}` - Trigger evaluation
- `GET /api/monitoring/compare` - Compare models

## Running the System

### Installation
```bash
cd /workspaces/yield-delta-protocol/ai-engine
pip install -r requirements.txt
```

### Start API Server
```bash
python api_server.py
```

The server will start on `http://localhost:8000` with docs at `/api/docs`

### Train Models
```bash
# Train all models
curl -X POST http://localhost:8000/api/train -H "Content-Type: application/json" -d '{"model_type": "all"}'

# Train specific model
curl -X POST http://localhost:8000/api/train -H "Content-Type: application/json" -d '{"model_type": "rl"}'
```

### Make Predictions

#### RL Agent - Vault Strategy
```bash
curl -X POST http://localhost:8000/api/rl/predict \
  -H "Content-Type: application/json" \
  -d '{
    "vault_state": {
      "current_price": 100,
      "lower_bound": 90,
      "upper_bound": 110,
      "liquidity": 1000000,
      "volume_24h": 500000,
      "volatility": 0.3,
      "fees_earned": 1000,
      "impermanent_loss": 0.02
    },
    "deterministic": true
  }'
```

#### LSTM - Price Prediction
```bash
curl -X POST http://localhost:8000/api/lstm/predict \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "SEI-USD",
    "sequence_length": 168,
    "prediction_horizon": 24
  }'
```

#### IL Predictor
```bash
curl -X POST http://localhost:8000/api/il/predict \
  -H "Content-Type: application/json" \
  -d '{
    "token0_price": 100,
    "token1_price": 50,
    "token0_volatility": 0.3,
    "token1_volatility": 0.25,
    "correlation": 0.7,
    "liquidity": 1000000,
    "fee_tier": 0.003,
    "time_horizon": 24
  }'
```

## Monitoring & Alerts

### Check Model Health
```bash
curl http://localhost:8000/api/monitoring/metrics/rl_agent
```

### Detect Model Drift
```bash
curl http://localhost:8000/api/monitoring/drift/lstm_forecaster
```

### Generate Performance Report
```bash
curl http://localhost:8000/api/monitoring/report/il_predictor
```

## Model Performance Metrics

### RL Agent
- **Objective**: Maximize fees while minimizing IL
- **Metrics**:
  - Average reward per episode
  - Capital preservation ratio
  - Time in range percentage
  - Total fees collected

### LSTM Forecaster
- **Objective**: Accurate price prediction
- **Metrics**:
  - Mean Absolute Error (MAE)
  - Root Mean Square Error (RMSE)
  - Directional accuracy
  - R² score

### IL Predictor
- **Objective**: Risk assessment accuracy
- **Metrics**:
  - MAE for IL prediction
  - Risk classification accuracy
  - Confidence interval coverage
  - Feature importance ranking

## Configuration

### Environment Variables
- `REDIS_HOST` - Redis host for distributed monitoring
- `REDIS_PORT` - Redis port (default: 6379)
- `LOG_LEVEL` - Logging level (default: INFO)

### Model Hyperparameters
Configured in respective model classes:
- RL: Learning rate, batch size, gamma, n_steps
- LSTM: Hidden size, num_layers, dropout, sequence length
- IL: n_estimators, max_depth, learning rates per model

## Troubleshooting

### Common Issues

1. **Model not loading**: Check model files exist in `models/` directory
2. **Training fails**: Ensure sufficient memory (8GB+ recommended)
3. **Drift alerts**: Retrain models if drift severity is "high"
4. **API timeout**: Increase timeout for large batch predictions

### Logs
- API logs: Console output or redirect to file
- TensorBoard: `tensorboard --logdir=./tensorboard`
- Model metrics: Stored in Redis or in-memory

## Future Enhancements

1. **Model Improvements**:
   - Transformer-based forecasting
   - Multi-agent RL with competition
   - Graph neural networks for pool interactions

2. **System Features**:
   - A/B testing framework
   - Automated retraining pipeline
   - Model versioning with MLflow
   - Distributed training support

3. **Monitoring**:
   - Grafana dashboard integration
   - Slack/Discord alerting
   - Automated model rollback
   - Performance benchmarking

## Support

For issues or questions:
- Check API docs at `/api/docs`
- Review logs for error messages
- Ensure all dependencies are installed
- Verify data quality and format