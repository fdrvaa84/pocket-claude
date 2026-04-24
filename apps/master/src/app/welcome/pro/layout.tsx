import type { Metadata, Viewport } from 'next';
import './pro.css';

export const metadata: Metadata = {
  title: 'Autmzr Command — Your AI command center · Linear edition',
  description:
    'Open-source bridge between your phone and AI coding CLIs running on your servers. Self-hosted MIT, or $5/mo hosted.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0b0d',
};

/**
 * Linear-style / Cool Dark variant — overrides AppShell.
 * RootLayout sets body { h-dvh; overflow-hidden } — landings need scroll,
 * so we wrap in min-h-screen + overflow-y-auto.
 * All variant styles live in ./pro.css scoped under `.pro-root`.
 */
export default function LinearWelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="pro-root min-h-screen w-full overflow-y-auto overflow-x-hidden"
      style={{ background: '#0b0b0d', color: '#f4f4f5', height: '100dvh' }}
    >
      {children}
    </div>
  );
}
