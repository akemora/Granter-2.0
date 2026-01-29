import asyncio
import json
import os
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse

from duckduckgo_search import DDGS

from models import DiscoveredSource, SourceType

_ALLOWED_DOMAIN_MARKERS = [
    '.gob.',
    '.gov.',
    '.gov',
    '.gob',
    '.europa.eu',
    '.eu',
    '.es',
]


@dataclass
class CandidateSource:
    title: str
    url: str
    snippet: str


def build_queries(scope: str, provincias: list[str]) -> list[str]:
    base = [
        'subvenciones site:gov',
        'ayudas publicas site:gov',
        'convocatorias subvenciones site:gov',
    ]

    if scope == 'espana':
        scoped = ['subvenciones espana', 'ayudas espana site:*.gob.es']
        if provincias:
            scoped.extend([f'subvenciones {provincia} site:*.gob.es' for provincia in provincias])
        return base + scoped

    if scope == 'internacional':
        return base + ['grants site:gov', 'public funding site:gov']

    return base + ['subvenciones europa site:europa.eu', 'eu funding site:europa.eu']


def normalize_url(raw_url: str) -> Optional[str]:
    try:
        parsed = urlparse(raw_url)
        if not parsed.scheme or not parsed.netloc:
            return None
        return f"{parsed.scheme}://{parsed.netloc}{parsed.path or ''}".rstrip('/')
    except Exception:
        return None


def is_official_domain(url: str) -> bool:
    domain = urlparse(url).netloc.lower()
    return any(marker in domain for marker in _ALLOWED_DOMAIN_MARKERS)


def build_candidate(result: dict) -> Optional[CandidateSource]:
    title = result.get('title') or result.get('heading') or ''
    url = result.get('href') or result.get('url') or ''
    snippet = result.get('body') or result.get('snippet') or ''
    if not title or not url:
        return None
    return CandidateSource(title=title, url=url, snippet=snippet)


def heuristic_confidence(candidate: CandidateSource, scope: str) -> float:
    title = candidate.title.lower()
    bonus = 0.2 if 'subv' in title or 'ayuda' in title or 'grant' in title else 0.0
    scope_bonus = 0.1 if scope in title else 0.0
    return min(0.4 + bonus + scope_bonus, 0.95)


def ensure_gemini_model():
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return None
    try:
        import google.generativeai as genai
    except Exception:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-pro')


def build_validation_prompt(candidate: CandidateSource, scope: str) -> str:
    return (
        'Classify if this URL is an official grant/subsidy portal. '
        'Return JSON with keys: confidence (0-1), description, organization, region.\n\n'
        f'Title: {candidate.title}\n'
        f'URL: {candidate.url}\n'
        f'Snippet: {candidate.snippet}\n'
        f'Scope: {scope}\n\n'
        'JSON only.'
    )


def parse_validation_response(text: str) -> Optional[dict]:
    try:
        return json.loads(text)
    except Exception:
        return None


def format_source(candidate: CandidateSource, confidence: float, meta: dict) -> DiscoveredSource:
    name = candidate.title.strip()[:200]
    base_url = normalize_url(candidate.url) or candidate.url
    metadata = {
        'discoveredBy': 'IA Discovery Engine',
        'confidence': confidence,
        'description': meta.get('description', candidate.snippet),
        'region': meta.get('region', 'N/A'),
        'organization': meta.get('organization', name),
    }
    return DiscoveredSource(
        name=name,
        baseUrl=base_url,
        type=SourceType.HTML,
        isActive=False,
        metadata=metadata,
    )


async def validate_candidate(candidate: CandidateSource, scope: str) -> tuple[float, dict]:
    model = ensure_gemini_model()
    if not model:
        return heuristic_confidence(candidate, scope), {}

    prompt = build_validation_prompt(candidate, scope)
    try:
        response = await asyncio.to_thread(model.generate_content, prompt)
    except Exception:
        return heuristic_confidence(candidate, scope), {}

    parsed = parse_validation_response(response.text or '')
    if not parsed:
        return heuristic_confidence(candidate, scope), {}

    confidence = float(parsed.get('confidence', 0.6))
    return max(min(confidence, 0.99), 0.1), parsed


def search_web(query: str, max_results: int) -> list[CandidateSource]:
    results = []
    try:
        with DDGS() as ddgs:
            for result in ddgs.text(query, max_results=max_results):
                candidate = build_candidate(result)
                if candidate:
                    results.append(candidate)
    except Exception:
        return results
    return results


async def discover_sources(
    scope: str,
    provincias: list[str],
    max_results: int,
    validate_with_ia: bool,
    skip_domain_filter: bool,
) -> list[DiscoveredSource]:
    queries = build_queries(scope, provincias)
    discovered: list[DiscoveredSource] = []
    seen = set()

    for query in queries:
        for candidate in search_web(query, max_results=max_results):
            base_url = normalize_url(candidate.url)
            if not base_url or base_url in seen:
                continue
            if not skip_domain_filter and not is_official_domain(base_url):
                continue

            seen.add(base_url)
            if validate_with_ia:
                confidence, meta = await validate_candidate(candidate, scope)
            else:
                confidence, meta = heuristic_confidence(candidate, scope), {}

            discovered.append(format_source(candidate, confidence, meta))
            if len(discovered) >= max_results:
                return discovered

    return discovered
