import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LogisticsProvider } from '@/context/LogisticsContext';

export const metadata: Metadata = {
  title: 'SwifLoad - On-Demand City Logistics Platform (Coimbatore, Tamil Nadu)',
  description: 'Enterprise & consumer goods transport mobile solution for Coimbatore, Tamil Nadu with Customer, Driver-Partner, and Operations Admin portals.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SwifLoad',
  },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        <LogisticsProvider>
          {children}
        </LogisticsProvider>
      </body>
    </html>
  );
}
