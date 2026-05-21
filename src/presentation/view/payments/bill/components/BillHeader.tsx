'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/presentation/hooks';
import type { CreatePartnerCreatePaymentResponse } from '@/data/model/response';

interface BillHeaderProps {
  bill: CreatePartnerCreatePaymentResponse;
}

function formatDateTime(raw: string | undefined): string {
  if (!raw) return '-';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString();
}

export function BillHeader({ bill }: BillHeaderProps) {
  const { t } = useTranslation();
  const unlimitedLabel = t('payments.unlimited_expiry', 'Unlimited');
  const quoteExpiryLabel = bill.is_unlimited_expiry ? unlimitedLabel : formatDateTime(bill.quote_expires_at);
  const billExpiryLabel = bill.is_unlimited_expiry ? unlimitedLabel : formatDateTime(bill.expire_time);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-green-300 font-medium">{t('payments.bill_ready', 'Bill Ready')}</span>
          </div>
          <h3 className="heading-3 text-foreground">{t('payments.bill_result_title', 'Bill Invoice')}</h3>
        </div>
        <p className="text-xs text-muted font-mono break-all text-right">{bill.payment_id}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-black/20 border border-white/10 p-3">
          <p className="text-muted">{t('payments.quote_expires_at', 'Quote Expires')}</p>
          <p className="text-foreground font-semibold mt-1">{quoteExpiryLabel}</p>
        </div>
        <div className="rounded-xl bg-black/20 border border-white/10 p-3">
          <p className="text-muted">{t('payments.bill_expires_at', 'Bill Expires')}</p>
          <p className="text-foreground font-semibold mt-1">{billExpiryLabel}</p>
        </div>
      </div>
    </div>
  );
}
