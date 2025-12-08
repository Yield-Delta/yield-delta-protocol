# SEI DLP ML Engine - Deployment Guide

## 🚀 Quick Start

### Local Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# API will be available at http://localhost:8000
# API docs at http://localhost:8000/api/docs
```

### Railway Deployment

1. **Connect Repository**
   ```bash
   railway login
   railway link
   ```

2. **Deploy with Training**
   ```bash
   # Enable model training on deployment
   railway variables set TRAIN_ON_START=true
   railway up
   ```

3. **Deploy with Pre-trained Models**
   ```bash
   # Skip training, use existing models
   railway variables set SKIP_MODEL_TRAINING=true
   railway up
   ```

## 📊 Model Training Options

### Build-time Training (Dockerfile)
Models are trained during Docker image build by default. This ensures models are ready immediately but increases build time.

### Runtime Training (On Start)
Set `TRAIN_ON_START=true` to train models when container starts. Useful for updating models with latest data.

### Skip Training (Development)
Set `SKIP_MODEL_TRAINING=true` to skip all training. API will start faster but some endpoints may not work without models.

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | redis-12049.c12.us-east-1-4.ec2.cloud.redislabs.com | Redis host |
| `REDIS_PORT` | 12049 | Redis port |
| `REDIS_USERNAME` | default | Redis username |
| `REDIS_PASSWORD` | (configured) | Redis password |
| `LOG_LEVEL` | INFO | Logging level |
| `MODEL_CACHE_TTL` | 3600 | Model cache TTL in seconds |
| `MAX_BATCH_SIZE` | 32 | Maximum batch size for predictions |
| `MODEL_TIMEOUT` | 30 | Model prediction timeout in seconds |
| `TRAIN_ON_START` | false | Train models on container start |
| `SKIP_MODEL_TRAINING` | false | Skip all model training (dev mode) |

## 📈 Training Configuration

The `init_models.py` script handles model initialization with these default configs:

### Reinforcement Learning (PPO)
```python
{
  'total_timesteps': 10000,  # Reduced for faster deployment
  'eval_freq': 1000,
  'save_freq': 5000
}
```

### LSTM Forecaster
```python
{
  'epochs': 10,
  'batch_size': 32,
  'sequence_length': 168,
  'prediction_horizon': 24
}
```

### Impermanent Loss Predictor
```python
{
  'n_estimators': 50,
  'max_depth': 10,
  'test_size': 0.2
}
```

## 🐳 Docker Build Process

The multi-stage Dockerfile optimizes for production:

1. **Builder Stage**: Compiles dependencies
2. **Production Stage**: Minimal runtime environment
3. **Model Training**: Runs during build (optional)
4. **Health Checks**: Ensures service availability

### Build Commands

```bash
# Standard build
docker build -t sei-dlp-ml:latest .

# Build without training (faster)
docker build --build-arg SKIP_MODEL_TRAINING=true -t sei-dlp-ml:dev .

# Build with custom training config
docker build --build-arg TRAIN_CONFIG=production -t sei-dlp-ml:prod .
```

## 🚢 Railway-Specific Configuration

### railway.toml Settings

```toml
[build]
builder = "dockerfile"
dockerfilePath = "./Dockerfile"

[deploy]
startCommand = "python api_server.py"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
healthcheckPath = "/health"
healthcheckTimeout = 10
region = "us-west1"
```

### Deployment Strategies

#### 1. Fast Deployment (No Training)
Best for development or when using pre-trained models:
```bash
railway variables set SKIP_MODEL_TRAINING=true
railway up
```

#### 2. Full Deployment (With Training)
For production with latest model training:
```bash
railway variables set TRAIN_ON_START=true
railway up
```

#### 3. Staged Deployment
Train locally, upload models, then deploy:
```bash
# Train locally
python init_models.py

# Upload models to cloud storage
# (implement upload_models.py)

# Deploy without training
railway variables set SKIP_MODEL_TRAINING=true
railway up
```

## 📊 Redis Configuration

The ML monitoring system uses Redis Labs for:
- Real-time metrics storage
- Model drift detection alerts
- Distributed caching
- Performance monitoring

Connection is pre-configured but can be overridden with environment variables.

## 🔍 Monitoring & Health

### Health Check Endpoint
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-08T10:00:00Z",
  "models_loaded": 3,
  "monitoring_enabled": true
}
```

### Model Status Check
```bash
curl http://localhost:8000/api/models/status
```

## 🐛 Troubleshooting

### Common Issues

1. **Models Not Training**
   - Check logs: `docker logs <container-id>`
   - Verify data availability
   - Ensure sufficient memory (4GB minimum)

2. **Redis Connection Failed**
   - Verify credentials in environment
   - Check network connectivity
   - System falls back to in-memory storage

3. **Slow Startup**
   - Model training can take 5-10 minutes
   - Use `SKIP_MODEL_TRAINING=true` for development
   - Consider pre-training models

4. **Out of Memory**
   - Reduce batch sizes in training config
   - Use smaller model configurations
   - Increase Docker memory limit

### Debug Mode

Enable detailed logging:
```bash
railway variables set LOG_LEVEL=DEBUG
railway up
```

## 📈 Performance Optimization

### Docker Optimization
- Multi-stage build reduces image size by ~60%
- Layer caching speeds up rebuilds
- Non-root user for security

### Model Optimization
- Reduced training steps for deployment
- Model quantization (future)
- ONNX conversion for inference (planned)

### Caching Strategy
- Redis for prediction caching (24h TTL)
- Model weights cached in memory
- Feature preprocessing cached

## 🔐 Security Notes

- Runs as non-root user (mluser)
- Health checks for auto-recovery
- Secrets managed via environment variables
- Network isolation in Docker

## 📚 Further Documentation

- Full ML system docs: `ML_SYSTEM_DOCUMENTATION.md`
- API documentation: http://localhost:8000/api/docs
- Frontend integration: `../yield-delta-frontend/docs/ML_METRICS_GUIDE.md`

## 🚀 Deployment Checklist

- [ ] Set environment variables in Railway
- [ ] Configure Redis connection
- [ ] Choose training strategy
- [ ] Set resource limits if needed
- [ ] Configure monitoring alerts
- [ ] Test health endpoints
- [ ] Verify model predictions
- [ ] Check frontend integration