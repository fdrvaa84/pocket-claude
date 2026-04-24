import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientBoot from '@/components/ClientBoot';

export const metadata: Metadata = {
  title: 'Autmzr Command',
  description: 'Your AI command center. In your pocket.',
};
export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false,
  viewportFit: 'cover', themeColor: '#f4f4f3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('pc_theme')||'soft';document.documentElement.setAttribute('data-theme',t)})()`
        }} />
      </head>
      <body className="h-dvh overflow-hidden">
        <ClientBoot />
        {children}
      </body>
    </html>
  );
}
