# ML Metrics Integration Guide

## Overview

This guide explains how to access and display ML metrics in the Yield Delta frontend, including real-time monitoring, alerts, and performance visualization.

## Quick Start

### 1. Access Admin Dashboard

Navigate to the admin dashboard to view all ML metrics:

```
http://localhost:3000/admin
```

### 2. Available Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin` | System overview with all models |
| ML Monitoring | `/admin/ml-monitoring` | Real-time model performance |
| Alerts | `/admin/ml-alerts` | Alert management and history |

## API Integration

### Environment Setup

Add to your `.env.local`:

```env
NEXT_PUBLIC_ML_API_URL=https://your-ml-api.railway.app
```

### Fetching Metrics

```typescript
// Example: Get model metrics
const fetchModelMetrics = async (modelName: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ML_API_URL}/api/monitoring/metrics/${modelName}`
  );
  return response.json();
};

// Example: Check drift status
const checkDrift = async (modelName: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ML_API_URL}/api/monitoring/drift/${modelName}`
  );
  return response.json();
};
```

## Available Metrics

### 1. Model Performance Metrics

#### RL Agent
- **Average Reward**: Cumulative reward per episode
- **Capital Preservation**: Ratio of current/initial capital
- **Time in Range**: Percentage of time price stays in bounds
- **Fees Collected**: Total fees earned

#### LSTM Forecaster
- **MAE (Mean Absolute Error)**: Average prediction error
- **RMSE (Root Mean Square Error)**: Prediction accuracy
- **R² Score**: Model fit quality (0-1)
- **Directional Accuracy**: % correct trend predictions

#### IL Predictor
- **IL Prediction MAE**: Impermanent loss prediction error
- **Risk Classification**: Accuracy of risk level predictions
- **Confidence Intervals**: Prediction uncertainty bounds
- **Feature Importance**: Most influential factors

### 2. System Metrics

```typescript
interface SystemMetrics {
  models_loaded: number;        // Active models
  total_predictions: number;     // 24h prediction count
  avg_latency: number;          // Response time (ms)
  error_rate: number;           // Failed predictions %
  cache_hit_rate: number;       // Redis cache efficiency
  redis_connected: boolean;     // Redis status
}
```

### 3. Drift Metrics

```typescript
interface DriftMetrics {
  prediction_drift: number;     // Model output drift (0-1)
  performance_drift: number;    // Accuracy degradation (0-1)
  feature_drift: Record<string, number>; // Per-feature drift
  is_drifting: boolean;        // Alert trigger
  drift_severity: 'none' | 'low' | 'medium' | 'high';
}
```

## React Components

### 1. Metrics Display Component

