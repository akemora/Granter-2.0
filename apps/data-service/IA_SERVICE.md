# IA Service - Intelligence & Analytics

## Overview

The IA Service implements intelligent grant data extraction from HTML content with a robust fallback mechanism. It provides a FastAPI endpoint that uses AI-powered extraction as the primary method, with automatic fallback to heuristic-based extraction (Regex + BeautifulSoup) when the AI method fails or times out.

## Architecture

### Three-Tier Extraction Pipeline

The service implements a strict fallback chain:

1. **Primary**: Gemini AI extraction (10-second timeout)
2. **Fallback 1**: Heuristic extraction (Regex + BeautifulSoup)
3. **Fallback 2**: Explicit error (never returns empty array)

### Key Components

```
src/
├── models/__init__.py          # Pydantic models for request/response
├── services/ia_service.py      # Core extraction logic
└── routers/ia_router.py        # FastAPI endpoint

tests/
├── test_ia_service.py          # Service unit tests
└── test_ia_router.py           # API endpoint tests
```

## Features

### 1. Gemini AI Extraction (Primary)
- Uses Google Gemini Pro model for intelligent data extraction
- Extracts: title, description, amount, deadline
- 10-second timeout to prevent hanging
- Graceful fallback on timeout or API errors

### 2. Heuristic Extraction (Fallback)
- BeautifulSoup HTML parsing
- Regex-based pattern matching
- Extracts from common HTML structures:
  - Title: h1, h2, or title tags
  - Description: First paragraph with sufficient length
  - Amount: Currency patterns (€50,000 EUR format)
  - Deadline: ISO 8601 dates (YYYY-MM-DD)

### 3. Explicit Error Handling
- Never returns empty or null data
- Always provides error message on complete failure
- Returns HTTP 500 with detailed error information

## API Endpoint

### POST `/api/ia/extract`

Extract grant data from HTML content.

**Request Body:**
```json
{
  "html": "string (100-1000000 chars)",
  "url": "string (URL)",
  "source": "string (source name)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "title": "string",
    "description": "string",
    "amount": 50000,
    "deadline": "2026-12-31",
    "url": "string",
    "source": "string",
    "extraction_method": "gemini" | "heuristic"
  },
  "method_used": "gemini" | "heuristic",
  "error": null
}
```

**Failure Response (500):**
```json
{
  "detail": "Failed to extract grant data from {source}. Both AI and heuristic extraction failed."
}
```

**Validation Error (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "html"],
      "msg": "ensure this value has at least 100 characters",
      "type": "value_error.string.min_length"
    }
  ]
}
```

## Data Models

### GrantData
```python
class GrantData(BaseModel):
    title: str                    # 5-500 chars
    description: str              # 10-5000 chars
    amount: Optional[int]         # >= 0
    deadline: Optional[str]       # ISO 8601 date
    url: str                      # Source URL
    source: str                   # Source name
    extraction_method: ExtractionMethod  # gemini or heuristic
```

### ExtractionRequest
```python
class ExtractionRequest(BaseModel):
    html: str        # 100-1000000 chars
    url: str         # Source URL
    source: str      # Source name
```

### ExtractionResponse
```python
class ExtractionResponse(BaseModel):
    success: bool
    data: Optional[GrantData]
    method_used: ExtractionMethod
    error: Optional[str]
```

## Configuration

### Environment Variables

```bash
# Required for Gemini extraction
GEMINI_API_KEY=your_api_key_here
```

### Service Initialization

```python
from services.ia_service import ia_service

# Service initializes with Gemini API key from environment
# If key is missing or invalid, will use heuristic extraction only
```

## Usage Examples

### Python Client

```python
import httpx

async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:8000/api/ia/extract",
        json={
            "html": "<h1>Grant Title</h1><p>Description...</p>",
            "url": "https://example.com/grant",
            "source": "Example Portal"
        }
    )

    if response.status_code == 200:
        data = response.json()
        print(f"Extracted: {data['data']['title']}")
        print(f"Method: {data['method_used']}")
    else:
        print(f"Error: {response.json()['detail']}")
```

### cURL

```bash
curl -X POST http://localhost:8000/api/ia/extract \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<h1>Grant</h1><p>Description with sufficient length for extraction.</p>",
    "url": "https://example.com",
    "source": "Test"
  }'
