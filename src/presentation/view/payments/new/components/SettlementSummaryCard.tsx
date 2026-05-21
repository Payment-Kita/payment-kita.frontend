'use client';

import { FileText } from 'lucide-react';
import { useTranslation } from '@/presentation/hooks';
import { SettlementMissingCard } from './SettlementMissingCard';
import type { MerchantSettlementProfileResponse } from '@/data/model/response';

interface SettlementSummaryCardProps {
  settlementProfile?: MerchantSettlementProfileResponse | null;
}

export function SettlementSummaryCard({ settlementProfile }: SettlementSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-accent-purple" />
        <p className="text-sm font-semibold text-foreground">{t('payments.settlement_summary', 'Settlement Summary')}</p>
      </div>
      {settlementProfile?.configured ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-black/20 border border-white/10 p-3">
            <p className="text-muted">{t('payments.invoice_currency', 'Invoice Currency')}</p>
            <p className="text-foreground font-semibold mt-1">{settlementProfile.invoice_currency || '-'}</p>
          </div>
          <div className="rounded-xl bg-black/20 border border-white/10 p-3">
            <p className="text-muted">{t('payments.dest_chain', 'Destination Chain')}</p>
            <p className="text-foreground font-semibold mt-1 break-all">{settlementProfile.dest_chain || '-'}</p>
          </div>
          <div className="rounded-xl bg-black/20 border border-white/10 p-3">
            <p className="text-muted">{t('payments.dest_token', 'Destination Token')}</p>
            <p className="text-foreground font-semibold mt-1 break-all">{settlementProfile.dest_token || '-'}</p>
          </div>
          <div className="rounded-xl bg-black/20 border border-white/10 p-3">
            <p className="text-muted">{t('payments.dest_wallet', 'Destination Wallet')}</p>
            <p className="text-foreground font-semibold mt-1 break-all">{settlementProfile.dest_wallet || '-'}</p>
          </div>
        </div>
      ) : (
        <SettlementMissingCard />
      )}
    </div>
  );
}
