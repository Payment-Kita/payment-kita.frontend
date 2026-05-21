'use client';

import { FileText } from 'lucide-react';
import { Card } from '@/presentation/components/atoms';
import { useTranslation } from '@/presentation/hooks';

export function BillInvoiceEmptyState() {
  const { t } = useTranslation();

  return (
    <Card variant="glass" size="lg" className="p-8 shadow-glass">
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center space-y-2">
        <div className="mx-auto w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-accent-purple" />
        </div>
        <p className="text-sm font-semibold text-foreground">{t('payments.bill_empty_title', 'Bill Invoice Preview')}</p>
        <p className="text-xs text-muted">
          {t('payments.bill_empty_desc', 'Result bill akan muncul di sini setelah kamu klik "Create Bill".')}
        </p>
      </div>
    </Card>
  );
}
