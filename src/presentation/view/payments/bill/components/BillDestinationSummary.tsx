'use client';

import { useTranslation } from '@/presentation/hooks';
import type { CreatePartnerCreatePaymentResponse } from '@/data/model/response';

interface BillDestinationSummaryProps {
  bill: CreatePartnerCreatePaymentResponse;
}

export function BillDestinationSummary({ bill }: BillDestinationSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{t('payments.destination_summary', 'Settlement Destination')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-black/20 border border-white/10 p-3">
          <p className="text-muted">{t('payments.dest_chain', 'Destination Chain')}</p>
          <p className="text-foreground font-semibold mt-1 break-all">{bill.dest_chain}</p>
        </div>
        <div className="rounded-xl bg-black/20 border border-white/10 p-3">
          <p className="text-muted">{t('payments.dest_token', 'Destination Token')}</p>
          <p className="text-foreground font-semibold mt-1 break-all">{bill.dest_token}</p>
        </div>
        <div className="rounded-xl bg-black/20 border border-white/10 p-3 md:col-span-2">
          <p className="text-muted">{t('payments.dest_wallet', 'Destination Wallet')}</p>
          <p className="text-foreground font-semibold mt-1 break-all">{bill.dest_wallet}</p>
        </div>
      </div>
    </div>
  );
}
