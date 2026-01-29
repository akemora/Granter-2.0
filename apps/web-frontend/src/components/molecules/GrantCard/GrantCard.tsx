'use client';
import Link from 'next/link';
import { Grant } from '@/types';

interface GrantCardProps {
  grant: Grant;
}

export function GrantCard({ grant }: GrantCardProps) {
  const formattedAmount =
    grant.amount && Number(grant.amount) > 0
      ? new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(Number(grant.amount))
      : 'Ver bases';

  const deadlineDate = grant.deadline
    ? new Date(grant.deadline).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Abierta';

  const postedDate = new Date(grant.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const officialLink = grant.officialUrl || grant.source?.url;

  return (
    <div className="block p-6 bg-slate-900/50 border border-slate-800/60 rounded-[2rem] hover:bg-slate-900 hover:border-blue-500/30 transition-all duration-500 group shadow-2xl">
      <Link href={`/grants/${grant.id}`}>
        <h3 className="text-lg font-bold text-slate-100 mb-3 group-hover:text-white transition-colors line-clamp-2">
          {grant.title}
        </h3>
      </Link>

      <p className="text-sm text-slate-400 line-clamp-3 mb-5">{grant.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {grant.source?.name && (
          <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/20">
            {grant.source.name}
          </span>
        )}
        <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/20">
          {grant.region}
        </span>
        <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/20">
          {formattedAmount}
        </span>
      </div>

      <div className="flex flex-col gap-1 mb-5">
        <p className="text-xs text-slate-500">
          Plazo: <span className="font-semibold text-slate-300">{deadlineDate}</span>
        </p>
        <p className="text-xs text-slate-600">Publicado {postedDate}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Link
          href={`/grants/${grant.id}`}
          className="inline-flex items-center justify-center w-full px-4 py-3 rounded-2xl border border-slate-700 text-slate-200 text-xs font-black uppercase tracking-widest hover:border-blue-500/50 hover:text-white transition-all"
        >
          Ver detalles
        </Link>
        {officialLink && (
          <a
            href={officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-4 py-3 rounded-2xl bg-white text-slate-950 text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
          >
            Acceder al portal
          </a>
        )}
      </div>
    </div>
  );
}
