'use client';

import { useCallback, useState } from 'react';
import { Card } from '@/presentation/components/atoms';
import type { CreatePartnerCreatePaymentResponse } from '@/data/model/response';
import { BillDestinationSummary } from './components/BillDestinationSummary';
import { BillFinancialSummary } from './components/BillFinancialSummary';
import { BillHeader } from './components/BillHeader';
import { BillInstructionAccordion } from './components/BillInstructionAccordion';
import { BillShareActions } from './components/BillShareActions';

interface BillInvoiceResultCardProps {
  bill: CreatePartnerCreatePaymentResponse;
}

export function BillInvoiceResultCard({ bill }: BillInvoiceResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = useCallback(async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // Keep this non-blocking for clipboard-denied environments.
    }
  }, []);

  const openCheckout = useCallback(() => {
    window.open(bill.payment_url, '_blank', 'noopener,noreferrer');
  }, [bill.payment_url]);

  return (
    <Card variant="glass" size="lg" className="p-8 shadow-glass space-y-6">
      <BillHeader bill={bill} />
      <BillFinancialSummary bill={bill} />
      <BillDestinationSummary bill={bill} />
      <BillShareActions bill={bill} copiedField={copiedField} onCopy={handleCopy} onOpenCheckout={openCheckout} />
      <BillInstructionAccordion instruction={bill.payment_instruction} copiedField={copiedField} onCopy={handleCopy} />
    </Card>
  );
}
