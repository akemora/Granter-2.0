import pytest

from services import discovery_service as ds


def test_normalize_url():
    assert ds.normalize_url('https://example.com/path') == 'https://example.com/path'
    assert ds.normalize_url('not-a-url') is None


def test_build_queries_espana():
    queries = ds.build_queries('espana', ['Madrid'])
    assert any('Madrid' in q for q in queries)


@pytest.mark.asyncio
async def test_discover_sources_returns_results(monkeypatch):
    candidate = ds.CandidateSource(
        title='Subvenciones Madrid',
        url='https://example.com/ayudas',
        snippet='Portal de ayudas públicas',
    )

    def fake_search(query: str, max_results: int):
        return [candidate]

    async def fake_validate(cand: ds.CandidateSource, scope: str):
        return 0.8, {'description': 'Test', 'region': scope, 'organization': 'Org'}

    monkeypatch.setattr(ds, 'search_web', fake_search)
    monkeypatch.setattr(ds, 'validate_candidate', fake_validate)

    results = await ds.discover_sources(
        scope='espana',
        provincias=['Madrid'],
        max_results=5,
        validate_with_ia=True,
        skip_domain_filter=True,
    )

    assert len(results) == 1
    assert results[0].metadata['confidence'] == 0.8
