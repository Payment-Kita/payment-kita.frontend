'use client';

import { Label } from '@/presentation/components/atoms';
import { useTranslation } from '@/presentation/hooks';
import type { CreatePaymentPricingType } from '@/data/model/request';

export interface PricingTypeOption {
  id: CreatePaymentPricingType;
  title: string;
  description: string;
}

interface PricingTypeSelectorProps {
  options: PricingTypeOption[];
  selected: CreatePaymentPricingType;
  onSelect: (pricingType: CreatePaymentPricingType) => void;
  errorMessage?: string;
}

export function PricingTypeSelector({ options, selected, onSelect, errorMessage }: PricingTypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground/80 ml-1">{t('payments.pricing_type', 'Pricing Type')}</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option) => {
          const isActive = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={[
                'rounded-2xl border p-3 text-left transition-all duration-300',
                isActive
                  ? 'border-accent-purple/50 bg-accent-purple/10 shadow-glow-sm'
                  : 'border-white/10 bg-white/5 hover:bg-white/10',
              ].join(' ')}
            >
              <p className="text-xs font-semibold text-foreground">{option.title}</p>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">{option.description}</p>
            </button>
          );
        })}
      </div>
      {errorMessage && (
        <p className="text-sm font-medium text-destructive animate-in slide-in-from-top-1 fade-in-20">{errorMessage}</p>
      )}
    </div>
  );
}
