'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [notice, setNotice] = useState<string | null>(null);
  const { login, register, isLoading, error } = useAuth();
  const router = useRouter();

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);
    try {
      if (mode === 'login') {
        await login(email, password);
        router.push('/');
      } else {
        const result = await register(email, password);
        setNotice(result.message);
        setMode('login');
      }
    } catch (err) {
      // handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] border border-slate-800 p-10 shadow-2xl shadow-blue-900/10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/40 rotate-12 transition-transform hover:rotate-0 duration-500">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            {mode === 'login' ? 'Acceso Seguro' : 'Crear Cuenta'}
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            {mode === 'login'
              ? 'Introduce tus credenciales GRANTER'
              : 'Registra un nuevo acceso para GRANTER'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Email Corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                placeholder="nombre@granter.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {notice && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-3 text-blue-300 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 disabled:bg-slate-800 disabled:text-slate-600"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mx-auto" size={20} />
            ) : mode === 'login' ? (
              'Iniciar Sesión'
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setNotice(null);
            }}
            className="text-blue-400 font-bold hover:text-blue-300"
          >
            {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          Sistema de Acceso Restringido
        </div>
      </div>
    </div>
  );
}
