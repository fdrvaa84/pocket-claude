import type { Metadata, Viewport } from 'next';
import './tactical.css';

export const metadata: Metadata = {
  title: 'AUTMZR/COMMAND — Tactical UI · v0.1.0',
  description:
    'Open-source bridge between your phone and AI coding CLIs running on your servers. Self-hosted MIT, or $5/mo hosted.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

/**
 * Tactical / Command Center variant — переопределяет AppShell.
 * RootLayout даёт body h-dvh overflow-hidden; здесь нужен скролл,
 * поэтому оборачиваем в div с min-h-screen + overflow-y-auto.
 * Все стили варианта живут в ./tactical.css и зашиты в `.tactical-root`.
 */
export default function TacticalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="tactical-root min-h-screen w-full overflow-y-auto overflow-x-hidden"
      style={{ background: '#0a0a0a', color: '#fafafa', height: '100dvh' }}
    >
      {children}
    </div>
  );
}
