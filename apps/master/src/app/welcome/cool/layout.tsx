import type { Metadata, Viewport } from 'next';
import './cool.css';

export const metadata: Metadata = {
  title: 'Autmzr Command — cool',
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
 * /welcome/cool — клон базового /welcome с cool stone + emerald palette.
 * Layout/components импортируются из /components/landing/*, а CSS-переменные
 * переопределены scope'd через .cool-root в ./cool.css.
 *
 * h-dvh + overflow-hidden из RootLayout → перебиваем своим скроллящимся wrapper'ом.
 */
export default function CoolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="cool-root min-h-screen w-full overflow-y-auto overflow-x-hidden"
      style={{ height: '100dvh' }}
    >
      {children}
    </div>
  );
}
