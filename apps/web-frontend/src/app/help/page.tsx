'use client';

import type { ComponentType, ReactNode } from 'react';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  BookOpen,
  Search,
  Globe,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Settings,
  Database,
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  content: ReactNode;
}

function HelpPageContent() {
  const [openSection, setOpenSection] = useState<string>('intro');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? '' : id);
  };

  const sections: Section[] = [
    {
      id: 'intro',
      title: '¿Qué es GRANTER?',
      icon: BookOpen,
      content: (
        <div className="space-y-4 text-slate-300">
          <p>
            <strong className="text-white">GRANTER</strong> es una plataforma automatizada que recopila,
            organiza y muestra subvenciones públicas con inteligencia artificial.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-emerald-400 mt-0.5" />
              Monitorea portales oficiales 24/7.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-emerald-400 mt-0.5" />
              Centraliza la información en un solo panel.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-emerald-400 mt-0.5" />
              Prioriza ayudas con filtros y preferencias.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'grants',
      title: 'Subvenciones',
      icon: Database,
      content: (
        <div className="space-y-4 text-slate-300">
          <p>El panel principal muestra convocatorias detectadas por el motor de scraping.</p>
          <p>Usa el buscador para filtrar por palabras clave y lanza el escaneo para actualizar la base.</p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-400 mt-0.5" />
              <p className="text-sm">
                GRANTER solo recopila información; para solicitar debes acceder al portal oficial.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'sources',
      title: 'Fuentes Oficiales',
      icon: Globe,
      content: (
        <div className="space-y-4 text-slate-300">
          <p>Gestiona los portales monitorizados. Puedes activarlos o desactivarlos según tu estrategia.</p>
          <p>Usa “Alta Manual” para añadir nuevas fuentes y “Discovery IA” para descubrir automáticamente.</p>
          <p>El boton “Scrape Now” ejecuta el scraping inmediato y muestra el resultado.</p>
        </div>
      ),
    },
    {
      id: 'discovery',
      title: 'Discovery IA',
      icon: Sparkles,
      content: (
        <div className="space-y-4 text-slate-300">
          <p>El motor de Discovery busca nuevas fuentes en portales oficiales y evalúa su confianza.</p>
          <p>Selecciona el ámbito geográfico y guarda las fuentes encontradas como inactivas.</p>
        </div>
      ),
    },
    {
      id: 'search',
      title: 'Búsqueda Avanzada',
      icon: Search,
      content: (
        <div className="space-y-4 text-slate-300">
          <p>Filtra convocatorias por texto, region, presupuesto, estado o fechas de cierre.</p>
          <p>Combina filtros para encontrar ayudas relevantes para tu organización.</p>
        </div>
      ),
    },
    {
      id: 'settings',
      title: 'Configuración',
      icon: Settings,
      content: (
        <div className="space-y-4 text-slate-300">
          <p>Define keywords, regiones y alertas para personalizar tu perfil.</p>
          <p>Activa notificaciones por email o Telegram para recibir avisos proactivos.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Centro de Ayuda</h1>
        <p className="text-slate-400 font-medium italic">
          Guía rápida de funcionalidades y buenas prácticas.
        </p>
      </header>

      <div className="space-y-4">
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          return (
            <div
              key={section.id}
              className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <section.icon size={22} className="text-blue-400" />
                  <span className="text-white font-bold">{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown size={20} className="text-slate-400" />
                ) : (
                  <ChevronRight size={20} className="text-slate-400" />
                )}
              </button>
              {isOpen && <div className="px-6 pb-6">{section.content}</div>}
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-3 text-slate-300">
          <Zap className="text-amber-400" size={20} />
          <p className="text-sm">
            Si necesitas soporte adicional, consulta la documentación interna o contacta con el equipo técnico.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <ProtectedRoute>
      <HelpPageContent />
    </ProtectedRoute>
  );
}
