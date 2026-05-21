'use client';

import Link from 'next/link';
import { Button } from '@/presentation/components/atoms';
import { useTranslation } from '@/presentation/hooks';
import { ROUTES } from '@/core/constants/routes';

export function SettlementMissingCard() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
      <p className="text-sm text-amber-200">
        {t('payments.settlement_not_configured', 'Settlement profile belum dikonfigurasi.')}
      </p>
      <Link href={ROUTES.SETTINGS}>
        <Button type="button" variant="outline" size="sm">
          {t('payments.configure_settlement', 'Configure Settlement')}
        </Button>
      </Link>
    </div>
  );
}
