from fastapi import APIRouter, Query

from models import DiscoveryResponse, DiscoveredSource
from services.backend_client import create_source
from services.discovery_service import discover_sources

router = APIRouter(prefix="", tags=["discovery"])


@router.post("/discover", response_model=DiscoveryResponse)
async def discover(
    scope: str = Query(default="europa"),
    provincias: list[str] = Query(default=[]),
    max_results: int = Query(default=20, ge=1, le=100),
    validate_with_ia: bool = Query(default=True),
    auto_save: bool = Query(default=False),
    skip_domain_filter: bool = Query(default=True),
) -> DiscoveryResponse:
    sources = await discover_sources(
        scope=scope,
        provincias=provincias,
        max_results=max_results,
        validate_with_ia=validate_with_ia,
        skip_domain_filter=skip_domain_filter,
    )

    saved_count = 0
    if auto_save:
        for source in sources:
            if create_source(source):
                saved_count += 1

    return DiscoveryResponse(
        message="Discovery completed",
        found=len(sources),
        saved_as_inactive=saved_count if auto_save else 0,
        auto_saved=auto_save,
        sources=[DiscoveredSource.model_validate(s) for s in sources],
    )
