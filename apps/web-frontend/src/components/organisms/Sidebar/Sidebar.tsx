'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Globe,
  Settings,
  Search,
  LogOut,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

const menuItems = [
  { name: 'Subvenciones', href: '/', icon: LayoutDashboard },
  { name: 'Fuentes', href: '/sources', icon: Globe },
  { name: 'Discovery IA', href: '/discover', icon: Sparkles },
  { name: 'Búsqueda', href: '/search', icon: Search },
  { name: 'Ayuda', href: '/help', icon: HelpCircle },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <div className="w-64 bg-slate-950 text-slate-100 h-screen p-6 flex flex-col border-r border-slate-900 shadow-2xl sticky top-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
          <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white">GRANTER</span>
      </div>
      <nav className="space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                active
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-900/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-blue-400 border border-transparent'
              }`}
            >
              <item.icon
                size={20}
                className={`transition-transform ${
                  active ? 'scale-110 text-purple-400' : 'group-hover:scale-110'
                }`}
              />
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 transition-all text-slate-400 hover:text-red-400 group mt-4 border border-transparent hover:border-red-500/20"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-semibold">Cerrar Sesión</span>
        </button>
      </nav>
      <div className="pt-6 border-t border-slate-900">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
            System Status
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </div>
        </div>
      </div>
    </div>
  );
}
