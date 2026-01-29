'use client';

import { ScrapeLog } from '@/types';

export type SourceLogState = {
  open: boolean;
  loading: boolean;
  items: ScrapeLog[];
  error?: string;
};

interface SourceScrapeLogsProps {
  state?: SourceLogState;
  onToggle: () => void;
}

export function SourceScrapeLogs({ state, onToggle }: SourceScrapeLogsProps) {
  return (
    <div className="mt-3 text-left">
      <button
        onClick={onToggle}
        className="rounded-full border border-slate-700/70 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:border-slate-500"
      >
        Historial
      </button>
      {state?.open && (
        <div className="mt-3 text-[11px] text-slate-300 space-y-2">
          {state.loading && (
            <p className="text-slate-500 uppercase tracking-[0.2em] text-[10px]">
              Cargando historial...
            </p>
          )}
          {!state.loading && state.error && (
            <p className="text-red-400 text-[10px] uppercase tracking-[0.2em]">{state.error}</p>
          )}
          {!state.loading && !state.error && (
            <div className="space-y-2">
              {state.items.length === 0 ? (
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                  Sin registros recientes
                </p>
              ) : (
                state.items.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1 rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                          log.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                      {log.result?.method ?? 'unknown'} · {log.result?.savedCount ?? 0}/
                      {log.result?.grantCount ?? 0}
                    </div>
                    {log.result?.error && <p className="text-[10px] text-red-400">{log.result.error}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
