'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useTranslation } from '@/presentation/hooks';
import { Button } from '@/presentation/components/atoms';
import { Globe, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface NavbarProps {
  mode?: 'auto' | 'public';
}

export default function Navbar({ mode = 'auto' }: NavbarProps) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t, locale, setLocale } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'id' : 'en');
  };

  const publicNav = [
    { href: '/', label: 'Home' },
    { href: '/app', label: 'App' },
    { href: '/docs', label: 'Docs' },
    { href: '/team', label: 'Team' },
  ];

  const authNav = [
    { href: '/dashboard', label: t('common.dashboard') },
    { href: '/payments', label: t('common.payments') },
    { href: '/wallets', label: t('common.wallets') },
  ];

  const showAuthenticatedState = mode === 'auto' && isAuthenticated;
  const navItems = showAuthenticatedState ? authNav : publicNav;

  return (
    <nav className={twMerge(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled 
        ? "glass-navbar backdrop-blur-md bg-black/50 border-b border-white/10 py-0" 
        : "bg-transparent py-2"
    )}>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Payment-Kita Logo"
                  className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-accent-purple/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-foreground font-bold text-xl tracking-tight hidden sm:block">
                Payment-Kita
              </span>
            </Link>
          </div>

          {/* Center: Navigation (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className={clsx(
              "flex items-center gap-1 rounded-full px-2 py-1 transition-all duration-300",
              scrolled ? "bg-white/5 border border-white/5 backdrop-blur-sm" : "bg-transparent border-transparent"
            )}>
                {navItems.map((item, index) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    pathname === item.href
                        ? 'bg-accent-purple/20 text-accent-purple shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'text-muted hover:text-foreground hover:bg-white/5'
                    }`}
                >
                    {item.label}
                </Link>
                ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
             {/* Language Switcher */}
              <button
                onClick={toggleLocale}
                className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors group"
              >
                <div className="p-2 rounded-full hover:bg-white/5 group-hover:text-accent-blue transition-colors">
                    <Globe className="w-5 h-5" />
                </div>
                <span className="uppercase font-medium hidden lg:inline-block">{locale}</span>
              </button>

             {/* Auth/CTA Buttons */}
            {showAuthenticatedState ? (
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    {/* User Info */}
                    <span className="text-muted text-sm hidden lg:block">
                        {user?.email}
                    </span>
                 </div>
                 
                  <Link href="/dashboard">
                    <Button variant="primary" size="sm" glow>
                        Dashboard
                    </Button>
                  </Link>
              </div>
            ) : (
              <div className="pl-4 border-l border-white/10">
                <Link href="/register">
                    <Button variant="primary" size="sm" glow>
                        Get Started
                    </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/10 animate-fade-in absolute w-full bg-black/95 backdrop-blur-xl">
          <div className="px-4 py-6 space-y-4">
            <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                    pathname === item.href
                        ? 'bg-accent-purple/20 text-accent-purple'
                        : 'text-muted hover:text-foreground hover:bg-white/5'
                    }`}
                >
                    {item.label}
                </Link>
                ))}
            </div>
            
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-6 px-2">
                 <span className="text-muted text-sm">{t('common.language')}</span>
                 <button
                    onClick={toggleLocale}
                    className="flex items-center gap-2 text-sm text-foreground bg-white/5 px-3 py-1.5 rounded-lg"
                 >
                    <Globe className="w-4 h-4" />
                    <span className="uppercase">{locale}</span>
                 </button>
              </div>
              
              {!showAuthenticatedState && (
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="primary" size="lg" glow className="w-full justify-center">
                    Get Started
                  </Button>
                </Link>
              )}

               {showAuthenticatedState && (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="primary" size="lg" glow className="w-full justify-center">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
