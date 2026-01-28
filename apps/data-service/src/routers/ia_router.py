from fastapi import APIRouter, HTTPException
import logging

from models import ExtractionRequest, ExtractionResponse
from services.ia_service import ia_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ia", tags=["Intelligence & Analytics"])


@router.post("/extract", response_model=ExtractionResponse)
async def extract_grant(request: ExtractionRequest) -> ExtractionResponse:
    """
    Extract grant data from HTML.

    Request body:
    - html: HTML content to extract from
    - url: Source URL
    - source: Source name

    Returns:
    - success: Whether extraction succeeded
    - data: Extracted grant data (if successful)
    - method_used: "gemini" or "heuristic"
    - error: Error message (if failed)
    """
    try:
        success, data, method, error = await ia_service.extract_grant(
            html=request.html,
            url=request.url,
            source=request.source,
        )

        if not success:
            raise HTTPException(
                status_code=500,
                detail=error or "Failed to extract grant data",
            )

        return ExtractionResponse(
            success=True,
            data=data,
            method_used=method,
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Unexpected error in extract_grant: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during extraction",
        )
