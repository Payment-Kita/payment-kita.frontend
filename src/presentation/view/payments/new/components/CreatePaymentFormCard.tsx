'use client';

import type React from 'react';
import Link from 'next/link';
import type { UseFormReturn } from 'react-hook-form';
import { Send } from 'lucide-react';
import { Button, Card, Input, Label } from '@/presentation/components/atoms';
import { ChainSelector } from '@/presentation/components/organisms/ChainSelector';
import { TokenSelector } from '@/presentation/components/organisms/TokenSelector';
import type { ChainItemData } from '@/presentation/components/molecules/ChainListItem';
import type { TokenItemData } from '@/presentation/components/molecules/TokenListItem';
import { useTranslation } from '@/presentation/hooks';
import { ROUTES } from '@/core/constants/routes';
import type { CreatePaymentPricingType } from '@/data/model/request';
import type { MerchantSettlementProfileResponse } from '@/data/model/response';
import type { CreatePaymentExpiryMode, PaymentFormValues } from '../useNewPayment';
import { CreatePaymentErrorCard } from './CreatePaymentErrorCard';
import { PricingTypeSelector, type PricingTypeOption } from './PricingTypeSelector';
import { SettlementSummaryCard } from './SettlementSummaryCard';

interface CreatePaymentFormCardProps {
  form: UseFormReturn<PaymentFormValues>;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void> | void;
  loading: boolean;
  error: string | null;
  settlementProfile?: MerchantSettlementProfileResponse | null;
  settlementConfigured: boolean;
  pricingType: CreatePaymentPricingType;
  pricingOptions: PricingTypeOption[];
  onPricingTypeSelect: (pricingType: CreatePaymentPricingType) => void;
  chainItems: ChainItemData[];
  sourceChainId?: string;
  onSourceChainSelect: (chain?: ChainItemData) => void;
  filteredTokens: TokenItemData[];
  selectedTokenId?: string;
  onTokenSelect: (token?: TokenItemData) => void;
  displayAmount: string;
  requestedAmountUnit: string;
  requestedAmountModeText: string;
  amountInputDisabled: boolean;
  amountPlaceholder: string;
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  expiryMode: CreatePaymentExpiryMode;
  expiresInCustom?: string;
  onExpiryModeSelect: (mode: CreatePaymentExpiryMode) => void;
  onExpiresInCustomChange: (value: string) => void;
}

export function CreatePaymentFormCard({
  form,
  onSubmit,
  loading,
  error,
  settlementProfile,
  settlementConfigured,
  pricingType,
  pricingOptions,
  onPricingTypeSelect,
  chainItems,
  sourceChainId,
  onSourceChainSelect,
  filteredTokens,
  selectedTokenId,
  onTokenSelect,
  displayAmount,
  requestedAmountUnit,
  requestedAmountModeText,
  amountInputDisabled,
  amountPlaceholder,
  onAmountChange,
  expiryMode,
  expiresInCustom,
  onExpiryModeSelect,
  onExpiresInCustomChange,
}: CreatePaymentFormCardProps) {
  const { t } = useTranslation();
  const sourceChainError = form.formState.errors.sourceChainId?.message;
  const sourceTokenError = form.formState.errors.sourceTokenAddress?.message;
  const amountError = form.formState.errors.amount?.message;
  const rootError = form.formState.errors.root?.message;
  const pricingTypeError = form.formState.errors.pricing_type?.message;
  const expiresInCustomError = form.formState.errors.expires_in_custom?.message;

  return (
    <Card variant="glass" size="lg" className="p-8 shadow-glass">
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-6">
          <h2 className="heading-3 text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center">
              <span className="text-accent-purple text-sm font-bold">1</span>
            </div>
            {t('payments.bill_configuration', 'Bill Configuration')}
          </h2>

          <PricingTypeSelector
            options={pricingOptions}
            selected={pricingType}
            onSelect={onPricingTypeSelect}
            errorMessage={pricingTypeError}
          />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <ChainSelector
                label={t('payments.payer_selected_chain', 'Payer Selected Chain')}
                chains={chainItems}
                selectedChainId={sourceChainId}
                onSelect={onSourceChainSelect}
                placeholder={t('payments.select_source_chain')}
              />
              {sourceChainError && (
                <p className="text-sm font-medium text-destructive animate-in slide-in-from-top-1 fade-in-20">
                  {sourceChainError}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <TokenSelector
                  label={t('payments.payer_selected_token', 'Payer Selected Token')}
                  tokens={filteredTokens}
                  selectedTokenId={selectedTokenId}
                  onSelect={onTokenSelect}
                  disabled={!sourceChainId}
                  placeholder={sourceChainId ? t('payments.select_token') : t('payments.select_chain_first')}
                />
                {sourceTokenError && (
                  <p className="text-sm font-medium text-destructive animate-in slide-in-from-top-1 fade-in-20">
                    {sourceTokenError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="flex justify-between items-center text-sm font-medium text-foreground/80 ml-1 mb-1.5">
                  <span>{t('payments.requested_amount', 'Requested Amount')}</span>
                  <span className="text-[11px] font-normal text-muted">{requestedAmountModeText}</span>
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={amountPlaceholder}
                    disabled={amountInputDisabled}
                    value={displayAmount}
                    onChange={onAmountChange}
                    className="pr-24"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {requestedAmountUnit && (
                      <span className="text-xs font-medium text-muted-foreground select-none">{requestedAmountUnit}</span>
                    )}
                  </div>
                </div>
                {amountError && (
                  <p className="text-sm font-medium text-destructive animate-in slide-in-from-top-1 fade-in-20">{amountError}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80 ml-1">{t('payments.bill_expiry_mode', 'Bill Expiry')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {([
                { id: 'default', title: t('payments.bill_expiry_default', 'Default (3 min)') },
                { id: 'custom', title: t('payments.bill_expiry_custom', 'Custom (seconds)') },
                { id: 'unlimited', title: t('payments.bill_expiry_unlimited', 'Unlimited') },
              ] as Array<{ id: CreatePaymentExpiryMode; title: string }>).map((option) => {
                const isActive = expiryMode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onExpiryModeSelect(option.id)}
                    className={[
                      'rounded-2xl border px-3 py-2 text-left transition-all duration-300 text-xs font-semibold',
                      isActive
                        ? 'border-accent-purple/50 bg-accent-purple/10 shadow-glow-sm text-foreground'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-muted',
                    ].join(' ')}
                  >
                    {option.title}
                  </button>
                );
              })}
            </div>

            {expiryMode === 'custom' && (
              <div className="space-y-1.5 pt-1">
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="180"
                    value={expiresInCustom || ''}
                    onChange={(event) => onExpiresInCustomChange(event.target.value)}
                    className="pr-20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">seconds</span>
                </div>
                {expiresInCustomError && (
                  <p className="text-sm font-medium text-destructive animate-in slide-in-from-top-1 fade-in-20">
                    {expiresInCustomError}
                  </p>
                )}
              </div>
            )}
          </div>

          <SettlementSummaryCard settlementProfile={settlementProfile} />
        </div>

        {error && <CreatePaymentErrorCard title={t('payments.error_label')} message={error} />}
        {rootError && <CreatePaymentErrorCard title={t('payments.form_error_label')} message={rootError} />}

        <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
          <Link href={ROUTES.DASHBOARD}>
            <Button type="button" variant="ghost">
              {t('common.cancel')}
            </Button>
          </Link>
          <Button type="submit" variant="primary" loading={loading} disabled={!settlementConfigured || loading} glow>
            <Send className="w-4 h-4" />
            {t('payments.create_bill_action', 'Create Bill')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
