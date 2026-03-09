'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useTranslation } from '@/presentation/hooks';
import { WalletConnectButton } from '@/presentation/components/molecules/WalletConnectButton';
import {
  Store,
  FileText,
  Settings,
  LogOut,
  Globe,
  X,
  ChevronRight,
  Waypoints,
  Cable,
  Percent,
  Route,
  Shuffle,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const drawerNavItems = [
  { href: '/merchant', labelKey: 'nav.merchant', icon: Store },
  { href: '/payment-requests', labelKey: 'nav.paymentRequests', icon: FileText },
  { href: '/settings', labelKey: 'common.settings', icon: Settings },
];

const adminDrawerNavItems = [
  { href: '/admin', labelKey: 'admin.dashboard', icon: Settings },
  { href: '/admin/users', labelKey: 'admin.users', icon: Settings },
  { href: '/admin/teams', labelKey: 'admin.teams', icon: Settings },
  { href: '/admin/merchants', labelKey: 'admin.merchants', icon: Store },
  { href: '/admin/chains', labelKey: 'admin.chains', icon: Settings },
  { href: '/admin/contracts', labelKey: 'admin.contracts', icon: Settings },
  { href: '/admin/rpcs', labelKey: 'admin.rpcs', icon: Settings },
  { href: '/admin/tokens', labelKey: 'admin.tokens', icon: Settings },
  { href: '/admin/payment-bridges', labelKey: 'admin.paymentBridges', icon: Waypoints },
  { href: '/admin/bridge-configs', labelKey: 'admin.bridgeConfigs', icon: Cable },
  { href: '/admin/fee-configs', labelKey: 'admin.feeConfigs', icon: Percent },
  { href: '/admin/onchain-adapters', labelKey: 'admin.onchainAdapters', icon: Route },
  { href: '/admin/route-policies', labelKey: 'admin.routePolicies', icon: Route },
  { href: '/admin/crosschain-config', labelKey: 'admin.crosschainConfigs', icon: Shuffle },
];

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { t, locale, setLocale } = useTranslation();
  const prevPathname = useRef(pathname);
  const canSeeAdminNav = pathname.startsWith('/admin') || user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN';

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'id' : 'en');
  };

  const isActive = (href: string) => pathname.startsWith(href);

  // Close drawer on route change (only when pathname actually changes)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      onClose();
      prevPathname.current = pathname;
    }
  }, [pathname, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="lg:hidden fixed left-4 top-4 bottom-4 w-[280px] max-h-[calc(100dvh-2rem)] overflow-hidden bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl z-50 animate-slide-in-left shadow-2xl flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Payment-Kita Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-foreground font-bold text-lg">{t('common.brand')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-green flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto">
          <span className="px-3 py-2 text-xs font-medium text-muted uppercase tracking-wider block">
            {t('nav.more')}
          </span>
          {drawerNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted hover:text-foreground hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${active ? 'text-accent-green' : ''}`} />
                  {t(item.labelKey)}
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            );
          })}
          {canSeeAdminNav && (
            <>
              <span className="px-3 py-2 text-xs font-medium text-muted uppercase tracking-wider block mt-3">
                Admin
              </span>
              {adminDrawerNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-white/10 text-foreground'
                        : 'text-muted hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${active ? 'text-accent-green' : ''}`} />
                      {t(item.labelKey) !== item.labelKey ? t(item.labelKey) : item.labelKey.split('.').pop()}
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Wallet Connect */}
          <WalletConnectButton size="sm" className="w-full" compact dropdownAlign="left" />

          {/* Language Switcher */}
          <button
            onClick={toggleLocale}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted hover:text-foreground transition-colors rounded-xl hover:bg-white/5"
          >
            <Globe className="w-5 h-5" />
            <span>{t('common.language')}</span>
            <span className="ml-auto uppercase font-medium text-foreground">{locale}</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors rounded-xl hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
}
