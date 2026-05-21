'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/presentation/hooks';
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  MoreHorizontal,
} from 'lucide-react';

interface BottomBarProps {
  onMoreClick: () => void;
}

const bottomNavItems = [
  { href: '/dashboard', labelKey: 'common.dashboard', icon: LayoutDashboard },
  { href: '/payments', labelKey: 'common.payments', icon: CreditCard },
  { href: '/wallets', labelKey: 'common.wallets', icon: Wallet },
];

export default function BottomBar({ onMoreClick }: BottomBarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Check if any secondary route is active (for "More" button highlight)
  const isSecondaryActive = ['/merchant', '/settings'].some(
    (path) => pathname.startsWith(path)
  );

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-xl border-t border-white/10 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-full px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 ${
                active
                  ? 'text-accent-purple'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {active && (
                  <div className="absolute -inset-2 bg-accent-purple/20 rounded-full blur-lg" />
                )}
              </div>
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={onMoreClick}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 ${
            isSecondaryActive
              ? 'text-accent-green'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5" />
            {isSecondaryActive && (
              <div className="absolute -inset-2 bg-accent-green/20 rounded-full blur-lg" />
            )}
          </div>
          <span className="text-[10px] font-medium">{t('nav.more')}</span>
        </button>
      </div>
    </nav>
  );
}