```tsx
import { useEffect, useState } from 'react';

export function ModelMetrics({ modelName }: { modelName: string }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ML_API_URL}/api/monitoring/metrics/${modelName}`
        );
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [modelName]);

  if (loading) return <div>Loading metrics...</div>;

  return (
    <div>
      {/* Display metrics */}
      <h3>{modelName} Performance</h3>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
}
```

### 2. Drift Alert Component

```tsx
export function DriftAlert({ modelName }: { modelName: string }) {
  const [drift, setDrift] = useState(null);

  useEffect(() => {
    const checkDrift = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ML_API_URL}/api/monitoring/drift/${modelName}`
      );
      const data = await response.json();
      setDrift(data);
    };

    checkDrift();
  }, [modelName]);

  if (!drift?.alert) return null;

  return (
    <div className={`alert alert-${drift.severity}`}>
      ⚠️ Model drift detected: {drift.severity} severity
      <div>Prediction drift: {(drift.drift_metrics.prediction_drift * 100).toFixed(1)}%</div>
    </div>
  );
}
```

### 3. Real-time Chart Component

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function PerformanceChart({ data }: { data: any[] }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="mae" stroke="#8884d8" />
      <Line type="monotone" dataKey="r2" stroke="#82ca9d" />
    </LineChart>
  );
}
```

## WebSocket Integration

For real-time updates, connect to the WebSocket endpoint:

```typescript
const connectWebSocket = () => {
  const ws = new WebSocket(`wss://your-ml-api.railway.app/ws`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Handle different message types
    switch (data.type) {
      case 'prediction':
        updatePrediction(data.payload);
        break;
      case 'alert':
        showAlert(data.payload);
        break;
      case 'metrics':
        updateMetrics(data.payload);
        break;
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
};
```

## Custom Hooks

### useModelMetrics

```typescript
import { useState, useEffect } from 'react';

export function useModelMetrics(modelName: string, autoRefresh = true) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ML_API_URL}/api/monitoring/metrics/${modelName}`
        );
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [modelName, autoRefresh]);

  return { metrics, loading, error };
}
```

### useAlerts

```typescript
export function useAlerts(severity?: string) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      let url = `${process.env.NEXT_PUBLIC_ML_API_URL}/api/alerts`;
      if (severity) url += `?severity=${severity}`;

      const response = await fetch(url);
      const data = await response.json();
      setAlerts(data);
    };

    fetchAlerts();
  }, [severity]);

  const resolveAlert = async (alertId: string) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_ML_API_URL}/api/alerts/${alertId}/resolve`,
      { method: 'POST' }
    );
    // Refresh alerts
    fetchAlerts();
  };

  return { alerts, resolveAlert };
}
```

## Metric Thresholds

### Performance Thresholds

| Model | Metric | Good | Warning | Critical |
|-------|--------|------|---------|----------|
| RL Agent | Avg Reward | > 100 | 50-100 | < 50 |
| RL Agent | Capital Ratio | > 0.95 | 0.90-0.95 | < 0.90 |
| LSTM | MAE | < 5.0 | 5.0-10.0 | > 10.0 |
| LSTM | R² Score | > 0.8 | 0.6-0.8 | < 0.6 |
| IL Predictor | MAE | < 0.01 | 0.01-0.05 | > 0.05 |
| IL Predictor | Risk Accuracy | > 0.8 | 0.6-0.8 | < 0.6 |

### Drift Thresholds

| Severity | Prediction Drift | Performance Drift | Action Required |
|----------|-----------------|-------------------|-----------------|
| None | < 0.1 | < 0.1 | None |
| Low | 0.1-0.2 | 0.1-0.2 | Monitor |
| Medium | 0.2-0.3 | 0.2-0.3 | Investigate |
| High | > 0.3 | > 0.3 | Retrain Model |

## Displaying in UI

### 1. Dashboard Widget

```tsx
export function MLMetricsWidget() {
  const { metrics: rlMetrics } = useModelMetrics('rl_agent');
  const { metrics: lstmMetrics } = useModelMetrics('lstm_forecaster');
  const { metrics: ilMetrics } = useModelMetrics('il_predictor');

  return (
    <Card>
      <CardHeader>
        <CardTitle>ML Model Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            title="RL Agent"
            value={rlMetrics?.performance?.reward?.mean || 0}
            unit="avg reward"
            status={getStatus(rlMetrics)}
          />
          <MetricCard
            title="LSTM"
            value={lstmMetrics?.performance?.mae?.mean || 0}
            unit="MAE"
            status={getStatus(lstmMetrics)}
          />
          <MetricCard
            title="IL Predictor"
            value={ilMetrics?.performance?.accuracy || 0}
            unit="accuracy"
            status={getStatus(ilMetrics)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. Alert Banner

```tsx
export function AlertBanner() {
  const { alerts } = useAlerts('high');

  if (alerts.length === 0) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {alerts.length} High Priority Alert{alerts.length > 1 ? 's' : ''}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {alerts.map(alert => (
                <li key={alert.id}>{alert.message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Testing Metrics

### Mock Data for Development

```typescript
// mock-metrics.ts
export const mockMetrics = {
  rl_agent: {
    model_name: 'rl_agent',
    timestamp: new Date().toISOString(),
    performance_report: {
      reward: { mean: 105.3, std: 12.4, min: 78, max: 145 },
      capital_ratio: 0.97,
      time_in_range: 0.83
    }
  },
  lstm_forecaster: {
    model_name: 'lstm_forecaster',
    timestamp: new Date().toISOString(),
    performance_report: {
      mae: { mean: 4.2, std: 0.8, min: 2.1, max: 6.5 },
      r2: { mean: 0.84, std: 0.05, min: 0.75, max: 0.92 }
    }
  }
};
```

### Testing Commands

```bash
# Test API endpoints
curl http://localhost:8000/api/monitoring/metrics/rl_agent
curl http://localhost:8000/api/monitoring/drift/lstm_forecaster
curl http://localhost:8000/api/monitoring/report/il_predictor

# Test from frontend
npm run dev
# Navigate to http://localhost:3000/admin
```

## Troubleshooting

### Common Issues

1. **Metrics not loading**: Check ML API URL in environment variables
2. **CORS errors**: Ensure API has proper CORS configuration
3. **WebSocket disconnects**: Implement reconnection logic
4. **High latency**: Check Redis connection and cache configuration

### Debug Mode

Enable debug logging:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Fetching metrics:', modelName);
  console.log('Response:', metrics);
}
```

## Best Practices

1. **Cache metrics client-side** to reduce API calls
2. **Use WebSockets** for real-time critical metrics
3. **Batch API requests** when fetching multiple models
4. **Implement retry logic** for failed requests
5. **Show loading states** during data fetching
6. **Handle errors gracefully** with fallback UI
7. **Use throttling** for metric updates (30s minimum)

## Production Considerations

1. **Authentication**: Add API key authentication
2. **Rate limiting**: Implement rate limits on API
3. **Monitoring**: Track frontend metric fetch patterns
4. **Alerts**: Set up critical metric notifications
5. **Performance**: Use React.memo for metric components
6. **Accessibility**: Add ARIA labels to metric displays