import type { Metadata, Viewport } from 'next';
import './brutalist.css';

export const metadata: Metadata = {
  title: 'AUTMZR/COMMAND — Brutalist · v0.1.0',
  description:
    'Open-source bridge between your phone and AI coding CLIs running on your servers. Self-hosted MIT, or $5/mo hosted.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

/**
 * Brutalist / Swiss-modernist variant — own scrolling layout, scoped via `.brutalist-root`.
 * Все стили в ./brutalist.css не должны утекать наружу.
 */
export default function BrutalistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="brutalist-root min-h-screen w-full overflow-y-auto overflow-x-hidden"
      style={{ background: '#ffffff', color: '#000000', height: '100dvh' }}
    >
      {children}
    </div>
  );
}
