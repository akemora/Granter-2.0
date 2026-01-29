from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from pathlib import Path
import sys

# Setup path for imports
SERVICE_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(SERVICE_ROOT / 'src'))

# Import routers
from routers.ia_router import router as ia_router
from routers.discovery_router import router as discovery_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(title="Granter Data Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "x-service-token"],
)

# Include routers
app.include_router(ia_router)
app.include_router(discovery_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "data-service"}
