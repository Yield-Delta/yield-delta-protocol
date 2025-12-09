# Backend Signer - ML Integration Guide

## Overview

The Backend Signer service has been upgraded to integrate with the enhanced AI Engine that includes three machine learning models:
- **RL Agent**: Reinforcement Learning agent for vault strategy optimization
- **LSTM Forecaster**: Long Short-Term Memory network for price prediction
- **IL Predictor**: Impermanent Loss risk assessment model

## Architecture

```
Backend Signer
    ├── RebalanceSubmitter
    │   └── processVault()
    │       └── aiEngine.getComprehensiveAnalysis()
    │           ├── getRLAgentRecommendation()
    │           ├── getLSTMPriceForecast()
    │           └── getILRiskAssessment()
    └── AIEngineService (Enhanced)
        ├── ML Model Integration
        ├── Market Data Caching
        └── Fallback Mechanisms
```

## New Features

### 1. Comprehensive ML Analysis
The service now performs parallel requests to all three ML models and combines their insights:

```typescript
const recommendation = await aiEngine.getComprehensiveAnalysis(vaultState);
```

### 2. RL Agent Integration
- Provides optimal tick ranges based on deep reinforcement learning
- Suggests actions: HOLD, REBALANCE, EXPAND_RANGE, NARROW_RANGE
- Returns confidence scores and expected rewards

### 3. LSTM Price Forecasting
- 24-hour price predictions with confidence intervals
- Trend detection (bullish/bearish/neutral)
- Volatility forecasting for risk adjustment

### 4. Impermanent Loss Risk Assessment
- Calculates expected IL over 24-hour horizon
- Provides risk scores (0-1 scale)
- Suggests mitigation strategies and optimal rebalance times

## Decision Logic

The comprehensive analysis combines all model outputs:

1. **Base Range**: Uses RL agent's optimal range recommendation
2. **Trend Adjustment**: Shifts range based on LSTM price forecast
   - Bullish: Shift range upward by 5%
   - Bearish: Shift range downward by 5%
3. **Volatility Adjustment**: Widens range by 10% if high volatility expected
4. **Urgency Setting**: Based on IL risk score
   - Risk > 0.8: Critical
   - Risk > 0.6: High
   - Risk > 0.3: Medium
   - Risk ≤ 0.3: Low
5. **Confidence Boost**: +15% if all models agree

## Configuration

### Environment Variables

```bash
# AI Engine URL (Railway deployment)
AI_ENGINE_URL=https://yield-delta-ai-engine.up.railway.app

# Confidence threshold (0-10000)
MIN_CONFIDENCE_THRESHOLD=8000  # 80% for production

# Model version
AI_MODEL_VERSION=liquidity-optimizer-v1.0
```

### Fallback Behavior

If ML models fail or return no results, the service falls back to the original basic analysis:
- Uses current tick range with standard adjustments
- Sets default confidence to 50%
- Applies rule-based urgency calculation

## API Endpoints Used

### AI Engine Endpoints

1. **`POST /predict/rl_strategy`**
   - Input: vault state, market data
   - Output: action, confidence, optimal range

2. **`POST /predict/price_forecast`**
   - Input: symbol, horizon, confidence level
   - Output: predictions, trend, volatility

3. **`POST /predict/il_risk`**
   - Input: vault position, time horizon
   - Output: expected IL, risk score, mitigation

4. **`GET /market/latest`**
   - Cached for 1 minute
   - Returns current market conditions

5. **`POST /analyze/rebalance`** (fallback)
   - Original basic analysis endpoint

## Monitoring

### Logs
The service provides detailed logging for ML integration:

```typescript
logger.info('Requesting comprehensive ML analysis', { vault });
logger.info('ML analysis complete', { confidence, urgency, reasoning });
```

### Health Checks
- Verifies AI Engine connectivity
- Checks model availability
- Monitors response times

## Testing

### Local Testing
```bash
# Use development environment
npm run dev

# Test with mock vault state
npm run test:ml-integration
```

### Production Deployment
```bash
# Deploy to Railway
railway up

# Monitor logs
railway logs -f
```

## Performance

### Optimizations
- **Parallel Model Requests**: All three ML models are queried simultaneously
- **Market Data Caching**: 1-minute cache to reduce API calls
- **Fallback Mechanism**: Ensures service continuity if ML models fail

### Response Times
- Comprehensive analysis: ~2-3 seconds (parallel execution)
- Basic analysis fallback: ~500ms
- Market data fetch: ~200ms (cached: <5ms)

## Error Handling

The service includes robust error handling:
1. Individual model failures don't block analysis
2. Automatic fallback to basic analysis
3. Detailed error logging for debugging
4. Graceful degradation of features

## Future Enhancements

1. **Model Ensemble Voting**: Weighted voting system for model disagreements
2. **Historical Performance Tracking**: Track accuracy of ML recommendations
3. **Dynamic Confidence Adjustment**: Adjust thresholds based on past performance
4. **Multi-chain Support**: Extend to other chains beyond SEI
5. **Real-time WebSocket Updates**: Stream model predictions in real-time