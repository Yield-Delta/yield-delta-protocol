"""
Model Initialization Script
Trains models on first run or loads existing models
"""

import os
import sys
import logging
import asyncio
from pathlib import Path
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_models_exist():
    """Check if pre-trained models exist"""
    model_paths = {
        'rl_agent': 'models/rl/defi_ppo_agent/final.zip',
        'lstm_forecaster': 'models/lstm/price_forecaster/final.pt',
        'il_predictor': 'models/il_predictor/il_predictor/final.pkl'
    }

    existing_models = {}
    for model_name, path in model_paths.items():
        exists = os.path.exists(path)
        existing_models[model_name] = exists
        logger.info(f"{model_name}: {'✓ Found' if exists else '✗ Not found'}")

    return existing_models

async def train_missing_models():
    """Train models that don't exist"""
    from sei_dlp_ai.training_pipeline import MLTrainingPipeline

    existing_models = check_models_exist()
    missing_models = [name for name, exists in existing_models.items() if not exists]

    if not missing_models:
        logger.info("All models already exist. Skipping training.")
        return

    logger.info(f"Training missing models: {missing_models}")

    # Create a lighter config for Docker deployment
    import json
    import tempfile

    docker_config = {
        'rl_config': {
            'total_timesteps': 10000,  # Reduced for faster initial training
            'eval_freq': 1000,
            'save_freq': 5000
        },
        'lstm_config': {
            'epochs': 10,  # Reduced epochs
            'batch_size': 32,
            'sequence_length': 168,
            'prediction_horizon': 24
        },
        'il_config': {
            'n_estimators': 50,  # Reduced trees
            'max_depth': 10,
            'test_size': 0.2
        }
    }

    # Write config to temp file and initialize pipeline with it
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(docker_config, f)
        config_path = f.name

    try:
        pipeline = MLTrainingPipeline(config_path=config_path)
    finally:
        # Clean up temp file
        import os as temp_os
        if temp_os.path.exists(config_path):
            temp_os.unlink(config_path)

    # Train each missing model
    for model_name in missing_models:
        try:
            logger.info(f"Training {model_name}...")
            start_time = time.time()

            if model_name == 'rl_agent':
                await pipeline.train_rl_agent()
            elif model_name == 'lstm_forecaster':
                await pipeline.train_lstm_forecaster()
            elif model_name == 'il_predictor':
                await pipeline.train_il_predictor()

            elapsed_time = time.time() - start_time
            logger.info(f"✓ {model_name} trained successfully in {elapsed_time:.2f}s")

        except Exception as e:
            logger.error(f"✗ Failed to train {model_name}: {e}")
            logger.warning(f"Continuing without {model_name}")

def download_pretrained_models():
    """Download pre-trained models from remote storage (if available)"""
    # This could be implemented to download from S3, GCS, or other storage
    # For now, we'll skip this and rely on training
    logger.info("Checking for downloadable pre-trained models...")

    # Example: Download from a model registry or cloud storage
    model_urls = {
        # 'rl_agent': 'https://storage.example.com/models/rl_agent.zip',
        # 'lstm_forecaster': 'https://storage.example.com/models/lstm.pt',
        # 'il_predictor': 'https://storage.example.com/models/il.pkl'
    }

    if not model_urls:
        logger.info("No remote models configured. Will train locally.")
        return False

    # Download logic would go here
    return False

def optimize_for_production():
    """Optimize models for production inference"""
    logger.info("Optimizing models for production...")

    # Set environment variables for optimization
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Reduce TensorFlow logging
    os.environ['OMP_NUM_THREADS'] = '4'  # Limit OpenMP threads

    # Could add model quantization, pruning, or ONNX conversion here
    logger.info("Production optimizations applied")

async def main():
    """Main initialization function"""
    logger.info("=" * 50)
    logger.info("Starting ML Model Initialization")
    logger.info("=" * 50)

    # Create necessary directories
    os.makedirs("models/rl/defi_ppo_agent", exist_ok=True)
    os.makedirs("models/lstm/price_forecaster", exist_ok=True)
    os.makedirs("models/il_predictor/il_predictor", exist_ok=True)
    os.makedirs("tensorboard", exist_ok=True)

    # Check if we should skip training (for development)
    if os.environ.get('SKIP_MODEL_TRAINING', '').lower() == 'true':
        logger.warning("SKIP_MODEL_TRAINING is set. Skipping model initialization.")
        return

    # Try to download pre-trained models first
    downloaded = download_pretrained_models()

    if not downloaded:
        # Train missing models
        await train_missing_models()

    # Optimize for production
    optimize_for_production()

    # Final check
    existing_models = check_models_exist()
    all_exist = all(existing_models.values())

    if all_exist:
        logger.info("✓ All models ready for deployment!")
    else:
        missing = [name for name, exists in existing_models.items() if not exists]
        logger.warning(f"⚠ Missing models: {missing}")
        logger.warning("API will start but some endpoints may not be available")

    logger.info("=" * 50)
    logger.info("Model initialization complete")
    logger.info("=" * 50)

if __name__ == "__main__":
    # Run the initialization
    asyncio.run(main())