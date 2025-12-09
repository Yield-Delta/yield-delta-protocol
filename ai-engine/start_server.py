#!/usr/bin/env python3
"""
Simple startup wrapper for the API server to ensure it starts regardless of failures
"""
import os
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Start the API server with error handling"""
    try:
        logger.info("Starting API server wrapper...")

        # Import uvicorn and run the API server
        import uvicorn
        port = int(os.getenv("PORT", "8000"))

        logger.info(f"Starting API server on port {port}")
        uvicorn.run(
            "api_server:app",
            host="0.0.0.0",
            port=port,
            log_level=os.getenv("LOG_LEVEL", "info").lower()
        )

    except Exception as e:
        logger.error(f"Failed to start API server: {e}")
        logger.info("Starting fallback minimal server...")

        # Start a minimal FastAPI server as fallback
        from fastapi import FastAPI
        import uvicorn

        app = FastAPI(title="ML API (Fallback Mode)")

        @app.get("/health")
        async def health():
            return {"status": "degraded", "message": "Running in fallback mode"}

        @app.get("/")
        async def root():
            return {"message": "ML API running in fallback mode due to initialization errors"}

        port = int(os.getenv("PORT", "8000"))
        logger.info(f"Starting fallback server on port {port}")

        uvicorn.run(
            app,
            host="0.0.0.0",
            port=port,
            log_level="info"
        )

if __name__ == "__main__":
    main()