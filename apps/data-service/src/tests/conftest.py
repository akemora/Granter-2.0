from pathlib import Path
import sys
import pytest
from fastapi.testclient import TestClient

SERVICE_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(SERVICE_ROOT))
sys.path.insert(0, str(SERVICE_ROOT / 'src'))

from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def pytest_configure(config):
    """Configure pytest with asyncio mode"""
    config.addinivalue_line(
        "markers", "asyncio: mark test as async"
    )
