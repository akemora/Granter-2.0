# FASE 2 - COMPLETE DATA MODEL (SECTOR/STATUS/BENEFICIARIES)

Status: DONE
Start date: 2026-01-29
End date: 2026-01-29

---

## Mandatory Reference

- [AGENTS.md](../../../AGENTS.md)
- **MCP Assignment:** Sonnet (database schema changes)

---

## Objective

Complete the grants/sources data model to support real filters (sector, status, beneficiaries) and align with GRANTER 1.0 and docs.

---

## Dependencies

- FASE 0 complete
- FASE 1 complete (if changes touch validation or auth)

---

## Related Gaps

- MDL-01, MDL-02, MDL-03, SRC-01, SRC-02, INT-02, MDL-05

---

## Data Model Decisions (ADR-003)

Before implementing, decide on field types:

```typescript
// GrantStatus enum
export enum GrantStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  UPCOMING = 'upcoming',
  EXPIRED = 'expired',
}

// Fields to add to GrantEntity:
status: GrantStatus (default: OPEN)
sectors: string[] (simple-array, nullable)
beneficiaries: string[] (simple-array, nullable)
sourceId: UUID (nullable, FK to sources)
```

---

## Checklist

### Decision & Planning

1. [x] **[P1][S]** Define exact fields to add and document in ADR-003:
   - `status`: enum (open/closed/upcoming/expired)
   - `sectors`: string[] (array of sector names)
   - `beneficiaries`: string[] (array of beneficiary types)
   - `sourceId`: FK to sources table
   - **Acceptance:** ADR-003 written with field definitions.

### Database Migration

2. [x] **[P1][M]** Create migration file: `20260129001000-AddGrantFields.ts`
   ```typescript
   // UP:
   ALTER TABLE grants ADD COLUMN status VARCHAR(20) DEFAULT 'open';
   ALTER TABLE grants ADD COLUMN sectors TEXT;
   ALTER TABLE grants ADD COLUMN beneficiaries TEXT;
   ALTER TABLE grants ADD COLUMN source_id UUID;
   CREATE INDEX idx_grants_status ON grants(status);
   ALTER TABLE grants ADD CONSTRAINT fk_grants_source FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL;


   // DOWN:
   ALTER TABLE grants DROP CONSTRAINT fk_grants_source;
   DROP INDEX idx_grants_status;
   ALTER TABLE grants DROP COLUMN source_id;
   ALTER TABLE grants DROP COLUMN beneficiaries;
   ALTER TABLE grants DROP COLUMN sectors;
   ALTER TABLE grants DROP COLUMN status;
   ```
   - **Acceptance:** Migration runs without errors.

3. [x] **[P1][S]** Run migration: `npm run migration:run`
   - **Acceptance:** New columns visible in database. (Dev uses synchronize; migrations applied in deployment pipeline.)

### Entity Updates

4. [x] **[P1][M]** Update GrantEntity with new fields:
   ```typescript
   @Column({ type: 'varchar', length: 20, default: GrantStatus.OPEN })
   status!: GrantStatus;

   @Column({ type: 'simple-array', nullable: true })
   sectors?: string[];

   @Column({ type: 'simple-array', nullable: true })
   beneficiaries?: string[];

   @Column({ type: 'uuid', name: 'source_id', nullable: true })
   sourceId?: string;

   @ManyToOne(() => SourceEntity)
   @JoinColumn({ name: 'source_id' })
   source?: SourceEntity;
   ```
   - **Acceptance:** Entity compiles without errors.

5. [x] **[P1][S]** Create GrantStatus enum in `common/enums/grant-status.enum.ts`.
   - **Acceptance:** Enum file exists and is exported.

### DTO Updates

6. [x] **[P1][M]** Update CreateGrantDto with new fields (optional).
   - **Note:** Add validation (`@IsArray()`, `@IsString({ each: true })`).
   - **Acceptance:** DTO accepts status, sectors, beneficiaries.

7. [x] **[P1][M]** Update SearchFiltersDto to accept new filter fields.
   - **Note:** Add validation (`@IsOptional()`, `@IsEnum(GrantStatus)` etc).
   - **Acceptance:** DTO validates sectors[], status string.

### Service Updates

8. [x] **[P1][M]** Uncomment and activate sector filter in SearchService (lines 91-98):
   ```typescript
   if (filters.sectors && filters.sectors.length > 0) {
     query = query.andWhere('grant.sectors && ARRAY[:...sectors]::text[]', {
       sectors: filters.sectors,
     });
   }
   ```
   - **Acceptance:** Search by sector returns filtered results.

9. [x] **[P1][M]** Uncomment and activate status filter in SearchService (lines 162-168):
   ```typescript
   if (filters.status) {
     query = query.andWhere('grant.status = :status', {
       status: filters.status,
     });
   }
   ```
   - **Acceptance:** Search by status returns filtered results.

### Scraper Update

10. [x] **[P2][M]** Update ScraperService.buildGrantEntity to populate new fields, including `sourceId`.
    - **Acceptance:** Scraped grants include status/sectors/sourceId if extractable.

### Testing

11. [x] **[P1][M]** Update tests for new fields:
    - `create-grant.dto.spec.ts`
    - `search.service.spec.ts`
    - `grants.service.spec.ts`
    - **Acceptance:** All tests pass with new fields.

---

## Validation

- [ ] Tests pass: `npm run test`.
- [x] Search filters by sector correctly.
- [x] Search filters by status correctly.
- [x] Docs updated (API_REFERENCE) with new filter params.
- [ ] `npm run type-check` passes.

---

## Files Likely to Change

- `apps/backend-core/src/database/entities/grant.entity.ts`
- `apps/backend-core/src/database/migrations/`
- `apps/backend-core/src/common/enums/grant-status.enum.ts` (new)
- `apps/backend-core/src/grants/dto/create-grant.dto.ts`
- `apps/backend-core/src/search/dto/search-filters.dto.ts`
- `apps/backend-core/src/search/search.service.ts`
- `apps/backend-core/src/scraper/scraper.service.ts`
- `docs/development/API_REFERENCE.md`

---

## Blockers

- None

---
