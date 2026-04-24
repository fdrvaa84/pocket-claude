import type { Metadata, Viewport } from 'next';
import './readme.css';

export const metadata: Metadata = {
  title: 'autmzr/command — README',
  description: 'Open-source bridge between your phone and AI coding CLIs running on your servers.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d1117',
};

/**
 * README.md style variant — выглядит как GitHub README в dark mode.
 * Все стили scoped под .readme-root в ./readme.css.
 */
export default function ReadmeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="readme-root min-h-screen w-full overflow-y-auto overflow-x-hidden"
      style={{ background: '#0d1117', color: '#e6edf3', height: '100dvh' }}
    >
      {children}
    </div>
  );
}
