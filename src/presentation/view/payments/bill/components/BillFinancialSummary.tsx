'use client';

import { useTranslation } from '@/presentation/hooks';
import type { CreatePartnerCreatePaymentResponse } from '@/data/model/response';

interface BillFinancialSummaryProps {
  bill: CreatePartnerCreatePaymentResponse;
}

export function BillFinancialSummary({ bill }: BillFinancialSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      <div className="rounded-xl bg-black/20 border border-white/10 p-4">
        <p className="text-muted text-xs">{t('payments.invoice_amount', 'Invoice Amount')}</p>
        <p className="text-foreground font-semibold mt-1">
          {bill.invoice_amount} {bill.invoice_currency}
        </p>
      </div>
      <div className="rounded-xl bg-black/20 border border-white/10 p-4">
        <p className="text-muted text-xs">{t('payments.quoted_amount', 'Quoted Payment Amount')}</p>
        <p className="text-foreground font-semibold mt-1">
          {bill.quoted_token_amount} {bill.quoted_token_symbol}
        </p>
      </div>
      <div className="rounded-xl bg-black/20 border border-white/10 p-4">
        <p className="text-muted text-xs">{t('payments.quote_rate', 'Quote Rate')}</p>
        <p className="text-foreground font-semibold mt-1 break-all">{bill.quote_rate}</p>
      </div>
      <div className="rounded-xl bg-black/20 border border-white/10 p-4">
        <p className="text-muted text-xs">{t('payments.quote_source', 'Quote Source')}</p>
        <p className="text-foreground font-semibold mt-1 break-all">{bill.quote_source}</p>
      </div>
    </div>
  );
}
