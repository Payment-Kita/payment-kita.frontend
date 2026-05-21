'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Button } from '@/presentation/components/atoms';
import { useTranslation } from '@/presentation/hooks';
import { useChainsQuery, useTokensQuery } from '@/data/usecase';
import type { ChainItemData } from '@/presentation/components/molecules/ChainListItem';
import type { TokenItemData } from '@/presentation/components/molecules/TokenListItem';
import { sanitizeNumberWithDecimals, formatMoneyDisplay, stripMoneyFormat } from '@/core/utils/validators';
import type { CreatePaymentPricingType } from '@/data/model/request';
import { useNewPayment } from './useNewPayment';
import { CreatePaymentHeader } from './components/CreatePaymentHeader';
import { CreatePaymentFormCard } from './components/CreatePaymentFormCard';
import type { PricingTypeOption } from './components/PricingTypeSelector';
import { BillInvoiceResultCard, BillInvoiceSkeleton, BillInvoiceEmptyState } from '../bill';
import type { NewPaymentPageInit } from './types';

interface NewPaymentViewProps {
  initData?: NewPaymentPageInit;
}

export function NewPaymentView({ initData }: NewPaymentViewProps) {
  const {
    form,
    loading,
    error,
    createdBill,
    settlementProfile,
    settlementConfigured,
    chainsData,
    chainsError,
    refetchChains,
    handleSubmit,
    handleSourceChainSelect,
    handleTokenSelect,
    sourceChainId,
    sourceTokenAddress,
    pricingType,
    expiryMode,
    expiresInCustom,
    handleExpiryModeSelect,
    handleExpiresInCustomChange,
    setValue,
  } = useNewPayment({
    initialChains: initData?.chains,
    initialSettlementProfile: initData?.settlementProfile,
  });
  const { t } = useTranslation();

  const {
    data: tokens,
    error: tokensQueryError,
    refetch: refetchTokens,
    isFetching: isTokensFetching,
  } = useTokensQuery(initData?.tokens);

  const chainItems: ChainItemData[] = useMemo(
    () =>
      chainsData?.items?.map((chain) => ({
        id: chain.id.toString(),
        networkId: chain.id.toString(),
        name: chain.name,
        logoUrl: chain.logoUrl,
        chainType: chain.chainType,
      })) || [],
    [chainsData]
  );

  const tokenItems: TokenItemData[] = useMemo(
    () =>
      (tokens?.items as Array<any>)?.map((token) => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        logoUrl: token.logoUrl,
        address: token.contractAddress,
        isNative: token.isNative,
        chainId: token.chainId,
        decimals: token.decimals,
      })) || [],
    [tokens]
  );

  const filteredTokens = useMemo(() => {
    if (!sourceChainId) return [];
    return tokenItems.filter((token) => String(token.chainId) === String(sourceChainId));
  }, [tokenItems, sourceChainId]);

  const selectedToken = useMemo(() => {
    if (!sourceTokenAddress) return null;
    return (
      tokenItems.find(
        (token) =>
          token.address === sourceTokenAddress ||
          (token.isNative && sourceTokenAddress === '0x0000000000000000000000000000000000000000')
      ) || null
    );
  }, [tokenItems, sourceTokenAddress]);

  const selectedTokenId = selectedToken?.id;
  const selectedTokenDecimals = selectedToken?.decimals ?? 18;
  const selectedTokenSymbol = selectedToken?.symbol ?? '';
  const settlementDestChainNumericId = useMemo(() => {
    const target = (settlementProfile?.dest_chain || '').trim().toLowerCase();
    if (!target) return '';
    const matched = chainsData?.items?.find((chain) => {
      const byID = String(chain.id).trim().toLowerCase();
      const byCAIP2 = String(chain.caip2 || '').trim().toLowerCase();
      return target === byID || target === byCAIP2;
    });
    return matched ? String(matched.id) : '';
  }, [chainsData?.items, settlementProfile?.dest_chain]);

  const settlementInvoiceToken = useMemo(() => {
    const settlementTokenAddress = (settlementProfile?.dest_token || '').trim().toLowerCase();
    if (!settlementTokenAddress) return null;
    return (
      tokenItems.find((token) => {
        const byAddress = String(token.address || '').trim().toLowerCase() === settlementTokenAddress;
        const byChain = !settlementDestChainNumericId || String(token.chainId) === String(settlementDestChainNumericId);
        return byAddress && byChain;
      }) || null
    );
  }, [settlementDestChainNumericId, settlementProfile?.dest_token, tokenItems]);

  const invoiceCurrencyDecimals = settlementInvoiceToken?.decimals ?? 6;
  const invoiceCurrencySymbol = (settlementProfile?.invoice_currency || settlementInvoiceToken?.symbol || '').trim();
  const requestedAmountDecimals = pricingType === 'invoice_currency' ? invoiceCurrencyDecimals : selectedTokenDecimals;
  const requestedAmountUnit = pricingType === 'invoice_currency' ? invoiceCurrencySymbol : selectedTokenSymbol;
  const requestedAmountModeText =
    pricingType === 'invoice_currency'
      ? t('payments.requested_amount_mode_invoice_currency', 'Invoice Currency Amount')
      : t('payments.requested_amount_mode_selected_token', 'Selected Token Amount');
  const amountInputDisabled = pricingType === 'invoice_currency' ? false : !sourceTokenAddress;
  const amountPlaceholder = amountInputDisabled ? t('payments.select_token_first') : '0';

  const pricingOptions: PricingTypeOption[] = [
    {
      id: 'invoice_currency',
      title: t('payments.pricing_invoice_currency_title', 'Invoice Currency'),
      description: t('payments.pricing_invoice_currency_desc', 'Requested amount follows merchant invoice currency.'),
    },
    {
      id: 'payment_token_fixed',
      title: t('payments.pricing_payment_token_fixed_title', 'Payment Token Fixed'),
      description: t('payments.pricing_payment_token_fixed_desc', 'Requested amount is fixed in customer selected token.'),
    },
    {
      id: 'payment_token_dynamic',
      title: t('payments.pricing_payment_token_dynamic_title', 'Payment Token Dynamic'),
      description: t('payments.pricing_payment_token_dynamic_desc', 'Requested amount uses dynamic selected token amount.'),
    },
  ];

  const [displayAmount, setDisplayAmount] = useState('');
  useEffect(() => {
    if (pricingType === 'invoice_currency') {
      return;
    }
    setDisplayAmount('');
  }, [pricingType, sourceTokenAddress]);

  useEffect(() => {
    setDisplayAmount('');
    setValue('amount', '', { shouldValidate: true });
    setValue('requested_amount', '', { shouldValidate: true });
    form.clearErrors('amount');
    form.clearErrors('requested_amount');
  }, [form, pricingType, setValue]);

  const handlePricingTypeSelect = useCallback(
    (nextPricingType: CreatePaymentPricingType) => {
      setValue('pricing_type', nextPricingType, { shouldValidate: true });
      form.clearErrors('pricing_type');
    },
    [form, setValue]
  );

  const handleAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const raw = stripMoneyFormat(event.target.value);
      const sanitized = sanitizeNumberWithDecimals(raw, requestedAmountDecimals);
      setValue('amount', sanitized, { shouldValidate: true });
      setValue('requested_amount', sanitized, { shouldValidate: true });
      setDisplayAmount(formatMoneyDisplay(sanitized));
    },
    [requestedAmountDecimals, setValue]
  );

  const dataLoadErrorMessage = useMemo(() => {
    if (chainsError) return chainsError;
    if (tokensQueryError instanceof Error) return tokensQueryError.message;
    return null;
  }, [chainsError, tokensQueryError]);

  const handleRetryDataLoad = useCallback(() => {
    void refetchChains();
    void refetchTokens();
  }, [refetchChains, refetchTokens]);

  return (
    <div className="space-y-8 animate-fade-in">
      <CreatePaymentHeader />

      {dataLoadErrorMessage && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
          <p className="text-sm text-amber-100">
            {t('payments.init_data_load_failed', 'Some initial data failed to load. Please retry.')}
          </p>
          <p className="text-xs text-amber-200/80 break-all">{dataLoadErrorMessage}</p>
          <Button type="button" size="sm" variant="outline" onClick={handleRetryDataLoad} loading={isTokensFetching}>
            {t('common.retry', 'Retry')}
          </Button>
        </div>
      )}

      <CreatePaymentFormCard
        form={form}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        settlementProfile={settlementProfile}
        settlementConfigured={settlementConfigured}
        pricingType={pricingType}
        pricingOptions={pricingOptions}
        onPricingTypeSelect={handlePricingTypeSelect}
        chainItems={chainItems}
        sourceChainId={sourceChainId}
        onSourceChainSelect={handleSourceChainSelect}
        filteredTokens={filteredTokens}
        selectedTokenId={selectedTokenId}
        onTokenSelect={handleTokenSelect}
        displayAmount={displayAmount}
        requestedAmountUnit={requestedAmountUnit}
        requestedAmountModeText={requestedAmountModeText}
        amountInputDisabled={amountInputDisabled}
        amountPlaceholder={amountPlaceholder}
        onAmountChange={handleAmountChange}
        expiryMode={expiryMode}
        expiresInCustom={expiresInCustom}
        onExpiryModeSelect={handleExpiryModeSelect}
        onExpiresInCustomChange={handleExpiresInCustomChange}
      />

      {!createdBill && loading && <BillInvoiceSkeleton />}
      {!createdBill && !loading && !error && <BillInvoiceEmptyState />}
      {createdBill && <BillInvoiceResultCard bill={createdBill} />}
    </div>
  );
}
