'use client';

import { useState } from 'react';
import { Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface ScrapeButtonProps {
  onSuccess?: (count: number) => void;
}

export function ScrapeButton({ onSuccess }: ScrapeButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [count, setCount] = useState<number | null>(null);

  const handleScrape = async () => {
    setStatus('loading');
    try {
      const data = await fetchApi('/scraper/run', { method: 'POST' });
      const totalSaved = data?.totalSaved ?? 0;
      setCount(totalSaved);
      setStatus('success');
      onSuccess?.(totalSaved);

      setTimeout(() => {
        setStatus('idle');
        setCount(null);
      }, 5000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleScrape}
        disabled={status === 'loading'}
        className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
          status === 'loading'
            ? 'bg-slate-200 text-slate-500 cursor-wait shadow-none'
            : status === 'success'
            ? 'bg-green-600 text-slate-100 shadow-green-600/20'
            : status === 'error'
            ? 'bg-red-600 text-slate-100 shadow-red-600/20'
            : 'bg-blue-700 text-slate-100 hover:bg-blue-800 shadow-blue-700/20'
        }`}
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Escaneando Red...
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle size={20} />
            ¡Listo!
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle size={20} />
            Error de Conexión
          </>
        ) : (
          <>
            <Play size={20} className="fill-current" />
            Lanzar Scrapers
          </>
        )}
      </button>

      {status === 'success' && count !== null && (
        <span className="text-[10px] font-black text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-tighter animate-in fade-in slide-in-from-right-4 border border-green-200">
          + {count} nuevas ayudas
        </span>
      )}
    </div>
  );
}
