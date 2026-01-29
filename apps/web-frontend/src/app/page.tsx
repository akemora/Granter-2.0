'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useGrants } from '@/hooks/useGrants';
import { SearchInput } from '@/components/molecules/SearchInput/SearchInput';
import { ScrapeButton } from '@/components/molecules/ScrapeButton/ScrapeButton';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '@/components/atoms/ErrorMessage/ErrorMessage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GrantCard } from '@/components/molecules/GrantCard/GrantCard';
import { Pagination } from '@/components/molecules/Pagination/Pagination';
import { RecommendationsPanel } from '@/components/organisms/RecommendationsPanel/RecommendationsPanel';
import { NotificationsPanel } from '@/components/organisms/NotificationsPanel/NotificationsPanel';

function GrantsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    grants,
    total,
    currentPage,
    totalPages,
    isLoading,
    error,
    filters,
    updateFilters,
    clearError,
    search,
    goToPage,
  } = useGrants({ initialPagination: { skip: 0, take: 12 } });

  useEffect(() => {
    search();
  }, [search]);

  useDebounce(() => {
    updateFilters({ query: searchTerm || undefined });
  }, 300);

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Subvenciones</h1>
          <p className="text-slate-400 font-medium italic">
            Inteligencia Artificial rastreando fondos públicos.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <SearchInput
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              placeholder="Filtrar por palabra clave..."
            />
          </div>
          <ScrapeButton onSuccess={() => search(filters)} />
        </div>
      </header>

      <div className="mb-12">
        <RecommendationsPanel />
      </div>

      {error && !isLoading && <ErrorMessage message={error} onDismiss={clearError} />}

      {isLoading && grants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40">
          <LoadingSpinner />
          <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em] mt-6">
            Accediendo al servidor seguro...
          </p>
        </div>
      ) : grants.length === 0 ? (
        <div className="bg-slate-900/30 rounded-[3rem] border border-slate-800 py-40 text-center shadow-2xl">
          <div className="max-w-xs mx-auto">
            <p className="text-slate-200 font-black text-2xl mb-3">Sin hallazgos</p>
            <p className="text-slate-500 font-medium">
              {searchTerm
                ? 'Ninguna convocatoria coincide con tu filtro actual.'
                : 'Inicia un escaneo para poblar la base de datos.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 text-sm text-slate-400">
            Resultados: <span className="font-semibold text-slate-200">{total}</span> subvenciones
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 transition-all duration-700 ${
              isLoading ? 'opacity-30' : 'opacity-100'
            }`}
          >
            {grants.map((grant) => (
              <GrantCard key={grant.id} grant={grant} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </>
      )}

      <div className="mt-14">
        <NotificationsPanel />
      </div>
    </div>
  );
}

export default function GrantsPage() {
  return (
    <ProtectedRoute>
      <GrantsPageContent />
    </ProtectedRoute>
  );
}
