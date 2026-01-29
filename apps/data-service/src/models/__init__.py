from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from enum import Enum


class ScraperResult(BaseModel):
    source: str
    status: str
    data: list[dict]


class ExtractionMethod(str, Enum):
    GEMINI = "gemini"
    HEURISTIC = "heuristic"


class GrantData(BaseModel):
    """Extracted grant data from HTML"""
    model_config = ConfigDict(use_enum_values=True)

    title: str = Field(..., min_length=5, max_length=500)
    description: str = Field(..., min_length=10, max_length=5000)
    amount: Optional[int] = Field(None, ge=0)
    deadline: Optional[str] = Field(None)  # ISO 8601 date
    url: str
    source: str
    extraction_method: ExtractionMethod


class ExtractionRequest(BaseModel):
    """Request to extract grant data from HTML"""
    html: str = Field(..., min_length=100, max_length=1000000)
    url: str
    source: str


class ExtractionResponse(BaseModel):
    """Response with extracted grant data"""
    success: bool
    data: Optional[GrantData] = None
    method_used: ExtractionMethod
    error: Optional[str] = None


class SourceType(str, Enum):
    API = "API"
    HTML = "HTML"
    RSS = "RSS"
    PDF = "PDF"


class DiscoveredSource(BaseModel):
    name: str
    baseUrl: str
    type: SourceType = SourceType.HTML
    isActive: bool = False
    metadata: dict[str, object] = Field(default_factory=dict)


class DiscoveryResponse(BaseModel):
    message: str
    found: int
    saved_as_inactive: int
    auto_saved: bool
    sources: list[DiscoveredSource]
