'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from './useApp';
import { ChainTokenSelector } from '@/presentation/components/organisms/ChainTokenSelector';
import { Button, Input, Label, Select } from '@/presentation/components/atoms';
import { AmountTokenInput, BaseModal, WalletConnectButton } from '@/presentation/components/molecules';
import { AlertTriangle, ArrowDownUp, CheckCircle2, Send, Wallet } from 'lucide-react';
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
    handlePay,
    handleReversePair
  } = useApp();

  const selectedSourceChain = chains.find((chain) => chain.id === sourceChainId);
  const [tempTxList, setTempTxList] = useState<Array<{ hash: string; chainName?: string; createdAt: string }>>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const lastCapturedTxRef = useRef<string | null>(null);

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

        <div className="space-y-2">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(true)}
            >
              Advance Settings
            </Button>
          </div>

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

        <BaseModal
          isOpen={showAdvancedSettings}
          onClose={() => setShowAdvancedSettings(false)}
          title="Advanced Settings"
          description="Optional override for route and mode tuning."
          className="max-w-xl"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-foreground/80">Mode</Label>
              <Select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as 'regular' | 'privacy')}
              >
                <option value="regular">Regular</option>
                <option value="privacy">Privacy</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground/80">Bridge Option</Label>
              <Select
                value={bridgeOptionSelection}
                onChange={(e) => setBridgeOptionSelection(e.target.value as 'default' | '0' | '1' | '2')}
              >
                <option value="default">Default (null → SC default)</option>
                <option value="0">Hyperbridge</option>
                <option value="1">CCIP</option>
                <option value="2">LayerZero</option>
              </Select>
            </div>

            {paymentMode === 'privacy' && (
              <p className="text-[11px] text-muted">
                Privacy intent and stealth receiver are generated automatically by backend.
              </p>
            )}
          </div>
        </BaseModal>

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