```

## Testing

### Run All Tests

```bash
pytest src/tests/ -v
```

### Run Specific Test Suite

```bash
# Service unit tests
pytest src/tests/test_ia_service.py -v

# API endpoint tests
pytest src/tests/test_ia_router.py -v

# Specific test
pytest src/tests/test_ia_service.py::test_heuristic_extraction_success -v
```

### Test Coverage

The service includes 17 comprehensive tests:

**Service Tests (11):**
- Heuristic extraction with valid HTML
- Alternative title extraction (h1, h2, title)
- Minimal valid data extraction
- Failure with empty HTML
- Failure with invalid HTML
- Amount extraction variants
- Deadline extraction
- Singleton access
- Metadata preservation
- Method returned correctly
- Timeout handling

**Router Tests (6):**
- Successful extraction via API
- Extraction failure handling
- Invalid request rejection
- Health endpoint
- Metadata preservation
- Response schema validation

## Logging

The service provides detailed logging at multiple levels:

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Sample log output:
# 2026-01-28 11:45:05 - services.ia_service - INFO - Starting grant extraction from Test Source
# 2026-01-28 11:45:05 - services.ia_service - INFO - ✓ Gemini extraction successful from Test Source
# 2026-01-28 11:45:05 - services.ia_service - ERROR - ✗ All extraction methods failed
```

### Log Levels

- **INFO**: Extraction started, successful completions, method used
- **DEBUG**: Attempting specific extraction method
- **WARNING**: Timeouts, fallback triggered
- **ERROR**: Extraction method failed, all methods exhausted

## Performance Characteristics

### Timing
- **Gemini extraction**: 1-3 seconds (with 10-second timeout)
- **Heuristic extraction**: 50-200ms
- **Total timeout**: 10 seconds (Gemini only)

### Resource Usage
- **Memory**: ~5-10 MB per request
- **CPU**: Minimal for heuristic, depends on Gemini API for AI extraction

## Error Handling

The service implements comprehensive error handling:

### Gemini Extraction Errors
- **Timeout**: Falls back to heuristic after 10s
- **API Error**: Falls back to heuristic immediately
- **Invalid JSON**: Falls back to heuristic
- **Validation Error**: Falls back to heuristic

### Heuristic Extraction Errors
- **Missing Title**: Generates default "Grant from {source}"
- **Short Description**: Falls back to full text content
- **No Amount Found**: Returns null (optional field)
- **No Deadline Found**: Returns null (optional field)

### Complete Failure
- **Both Methods Fail**: Returns HTTP 500 with error message
- **Never Returns Empty**: Always provides explicit error

## Debugging

### Enable Debug Logging

```python
import logging

logging.getLogger('services.ia_service').setLevel(logging.DEBUG)
```

### Test with Real HTML

```python
from services.ia_service import ia_service

# Simulate extraction
html = """
<html>
    <h1>Test Grant</h1>
    <p>This is a comprehensive test grant with sufficient description text.</p>
    <p>Amount: €25,000 EUR</p>
    <p>Deadline: 2026-12-31</p>
</html>
"""

success, data, method, error = await ia_service.extract_grant(
    html=html,
    url="https://example.com",
    source="Test"
)

print(f"Success: {success}")
print(f"Method: {method}")
print(f"Data: {data}")
print(f"Error: {error}")
```

## Deployment

### Docker
```dockerfile
FROM python:3.13

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment
```bash
export GEMINI_API_KEY=your_key_here
uvicorn main:app --reload
```

## Future Enhancements

1. **Caching**: Cache extraction results for identical HTML
2. **Batch Processing**: Add endpoint for extracting multiple documents
3. **Custom Models**: Allow swapping Gemini for other AI providers
4. **Extraction Templates**: Support domain-specific extraction rules
5. **Metrics**: Add Prometheus metrics for extraction success rates
6. **Retry Logic**: Implement exponential backoff for Gemini API

## Support

For issues or questions:
1. Check logs for detailed error messages
2. Review test cases for usage examples
3. Verify GEMINI_API_KEY is set correctly
4. Ensure HTML input meets minimum length requirement (100 chars)

## License

Part of GRANTER 2.0 project - Sprint 2, Task S2-D3-4
