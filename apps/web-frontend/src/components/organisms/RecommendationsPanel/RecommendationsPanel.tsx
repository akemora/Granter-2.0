'use client';

import { GrantCard } from '@/components/molecules/GrantCard/GrantCard';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner/LoadingSpinner';
import { useRecommendations } from '@/hooks/useRecommendations';

export function RecommendationsPanel() {
  const { recommendations, isLoading, error } = useRecommendations(3);

  if (isLoading) {
    return (
      <section className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-8">
        <div className="flex items-center gap-4">
          <LoadingSpinner />
          <p className="text-slate-400 font-semibold">Calculando recomendaciones...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-8">
        <p className="text-slate-400 font-semibold">{error}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Recomendadas para ti</h2>
        <p className="text-slate-400 text-sm">Basado en tus keywords y regiones activas.</p>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-10 text-slate-400">
          Sin coincidencias por ahora. Ajusta tu perfil para mejorar las sugerencias.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendations.map((item) => (
            <div key={item.grant.id} className="relative">
              <span className="absolute -top-3 right-4 z-10 px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full bg-emerald-400 text-slate-950">
                Score {item.score}
              </span>
              <GrantCard grant={item.grant} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
