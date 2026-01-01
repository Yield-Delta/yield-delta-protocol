# AI Engine Training Guide

## Overview
The SEI DLP AI Engine includes three machine learning models:
- **RL Agent**: Reinforcement Learning for position optimization
- **LSTM Forecaster**: Price prediction using LSTM networks
- **IL Predictor**: Impermanent Loss prediction

## Training Options

### Option 1: Local Training (Recommended)

Train models locally and deploy the trained artifacts to Railway.

#### Step 1: Install Dependencies
```bash
cd ai-engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Step 2: Train Models
```bash
# Train all models
python -c "
import asyncio
from sei_dlp_ai.training_pipeline import MLTrainingPipeline

async def train():
    pipeline = MLTrainingPipeline()
    await pipeline.run_complete_pipeline()

asyncio.run(train())
"

# Or train individually
python init_models.py
```

This will create trained models in:
- `models/rl/defi_ppo_agent/final.zip`
- `models/lstm/price_forecaster/final.pt`
- `models/il_predictor/il_predictor/final.pkl`

#### Step 3: Deploy to Railway

**Option A: Include in Docker Build**
```bash
# Commit the trained models to your repo
git add models/
git commit -m "Add pre-trained ML models"
git push

# Update Dockerfile to skip training (already done)
# Railway will build with pre-trained models
```

**Option B: Use Cloud Storage (Recommended for large models)**
```bash
# Upload to S3, GCS, or other storage
# Then download in entrypoint.sh before starting server
```

### Option 2: Train via API (Background Training)

Once deployed, trigger training via API endpoint:

```bash
# Train all models in background
curl -X POST "https://your-railway-url.railway.app/api/train" \
  -H "Content-Type: application/json" \
  -d '{"model_type": "all"}'

# Train specific model
curl -X POST "https://your-railway-url.railway.app/api/train" \
  -H "Content-Type: application/json" \
  -d '{"model_type": "rl"}'  # Options: "rl", "lstm", "il"

# Check training status
curl "https://your-railway-url.railway.app/api/models/status"
```

**Pros:**
- No local setup needed
- Can retrain models without redeployment

**Cons:**
- Training runs on Railway (uses resources)
- Takes 10-30 minutes depending on model
- May timeout on free tier

### Option 3: Train on Container Startup

Set Railway environment variables:
```bash
TRAIN_ON_START=true
SKIP_MODEL_TRAINING=false
```

Then redeploy the service.

**Pros:**
- Automatic training on each deployment
- Fresh models every deploy

**Cons:**
- Slow startup time (10-30 minutes)
- Uses Railway compute resources
- Health checks may fail during training

## Training Configuration

### Quick Training (Development)
For faster training during development:

```json
{
  "rl_config": {
    "total_timesteps": 10000,
    "eval_freq": 1000,
    "save_freq": 5000
  },
  "lstm_config": {
    "epochs": 10,
    "batch_size": 32
  },
  "il_config": {
    "n_estimators": 50,
    "max_depth": 10
  }
}
```

### Production Training (Full Quality)
For production-quality models:

```json
{
  "rl_config": {
    "total_timesteps": 1000000,
    "eval_freq": 10000,
    "save_freq": 50000
  },
  "lstm_config": {
    "epochs": 100,
    "batch_size": 64
  },
  "il_config": {
    "n_estimators": 200,
    "max_depth": 20
  }
}
```

## Custom Training Pipeline

Create a custom training script:

```python
# train_custom.py
import asyncio
from sei_dlp_ai.training_pipeline import MLTrainingPipeline
import json

async def train_with_custom_config():
    # Create custom config
    config = {
        'rl_config': {
            'total_timesteps': 50000,
            'learning_rate': 0.0003
        },
        'lstm_config': {
            'epochs': 50,
            'hidden_size': 128
        },
        'il_config': {
            'n_estimators': 100
        }
    }

    # Save config
    with open('custom_config.json', 'w') as f:
        json.dump(config, f)

    # Initialize pipeline with custom config
    pipeline = MLTrainingPipeline(config_path='custom_config.json')

    # Train all models
    await pipeline.run_complete_pipeline()

    print("Training complete!")

if __name__ == "__main__":
    asyncio.run(train_with_custom_config())
```

Run it:
```bash
python train_custom.py
```

## Model Evaluation

After training, evaluate model performance:

```bash
# Via API
curl "https://your-railway-url.railway.app/api/monitoring/evaluation/report"

# Locally
python -c "
from sei_dlp_ai.models.rl_agent import DeFiRLAgent

agent = DeFiRLAgent()
agent.load_model('models/rl/defi_ppo_agent/final.zip')
metrics = agent.evaluate(n_eval_episodes=100)
print(metrics)
"
```

## Troubleshooting

### Out of Memory During Training
```bash
# Reduce batch size
# Reduce model complexity
# Train models sequentially instead of all at once
```

### Training Takes Too Long
```bash
# Use quick training config (see above)
# Train locally instead of on Railway
# Use pre-trained models
```

### Models Not Loading After Training
```bash
# Check file paths are correct
# Verify models directory permissions
# Check logs for initialization errors
```

## Best Practices

1. **Train locally for production** - More control, faster iteration
2. **Use version control** - Track model versions with git LFS or DVC
3. **Monitor training** - Use TensorBoard for RL/LSTM training
4. **Validate models** - Always evaluate before deploying
5. **Backup models** - Store trained models in cloud storage

## Model Storage Options

### Git LFS (Small Models < 100MB)
```bash
git lfs track "models/**/*.zip"
git lfs track "models/**/*.pt"
git lfs track "models/**/*.pkl"
git add .gitattributes models/
git commit -m "Add trained models with Git LFS"
```

### Cloud Storage (Large Models)
```bash
# AWS S3
aws s3 cp models/ s3://your-bucket/ai-engine-models/ --recursive

# Google Cloud Storage
gsutil -m cp -r models/ gs://your-bucket/ai-engine-models/

# Download in entrypoint.sh before starting
```

## Continuous Training

Set up automated retraining:

```bash
# Cron job to retrain weekly
0 0 * * 0 curl -X POST https://your-railway-url.railway.app/api/train \
  -H "Content-Type: application/json" \
  -d '{"model_type": "all"}'
```

Or use Railway's scheduled jobs (if available).

## Resources

- Training typically requires:
  - **Memory**: 2-4GB RAM
  - **CPU**: 2-4 cores
  - **Time**: 10-30 minutes (quick), 2-8 hours (full)
  - **Storage**: 500MB-2GB for models

- Railway free tier may struggle with training
- Consider training locally or using dedicated compute
