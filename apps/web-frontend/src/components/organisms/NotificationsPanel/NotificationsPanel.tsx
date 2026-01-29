'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/types';

function NotificationRow({ item }: { item: NotificationItem }) {
  const created = new Date(item.createdAt).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <div className="flex items-center justify-between gap-6 py-3 border-b border-slate-800/50 last:border-b-0">
      <div>
        <p className="text-slate-200 font-semibold line-clamp-1">{item.grant.title}</p>
        <p className="text-xs text-slate-500">
          {item.channel.toUpperCase()} · {created}
        </p>
      </div>
      <span
        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
          item.status === 'sent'
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        {item.status}
      </span>
    </div>
  );
}

export function NotificationsPanel() {
  const { items, isLoading, error } = useNotifications(5);

  return (
    <section className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Ultimas alertas</h2>
        <p className="text-slate-400 text-sm">Historico de notificaciones enviadas.</p>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Cargando alertas...</p>
      ) : error ? (
        <p className="text-slate-500">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">Todavía no hay alertas registradas.</p>
      ) : (
        <div className="divide-y divide-slate-800/50">
          {items.map((item) => (
            <NotificationRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
