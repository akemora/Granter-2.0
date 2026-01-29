# FASE 4 - SCRAPING + ADVANCED IA

Status: DONE
Start date: 2026-01-29
End date: 2026-01-29

---

## Mandatory Reference

- [AGENTS.md](../../../AGENTS.md)
- **MCP Assignment:** Sonnet (complex orchestration)

---

## Objective

Close the gap with GRANTER 1.0 in scraping/IA. Implement real SourceType handling, integrate IA extraction, and evaluate specialized scrapers.

---

## Dependencies

- FASE 2 complete (data model)
- Note: Does NOT depend on FASE 3 (scraping works independently of user profiles)

---

## Related Gaps

- SCR-01, SCR-02, SCR-03, SCR-04, MDL-04, MDL-05, AUT-01, AUT-02

---

## Architecture Decision (ADR-004)

Implement Strategy Pattern for source handlers:

```typescript
interface SourceHandler {
  canHandle(source: SourceEntity): boolean;
  scrape(source: SourceEntity): Promise<ScrapedGrant[]>;
}

// Implementations:
- HtmlHandler (existing SmartScraper + GenericScraper)
- ApiHandler (new - for JSON/REST APIs)
- RssHandler (new - for RSS/Atom feeds)
- PdfHandler (new - for PDF documents)
```

---

## Checklist

### Source Type Handlers

1. [x] **[P1][M]** Create handler interface in `scraper/handlers/source-handler.interface.ts`:
   ```typescript
   export interface SourceHandler {
     canHandle(source: SourceEntity): boolean;
     scrape(source: SourceEntity): Promise<ScrapedGrant[]>;
   }
   ```
   - **Acceptance:** Interface file exists and is exported.

2. [x] **[P1][M]** Refactor existing scrapers into HtmlHandler:
   - Move SmartScraper + GenericScraper fallback into HtmlHandler
   - **Acceptance:** HtmlHandler works for SourceType.HTML.

3. [x] **[P2][L]** Implement ApiHandler for JSON/REST sources:
   ```typescript
   @Injectable()
   class ApiHandler implements SourceHandler {
     canHandle(source: SourceEntity): boolean {
       return source.type === SourceType.API;
     }
     async scrape(source: SourceEntity): Promise<ScrapedGrant[]> {
       // Use source.metadata for API config (endpoint, auth, mapping)
       const response = await fetch(source.url, this.buildRequestOptions(source));
       return this.mapResponseToGrants(await response.json(), source.metadata);
     }
   }
   ```
   - **Acceptance:** API sources are scraped correctly.

4. [x] **[P2][L]** Implement RssHandler for RSS/Atom feeds:
   - **Acceptance:** RSS sources are parsed and converted to grants.

5. [x] **[P3][XL]** Implement PdfHandler for PDF documents (optional):
   - Use pdf-parse or call data-service
   - **Acceptance:** PDF sources are processed.

### Scraper Service Refactor

6. [x] **[P1][M]** Update ScraperService to use handler registry:
   ```typescript
   @Injectable()
   class ScraperService {
     constructor(
       private readonly handlers: SourceHandler[],
       // ...
     ) {}

     async scrapeSource(source: SourceEntity): Promise<ScraperResult> {
       const handler = this.handlers.find(h => h.canHandle(source));
       if (!handler) {
         throw new Error(`No handler for source type: ${source.type}`);
       }
       return handler.scrape(source);
     }
   }
   ```
   - **Acceptance:** Correct handler selected based on source type.

### IA Integration

7. [x] **[P1][L]** Integrate data-service IA extraction in scraping flow:
   ```typescript
   // In HtmlHandler or separate step
   async enhanceWithIA(grants: ScrapedGrant[], rawHtml: string): Promise<ScrapedGrant[]> {
     const response = await fetch('http://localhost:8000/api/ia/extract', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'X-Service-Token': process.env.SERVICE_TOKEN,
       },
       body: JSON.stringify({ html: rawHtml }),
     });
     const iaResult = await response.json();
     return this.mergeIAResults(grants, iaResult);
   }
   ```
   - **Acceptance:** IA extraction called when available, fallback to heuristic.

8. [x] **[P2][M]** Add IA extraction toggle in source metadata:
   - **Acceptance:** Sources can enable/disable IA extraction.

### Discovery Engine Integration

9. [x] **[P2][M]** Configure Discovery Engine to use X-Service-Token for auto-save:
    - **Acceptance:** Discovered grants are saved via authenticated endpoint.

### Documentation & Logging

10. [x] **[P2][S]** Document automation/ and queue/ modules:
    - **Acceptance:** Modules have README or are documented in ARCHITECTURE.

---

## Validation

- [ ] Tests pass: `npm run test`.
- [x] HTML sources work (existing behavior).
- [x] API sources work (if implemented).
- [x] RSS sources work (if implemented).
- [x] IA extraction is called when enabled.
- [x] Correct handler selected for each source type.

---

## Smoke Tests

```bash
# Test HTML source
curl -X POST http://localhost:3001/scraper/run/[html-source-id] -H "Authorization: Bearer $TOKEN"
# Expected: 200 with grants

# Test API source (if implemented)
curl -X POST http://localhost:3001/scraper/run/[api-source-id] -H "Authorization: Bearer $TOKEN"
# Expected: 200 with grants

# Test IA extraction
curl -X POST http://localhost:8000/api/ia/extract -H "Content-Type: application/json" -d '{"html":"<html>...</html>"}'
# Expected: 200 with extracted data
```

---

## Files Likely to Change

- `apps/backend-core/src/scraper/scraper.service.ts`
- `apps/backend-core/src/scraper/handlers/` (new directory)
- `apps/backend-core/src/scraper/handlers/source-handler.interface.ts` (new)
- `apps/backend-core/src/scraper/handlers/html.handler.ts` (new)
- `apps/backend-core/src/scraper/handlers/api.handler.ts` (new)
- `apps/backend-core/src/scraper/handlers/rss.handler.ts` (new)
- `apps/backend-core/src/scraper/scraper.module.ts`
- `apps/data-service/src/routers/ia_router.py`
- `docs/development/ARCHITECTURE_OVERVIEW.md`

---

## Blockers

- None

---
