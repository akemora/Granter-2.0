import '../styles/globals.css';

export const metadata = {
  title: 'Granter v2',
  description: 'Government grants intelligence platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#0f172a] text-white">
          <main className="mx-auto max-w-5xl px-6 py-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
