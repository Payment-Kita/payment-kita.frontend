'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Book, FileCode, Package, FileText, Menu, X, Github, Globe } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { Button } from '@/presentation/components/atoms';
import { useTranslation } from '@/presentation/hooks/useTranslation';

const navigation = [
  { name: 'Introduction', href: '/docs', icon: Book },
  { name: 'Partner API', href: '/docs/partner-api', icon: FileCode },
  { name: 'API Reference', href: '/docs/api', icon: FileCode },
  { name: 'SDKs', href: '/docs/sdks', icon: Package },
  { name: 'Guides', href: '/docs/guides', icon: FileText },
];

export function DocsLayoutView({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, locale, setLocale } = useTranslation();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'id' : 'en');
  };

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in group/layout relative overflow-hidden">
      {/* Background Gradients (Mesh Effect) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-accent-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-accent-blue/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-card/80 backdrop-blur-xl border-r border-white/5 transform transition-all duration-500 ease-in-out lg:translate-x-0 shadow-2xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-8 border-b border-white/5">
            <Link href="/" className="flex items-center gap-3 group/logo">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Payment-Kita Logo"
                  className="h-9 w-9 object-contain transition-transform duration-300 group-hover/logo:scale-110"
                />
                <div className="absolute inset-0 bg-accent-purple/30 blur-xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-foreground font-bold text-xl tracking-tight hidden sm:block">
                Payment-Kita
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl hover:bg-white/5"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto scrollbar-hide" role="navigation">
            <div className="px-4 mb-4">
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] opacity-50">Main Documentation</span>
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={t(`docs.nav.${item.href}`, item.name)}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative group/item',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-glow-purple/20'
                      : 'text-muted hover:bg-white/5 hover:text-white'
                  )}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn("h-5 w-5 transition-transform group-hover/item:scale-110", isActive ? "opacity-100" : "opacity-60")} aria-hidden="true" />
                  {t(`docs.nav.${item.href}`, item.name)}
                  {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-white/5 space-y-3">
            <button
              type="button"
              onClick={toggleLocale}
              className="w-full flex items-center justify-between gap-4 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="flex items-center gap-3">
                <Globe className="h-5 w-5 opacity-70" aria-hidden="true" />
                {t('common.language', 'Language')}
              </span>
              <span className="uppercase text-xs font-black tracking-[0.2em] text-primary">{locale}</span>
            </button>
             <Link
              href="https://github.com/payment-kita"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:bg-white/5 hover:text-white transition-all group/gh"
            >
              <Github className="h-5 w-5 opacity-60 group-hover/gh:opacity-100 group-hover/gh:scale-110 transition-all" aria-hidden="true" />
              GitHub Repository
            </Link>
            <div className="px-4 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Version</span>
                    <span className="text-[10px] font-bold text-white px-1.5 py-0.5 bg-primary/20 rounded">v2.0.0</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">Latest stable release for institutional partners.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-white/10 bg-black/50 backdrop-blur-md px-8 glass-navbar"
          aria-label="Top navigation"
        >
          <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl hover:bg-white/5"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                aria-expanded={sidebarOpen}
            >
                <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
            <div className="hidden lg:flex items-center gap-2 text-muted text-sm font-bold">
                <span>{t('docs.layout.breadcrumb_root', 'Documentation')}</span>
                <span className="opacity-20">/</span>
                <span className="text-foreground">{t(`docs.nav.${pathname}`, navigation.find(n => n.href === pathname)?.name || 'Overview')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button
                type="button"
                onClick={toggleLocale}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-muted hover:text-white hover:border-white/20 transition-all"
             >
                <Globe className="h-4 w-4" aria-hidden="true" />
                <span>{locale}</span>
             </button>
             <Button variant="outline" size="sm" className="hidden border-white/10 rounded-xl font-bold text-xs h-10 px-4 hover:bg-white/5">
                Feedback
             </Button>
             <div className="h-8 w-px bg-white/10 hidden md:block" />
             <div className="flex items-center gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/5 pr-4">
                <div className="h-7 w-7 rounded-lg bg-linear-to-tr from-primary to-accent-blue shadow-inner" />
                <span className="text-xs font-bold truncate max-w-[100px]">Guest User</span>
             </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-8 lg:p-12 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <footer className="p-8 border-t border-white/5 bg-black/20 mt-auto text-center">
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Built for the future of institutional crypto payments.</p>
        </footer>
      </div>
    </div>
  );
}
