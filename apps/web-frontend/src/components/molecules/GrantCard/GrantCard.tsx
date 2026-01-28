'use client';

import Link from 'next/link';
import { Grant } from '@/types';

interface GrantCardProps {
  grant: Grant;
}

export function GrantCard({ grant }: GrantCardProps) {
  const formattedAmount = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(grant.amount));

  const deadlineDate = new Date(grant.deadline).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const postedDate = new Date(grant.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/grants/${grant.id}`}>
      <div className="block p-4 bg-white border border-neutral-200 rounded-lg hover:shadow-md transition-shadow duration-base cursor-pointer group">
        <h3 className="text-base font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {grant.title}
        </h3>

        <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{grant.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
            {grant.region}
          </span>
          <span className="inline-block px-3 py-1 bg-status-success/10 text-status-success text-xs font-medium rounded-full">
            {formattedAmount}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs text-neutral-500">
            Deadline: <span className="font-medium">{deadlineDate}</span>
          </p>
          <p className="text-xs text-neutral-500">Posted {postedDate}</p>
        </div>
      </div>
    </Link>
  );
}
