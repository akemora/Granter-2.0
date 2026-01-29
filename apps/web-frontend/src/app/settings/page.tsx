'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { UserProfile } from '@/types';
import { Save, Bell, Search, Loader2, CheckCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function SettingsPageContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const data = await fetchApi('/profile');
        setProfile(data as UserProfile);
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          router.push('/login');
          return;
        }
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      await fetchApi('/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto bg-slate-950 min-h-screen">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Mi Perfil</h1>
        <p className="text-slate-400 font-medium italic">Configura tu identidad de búsqueda para el motor de IA.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-10">
        <section className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 p-10 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-black text-white mb-8 flex items-center gap-4 border-b border-slate-800 pb-6 uppercase tracking-widest text-[13px]">
            <Search size={22} className="text-blue-500" />
            Filtros de Inteligencia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Keywords Estratégicas</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-white font-medium placeholder:text-slate-700"
                placeholder="IA, digitalización, industria..."
                value={profile?.keywords.join(', ') || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev!,
                    keywords: e.target.value
                      .split(',')
                      .map((k) => k.trim())
                      .filter((k) => k !== ''),
                  }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Ámbitos de Acción</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-white font-medium placeholder:text-slate-700"
                placeholder="UE, Nacional, Regional..."
                value={profile?.regions.join(', ') || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev!,
                    regions: e.target.value
                      .split(',')
                      .map((r) => r.trim())
                      .filter((r) => r !== ''),
                  }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Presupuesto Mínimo (€)</label>
              <input
                type="number"
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-white font-black"
                value={profile?.minAmount || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev!,
                    minAmount: Number(e.target.value) || undefined,
                  }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Presupuesto Máximo (€)</label>
              <input
                type="number"
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-white font-black"
                value={profile?.maxAmount || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev!,
                    maxAmount: Number(e.target.value) || undefined,
                  }))
                }
              />
            </div>
          </div>
        </section>

        <section className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 p-10 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-black text-white mb-8 flex items-center gap-4 border-b border-slate-800 pb-6 uppercase tracking-widest text-[13px]">
            <Bell size={22} className="text-blue-500" />
            Terminal de Alertas
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-950/50 rounded-3xl border border-slate-800/50 hover:bg-slate-950 transition-all">
              <div className="space-y-1">
                <p className="font-bold text-slate-100 uppercase tracking-tighter">Canal de Email</p>
                <input
                  type="email"
                  className="mt-2 w-80 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm outline-none text-blue-400 focus:border-blue-500 transition-all"
                  placeholder="admin@granter.io"
                  hidden={!profile?.emailNotifications}
                  value={profile?.email || ''}
                  onChange={(e) => setProfile((prev) => ({ ...prev!, email: e.target.value }))}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setProfile((prev) => ({
                    ...prev!,
                    emailNotifications: !prev!.emailNotifications,
                  }))
                }
                className={`w-16 h-8 rounded-full transition-all flex items-center px-1.5 ${
                  profile?.emailNotifications ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${
                    profile?.emailNotifications ? 'translate-x-8' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-950/50 rounded-3xl border border-slate-800/50 hover:bg-slate-950 transition-all">
              <div className="space-y-1">
                <p className="font-bold text-slate-100 uppercase tracking-tighter">Bot de Telegram</p>
                <p className="text-xs font-medium text-slate-500">Alertas instantáneas de baja latencia.</p>
                <input
                  type="text"
                  className="mt-2 w-80 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm outline-none text-blue-400 focus:border-blue-500 transition-all"
                  placeholder="Chat ID del bot"
                  hidden={!profile?.telegramNotifications}
                  value={profile?.telegramChatId || ''}
                  onChange={(e) => setProfile((prev) => ({ ...prev!, telegramChatId: e.target.value }))}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setProfile((prev) => ({
                    ...prev!,
                    telegramNotifications: !prev!.telegramNotifications,
                  }))
                }
                className={`w-16 h-8 rounded-full transition-all flex items-center px-1.5 ${
                  profile?.telegramNotifications ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${
                    profile?.telegramNotifications ? 'translate-x-8' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        <div className="flex justify-end items-center gap-6">
          {savedSuccess && (
            <span className="flex items-center gap-2 text-emerald-400 font-black uppercase text-[10px] tracking-widest animate-in fade-in zoom-in">
              <CheckCircle size={16} />
              Protocolo Guardado
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-2xl active:scale-95 disabled:bg-slate-800 disabled:text-slate-600"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Procesando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  );
}
