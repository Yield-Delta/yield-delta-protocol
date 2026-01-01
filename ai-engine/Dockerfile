# Multi-stage build for optimized ML container
FROM python:3.11-slim as builder

# Install system dependencies for compilation
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    libhdf5-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    libopenblas0 \
    libgomp1 \
    libhdf5-serial-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    TF_CPP_MIN_LOG_LEVEL=2

# Create non-root user with home directory
RUN groupadd -g 1001 mluser && \
    useradd -r -u 1001 -g mluser -m -d /home/mluser mluser && \
    mkdir -p /home/mluser/.config && \
    chown -R mluser:mluser /home/mluser

# Set working directory
WORKDIR /app

# Copy application code
COPY --chown=mluser:mluser . .

# Create directories for models, data, and logs
RUN mkdir -p models/rl models/lstm models/il_predictor tensorboard data && \
    chown -R mluser:mluser models tensorboard data /app

# Switch to non-root user
USER mluser

# Run model initialization (training or loading)
# This can be skipped with SKIP_MODEL_TRAINING=true
RUN python init_models.py || echo "Model initialization failed, continuing..."

# Expose FastAPI port
EXPOSE 8000

# Health check with dynamic port - increased timeouts for Railway
HEALTHCHECK --interval=30s --timeout=30s --start-period=120s --retries=15 \
    CMD curl -f http://localhost:8000/health || exit 1

# Create entrypoint script
USER root
RUN echo '#!/bin/bash\n\
\n\
echo "========================================"\n\
echo "Container starting..."\n\
echo "PORT environment variable: ${PORT:-not set}"\n\
echo "Python version: $(python --version)"\n\
echo "Current directory: $(pwd)"\n\
echo "========================================"\n\
\n\
if [ "$TRAIN_ON_START" = "true" ]; then\n\
  echo "Running model training..."\n\
  python init_models.py || echo "Model training failed, continuing anyway"\n\
fi\n\
\n\
echo "Starting API server on port ${PORT:-8000}..."\n\
exec python -u start_server.py' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh && \
    chown mluser:mluser /app/entrypoint.sh

USER mluser

# Use entrypoint for flexibility
ENTRYPOINT ["/app/entrypoint.sh"]