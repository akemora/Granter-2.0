'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Plus, Trash2, Loader2, Zap } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { ScrapeLog, Source, SourceType } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SourceScrapeLogs, type SourceLogState } from '@/components/molecules/SourceScrapeLogs';

function normalizeSource(source: any): Source {
  return {
    id: source.id,
    name: source.name,
    baseUrl: source.baseUrl ?? source.url,
    type: source.type ?? SourceType.HTML,
    region: source.region,
    isActive: source.isActive ?? source.active ?? true,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    lastRun: source.lastRun,
    metadata: source.metadata ?? null,
  };
}

function SourcesPageContent() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [scrapeState, setScrapeState] = useState<
    Record<string, { status: 'idle' | 'running' | 'success' | 'error'; message?: string }>
  >({});
  const [logState, setLogState] = useState<Record<string, SourceLogState>>({});
  const [newSource, setNewSource] = useState({
    name: '',
    baseUrl: '',
    type: SourceType.HTML,
    isActive: true,
    region: 'ES',
  });
  const router = useRouter();

  const loadSources = useCallback(async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    try {
      const data = await fetchApi('/sources');
      const mapped = Array.isArray(data) ? data.map(normalizeSource) : [];
      setSources(mapped);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login');
        return;
      }
      console.error('Error loading sources:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const handleAddSource = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/sources', {
        method: 'POST',
        body: JSON.stringify(newSource),
      });
      setIsAdding(false);
      setNewSource({ name: '', baseUrl: '', type: SourceType.HTML, isActive: true, region: 'ES' });
      loadSources();
    } catch (error) {
      console.error('Error adding source:', error);
    }
  };

  const handleToggleStatus = async (source: Source) => {
    try {
      await fetchApi(`/sources/${source.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !source.isActive }),
      });
      loadSources();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDeleteSource = async (source: Source) => {
    if (!confirm(`¿Eliminar "${source.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await fetchApi(`/sources/${source.id}`, {
        method: 'DELETE',
      });
      loadSources();
    } catch (error) {
      console.error('Error deleting source:', error);
      alert('Error al eliminar la fuente. Verifica la consola.');
    }
  };

  const handleDiscover = () => {
    router.push('/discover');
  };

  const handleRunScrape = async (source: Source) => {
    setScrapeState((prev) => ({
      ...prev,
      [source.id]: { status: 'running', message: 'Ejecutando...' },
    }));

    try {
      const result = (await fetchApi(`/scraper/source/${source.id}`, {
        method: 'POST',
      })) as { saved?: number; grantCount?: number };

      const saved = result?.saved ?? 0;
      const count = result?.grantCount ?? 0;
      setScrapeState((prev) => ({
        ...prev,
        [source.id]: {
          status: 'success',
          message: `Guardados ${saved}/${count}`,
        },
      }));
      loadSources();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al ejecutar scraping';
      setScrapeState((prev) => ({
        ...prev,
        [source.id]: { status: 'error', message },
      }));
    }
  };

  const handleToggleLogs = async (source: Source) => {
    const current = logState[source.id];
    if (current?.open) {
      setLogState((prev) => ({ ...prev, [source.id]: { ...current, open: false } }));
      return;
    }

    if (current?.items?.length) {
      setLogState((prev) => ({ ...prev, [source.id]: { ...current, open: true } }));
      return;
    }

    setLogState((prev) => ({
      ...prev,
      [source.id]: { open: true, loading: true, items: [] },
    }));

    try {
      const logs = (await fetchApi(`/scraper/source/${source.id}/logs?limit=5`)) as ScrapeLog[];
      setLogState((prev) => ({
        ...prev,
        [source.id]: { open: true, loading: false, items: logs ?? [] },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar historial';
      setLogState((prev) => ({
        ...prev,
        [source.id]: { open: true, loading: false, items: [], error: message },
      }));
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Fuentes Oficiales</h1>
          <p className="text-slate-400 font-medium italic text-lg">
            Catálogo de portales bajo monitorización constante.
          </p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <button
            onClick={handleDiscover}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-slate-900 text-slate-300 px-6 py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg border border-slate-800 font-black uppercase text-xs tracking-widest"
          >
            <Zap size={20} className="text-amber-500 fill-amber-500" />
            Auto-Descubrimiento
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 font-black uppercase text-xs tracking-widest"
          >
            <Plus size={20} />
            Alta Manual
          </button>
        </div>
      </header>

      {isAdding && (
        <div className="mb-12 bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-8 duration-500">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-white">
            <Globe size={28} className="text-blue-500" />
            Configurar Portal Oficial
          </h2>
          <form onSubmit={handleAddSource} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                Nombre descriptivo
              </label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-white font-medium"
                placeholder="Ej. Junta de Extremadura"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                Punto de Entrada (URL)
              </label>
              <input
                type="url"
                required
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-white font-medium"
                placeholder="https://..."
                value={newSource.baseUrl}
                onChange={(e) => setNewSource({ ...newSource, baseUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                Arquitectura de Datos
              </label>
              <select
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none text-white font-medium appearance-none"
                value={newSource.type}
                onChange={(e) => setNewSource({ ...newSource, type: e.target.value as SourceType })}
              >
                <option value={SourceType.HTML}>Exploración Web Inteligente</option>
                <option value={SourceType.API}>Conexión API (JSON)</option>
                <option value={SourceType.RSS}>Flujo RSS / XML</option>
                <option value={SourceType.PDF}>Documentos PDF</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                Región
              </label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-white font-medium"
                placeholder="ES"
                value={newSource.region}
                onChange={(e) => setNewSource({ ...newSource, region: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-4">
              <button
                type="submit"
                className="flex-1 bg-white text-slate-950 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl"
              >
                Confirmar Registro
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-8 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-700 hover:text-slate-200 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 bg-slate-900/20 rounded-[3rem] border border-slate-800 border-dashed">
          <Loader2 className="animate-spin text-blue-500 mb-6" size={48} />
          <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">Leyendo base de datos...</p>
        </div>
      ) : (
        <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800/50 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fuente de Datos</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Protocolo</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Estado Engine</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id} className="border-b border-slate-800/40 hover:bg-slate-900/40 transition-all">
                  <td className="px-10 py-6">
                    <div>
                      <p className="text-white font-bold">{source.name}</p>
                      <p className="text-xs text-slate-500 break-all">{source.baseUrl}</p>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{source.type}</span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <button
                      onClick={() => handleToggleStatus(source)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        source.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {source.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleRunScrape(source)}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-300 hover:bg-blue-500/20"
                        disabled={scrapeState[source.id]?.status === 'running'}
                      >
                        {scrapeState[source.id]?.status === 'running' ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Zap size={14} />
                        )}
                        Scrape Now
                      </button>
                      <button
                        onClick={() => handleDeleteSource(source)}
                        className="text-red-400 hover:text-red-300 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {scrapeState[source.id]?.message && (
                      <p
                        className={`mt-3 text-[10px] uppercase tracking-[0.2em] ${
                          scrapeState[source.id]?.status === 'error'
                            ? 'text-red-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {scrapeState[source.id]?.message}
                      </p>
                    )}
                    <SourceScrapeLogs
                      state={logState[source.id]}
                      onToggle={() => handleToggleLogs(source)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SourcesPage() {
  return (
    <ProtectedRoute>
      <SourcesPageContent />
    </ProtectedRoute>
  );
}
