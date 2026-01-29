import type { ReactNode } from 'react';
import { AppShell } from '@/components/organisms/AppShell/AppShell';
import '../styles/globals.css';

export const metadata = {
  title: 'Granter v2',
  description: 'Government grants intelligence platform'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-slate-950 text-slate-50">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
