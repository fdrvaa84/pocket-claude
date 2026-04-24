import type { Metadata, Viewport } from 'next';
import './welcome.css';

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
 * CSS-палитра переопределена в welcome.css через .welcome-root (cool stone + emerald).
 */
export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="welcome-root min-h-screen w-full overflow-y-auto overflow-x-hidden"
      style={{ height: '100dvh' }}
    >
      {children}
    </div>
  );
}
