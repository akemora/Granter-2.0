import { Suspense } from 'react';
import { SearchPageClient } from './SearchPageClient';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 py-12 text-center text-slate-400">
            Cargando buscador...
          </div>
        }
      >
        <SearchPageClient />
      </Suspense>
    </ProtectedRoute>
  );
}
