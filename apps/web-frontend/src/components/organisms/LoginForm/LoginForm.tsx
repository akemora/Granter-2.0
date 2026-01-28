'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      // error already captured in hook
    }
  };

  return (
    <form
      role="form"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-secondary-300 bg-white/80 p-6 shadow-lg"
    >
      <h2 className="text-xl font-semibold text-neutral-900">Sign in</h2>
      <div className="space-y-1 text-sm">
        <label htmlFor="email" className="block font-medium text-neutral-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-1 text-sm">
        <label htmlFor="password" className="block font-medium text-neutral-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="w-full rounded-md border border-neutral-200 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={12}
        />
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
