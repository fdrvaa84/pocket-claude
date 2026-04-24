import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Autmzr Command — Your AI command center. In your pocket.',
  description:
    'Open-source bridge between your phone and AI coding CLIs running on your servers. Self-hosted MIT, or $5/mo hosted.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f4f4f3',
};

/**
 * Лендинг живёт в отдельном layout, без AppShell-а.
 * body в RootLayout стоит h-dvh overflow-hidden — тут нужен скролл.
 * Палитра берётся из globals.css (cool stone + emerald — единая для всего проекта).
 */
export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full overflow-y-auto overflow-x-hidden"
      style={{ height: '100dvh' }}
    >
      {children}
    </div>
  );
}
