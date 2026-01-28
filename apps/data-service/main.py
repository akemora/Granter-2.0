from fastapi import FastAPI
import logging
from pathlib import Path
import sys

# Setup path for imports
SERVICE_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(SERVICE_ROOT / 'src'))

# Import routers
from routers.ia_router import router as ia_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(title="Granter Data Service")

# Include routers
app.include_router(ia_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "data-service"}
