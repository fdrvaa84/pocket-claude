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
  themeColor: '#efece4',
};

/**
 * Лендинг живёт в отдельном layout, без AppShell-а / ClientBoot.
 * body в RootLayout стоит h-dvh overflow-hidden — на лендинге нужен скролл,
 * поэтому переопределяем через div с min-h-screen и overflow-y-auto.
 */
export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full overflow-y-auto overflow-x-hidden"
      style={{ background: 'var(--bg)', color: 'var(--fg)', height: '100dvh' }}
    >
      {children}
    </div>
  );
}
