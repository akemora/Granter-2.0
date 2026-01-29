import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Grant } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchGrant(id: string): Promise<Grant> {
  const res = await fetch(`${API_URL}/grants/${id}`, { cache: 'no-store' });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error('Failed to load grant');
  }

  const payload = await res.json();
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: Grant }).data;
  }

  return payload as Grant;
}

function formatCurrency(amount?: number | null) {
  if (amount == null) return 'No especificado';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(date?: string | null) {
  if (!date) return 'Abierta';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Abierta';
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(parsed);
}

export default async function GrantDetailPage({ params }: { params: { id: string } }) {
  const grant = await fetchGrant(params.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/search" className="text-xs uppercase tracking-[0.3em] text-slate-500 hover:text-blue-400">
          Volver a resultados
        </Link>

        <header className="mt-6 rounded-[2.5rem] border border-slate-800 bg-gradient-to-br from-slate-900/70 via-slate-950 to-slate-900 p-10 shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-500">{grant.region}</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{grant.title}</h1>
              <p className="mt-3 text-sm text-slate-400">{grant.source?.name ?? 'Fuente no especificada'}</p>
            </div>
            <div className="flex flex-col items-start gap-2 text-right">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300">
                {grant.status ?? 'open'}
              </span>
              <span className="text-2xl font-black text-white">{formatCurrency(grant.amount)}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Importe estimado</span>
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Fecha limite</p>
            <p className="mt-3 text-lg font-semibold text-white">{formatDate(grant.deadline)}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Sectores</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(grant.sectors ?? ['No definido']).map((sector) => (
                <span
                  key={sector}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Beneficiarios</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(grant.beneficiaries ?? ['No definido']).map((beneficiary) => (
                <span
                  key={beneficiary}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300"
                >
                  {beneficiary}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2.5rem] border border-slate-800 bg-slate-900/40 p-10">
          <h2 className="text-xs uppercase tracking-[0.4em] text-slate-500">Descripcion</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-200">{grant.description}</p>
        </section>

        {grant.officialUrl && (
          <div className="mt-8">
            <a
              href={grant.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-blue-500/40 bg-blue-500/10 px-6 py-3 text-sm font-semibold text-blue-200 hover:bg-blue-500/20"
            >
              Ver convocatoria oficial
              <span aria-hidden>↗</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
