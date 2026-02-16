"""
WSGI Entry Point for EKA-AI Platform (Production v4.5)
This file is used by Gunicorn to serve the FastAPI application.

Usage:
    gunicorn --bind 0.0.0.0:8001 --workers 4 --threads 2 --worker-class uvicorn.workers.UvicornWorker --timeout 120 wsgi:application
"""
import os
import sys
import logging

# Configure logging before importing app
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # The 'gunicorn.pid' environment variable is set in worker processes.
    # We log the successful load only from the main process.
    is_gunicorn_worker = 'gunicorn.pid' in os.environ
    from server import app
    if not is_gunicorn_worker:
        logger.info("✅ WSGI: FastAPI application loaded successfully")
except Exception as e:
    logger.error(f"❌ WSGI: Failed to load FastAPI application: {e}")
    raise

# Export the application object for Gunicorn
application = app

if __name__ == "__main__":
    # Development server (not for production)
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 8001)))