'use client';

import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { useTranslation } from '@/presentation/hooks';
import { ROUTES } from '@/core/constants/routes';

export function CreatePaymentHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4">
      <Link
        href={ROUTES.PAYMENTS}
        className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 text-muted group-hover:text-foreground transition-colors" />
      </Link>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-2">
          <Send className="w-3 h-3 text-accent-purple" />
          <span className="text-xs text-accent-purple font-medium">{t('payments.new_bill_badge', 'Create Bill')}</span>
        </div>
        <h1 className="heading-2 text-foreground">{t('payments.new_payment_bill', 'New Payment Bill')}</h1>
      </div>
    </div>
  );
}
