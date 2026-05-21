'use client';

import { Copy, ExternalLink } from 'lucide-react';
import { Button, Input, Label } from '@/presentation/components/atoms';
import { useTranslation } from '@/presentation/hooks';
import { QRDisplay } from '@/presentation/components/organisms/checkout/QRDisplay';
import type { CreatePartnerCreatePaymentResponse } from '@/data/model/response';

interface BillShareActionsProps {
  bill: CreatePartnerCreatePaymentResponse;
  copiedField: string | null;
  onCopy: (value: string, field: string) => void;
  onOpenCheckout: () => void;
}

export function BillShareActions({ bill, copiedField, onCopy, onOpenCheckout }: BillShareActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Input label={t('payments.payment_url', 'Payment URL')} value={bill.payment_url} readOnly />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => onCopy(bill.payment_url, 'payment_url')}>
            <Copy className="w-3.5 h-3.5" />
            {copiedField === 'payment_url' ? t('payments.copied', 'Copied!') : t('payments.copy_url', 'Copy URL')}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onOpenCheckout}>
            <ExternalLink className="w-3.5 h-3.5" />
            {t('payments.open_checkout', 'Open Checkout')}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80 ml-1">{t('payments.payment_code', 'Payment Code (QR)')}</Label>
        <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
          <div className="max-w-[240px] mx-auto">
            <QRDisplay value={bill.payment_code} size={176} label={t('pay_page.scan_to_pay', 'Scan to Pay')} />
          </div>
        </div>
      </div>
    </div>
  );
}
