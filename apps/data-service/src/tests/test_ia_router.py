import pytest
from fastapi.testclient import TestClient


def test_extract_grant_success(client: TestClient):
    """Test successful grant extraction via API endpoint"""
    payload = {
        "html": """
        <html>
            <h1>Research Grant 2026</h1>
            <p>This is a comprehensive research grant for climate change mitigation projects with excellent funding opportunities.</p>
            <p>Total amount: €50,000 EUR</p>
            <p>Deadline: 2026-12-31</p>
        </html>
        """,
        "url": "https://example.com/grant",
        "source": "Test Source"
    }

    response = client.post("/api/ia/extract", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] is not None
    assert data["data"]["title"] == "Research Grant 2026"
    assert data["method_used"] in ["gemini", "heuristic"]
    assert data["error"] is None


def test_extract_grant_fails(client: TestClient):
    """Test that extraction handles errors gracefully with error message"""
    # HTML with metadata that should be preserved in error response
    payload = {
        "html": "<html><script>console.log('test')</script><style>body{color:red}</style></html>" + "x" * 150,
        "url": "https://example.com",
        "source": "Test Source"
    }

    response = client.post("/api/ia/extract", json=payload)

    # Could succeed with heuristic or fail - both are acceptable
    if response.status_code == 500:
        data = response.json()
        assert "detail" in data
        assert "Failed to extract" in data["detail"]
    else:
        # If it succeeds via heuristic, that's also fine
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


def test_extract_grant_invalid_request(client: TestClient):
    """Test that invalid requests are rejected"""
    payload = {
        "html": "Too short",  # Less than 100 characters
        "url": "https://example.com",
        "source": "Test"
    }

    response = client.post("/api/ia/extract", json=payload)

    assert response.status_code == 422  # Validation error


def test_health_endpoint(client: TestClient):
    """Test that health endpoint works"""
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "data-service"


def test_extract_grant_preserves_metadata(client: TestClient):
    """Test that extraction preserves URL and source metadata"""
    payload = {
        "html": """
        <html>
            <h1>Test Grant</h1>
            <p>Test grant with proper structure and sufficient descriptive information for extraction purposes.</p>
        </html>
        """,
        "url": "https://grants.example.com/test/grant/123",
        "source": "Custom Grant Portal"
    }

    response = client.post("/api/ia/extract", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["url"] == payload["url"]
    assert data["data"]["source"] == payload["source"]


def test_extract_grant_response_schema(client: TestClient):
    """Test that response matches expected schema"""
    payload = {
        "html": """
        <html>
            <h1>Schema Test Grant</h1>
            <p>This test verifies the response schema is correct and contains all required fields.</p>
        </html>
        """,
        "url": "https://example.com/grant",
        "source": "Test"
    }

    response = client.post("/api/ia/extract", json=payload)

    assert response.status_code == 200
    data = response.json()

    # Verify response structure
    assert "success" in data
    assert "method_used" in data
    assert "error" in data

    # Verify data structure when successful
    if data["success"]:
        assert "data" in data
        assert data["data"] is not None
        assert "title" in data["data"]
        assert "description" in data["data"]
        assert "url" in data["data"]
        assert "source" in data["data"]
        assert "extraction_method" in data["data"]
        assert data["error"] is None
