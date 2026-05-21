'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Copy } from 'lucide-react';
import { Button, Label } from '@/presentation/components/atoms';
import { useTranslation } from '@/presentation/hooks';
import type { PartnerPaymentInstructionResponse } from '@/data/model/response';

interface BillInstructionAccordionProps {
  instruction: PartnerPaymentInstructionResponse;
  copiedField: string | null;
  onCopy: (value: string, field: string) => void;
}

export function BillInstructionAccordion({ instruction, copiedField, onCopy }: BillInstructionAccordionProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const instructionJSON = useMemo(() => JSON.stringify(instruction, null, 2), [instruction]);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between text-left"
      >
        <Label className="text-sm font-medium text-foreground/80">
          {t('payments.payment_instruction', 'Payment Instruction')}
        </Label>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="space-y-2 animate-in fade-in-20 slide-in-from-top-1">
          <pre className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-foreground/80 overflow-x-auto">
            {instructionJSON}
          </pre>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onCopy(instructionJSON, 'payment_instruction')}
            disabled={!instructionJSON}
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedField === 'payment_instruction'
              ? t('payments.copied', 'Copied!')
              : t('payments.copy_instruction_json', 'Copy Instruction JSON')}
          </Button>
        </div>
      )}
    </div>
  );
}
