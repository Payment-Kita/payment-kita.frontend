'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useTranslation } from '@/presentation/hooks';
import { Button } from '@/presentation/components/atoms';
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Store,
  FileText,
  Settings,
  LogOut,
  Globe,
  Plus,
  Shield,
  Users,
  Link as LinkIcon,
  Code2,
  Server,
  Coins,
  Waypoints,
  Cable,
  Percent,
  Route,
  Shuffle,
  AlertTriangle,
} from 'lucide-react';

// Navigation items definition
export const mainNavItems = [
  { href: '/dashboard', labelKey: 'common.dashboard', icon: LayoutDashboard },
  { href: '/payments', labelKey: 'common.payments', icon: CreditCard },
  { href: '/wallets', labelKey: 'common.wallets', icon: Wallet },
];

export const secondaryNavItems = [
  { href: '/merchant', labelKey: 'nav.merchant', icon: Store },
  { href: '/payment-requests', labelKey: 'nav.paymentRequests', icon: FileText },
  { href: '/settings', labelKey: 'common.settings', icon: Settings },
];

export const adminNavItems = [
  { href: '/admin', labelKey: 'admin.dashboard', icon: Shield },
  { href: '/admin/users', labelKey: 'admin.users', icon: Users },
  { href: '/admin/teams', labelKey: 'admin.teams', icon: Users },
  { href: '/admin/merchants', labelKey: 'admin.merchants', icon: Store },
  { href: '/admin/chains', labelKey: 'admin.chains', icon: LinkIcon },
  { href: '/admin/contracts', labelKey: 'admin.contracts', icon: Code2 },
  { href: '/admin/rpcs', labelKey: 'admin.rpcs', icon: Server },
  { href: '/admin/tokens', labelKey: 'admin.tokens', icon: Coins },
  { href: '/admin/payment-bridges', labelKey: 'admin.paymentBridges', icon: Waypoints },
  { href: '/admin/bridge-configs', labelKey: 'admin.bridgeConfigs', icon: Cable },
  { href: '/admin/fee-configs', labelKey: 'admin.feeConfigs', icon: Percent },
  { href: '/admin/onchain-adapters', labelKey: 'admin.onchainAdapters', icon: Route },
  { href: '/admin/route-policies', labelKey: 'admin.routePolicies', icon: Route },
  { href: '/admin/crosschain-config', labelKey: 'admin.crosschainConfigs', icon: Shuffle },
  { href: '/admin/diagnostics/legacy-endpoints', labelKey: 'Legacy Diagnostics', icon: AlertTriangle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuthStore();
  const { t, locale, setLocale } = useTranslation();
  const canSeeAdminNav = pathname.startsWith('/admin') || user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN';

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'id' : 'en');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex m-5 fixed left-2 top-2 bottom-2 w-[260px] max-h-[calc(100dvh-1rem)] overflow-hidden flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl z-40">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/logo.png"
              alt="Payment-Kita Logo"
              className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-accent-purple/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-foreground font-bold text-lg tracking-tight">
            Payment-Kita
          </span>
        </Link>
      </div>

      {/* Quick Action */}
      <div className="px-3 py-3">
        <Link href="/payments/new">
          <Button variant="primary" size="sm" className="w-full justify-center gap-2">
            <Plus className="w-4 h-4" />
            {t('dashboard.newPayment')}
          </Button>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 min-h-0 px-2 py-1 overflow-y-auto">
        <div className="space-y-0.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-accent-purple' : ''}`} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="my-3 h-px bg-white/10" />

        {/* Secondary Navigation */}
        <div className="space-y-0.5">
          <span className="px-3 py-1.5 text-[10px] font-medium text-muted uppercase tracking-wider">
            {t('nav.more')}
          </span>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-accent-green' : ''}`} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>

        {/* Admin Navigation */}
        {isLoading && !canSeeAdminNav ? (
          <div className="space-y-3 mt-6 px-3">
             <div className="h-2 w-12 bg-white/5 rounded animate-pulse" />
             <div className="h-8 w-full bg-white/5 rounded-xl animate-pulse" />
             <div className="h-8 w-full bg-white/5 rounded-xl animate-pulse" />
          </div>
        ) : canSeeAdminNav && (
          <>
            <div className="my-3 h-px bg-white/10" />
            <div className="space-y-0.5">
              <span className="px-3 py-1.5 text-[10px] font-medium text-muted uppercase tracking-wider">
                Admin
              </span>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-white/10 text-foreground'
                        : 'text-muted hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-red-400' : ''}`} />
                    {t(item.labelKey) !== item.labelKey ? t(item.labelKey) : item.labelKey.split('.').pop()}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {/* Language Switcher */}
        <button
          onClick={toggleLocale}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-xl hover:bg-white/5"
        >
          <Globe className="w-4 h-4" />
          <span className="uppercase font-medium">{locale}</span>
        </button>

        {/* User Info & Logout */}
        {isLoading ? (
          <div className="px-3 py-2 rounded-xl bg-white/5 animate-pulse">
            <div className="h-4 w-24 bg-white/10 rounded mb-1" />
            <div className="h-3 w-32 bg-white/10 rounded" />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-muted truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
              title={t('common.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
