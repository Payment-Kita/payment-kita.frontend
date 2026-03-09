'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from './useApp';
import { ChainTokenSelector } from '@/presentation/components/organisms/ChainTokenSelector';
import { Button, Input, Label } from '@/presentation/components/atoms';
import { AmountTokenInput, WalletConnectButton } from '@/presentation/components/molecules';
import { AlertTriangle, ArrowDownUp, CheckCircle2, HandCoins, Loader2, RotateCcw, Send, Undo2, Wallet } from 'lucide-react';
import { useTranslation } from '@/presentation/hooks';
import { cn } from '@/core/utils/cn';

export default function AppView() {
  const { t } = useTranslation();
  const {
    isConnected, chains,
    sourceChainId,
    destChainId,
    sourceTokenAddress,
    receiver, setReceiver,
    paymentMode,
    setPaymentMode,
    bridgeOptionSelection,
    setBridgeOptionSelection,
    bridgeTokenSource,
    setBridgeTokenSource,
    minBridgeAmountOut,
    setMinBridgeAmountOut,
    minDestAmountOut,
    setMinDestAmountOut,
    selectedSourceChainTokenId,
    selectedDestChainTokenId,
    chainTokenItems,
    handleSourceChainTokenSelect,
    handleDestChainTokenSelect,
    amountDisplay,
    handleAmountChange,
    handleMaxClick,
    selectedTokenSymbol,
    formattedBalance,
    canUseMax,
    addressError,
    receiverPlaceholder,
    isOwnAddress, setIsOwnAddress,
    isLoading, isSuccess, error, routeErrorDiagnostics, txHash,
    paymentCostPreview,
    activePaymentId,
    privacyStatus,
    privacyStatusLoading,
    privacyStatusError,
    privacyActionLoading,
    privacyActionError,
    handlePrivacyAction,
    handlePay,
    handleReversePair
  } = useApp();

  const selectedSourceChain = chains.find((chain) => chain.id === sourceChainId);
  const normalizedBridgeQuoteReason = useMemo(() => {
    const reason = String(paymentCostPreview?.bridgeQuoteReason || '').trim().toLowerCase();
    if (!reason) return '';
    if (
      reason.includes('quote_failed_schema_mismatch') ||
      reason.includes('selector was not recognized') ||
      reason.includes("there's no fallback function") ||
      reason.includes('no method with id')
    ) {
      return t('app_view.bridge_quote_reason_schema_mismatch');
    }
    if (reason.includes('route not configured')) return t('app_view.bridge_quote_reason_route_not_configured');
    if (reason.includes('insufficient native fee')) return t('app_view.bridge_quote_reason_insufficient_native_fee');
    return paymentCostPreview?.bridgeQuoteReason || '';
  }, [paymentCostPreview?.bridgeQuoteReason, t]);
  const [tempTxList, setTempTxList] = useState<Array<{ hash: string; chainName?: string; createdAt: string }>>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const lastCapturedTxRef = useRef<string | null>(null);
  const privacyStage = String(privacyStatus?.stage || '').toLowerCase();
  const privacyStepIndex = useMemo(() => {
    if (privacyStage === 'privacy_forwarded_final' || privacyStage === 'privacy_resolved') return 2;
    if (privacyStage === 'privacy_settled_to_stealth' || privacyStage === 'privacy_forward_failed_retrying') return 1;
    if (privacyStage === 'privacy_claimable' || privacyStage === 'privacy_refundable') return 1;
    if (privacyStage === 'privacy_pending_on_source') return 0;
    return -1;
  }, [privacyStage]);
  const privacyStageLabel = useMemo(() => {
    switch (privacyStage) {
      case 'privacy_pending_on_source':
        return 'Pending on source';
      case 'privacy_settled_to_stealth':
        return 'Settled to stealth';
      case 'privacy_forwarded_final':
        return 'Forwarded to final receiver';
      case 'privacy_forward_failed_retrying':
        return 'Forward failed (retrying)';
      case 'privacy_claimable':
        return 'Claim available';
      case 'privacy_refundable':
        return 'Refund available';
      case 'privacy_resolved':
        return 'Resolved';
      case 'not_privacy':
        return 'Not privacy route';
      default:
        return 'Waiting privacy status';
    }
  }, [privacyStage]);
  const privacyStageClass = useMemo(() => {
    if (privacyStage === 'privacy_forwarded_final' || privacyStage === 'privacy_resolved') return 'bg-accent-green/10 text-accent-green border-accent-green/20';
    if (privacyStage === 'privacy_forward_failed_retrying') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (privacyStage === 'privacy_claimable') return 'bg-blue-500/10 text-blue-300 border-blue-400/20';
    if (privacyStage === 'privacy_refundable') return 'bg-amber-500/10 text-amber-300 border-amber-400/20';
    if (privacyStage === 'privacy_settled_to_stealth') return 'bg-blue-500/10 text-blue-300 border-blue-400/20';
    if (privacyStage === 'privacy_pending_on_source') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-surface/60 text-muted border-white/10';
  }, [privacyStage]);
  const privacyActions = useMemo(() => {
    const actions: Array<{ key: 'retry' | 'claim' | 'refund'; label: string; icon: React.ReactNode }> = [];
    if (['privacy_forward_failed_retrying', 'privacy_claimable', 'privacy_refundable'].includes(privacyStage)) {
      actions.push({
        key: 'retry',
        label: 'Retry',
        icon: <RotateCcw className="h-3.5 w-3.5" />,
      });
    }
    if (['privacy_settled_to_stealth', 'privacy_claimable', 'privacy_forward_failed_retrying'].includes(privacyStage)) {
      actions.push({
        key: 'claim',
        label: 'Claim',
        icon: <HandCoins className="h-3.5 w-3.5" />,
      });
    }
    if (['privacy_refundable', 'privacy_forward_failed_retrying'].includes(privacyStage)) {
      actions.push({
        key: 'refund',
        label: 'Refund',
        icon: <Undo2 className="h-3.5 w-3.5" />,
      });
    }
    return actions;
  }, [privacyStage]);

  const getExplorerUrl = (hash: string) => {
    const explorer = selectedSourceChain?.explorerUrl;
    if (!explorer) return `https://etherscan.io/tx/${hash}`;
    return `${explorer}/tx/${hash}`;
  };

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    if (lastCapturedTxRef.current === txHash) return;

    lastCapturedTxRef.current = txHash;
    setTempTxList((prev) => {
      if (prev.some((item) => item.hash === txHash)) return prev;
      return [
        {
          hash: txHash,
          chainName: selectedSourceChain?.name,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 10);
    });
  }, [isSuccess, txHash, selectedSourceChain?.name]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in py-8 rounded-4xl">
      {isSuccess && (
        <div className="card-glass p-8 shadow-glass text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="heading-2 text-foreground">{t('app_view.payment_sent')}</h1>
          <p className="text-sm text-muted">{t('app_view.transaction_hash')}</p>
          <p className="text-sm text-foreground break-all">{txHash}</p>
          {txHash && (
            <a
              href={getExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm text-accent-purple hover:text-accent-purple/80 transition-colors"
            >
              {t('app_view.view_explorer')}
            </a>
          )}
        </div>
      )}

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-2">
          <Send className="w-3 h-3 text-accent-purple" />
          <span className="text-xs text-accent-purple font-medium">{t('app_view.badge')}</span>
        </div>
        <h5 className="heading-2 text-foreground">{t('app_view.title')}</h5>
      </div>

      <div className="card-glass p-8 shadow-glass space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end relative">
          <div className="flex-1 w-full space-y-1.5 transition-all duration-300">
            <Label className="text-sm font-medium text-foreground/80 ml-1">{t('app_view.source_chain')}</Label>
            <ChainTokenSelector
              items={chainTokenItems}
              selectedId={selectedSourceChainTokenId}
              onSelect={handleSourceChainTokenSelect}
              isSwitchingChain={true}
              size="default"
              placeholder={t('app_view.select_source_chain')}
              searchPlaceholder={t('common.search_tokens')}
              disabled={!chains.length}
            />
          </div>

          <div className="flex items-center justify-center -my-2 sm:my-0 sm:pb-1 relative z-10 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-background/60 border border-border/50 shadow-glass backdrop-blur-md hover:bg-accent-purple/20 hover:border-accent-purple/50 transition-all active:scale-95 group"
              onClick={handleReversePair}
              disabled={!sourceChainId && !destChainId}
            >
              <ArrowDownUp className="h-4 w-4 text-muted group-hover:text-accent-purple transition-all duration-500 rotate-0 md:rotate-90" />
            </Button>
          </div>

          <div className="flex-1 w-full space-y-1.5 transition-all duration-300">
            <Label className="text-sm font-medium text-foreground/80 ml-1">{t('app_view.destination_chain')}</Label>
            <ChainTokenSelector
              items={chainTokenItems}
              selectedId={selectedDestChainTokenId}
              onSelect={handleDestChainTokenSelect}
              size="default"
              placeholder={t('app_view.select_destination_chain')}
              searchPlaceholder={t('common.search_tokens')}
              disabled={!chains.length}
            />
          </div>
        </div>

        <AmountTokenInput
          label={t('app_view.amount')}
          value={amountDisplay}
          onChange={handleAmountChange}
          placeholder={sourceTokenAddress ? '0' : t('app_view.select_source_first')}
          disabled={!sourceTokenAddress}
          tokenSymbol={selectedTokenSymbol}
          maxAmount={formattedBalance}
          canUseMax={canUseMax}
          onMaxClick={handleMaxClick}
        />

        {paymentCostPreview && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-foreground/70">
              {t('app_view.fee_breakdown_title')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p className="text-muted">
                {t('app_view.source_amount')}: <span className="text-foreground">{paymentCostPreview.sourceAmountDisplay}</span>
              </p>
              <p className="text-muted">
                {t('app_view.platform_fee')}: <span className="text-foreground">{paymentCostPreview.platformFeeDisplay}</span>
              </p>
              <p className="text-muted">
                {t('app_view.total_source_required')}: <span className="text-foreground">{paymentCostPreview.totalSourceRequiredDisplay}</span>
              </p>
              <p className="text-muted">
                {t('app_view.fee_source')}:{' '}
                <span className="text-foreground">
                  {paymentCostPreview.feeSource === 'onchain'
                    ? t('app_view.fee_source_onchain')
                    : t('app_view.fee_source_legacy')}
                </span>
              </p>
              <p className="text-muted break-all">
                {t('app_view.bridge_fee_native')}: <span className="text-foreground">{paymentCostPreview.bridgeFeeNativeRaw} wei</span>
              </p>
              {paymentCostPreview.bridgeQuoteOk !== null && (
                <p className="text-muted break-all">
                  {t('app_view.bridge_quote_status')}:{' '}
                  <span className={paymentCostPreview.bridgeQuoteOk ? 'text-emerald-300' : 'text-amber-300'}>
                    {paymentCostPreview.bridgeQuoteOk
                      ? t('app_view.bridge_quote_ok')
                      : t('app_view.bridge_quote_failed')}
                  </span>
                </p>
              )}
            </div>
            {!!paymentCostPreview.bridgeQuoteReason && (
              <p className="text-xs text-muted break-all">
                {t('app_view.bridge_quote_reason')}: {normalizedBridgeQuoteReason}
              </p>
            )}
            <div className="pt-2 border-t border-white/10 space-y-1">
              <p className="text-xs text-amber-200/90">{t('app_view.fee_behavior_hint')}</p>
              <p className="text-xs text-amber-200/90">{t('app_view.native_excess_refund_hint')}</p>
            </div>
          </div>
        )}
        {(paymentMode === 'privacy' || !!activePaymentId) && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-foreground/70">Privacy Route Status</p>
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${privacyStageClass}`}>
                {privacyStatusLoading ? 'Checking...' : privacyStageLabel}
              </span>
            </div>
            <p className="text-xs text-muted">
              Swap route check only validates swap availability. Privacy execution status is tracked separately below.
            </p>
            {activePaymentId && (
              <p className="text-xs text-muted break-all">
                paymentId: <span className="text-foreground">{activePaymentId}</span>
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p className="text-muted">
                Swap Route:{' '}
                <span className={paymentCostPreview?.bridgeQuoteOk === true ? 'text-emerald-300' : paymentCostPreview?.bridgeQuoteOk === false ? 'text-amber-300' : 'text-foreground'}>
                  {paymentCostPreview?.bridgeQuoteOk === true ? 'Ready' : paymentCostPreview?.bridgeQuoteOk === false ? 'Blocked' : 'Unknown'}
                </span>
              </p>
              <p className="text-muted">
                Privacy Candidate:{' '}
                <span className={privacyStatus?.isPrivacyCandidate ? 'text-emerald-300' : 'text-foreground'}>
                  {privacyStatus?.isPrivacyCandidate ? 'Yes' : 'Not confirmed yet'}
                </span>
              </p>
            </div>
            <div className="space-y-2">
              {[
                { key: 'privacy_pending_on_source', label: '1. Pending on source gateway' },
                { key: 'privacy_settled_to_stealth', label: '2. Settled to stealth receiver' },
                { key: 'privacy_forwarded_final', label: '3. Forwarded to final receiver' },
              ].map((step, index) => {
                const isDone = privacyStepIndex >= index;
                const isCurrent = privacyStage === step.key;
                return (
                  <div
                    key={step.key}
                    className={`text-xs rounded-lg border px-3 py-2 ${
                      isDone
                        ? 'border-accent-green/20 bg-accent-green/10 text-accent-green'
                        : 'border-white/10 bg-black/20 text-muted'
                    }`}
                  >
                    <span className={isCurrent ? 'font-semibold' : ''}>{step.label}</span>
                  </div>
                );
              })}
            </div>
            {privacyActions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                {privacyActions.map((action) => (
                  <Button
                    key={action.key}
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={privacyActionLoading}
                    onClick={() => void handlePrivacyAction(action.key)}
                  >
                    {privacyActionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
            {privacyStatus?.reason && (
              <p className="text-xs text-amber-200/90 break-all">
                reason: {privacyStatus.reason}
              </p>
            )}
            {privacyStatus?.signals && privacyStatus.signals.length > 0 && (
              <p className="text-xs text-muted break-all">
                signals: {privacyStatus.signals.join(', ')}
              </p>
            )}
            {privacyStatusError && (
              <p className="text-xs text-red-300 break-all">
                status error: {privacyStatusError}
              </p>
            )}
            {privacyActionError && (
              <p className="text-xs text-red-300 break-all">
                action error: {privacyActionError}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-foreground/70">Advanced Settings</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedSettings((prev) => !prev)}
              >
                {showAdvancedSettings ? 'Hide' : 'Show'}
              </Button>
            </div>
            <p className="text-[11px] text-muted">
              Optional override for route and mode tuning. Normal flow does not require this.
            </p>
          </div>
          {showAdvancedSettings && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <p className="text-xs uppercase tracking-wide text-foreground/70">Manual Configuration</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-foreground/80">Mode</Label>
                <select
                  className="w-full h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as 'regular' | 'privacy')}
                >
                  <option value="regular">Regular</option>
                  <option value="privacy">Privacy</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-foreground/80">Bridge Option</Label>
                <select
                  className="w-full h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground"
                  value={bridgeOptionSelection}
                  onChange={(e) => setBridgeOptionSelection(e.target.value as 'default' | '0' | '1' | '2')}
                >
                  <option value="default">Default (null → SC default)</option>
                  <option value="0">Hyperbridge</option>
                  <option value="1">CCIP</option>
                  <option value="2">LayerZero</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-foreground/80">Bridge Token Source (optional)</Label>
                <Input
                  placeholder="0x..."
                  value={bridgeTokenSource}
                  onChange={(e) => setBridgeTokenSource(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-foreground/80">Min Bridge Amount Out (optional)</Label>
                <Input
                  placeholder="e.g. 1.25"
                  value={minBridgeAmountOut}
                  onChange={(e) => setMinBridgeAmountOut(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs text-foreground/80">Min Dest Amount Out (optional)</Label>
                <Input
                  placeholder="e.g. 1.25"
                  value={minDestAmountOut}
                  onChange={(e) => setMinDestAmountOut(e.target.value)}
                />
              </div>
            </div>
            <div className="pt-1 space-y-1">
              <p className="text-[11px] text-muted">
                Min-out values are entered as normal token amounts (for example `1.25`), not raw wei units.
              </p>
              <p className="text-[11px] text-muted">
                The app converts them to smallest-unit values automatically using token decimals before sending the transaction request.
              </p>
            </div>
            {paymentMode === 'privacy' && (
              <p className="text-[11px] text-muted">
                Privacy intent and stealth receiver are generated automatically by backend.
              </p>
            )}
          </div>
          )}

          <div className="flex items-center justify-between px-1">
            <Label className="text-sm font-medium text-foreground/80">{t('app_view.receiver_address')}</Label>
            <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsOwnAddress(true)}
                className={cn(
                  "px-3 py-1 text-[10px] uppercase tracking-wider rounded-md transition-all font-bold",
                  isOwnAddress
                    ? "bg-accent-purple text-white shadow-lg shadow-accent-purple/20"
                    : "text-muted hover:text-foreground"
                )}
              >
                {t('app_view.own_address')}
              </button>
              <button
                type="button"
                onClick={() => setIsOwnAddress(false)}
                className={cn(
                  "px-3 py-1 text-[10px] uppercase tracking-wider rounded-md transition-all font-bold",
                  !isOwnAddress
                    ? "bg-accent-purple text-white shadow-lg shadow-accent-purple/20"
                    : "text-muted hover:text-foreground"
                )}
              >
                {t('app_view.other_address')}
              </button>
            </div>
          </div>
          <Input
            placeholder={destChainId ? receiverPlaceholder : t('payments.select_destination_chain_first')}
            disabled={!destChainId || isOwnAddress}
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            error={addressError || undefined}
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in max-w-full">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>

            {/* IMPORTANT: min-w-0 */}
            <div className="min-w-0 flex-1">
              <p className="text-red-400 font-medium">
                {t('app_view.payment_error_title')}
              </p>

              <p className="text-red-400/80 text-sm mt-1 wrap-break-word overflow-hidden">
                {error}
              </p>
            </div>
          </div>
        )}
        {routeErrorDiagnostics && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-red-300">Route Diagnostics</p>
            <p className="text-xs text-red-200/90 break-all">
              paymentId: {routeErrorDiagnostics.paymentIdHex || '-'}
            </p>
            <p className="text-xs text-red-200/90 break-all">
              selector: {routeErrorDiagnostics.decoded?.selector || '-'}
            </p>
            <p className="text-xs text-red-200/90 break-all">
              error: {routeErrorDiagnostics.decoded?.name || routeErrorDiagnostics.decoded?.message || '-'}
            </p>
            {routeErrorDiagnostics.decoded?.message && (
              <p className="text-xs text-red-200/90 break-all">
                message: {routeErrorDiagnostics.decoded.message}
              </p>
            )}
            {routeErrorDiagnostics.decoded?.details && (
              <p className="text-xs text-red-200/90 break-all">
                details: {JSON.stringify(routeErrorDiagnostics.decoded.details)}
              </p>
            )}
          </div>
        )}

        {!isConnected && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-fade-in">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-200 font-medium">{t('app_view.connect_wallet_title')}</p>
              <p className="text-amber-200/60 text-sm mt-1">{t('app_view.connect_wallet_subtitle')}</p>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-white/10">
          <WalletConnectButton size="default" />
          {isConnected && (
            <Button type="button" variant="primary" glow loading={isLoading} onClick={handlePay}>
              <Send className="w-4 h-4" />
              {t('app_view.pay_now')}
            </Button>
          )}
        </div>
      </div >

      {tempTxList.length > 0 && (
        <div className="card-glass p-6 shadow-glass space-y-3">
          <h6 className="text-sm font-semibold text-foreground">{t('payments.history')}</h6>
          <div className="space-y-2">
            {tempTxList.map((item) => (
              <div key={item.hash} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted">{item.chainName || '-'}</p>
                  <p className="text-xs text-foreground break-all">{item.hash}</p>
                </div>
                <a
                  href={getExplorerUrl(item.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-purple hover:text-accent-purple/80 shrink-0"
                >
                  {t('app_view.view_explorer')}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div >
  );
}
