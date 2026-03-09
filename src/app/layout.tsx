import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/presentation/providers';
import QueryProvider from '@/presentation/providers/QueryProvider';
import AuthProvider from '@/presentation/providers/AuthProvider';
import { Toaster } from 'sonner';

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Payment-Kita | Cross-Chain Stablecoin Payments',
  description: 'The fastest way to send and receive cross-chain stablecoin payments. Built for the future of decentralized finance.',
  keywords: ['crypto', 'payments', 'stablecoin', 'cross-chain', 'defi', 'solana', 'ethereum'],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Payment-Kita | Cross-Chain Stablecoin Payments',
    description: 'The fastest way to send and receive cross-chain stablecoin payments.',
    type: 'website',
  },
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans bg-background text-foreground min-h-screen">
        {/* Background mesh gradient */}
        <div className="fixed inset-0 bg-mesh pointer-events-none" />

        {/* Animated gradient orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '4s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <I18nProvider>
            <QueryProvider>
              <AuthProvider>
                {children}
                <Toaster position="top-center" richColors />
              </AuthProvider>
            </QueryProvider>
          </I18nProvider>
        </div>
      </body>
    </html>
  );
}
