import os
from typing import Optional

import httpx

from models import DiscoveredSource

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3001')
SERVICE_TOKEN = os.getenv('SERVICE_TOKEN', '')


def is_configured() -> bool:
    return bool(BACKEND_URL and SERVICE_TOKEN)


def create_source(source: DiscoveredSource) -> bool:
    if not is_configured():
        return False

    payload = {
        'name': source.name,
        'baseUrl': source.baseUrl,
        'type': source.type,
        'isActive': source.isActive,
        'metadata': source.metadata,
    }

    headers = {'x-service-token': SERVICE_TOKEN}
    try:
        response = httpx.post(
            f"{BACKEND_URL}/sources/service",
            json=payload,
            headers=headers,
            timeout=10,
        )
        return response.status_code in (200, 201)
    except httpx.HTTPError:
        return False
