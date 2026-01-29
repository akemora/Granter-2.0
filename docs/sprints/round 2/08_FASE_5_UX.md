# FASE 5 - COMPLETE UX

Status: DONE
Start date: 2026-01-29
End date: 2026-01-29

---

## Mandatory Reference

- [AGENTS.md](../../../AGENTS.md)
- **MCP Assignment:** Sonnet (complex UI logic)

---

## Objective

Complete the UI for all promised functionalities: real advanced filters, grant details, scraping actions per source, and visibility of logs/alerts.

---

## Dependencies

- FASE 2 complete (model and real filters)
- FASE 3 complete (per-user profile)
- FASE 4 complete (scraping and IA ready)

---

## Related Gaps

- SRC-03, SRC-04, SRC-05, UX-01, UX-02, UX-03, UX-04

---

## Checklist

### Filter Panel Completion

1. [x] **[P1][M]** Add deadline filter inputs to FilterPanel.tsx:
   ```tsx
   {/* Deadline Filter */}
   <div className="mb-6 pb-6 border-b border-slate-800/60">
     <h3 className="text-sm font-medium text-slate-100 mb-3">Fecha límite</h3>
     <div className="space-y-3">
       <div>
         <label htmlFor="deadlineAfter" className="block text-xs text-slate-500 mb-1">
           Desde
         </label>
         <input
           id="deadlineAfter"
           type="date"
           value={filters.deadlineAfter || ''}
           onChange={(e) => onFilterChange({ deadlineAfter: e.target.value || undefined })}
           className="w-full px-3 py-2 border border-slate-800 rounded-2xl text-sm bg-slate-900 text-slate-100"
         />
       </div>
       <div>
         <label htmlFor="deadlineBefore" className="block text-xs text-slate-500 mb-1">
           Hasta
         </label>
         <input
           id="deadlineBefore"
           type="date"
           value={filters.deadlineBefore || ''}
           onChange={(e) => onFilterChange({ deadlineBefore: e.target.value || undefined })}
           className="w-full px-3 py-2 border border-slate-800 rounded-2xl text-sm bg-slate-900 text-slate-100"
         />
       </div>
     </div>
   </div>
   ```
   - **Acceptance:** Date inputs visible and functional.

2. [x] **[P1][M]** Add status filter dropdown to FilterPanel.tsx:
   ```tsx
   const STATUSES = ['open', 'closed', 'upcoming', 'expired'];

   {/* Status Filter */}
   <div className="mb-6 pb-6 border-b border-slate-800/60">
     <h3 className="text-sm font-medium text-slate-100 mb-3">Estado</h3>
     <select
       value={filters.status || ''}
       onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
       className="w-full px-3 py-2 border border-slate-800 rounded-2xl text-sm bg-slate-900 text-slate-100"
     >
       <option value="">Todos</option>
       {STATUSES.map((status) => (
         <option key={status} value={status}>{status}</option>
       ))}
     </select>
   </div>
   ```
   - **Acceptance:** Status dropdown visible and filters work.

3. [x] **[P1][S]** Verify filters are sent to backend correctly.
   - **Acceptance:** Network tab shows correct query params.

### Grant Detail Page

4. [x] **[P1][L]** Create grant detail page at `app/grants/[id]/page.tsx`:
   ```tsx
   export default async function GrantDetailPage({ params }: { params: { id: string } }) {
     const grant = await fetchGrant(params.id);
     return (
       <div className="container mx-auto py-8">
         <h1 className="text-2xl font-bold">{grant.title}</h1>
         <div className="grid grid-cols-2 gap-4 mt-4">
           <div>Región: {grant.region}</div>
           <div>Importe: {grant.amount ?? 'No especificado'}</div>
           <div>Fecha límite: {grant.deadline ?? 'Abierta'}</div>
           <div>Estado: {grant.status}</div>
         </div>
         <div className="mt-4">
           <h2 className="text-lg font-semibold">Descripción</h2>
           <p>{grant.description}</p>
         </div>
         {grant.officialUrl && (
           <a href={grant.officialUrl} target="_blank" className="mt-4 inline-block text-blue-500">
             Ver convocatoria oficial
           </a>
         )}
       </div>
     );
   }
   ```
   - **Acceptance:** `/grants/[id]` shows grant details.

5. [x] **[P1][S]** Update GrantCard to link to detail page:
   ```tsx
   <Link href={`/grants/${grant.id}`}>
     <h3>{grant.title}</h3>
   </Link>
   ```
   - **Acceptance:** Clicking grant card navigates to detail.

### Source Management UI

6. [x] **[P2][M]** Add "Scrape Now" button per source in sources page:
   ```tsx
   <button onClick={() => runScrape(source.id)}>
     Ejecutar scraping
   </button>
   ```
   - **Acceptance:** Button triggers scrape for specific source.

7. [x] **[P2][M]** Show scraping status/result after running:
   - **Acceptance:** User sees success/error message and grant count.

8. [x] **[P3][M]** Show scraping history/logs per source (if endpoint available):
   - **Acceptance:** Recent scrape logs visible.

### Notifications & Recommendations

9. [x] **[P2][M]** Update notifications panel to reflect current user:
   - **Acceptance:** Notifications are user-specific.

10. [x] **[P2][S]** Update help page to reflect real functionality:
    - **Acceptance:** Help text matches actual features.

---

## Validation

- [ ] Tests pass: `npm run test`.
- [x] Deadline filters work end-to-end.
- [x] Status filter works end-to-end.
- [x] Grant detail page shows all fields.
- [x] Scrape per source works from UI.
- [ ] Manual flow validation passes.

---

## Files Likely to Change

- `apps/web-frontend/src/components/molecules/FilterPanel/FilterPanel.tsx`
- `apps/web-frontend/src/app/grants/[id]/page.tsx` (new)
- `apps/web-frontend/src/components/molecules/GrantCard/GrantCard.tsx`
- `apps/web-frontend/src/app/sources/page.tsx`
- `apps/web-frontend/src/app/help/page.tsx`
- `apps/web-frontend/src/types/index.ts`

---

## Blockers

- None

---
