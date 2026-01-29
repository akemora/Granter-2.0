'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { SourceType } from '@/types';
import {
  Sparkles,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Globe,
  MapPin,
  Building2,
  FileText,
  Zap,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface DiscoveredSource {
  name: string;
  baseUrl: string;
  type: SourceType;
  isActive: boolean;
  metadata: {
    discoveredBy: string;
    confidence: number;
    description: string;
    region: string;
    organization: string;
  };
}

interface DiscoveryResult {
  message: string;
  found: number;
  saved_as_inactive: number;
  auto_saved: boolean;
  sources: DiscoveredSource[];
}

const DATA_SERVICE_URL = process.env.NEXT_PUBLIC_DATA_URL || 'http://localhost:8000';

function DiscoverPageContent() {
  const router = useRouter();
  const [maxResults, setMaxResults] = useState(20);
  const [validateWithIA, setValidateWithIA] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [scope, setScope] = useState<'europa' | 'espana' | 'internacional'>('europa');
  const [selectedProvincias, setSelectedProvincias] = useState<Set<string>>(new Set());
  const [discovering, setDiscovering] = useState(false);
  const [results, setResults] = useState<DiscoveryResult | null>(null);
  const [selectedSources, setSelectedSources] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const provincias = [
    'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila',
    'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria',
    'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Girona', 'Granada',
    'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares',
    'Jaén', 'La Coruña', 'La Rioja', 'Las Palmas', 'León', 'Lérida',
    'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense',
    'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife',
    'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo',
    'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
  ];

  const handleToggleProvincia = (provincia: string) => {
    const newSelected = new Set(selectedProvincias);
    if (newSelected.has(provincia)) {
      newSelected.delete(provincia);
    } else {
      newSelected.add(provincia);
    }
    setSelectedProvincias(newSelected);
  };

  const handleDiscover = async (e: FormEvent) => {
    e.preventDefault();

    setDiscovering(true);
    setResults(null);
    setSelectedSources(new Set());

    try {
      const params = new URLSearchParams({
        max_results: maxResults.toString(),
        validate_with_ia: validateWithIA.toString(),
        auto_save: autoSave.toString(),
        skip_domain_filter: 'true',
        scope: scope,
      });

      if (scope === 'espana' && selectedProvincias.size > 0) {
        Array.from(selectedProvincias).forEach((prov) => {
          params.append('provincias', prov);
        });
      }

      const response = await fetch(`${DATA_SERVICE_URL}/discover?${params}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Discovery failed');
      }

      const data: DiscoveryResult = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error discovering sources:', error);
      alert('Error al descubrir fuentes. Verifica la consola para detalles.');
    } finally {
      setDiscovering(false);
    }
  };

  const handleToggleSource = (index: number) => {
    const newSelected = new Set(selectedSources);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSources(newSelected);
  };

  const handleSelectAll = () => {
    if (!results) return;
    if (selectedSources.size === results.sources.length) {
      setSelectedSources(new Set());
    } else {
      setSelectedSources(new Set(results.sources.map((_, i) => i)));
    }
  };

  const handleSaveSelected = async () => {
    if (!results || selectedSources.size === 0) return;

    setSaving(true);
    try {
      const sourcesToSave = Array.from(selectedSources).map((index) => results.sources[index]);

      let savedCount = 0;
      for (const source of sourcesToSave) {
        try {
          await fetchApi('/sources', {
            method: 'POST',
            body: JSON.stringify({
              name: source.name,
              baseUrl: source.baseUrl,
              type: source.type,
              isActive: false,
              metadata: source.metadata,
            }),
          });
          savedCount++;
        } catch (error) {
          console.error('Error saving source:', source.name, error);
        }
      }

      alert(
        `${savedCount} fuentes guardadas correctamente como inactivas.\nPuedes activarlas desde la página de Fuentes.`,
      );

      setSelectedSources(new Set());
      setResults(null);
      router.push('/sources');
    } catch (error) {
      console.error('Error saving sources:', error);
      alert('Error al guardar fuentes. Verifica la consola.');
    } finally {
      setSaving(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (confidence >= 0.6) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (confidence >= 0.6) return <Sparkles size={16} className="text-yellow-500" />;
    return <XCircle size={16} className="text-orange-500" />;
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <Sparkles size={40} className="text-purple-500 fill-purple-500" />
          <h1 className="text-4xl font-black text-white tracking-tighter">Discovery Engine</h1>
        </div>
        <p className="text-slate-400 font-medium italic text-lg">
          Búsqueda inteligente de portales de subvenciones con validación IA
        </p>
      </header>

      <form onSubmit={handleDiscover} className="mb-12 bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-white">
          <Globe size={28} className="text-purple-500" />
          Ámbito Geográfico
        </h2>

        <p className="text-slate-400 mb-8 italic">
          Selecciona el alcance de búsqueda y activa la validación IA para filtrar fuentes oficiales.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Alcance</label>
            <div className="grid grid-cols-3 gap-3">
              {['europa', 'espana', 'internacional'].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setScope(option as typeof scope)}
                  className={`py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    scope === option
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {option === 'espana' ? 'España' : option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Máximo de resultados</label>
            <input
              type="number"
              min={5}
              max={100}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-white font-medium"
            />
          </div>
        </div>

        {scope === 'espana' && (
          <div className="mb-8">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Provincias</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {provincias.map((provincia) => (
                <button
                  type="button"
                  key={provincia}
                  onClick={() => handleToggleProvincia(provincia)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedProvincias.has(provincia)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {provincia}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-4 text-slate-300 text-sm font-semibold">
              <input
                type="checkbox"
                checked={validateWithIA}
                onChange={(e) => setValidateWithIA(e.target.checked)}
                className="w-5 h-5 text-blue-500 rounded border-slate-700 bg-slate-950"
              />
              Validar con IA (Gemini)
            </label>
            <label className="flex items-center gap-4 text-slate-300 text-sm font-semibold">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-5 h-5 text-emerald-500 rounded border-slate-700 bg-slate-950"
              />
              Auto-guardar como inactivas (X-Service-Token)
            </label>
          </div>

          <button
            type="submit"
            disabled={discovering}
            className="flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl disabled:bg-slate-800 disabled:text-slate-500"
          >
            {discovering ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Descubriendo...
              </>
            ) : (
              <>
                <Search size={20} />
                Ejecutar Discovery
              </>
            )}
          </button>
        </div>
      </form>

      {results && (
        <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800/50 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-10 py-6 border-b border-slate-800/50">
            <div>
              <h3 className="text-xl font-black text-white">Resultados Discovery</h3>
              <p className="text-slate-500 text-sm">{results.found} fuentes encontradas</p>
              {results.auto_saved && (
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.2em] mt-2">
                  {results.saved_as_inactive} guardadas como inactivas
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                disabled={results.auto_saved}
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white"
              >
                {selectedSources.size === results.sources.length ? 'Deseleccionar' : 'Seleccionar todo'}
              </button>
              <button
                onClick={handleSaveSelected}
                disabled={results.auto_saved || saving || selectedSources.size === 0}
                className="flex items-center gap-2 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                Guardar Selección
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {results.sources.map((source, index) => {
              const confidence = source.metadata?.confidence ?? 0;
              const organization = source.metadata?.organization ?? source.name;
              const regionLabel = source.metadata?.region ?? 'N/A';
              return (
              <div key={index} className="flex gap-6 px-10 py-6 hover:bg-slate-900/30">
                <input
                  type="checkbox"
                  checked={selectedSources.has(index)}
                  onChange={() => handleToggleSource(index)}
                  disabled={results.auto_saved}
                  className="mt-2 w-5 h-5 text-blue-500 rounded border-slate-700 bg-slate-950"
                />
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-2">{source.name}</h4>
                  <p className="text-slate-400 text-sm mb-3 break-all">{source.baseUrl}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getConfidenceColor(confidence)}`}>
                      {getConfidenceIcon(confidence)}
                      <span className="ml-2">{Math.round(confidence * 100)}% confianza</span>
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-700 text-slate-400">
                      <Building2 size={12} className="inline mr-1" />
                      {organization}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-700 text-slate-400">
                      <MapPin size={12} className="inline mr-1" />
                      {regionLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-700 text-slate-400">
                      <FileText size={12} className="inline mr-1" />
                      {source.type}
                    </span>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <ProtectedRoute>
      <DiscoverPageContent />
    </ProtectedRoute>
  );
}
