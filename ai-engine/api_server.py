"""
Enhanced API Server with All ML Models
FastAPI server exposing endpoints for RL, LSTM, and IL prediction models
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
import numpy as np
import pandas as pd
import uvicorn
import logging
import asyncio
import json
import os
from datetime import datetime, timedelta
from pathlib import Path

# Import ML models
from sei_dlp_ai.models.rl_agent import DeFiRLAgent
from sei_dlp_ai.models.rl_environment import DeFiTradingEnv
from sei_dlp_ai.models.lstm_forecaster import LSTMForecaster
from sei_dlp_ai.models.impermanent_loss_predictor import ImpermanentLossPredictor
from sei_dlp_ai.training_pipeline import MLTrainingPipeline
from sei_dlp_ai.monitoring.model_monitor import PerformanceMonitor, ModelEvaluator, MonitoringAPI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SEI DLP ML API",
    description="Machine Learning API for DeFi Vault Optimization",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instances
models = {
    'rl_agent': None,
    'lstm_forecaster': None,
    'il_predictor': None
}

# Training pipeline instance
training_pipeline = None

# Monitoring instances
performance_monitor = None
model_evaluator = None
monitoring_api = None


# ============ Request/Response Models ============

class VaultState(BaseModel):
    current_price: float = Field(..., description="Current price of the asset")
    lower_bound: float = Field(..., description="Lower price bound of the range")
    upper_bound: float = Field(..., description="Upper price bound of the range")
    liquidity: float = Field(..., description="Current liquidity in the pool")
    volume_24h: float = Field(..., description="24-hour trading volume")
    volatility: float = Field(..., description="Current volatility")
    fees_earned: float = Field(0.0, description="Fees earned so far")
    impermanent_loss: float = Field(0.0, description="Current impermanent loss")


class RLPredictionRequest(BaseModel):
    vault_state: VaultState
    deterministic: bool = Field(True, description="Use deterministic policy")


class RLPredictionResponse(BaseModel):
    action: Dict[str, float]
    recommendation: str
    confidence: float
    expected_reward: Optional[float] = None


class LSTMPredictionRequest(BaseModel):
    symbol: str = Field("SEI-USD", description="Symbol to predict")
    historical_data: Optional[List[Dict[str, float]]] = Field(None, description="Historical price data")
    sequence_length: int = Field(168, description="Number of past hours to use")
    prediction_horizon: int = Field(24, description="Hours to predict ahead")


class LSTMPredictionResponse(BaseModel):
    predictions: List[float]
    timestamps: List[str]
    uncertainty: Optional[List[float]] = None
    trend: str
    support_levels: List[float]
    resistance_levels: List[float]


class ILPredictionRequest(BaseModel):
    token0_price: float = Field(..., description="Price of token 0")
    token1_price: float = Field(..., description="Price of token 1")
    token0_volatility: float = Field(..., description="Volatility of token 0")
    token1_volatility: float = Field(..., description="Volatility of token 1")
    correlation: float = Field(..., description="Price correlation between tokens")
    liquidity: float = Field(..., description="Total liquidity")
    fee_tier: float = Field(0.003, description="Fee tier (e.g., 0.003 for 0.3%)")
    time_horizon: int = Field(24, description="Time horizon in hours")
    additional_features: Optional[Dict[str, float]] = None


class ILPredictionResponse(BaseModel):
    predicted_il: float
    confidence_interval: Dict[str, float]
    risk_level: str
    recommendations: List[str]
    feature_importance: Optional[Dict[str, float]] = None


class TrainingRequest(BaseModel):
    model_type: str = Field(..., description="Model type: 'rl', 'lstm', 'il', or 'all'")
    data_source: Optional[str] = Field(None, description="Data source URL or path")
    hyperparameters: Optional[Dict[str, Any]] = None


class ModelStatusResponse(BaseModel):
    model: str
    is_loaded: bool
    version: Optional[str] = None
    last_updated: Optional[str] = None
    metrics: Optional[Dict[str, float]] = None


# ============ Helper Functions ============

def load_models():
    """Load pre-trained models from disk"""
    global models

    model_paths = {
        'rl_agent': 'models/rl/defi_ppo_agent/final.zip',
        'lstm_forecaster': 'models/lstm/price_forecaster/final.pt',
        'il_predictor': 'models/il_predictor/il_predictor/final.pkl'
    }

    # Load RL Agent
    if os.path.exists(model_paths['rl_agent']):
        try:
            models['rl_agent'] = DeFiRLAgent()
            models['rl_agent'].load_model(model_paths['rl_agent'])
            logger.info("RL Agent loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load RL Agent: {e}")

    # Load LSTM Forecaster
    if os.path.exists(model_paths['lstm_forecaster']):
        try:
            models['lstm_forecaster'] = LSTMForecaster()
            models['lstm_forecaster'].load_model(model_paths['lstm_forecaster'])
            logger.info("LSTM Forecaster loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load LSTM Forecaster: {e}")

    # Load IL Predictor
    if os.path.exists(model_paths['il_predictor']):
        try:
            models['il_predictor'] = ImpermanentLossPredictor()
            models['il_predictor'].load_model(model_paths['il_predictor'])
            logger.info("IL Predictor loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load IL Predictor: {e}")


# ============ API Endpoints ============

@app.on_event("startup")
async def startup_event():
    """Initialize models and monitoring on startup"""
    global performance_monitor, model_evaluator, monitoring_api

    logger.info("Starting ML API server...")
    load_models()

    # Initialize monitoring with Redis Labs
    performance_monitor = PerformanceMonitor(
        window_size=1000,
        drift_threshold=0.1,
        redis_host=os.getenv("REDIS_HOST", "redis-12049.c12.us-east-1-4.ec2.cloud.redislabs.com"),
        redis_port=int(os.getenv("REDIS_PORT", "12049")),
        redis_username=os.getenv("REDIS_USERNAME", "default"),
        redis_password=os.getenv("REDIS_PASSWORD", "t9H5tKrB72iVrATk2jlcjwZRuQUgF5B5")
    )

    model_evaluator = ModelEvaluator()
    monitoring_api = MonitoringAPI(performance_monitor, model_evaluator)

    logger.info("ML API server ready with monitoring enabled!")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "SEI DLP ML API",
        "version": "2.0.0",
        "models": {
            "rl_agent": models['rl_agent'] is not None,
            "lstm_forecaster": models['lstm_forecaster'] is not None,
            "il_predictor": models['il_predictor'] is not None
        },
        "docs": "/api/docs"
    }


@app.get("/api/models/status")
async def get_models_status() -> List[ModelStatusResponse]:
    """Get status of all loaded models"""
    status = []

    for model_name, model in models.items():
        status.append(ModelStatusResponse(
            model=model_name,
            is_loaded=model is not None,
            version="1.0.0" if model else None,
            last_updated=datetime.now().isoformat() if model else None
        ))

    return status


# ============ RL Agent Endpoints ============

@app.post("/api/rl/predict", response_model=RLPredictionResponse)
async def predict_rl_action(request: RLPredictionRequest):
    """Get optimal action from RL agent"""
    if models['rl_agent'] is None:
        raise HTTPException(status_code=503, detail="RL Agent not loaded")

    try:
        # Prepare observation
        observation = np.array([
            request.vault_state.current_price / 100,  # Normalized
            (request.vault_state.current_price - request.vault_state.lower_bound) /
            (request.vault_state.upper_bound - request.vault_state.lower_bound),
            request.vault_state.volatility,
            np.log10(request.vault_state.volume_24h + 1) / 20,
            request.vault_state.fees_earned / 10000,
            request.vault_state.impermanent_loss,
            0.5,  # Time in range ratio (placeholder)
            0.0,  # Price momentum (placeholder)
            request.vault_state.liquidity / 1000000
        ], dtype=np.float32)

        # Get prediction
        action, info = models['rl_agent'].predict(observation, deterministic=request.deterministic)

        # Track prediction in monitoring
        if performance_monitor:
            performance_monitor.track_prediction(
                model_name="rl_agent",
                prediction=action,
                features=observation,
                metadata={"vault_state": request.vault_state.dict()}
            )

        # Prepare response
        response = RLPredictionResponse(
            action={
                "lower_adjustment": info["lower_adjustment"],
                "upper_adjustment": info["upper_adjustment"],
                "rebalance_ratio": info["rebalance_ratio"]
            },
            recommendation="REBALANCE" if info["should_rebalance"] else "HOLD",
            confidence=0.85,  # Placeholder
            expected_reward=None
        )

        return response

    except Exception as e:
        logger.error(f"RL prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rl/evaluate")
async def evaluate_rl_agent(n_episodes: int = 10):
    """Evaluate RL agent performance"""
    if models['rl_agent'] is None:
        raise HTTPException(status_code=503, detail="RL Agent not loaded")

    try:
        metrics = models['rl_agent'].evaluate(n_eval_episodes=n_episodes)
        return JSONResponse(content=metrics)
    except Exception as e:
        logger.error(f"RL evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ LSTM Forecaster Endpoints ============

@app.post("/api/lstm/predict", response_model=LSTMPredictionResponse)
async def predict_lstm_price(request: LSTMPredictionRequest):
    """Get price predictions from LSTM model"""
    if models['lstm_forecaster'] is None:
        raise HTTPException(status_code=503, detail="LSTM Forecaster not loaded")

    try:
        # Prepare data
        if request.historical_data:
            df = pd.DataFrame(request.historical_data)
        else:
            # Generate dummy data for demo
            dates = pd.date_range(end=datetime.now(), periods=request.sequence_length, freq='h')
            df = pd.DataFrame({
                'price': np.random.normal(100, 10, request.sequence_length),
                'volume': np.random.lognormal(15, 1, request.sequence_length),
                'volatility': np.random.uniform(0.1, 0.5, request.sequence_length),
                'high': np.random.normal(105, 10, request.sequence_length),
                'low': np.random.normal(95, 10, request.sequence_length)
            }, index=dates)

        # Get predictions
        results = models['lstm_forecaster'].predict(df, return_uncertainty=True)

        # Analyze trend
        predictions = results['predictions']
        trend = "BULLISH" if predictions[-1] > predictions[0] else "BEARISH"

        # Calculate support/resistance levels
        support_levels = [np.percentile(predictions, q) for q in [10, 25]]
        resistance_levels = [np.percentile(predictions, q) for q in [75, 90]]

        # Generate timestamps
        current_time = datetime.now()
        timestamps = [(current_time + timedelta(hours=i)).isoformat()
                     for i in range(1, request.prediction_horizon + 1)]

        response = LSTMPredictionResponse(
            predictions=predictions.tolist(),
            timestamps=timestamps,
            uncertainty=results.get('uncertainty', []).tolist(),
            trend=trend,
            support_levels=support_levels,
            resistance_levels=resistance_levels
        )

        return response

    except Exception as e:
        logger.error(f"LSTM prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ IL Predictor Endpoints ============

@app.post("/api/il/predict", response_model=ILPredictionResponse)
async def predict_impermanent_loss(request: ILPredictionRequest):
    """Predict impermanent loss for a liquidity position"""
    if models['il_predictor'] is None:
        raise HTTPException(status_code=503, detail="IL Predictor not loaded")

    try:
        # Prepare features
        features = pd.DataFrame([{
            'price_token0': request.token0_price,
            'price_token1': request.token1_price,
            'volatility_token0': request.token0_volatility,
            'volatility_token1': request.token1_volatility,
            'correlation': request.correlation,
            'liquidity': request.liquidity,
            'fee_tier': request.fee_tier,
            'initial_price_token0': request.token0_price,
            'initial_price_token1': request.token1_price,
            'volume_token0': request.liquidity * 0.1,  # Estimate
            'volume_token1': request.liquidity * 0.1,
            'time_in_pool': request.time_horizon,
            'market_trend': 0.0
        }])

        # Add additional features if provided
        if request.additional_features:
            for key, value in request.additional_features.items():
                features[key] = value

        # Get prediction with uncertainty
        results = models['il_predictor'].predict_with_uncertainty(features)

        # Determine risk level
        predicted_il = abs(results['prediction'][0])
        if predicted_il < 0.01:
            risk_level = "LOW"
        elif predicted_il < 0.05:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        # Generate recommendations
        recommendations = []
        if predicted_il > 0.05:
            recommendations.append("Consider tighter price ranges to reduce IL exposure")
        if request.correlation < 0.5:
            recommendations.append("Low correlation increases IL risk - monitor closely")
        if request.token0_volatility > 0.5 or request.token1_volatility > 0.5:
            recommendations.append("High volatility detected - consider hedging strategies")

        response = ILPredictionResponse(
            predicted_il=predicted_il,
            confidence_interval={
                'lower': float(results['lower_bound'][0]),
                'upper': float(results['upper_bound'][0])
            },
            risk_level=risk_level,
            recommendations=recommendations,
            feature_importance=models['il_predictor'].feature_importance if hasattr(models['il_predictor'], 'feature_importance') else None
        )

        return response

    except Exception as e:
        logger.error(f"IL prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ Training Endpoints ============

@app.post("/api/train")
async def trigger_training(background_tasks: BackgroundTasks, request: TrainingRequest):
    """Trigger model training in the background"""
    global training_pipeline

    if training_pipeline is None:
        training_pipeline = MLTrainingPipeline()

    async def run_training():
        try:
            if request.model_type == "all":
                await training_pipeline.run_complete_pipeline()
            elif request.model_type == "rl":
                await training_pipeline.train_rl_agent()
            elif request.model_type == "lstm":
                await training_pipeline.train_lstm_forecaster()
            elif request.model_type == "il":
                await training_pipeline.train_il_predictor()
            else:
                raise ValueError(f"Unknown model type: {request.model_type}")

            # Reload models after training
            load_models()

        except Exception as e:
            logger.error(f"Training error: {e}")

    background_tasks.add_task(run_training)

    return {"message": f"Training started for {request.model_type}", "status": "running"}


# ============ Monitoring Endpoints ============

@app.get("/api/monitoring/metrics/{model_name}")
async def get_model_metrics(model_name: str, hours: int = 24):
    """Get metrics for a specific model"""
    if monitoring_api is None:
        raise HTTPException(status_code=503, detail="Monitoring not initialized")

    try:
        metrics = await monitoring_api.get_realtime_metrics(model_name)
        return JSONResponse(content=metrics)
    except Exception as e:
        logger.error(f"Monitoring metrics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/monitoring/drift/{model_name}")
async def get_drift_status(model_name: str):
    """Check drift status for a model"""
    if monitoring_api is None:
        raise HTTPException(status_code=503, detail="Monitoring not initialized")

    try:
        drift_status = await monitoring_api.get_drift_status(model_name)
        return JSONResponse(content=drift_status)
    except Exception as e:
        logger.error(f"Drift detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/monitoring/report/{model_name}")
async def get_performance_report(model_name: str):
    """Get detailed performance report for a model"""
    if performance_monitor is None:
        raise HTTPException(status_code=503, detail="Monitoring not initialized")

    try:
        report = performance_monitor.generate_report(model_name)
        return JSONResponse(content=report)
    except Exception as e:
        logger.error(f"Report generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/monitoring/evaluation/report")
async def get_evaluation_report():
    """Get comprehensive evaluation report for all models"""
    if model_evaluator is None:
        raise HTTPException(status_code=503, detail="Evaluator not initialized")

    try:
        report = model_evaluator.generate_evaluation_report()
        return JSONResponse(content=report)
    except Exception as e:
        logger.error(f"Evaluation report error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/monitoring/evaluate/{model_name}")
async def trigger_model_evaluation(
    model_name: str,
    background_tasks: BackgroundTasks,
    test_data_path: Optional[str] = None
):
    """Trigger evaluation for a specific model"""
    if model_evaluator is None or models.get(model_name) is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model {model_name} or evaluator not available"
        )

    async def run_evaluation():
        try:
            # Load test data if path provided
            test_data = None
            if test_data_path:
                import pandas as pd
                test_data = pd.read_csv(test_data_path)

            # Run evaluation based on model type
            if model_name == "rl_agent":
                env = DeFiTradingEnv()
                result = await model_evaluator.evaluate_rl_agent(
                    models[model_name], env, n_episodes=50
                )
            elif model_name == "lstm_forecaster":
                if test_data is None:
                    # Generate synthetic test data
                    test_data = pd.DataFrame({
                        'price': np.random.normal(100, 10, 500),
                        'volume': np.random.lognormal(15, 1, 500),
                        'volatility': np.random.uniform(0.1, 0.5, 500)
                    })
                result = await model_evaluator.evaluate_lstm_forecaster(
                    models[model_name], test_data
                )
            elif model_name == "il_predictor":
                if test_data is None:
                    # Generate synthetic test data
                    test_data = pd.DataFrame({
                        'price_token0': np.random.normal(100, 10, 100),
                        'price_token1': np.random.normal(50, 5, 100),
                        'volatility_token0': np.random.uniform(0.1, 0.5, 100),
                        'volatility_token1': np.random.uniform(0.1, 0.5, 100),
                        'correlation': np.random.uniform(-1, 1, 100),
                        'liquidity': np.random.lognormal(15, 1, 100),
                        'actual_il': np.random.uniform(0, 0.1, 100)
                    })
                result = await model_evaluator.evaluate_il_predictor(
                    models[model_name], test_data
                )
            else:
                raise ValueError(f"Unknown model: {model_name}")

            logger.info(f"Evaluation completed for {model_name}")

        except Exception as e:
            logger.error(f"Evaluation error for {model_name}: {e}")

    background_tasks.add_task(run_evaluation)

    return {
        "message": f"Evaluation started for {model_name}",
        "status": "running"
    }


@app.get("/api/monitoring/compare")
async def compare_models(models_to_compare: str = "rl_agent,lstm_forecaster,il_predictor"):
    """Compare performance across models"""
    if model_evaluator is None:
        raise HTTPException(status_code=503, detail="Evaluator not initialized")

    try:
        model_names = models_to_compare.split(",")
        comparison = model_evaluator.compare_models(model_names)
        return JSONResponse(content=comparison)
    except Exception as e:
        logger.error(f"Model comparison error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ Health Check ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": sum(1 for m in models.values() if m is not None),
        "monitoring_enabled": performance_monitor is not None
    }


# ============ Main Entry Point ============

if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )