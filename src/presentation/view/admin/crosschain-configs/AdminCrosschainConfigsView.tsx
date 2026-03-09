'use client';

import { useMemo, useState } from 'react';
import { Download, RefreshCcw, Shuffle, WandSparkles, Wrench } from 'lucide-react';
import { Button, Card, Input } from '@/presentation/components/atoms';
import { ChainSelector } from '@/presentation/components/organisms';
import { useTranslation } from '@/presentation/hooks';
import { useAdminCrosschainConfigs } from './useAdminCrosschainConfigs';
import { isQuoteSchemaMismatchMessage, normalizeCrosschainErrorMessage, recommendActionByErrorCode } from './crosschainErrorHints';

const statusClass = (status: string) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'READY') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
  if (normalized === 'ERROR') return 'bg-red-500/10 text-red-300 border-red-500/30';
  return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
};

const boolText = (value: boolean, yesText: string, noText: string) => (value ? yesText : noText);
const addressToPaddedBytesHex = (address: string): string => {
  const value = String(address || '').trim().toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(value)) return address;
  return `0x${value.slice(2).padStart(64, '0')}`;
};
const actionLabel = (action: 'SETUP' | 'AUTO_FIX_ERROR_ONLY' | 'VERIFY', t: (key: string) => string) => {
  if (action === 'SETUP') return t('admin.crosschain_configs_view.report_action_setup');
  if (action === 'AUTO_FIX_ERROR_ONLY') return t('admin.crosschain_configs_view.report_action_auto_fix_error');
  return t('admin.crosschain_configs_view.report_action_verify');
};
const executionClass = (status: 'PENDING' | 'SUCCESS' | 'FAILED') => {
  if (status === 'SUCCESS') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (status === 'FAILED') return 'border-red-500/30 bg-red-500/10 text-red-300';
  return 'border-white/10 bg-white/5 text-muted';
};
const preflightCheckClass = (ok: boolean) =>
  ok ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-300 border-red-500/30';
const preflightRecommendationKey = (checks: { adapterRegistered?: boolean; routeConfigured?: boolean; feeQuoteHealthy?: boolean }) => {
  if (!checks?.adapterRegistered) return 'admin.crosschain_configs_view.preflight_recommend_register_adapter';
  if (!checks?.routeConfigured) return 'admin.crosschain_configs_view.preflight_recommend_configure_route';
  if (!checks?.feeQuoteHealthy) return 'admin.crosschain_configs_view.preflight_recommend_verify_fee_quote';
  return 'admin.crosschain_configs_view.preflight_recommend_ready';
};
const preflightProgress = (checks: { adapterRegistered?: boolean; routeConfigured?: boolean; feeQuoteHealthy?: boolean }) => {
  const done =
    (checks?.adapterRegistered ? 1 : 0) +
    (checks?.routeConfigured ? 1 : 0) +
    (checks?.feeQuoteHealthy ? 1 : 0);
  const total = 3;
  const percent = Math.round((done / total) * 100);
  return { done, total, percent };
};
const preflightProgressBarClass = (percent: number) => {
  if (percent >= 100) return 'bg-emerald-500';
  if (percent >= 67) return 'bg-green-400';
  if (percent >= 34) return 'bg-amber-400';
  return 'bg-red-400';
};
const preflightProgressLevelKey = (percent: number) => {
  if (percent >= 100) return 'admin.crosschain_configs_view.preflight_level_complete';
  if (percent >= 67) return 'admin.crosschain_configs_view.preflight_level_high';
  if (percent >= 34) return 'admin.crosschain_configs_view.preflight_level_medium';
  return 'admin.crosschain_configs_view.preflight_level_low';
};
export const AdminCrosschainConfigsView = () => {
  const { t } = useTranslation();
  const { state, actions } = useAdminCrosschainConfigs();
  const isManualHyperbridge = String(state.manualBridgeType) === '0';
  const isManualCCIP = String(state.manualBridgeType) === '1';
  const isManualLayerZero = String(state.manualBridgeType) === '2';
  const manualBridgeOptions = useMemo(() => {
    const canonicalNameByType: Record<string, string> = {
      '0': 'Hyperbridge',
      '1': 'CCIP',
      '2': 'LayerZero',
    };
    const uniq = new Map<string, { bridgeType: string; name: string }>();
    for (const item of state.manualBridgeOptions || []) {
      const type = String((item as any)?.bridgeType ?? '').trim();
      if (type !== '0' && type !== '1' && type !== '2') continue;
      uniq.set(type, {
        bridgeType: type,
        name: canonicalNameByType[type] || String((item as any)?.name || `Bridge ${type}`),
      });
    }
    return Array.from(uniq.values()).sort((a, b) => Number(a.bridgeType) - Number(b.bridgeType));
  }, [state.manualBridgeOptions]);
  const [expandedBridgeKeys, setExpandedBridgeKeys] = useState<Set<string>>(new Set());
  const bridgeKeys: string[] = useMemo(
    () => (state.preflight?.bridges || []).map((bridge: any) => `${bridge.bridgeType}-${bridge.bridgeName}`),
    [state.preflight?.bridges]
  );
  const isSingleBridge = bridgeKeys.length <= 1;
  const allExpanded = !isSingleBridge && bridgeKeys.every((key: string) => expandedBridgeKeys.has(key));
  const toggleAllBridges = (expand: boolean) => {
    if (expand) {
      setExpandedBridgeKeys(new Set(bridgeKeys));
      return;
    }
    setExpandedBridgeKeys(new Set());
  };
  const toggleBridge = (key: string) => {
    setExpandedBridgeKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shuffle className="w-6 h-6 text-primary" />
          {t('admin.crosschain_configs_view.title')}
        </h1>
        <p className="text-sm text-muted">{t('admin.crosschain_configs_view.subtitle')}</p>
      </div>

      <Card className="p-5 bg-white/5 border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <ChainSelector
            label={t('admin.crosschain_configs_view.source_chain')}
            chains={state.sourceChains}
            selectedChainId={state.sourceChainId}
            onSelect={(chain) => actions.setSourceChainId(chain?.id || '')}
            placeholder={t('admin.crosschain_configs_view.all_source_chains')}
          />
          <ChainSelector
            label={t('admin.crosschain_configs_view.destination_chain')}
            chains={state.destinationChains}
            selectedChainId={state.destChainId}
            onSelect={(chain) => actions.setDestChainId(chain?.id || '')}
            placeholder={t('admin.crosschain_configs_view.all_destination_chains')}
          />
          <div className="flex items-end">
            <Button variant="ghost" className="w-full" onClick={() => actions.refresh()}>
              <RefreshCcw className="w-4 h-4" />
              {t('admin.crosschain_configs_view.refresh')}
            </Button>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80 ml-1">
              {t('admin.crosschain_configs_view.status')}
            </label>
            <select
              className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
              value={state.statusFilter}
              onChange={(e) => actions.setStatusFilter(e.target.value as 'ALL' | 'READY' | 'ERROR')}
            >
              <option value="ALL">{t('admin.crosschain_configs_view.filter_all')}</option>
              <option value="READY">{t('admin.crosschain_configs_view.filter_ready')}</option>
              <option value="ERROR">{t('admin.crosschain_configs_view.filter_error')}</option>
            </select>
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-white/10 flex flex-wrap items-center gap-2 justify-end">
          <Button
            size="sm"
            variant="primary"
            onClick={() => actions.setupSelectedSource()}
            disabled={state.isPending || state.isLoading}
          >
            <WandSparkles className="w-3.5 h-3.5" />
            {t('admin.crosschain_configs_view.setup_selected_source')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => actions.recheckVisible()} disabled={state.isPending || state.isLoading || state.routes.length === 0}>
            <RefreshCcw className="w-3.5 h-3.5" />
            {t('admin.crosschain_configs_view.recheck_visible')}
          </Button>
          <Button size="sm" variant="primary" onClick={() => actions.autoFixVisible()} disabled={state.isPending || state.isLoading || state.routes.length === 0}>
            <Wrench className="w-3.5 h-3.5" />
            {t('admin.crosschain_configs_view.auto_fix_visible')}
          </Button>
        </div>
      </Card>

      <Card className="p-5 bg-white/5 border-white/10 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{t('admin.route_policies_view.title')}</h3>
            <p className="text-sm text-muted">{t('admin.route_policies_view.subtitle')}</p>
          </div>
          <span
            className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium ${
              state.activeRoutePolicy
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
          >
            {state.activeRoutePolicy ? t('admin.route_policies_view.update_title') : t('admin.route_policies_view.create_title')}
          </span>
        </div>
        {!state.sourceChainId || !state.destChainId ? (
          <p className="text-sm text-muted">{t('admin.crosschain_configs_view.preflight_select_hint')}</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 ml-1">
                  {t('admin.route_policies_view.default_bridge_type')}
                </label>
                <select
                  className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
                  value={state.policyDefaultBridgeType}
                  onChange={(e) => actions.setPolicyDefaultBridgeType(e.target.value)}
                  disabled={state.isPending || state.isRoutePolicyLoading}
                >
                  {(manualBridgeOptions.length ? manualBridgeOptions : [{ bridgeType: '0', name: 'Hyperbridge' }]).map((item: any) => (
                    <option key={String(item.bridgeType)} value={String(item.bridgeType)}>
                      {String(item.bridgeType)} - {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80 ml-1">{t('admin.route_policies_view.fallback_mode')}</label>
                <select
                  className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
                  value={state.policyFallbackMode}
                  onChange={(e) => actions.setPolicyFallbackMode(e.target.value as 'strict' | 'auto_fallback')}
                  disabled={state.isPending || state.isRoutePolicyLoading}
                >
                  <option value="strict">{t('admin.route_policies_view.strict')}</option>
                  <option value="auto_fallback">{t('admin.route_policies_view.auto_fallback')}</option>
                </select>
              </div>
              <Input
                label={t('admin.route_policies_view.fallback_order_optional')}
                placeholder="0,1,2"
                value={state.policyFallbackOrderInput}
                onChange={(e) => actions.setPolicyFallbackOrderInput(e.target.value)}
                disabled={state.isPending || state.isRoutePolicyLoading}
              />
              <Input
                label={t('admin.route_policies_view.per_byte_rate')}
                placeholder="300"
                value={state.policyPerByteRate}
                onChange={(e) => actions.setPolicyPerByteRate(e.target.value)}
                disabled={state.isPending || state.isRoutePolicyLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                label={t('admin.route_policies_view.overhead_bytes')}
                placeholder="256"
                value={state.policyOverheadBytes}
                onChange={(e) => actions.setPolicyOverheadBytes(e.target.value)}
                disabled={state.isPending || state.isRoutePolicyLoading}
              />
              <Input
                label={t('admin.route_policies_view.min_fee')}
                placeholder="0"
                value={state.policyMinFee}
                onChange={(e) => actions.setPolicyMinFee(e.target.value)}
                disabled={state.isPending || state.isRoutePolicyLoading}
              />
              <Input
                label={t('admin.route_policies_view.max_fee')}
                placeholder="0"
                value={state.policyMaxFee}
                onChange={(e) => actions.setPolicyMaxFee(e.target.value)}
                disabled={state.isPending || state.isRoutePolicyLoading}
              />
              <div className="flex items-end">
                <Button
                  className="w-full"
                  size="sm"
                  variant="primary"
                  onClick={() => actions.saveRoutePolicy()}
                  disabled={state.isPending || state.isRoutePolicyLoading}
                >
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </div>
        )}
        {state.activeRoutePolicy?.id && (
          <p className="text-xs text-muted break-all">
            id: {String(state.activeRoutePolicy.id)}
          </p>
        )}
      </Card>

      <Card className="p-5 bg-white/5 border-white/10 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">{t('admin.crosschain_configs_view.preflight_title')}</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => actions.refresh()}
            disabled={state.isPending || !state.sourceChainId || !state.destChainId}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            {t('admin.crosschain_configs_view.refresh')}
          </Button>
        </div>
        {!state.sourceChainId || !state.destChainId ? (
          <p className="text-sm text-muted">{t('admin.crosschain_configs_view.preflight_select_hint')}</p>
        ) : state.isPreflightLoading ? (
          <p className="text-sm text-muted">{t('admin.crosschain_configs_view.preflight_loading')}</p>
        ) : !state.preflight ? (
          <p className="text-sm text-muted">{t('admin.crosschain_configs_view.preflight_empty')}</p>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
              {t('admin.crosschain_configs_view.preflight_quote_pipeline_hint')}
            </div>
            {!isSingleBridge && (
              <div className="lg:hidden flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleAllBridges(!allExpanded)}
                  disabled={state.isPending}
                >
                  {allExpanded ? t('common.collapse_all') : t('common.expand_all')}
                </Button>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span>{t('admin.crosschain_configs_view.preflight_legend')}:</span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                {t('admin.crosschain_configs_view.preflight_level_low')}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                {t('admin.crosschain_configs_view.preflight_level_medium')}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                {t('admin.crosschain_configs_view.preflight_level_high')}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                {t('admin.crosschain_configs_view.preflight_level_complete')}
              </span>
            </div>
            <div className="text-sm text-muted">
              {state.preflight.sourceChainId} → {state.preflight.destChainId} • {t('admin.crosschain_configs_view.default_bridge_type')} {state.preflight.defaultBridgeType}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {(state.preflight.bridges || []).map((bridge: any) => {
                const bridgeKey = `${bridge.bridgeType}-${bridge.bridgeName}`;
                const mobileExpanded = isSingleBridge || expandedBridgeKeys.has(bridgeKey);
                const schemaMismatch =
                  Boolean(bridge?.quoteSchemaMismatch) ||
                  isQuoteSchemaMismatchMessage(String(bridge?.quoteFailureReason || bridge?.errorMessage || ''));
                const quotePathUsed = String(bridge?.quotePathUsed || '').trim();
                const quoteFailureReason = String(bridge?.quoteFailureReason || '').trim();
                return (
                  <div key={bridgeKey} className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 space-y-2">
                    {(() => {
                      const progress = preflightProgress({
                        adapterRegistered: Boolean(bridge?.checks?.adapterRegistered),
                        routeConfigured: Boolean(bridge?.checks?.routeConfigured),
                        feeQuoteHealthy: Boolean(bridge?.checks?.feeQuoteHealthy),
                      });
                      return (
                        <>
                          <div className="flex items-center justify-between text-xs text-muted">
                            <span>{t('admin.crosschain_configs_view.preflight_progress_label')}</span>
                            <span>{progress.done}/{progress.total}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${preflightProgressBarClass(progress.percent)}`}
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted">
                            {t(preflightProgressLevelKey(progress.percent))}
                          </div>
                        </>
                      );
                    })()}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{bridge.bridgeName} ({bridge.bridgeType})</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium ${bridge.ready ? statusClass('READY') : statusClass('ERROR')}`}>
                          {bridge.ready ? t('admin.crosschain_configs_view.success_status') : t('admin.crosschain_configs_view.error_status')}
                        </span>
                        {!isSingleBridge && (
                          <button
                            type="button"
                            className="lg:hidden text-xs text-muted border border-white/10 rounded-md px-2 py-1"
                            onClick={() => toggleBridge(bridgeKey)}
                          >
                            {mobileExpanded ? t('common.hide') : t('common.show')}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={`${mobileExpanded ? 'block' : 'hidden'} lg:block space-y-2`}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                        <span className={`inline-flex px-2 py-1 rounded-lg border text-xs ${preflightCheckClass(Boolean(bridge?.checks?.adapterRegistered))}`}>
                          adapterRegistered: {boolText(Boolean(bridge?.checks?.adapterRegistered), t('admin.crosschain_configs_view.yes'), t('admin.crosschain_configs_view.no'))}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-lg border text-xs ${preflightCheckClass(Boolean(bridge?.checks?.routeConfigured))}`}>
                          routeConfigured: {boolText(Boolean(bridge?.checks?.routeConfigured), t('admin.crosschain_configs_view.yes'), t('admin.crosschain_configs_view.no'))}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-lg border text-xs ${preflightCheckClass(Boolean(bridge?.checks?.feeQuoteHealthy))}`}>
                          feeQuoteHealthy: {boolText(Boolean(bridge?.checks?.feeQuoteHealthy), t('admin.crosschain_configs_view.yes'), t('admin.crosschain_configs_view.no'))}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-lg border text-xs ${preflightCheckClass(!schemaMismatch)}`}>
                          {t('admin.crosschain_configs_view.preflight_quote_schema_mismatch')}:{' '}
                          {boolText(schemaMismatch, t('admin.crosschain_configs_view.yes'), t('admin.crosschain_configs_view.no'))}
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className={`inline-flex px-2 py-1 rounded-lg border text-xs ${bridge?.ready ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}>
                          {t(preflightRecommendationKey({
                            adapterRegistered: Boolean(bridge?.checks?.adapterRegistered),
                            routeConfigured: Boolean(bridge?.checks?.routeConfigured),
                            feeQuoteHealthy: Boolean(bridge?.checks?.feeQuoteHealthy),
                          }))}
                        </span>
                      </div>
                      {bridge.errorMessage && (
                        <p className="text-xs text-red-300/90">{normalizeCrosschainErrorMessage(bridge.errorMessage)}</p>
                      )}
                      {quotePathUsed && (
                        <p className="text-xs text-cyan-300/90">
                          quote path: <span className="font-mono">{quotePathUsed}</span>
                        </p>
                      )}
                      {quoteFailureReason && (
                        <p className="text-xs text-red-300/90">
                          quote reason: {normalizeCrosschainErrorMessage(quoteFailureReason)}
                        </p>
                      )}
                      {bridge.errorCode && recommendActionByErrorCode(String(bridge.errorCode)) && (
                        <p className="text-xs text-amber-300/90">
                          {t('admin.crosschain_configs_view.recommended_action_label')}: {recommendActionByErrorCode(String(bridge.errorCode))}
                        </p>
                      )}
                      <div className="pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            onClick={() =>
                              actions.applyPreflightSuggestion(Number(bridge.bridgeType || 0), {
                                adapterRegistered: Boolean(bridge?.checks?.adapterRegistered),
                                routeConfigured: Boolean(bridge?.checks?.routeConfigured),
                                feeQuoteHealthy: Boolean(bridge?.checks?.feeQuoteHealthy),
                              })
                            }
                            disabled={state.isPending}
                          >
                            {t('admin.crosschain_configs_view.preflight_apply_suggestion')}
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            className="w-full"
                            onClick={() =>
                              actions.runPreflightNextStep(Number(bridge.bridgeType || 0), {
                                adapterRegistered: Boolean(bridge?.checks?.adapterRegistered),
                                routeConfigured: Boolean(bridge?.checks?.routeConfigured),
                                feeQuoteHealthy: Boolean(bridge?.checks?.feeQuoteHealthy),
                              })
                            }
                            disabled={state.isPending}
                          >
                            {t('admin.crosschain_configs_view.preflight_run_next_step')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {state.sourceChainId && state.destChainId && (
        <Card className="p-5 bg-white/5 border-white/10 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-foreground">{t('admin.crosschain_configs_view.layerzero_e2e_title')}</h3>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium ${
                  state.layerZeroE2EStatus?.ready ? statusClass('READY') : statusClass('ERROR')
                }`}
              >
                {state.layerZeroE2EStatus?.ready ? t('admin.crosschain_configs_view.success_status') : t('admin.crosschain_configs_view.error_status')}
              </span>
              <Button
                size="sm"
                variant={state.layerZeroE2EStatus?.ready ? 'ghost' : 'primary'}
                onClick={() => actions.configureLayerZeroE2ESelected()}
                disabled={state.isPending || state.isLayerZeroE2EStatusLoading}
              >
                {state.layerZeroE2EStatus?.ready
                  ? t('admin.crosschain_configs_view.layerzero_e2e_reconfigure')
                  : t('admin.crosschain_configs_view.layerzero_e2e_fix_now')}
              </Button>
            </div>
          </div>
          {state.isLayerZeroE2EStatusLoading ? (
            <p className="text-sm text-muted">{t('admin.crosschain_configs_view.preflight_loading')}</p>
          ) : !state.layerZeroE2EStatus ? (
            <p className="text-sm text-muted">{t('admin.crosschain_configs_view.layerzero_e2e_empty')}</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {Object.entries(state.layerZeroE2EStatus?.checks || {}).map(([key, value]) => (
                  <span
                    key={key}
                    className={`inline-flex px-2 py-1 rounded-lg border text-xs ${preflightCheckClass(Boolean(value))}`}
                  >
                    {key}: {boolText(Boolean(value), t('admin.crosschain_configs_view.yes'), t('admin.crosschain_configs_view.no'))}
                  </span>
                ))}
              </div>
              {Array.isArray(state.layerZeroE2EStatus?.issues) && state.layerZeroE2EStatus.issues.length > 0 && (
                <div className="space-y-1">
                  {state.layerZeroE2EStatus.issues.map((issue: any, idx: number) => (
                    <p key={`lz-issue-${idx}`} className="text-xs text-red-300/90">
                      {typeof issue === 'string'
                        ? issue
                        : `${String(issue?.code || 'ISSUE')}: ${String(issue?.message || '')}`}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <Card className="p-5 bg-white/5 border-white/10 space-y-4">
        <h3 className="text-base font-semibold text-foreground">{t('admin.crosschain_configs_view.manual_title')}</h3>
        <p className="text-sm text-muted">{t('admin.crosschain_configs_view.manual_subtitle')}</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className={`rounded-xl border px-3 py-2 text-xs ${state.manualCurrentStep === 1 ? 'border-primary/40 bg-primary/10 text-primary' : state.manualStepCompleted.step1 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-muted'}`}>
            1. {t('admin.crosschain_configs_view.manual_step_1')}
          </div>
          <div className={`rounded-xl border px-3 py-2 text-xs ${state.manualCurrentStep === 2 ? 'border-primary/40 bg-primary/10 text-primary' : state.manualStepCompleted.step2 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-muted'}`}>
            2. {t('admin.crosschain_configs_view.manual_step_2')}
          </div>
          <div className={`rounded-xl border px-3 py-2 text-xs ${state.manualCurrentStep === 3 ? 'border-primary/40 bg-primary/10 text-primary' : state.manualStepCompleted.step3 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-muted'}`}>
            3. {t('admin.crosschain_configs_view.manual_step_3')}
          </div>
          <div className={`rounded-xl border px-3 py-2 text-xs ${state.manualCurrentStep === 4 ? 'border-primary/40 bg-primary/10 text-primary' : state.manualStepCompleted.step4 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-muted'}`}>
            4. {t('admin.crosschain_configs_view.manual_step_4')}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'step1', label: t('admin.crosschain_configs_view.manual_step_1') },
            { key: 'step2', label: t('admin.crosschain_configs_view.manual_step_2') },
            { key: 'step3', label: t('admin.crosschain_configs_view.manual_step_3') },
            { key: 'step4', label: t('admin.crosschain_configs_view.manual_step_4') },
          ].map((item) => {
            const exec = (state.manualExecution as any)[item.key] as { status: 'PENDING' | 'SUCCESS' | 'FAILED'; message?: string; txHashes: string[] };
            return (
              <div key={item.key} className={`rounded-xl border p-3 ${executionClass(exec.status)}`}>
                <p className="text-xs uppercase tracking-wide">{item.label}</p>
                <p className="text-xs mt-1">{t(`admin.crosschain_configs_view.execution_${exec.status.toLowerCase()}`)}</p>
                {exec.message && (
                  <p className="text-xs mt-1 wrap-break-word">{exec.message}</p>
                )}
                {Array.isArray(exec.txHashes) && exec.txHashes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">{t('admin.crosschain_configs_view.execution_tx_hashes')}</p>
                    {exec.txHashes.map((hash, idx) => (
                      <p key={`${item.key}-${idx}`} className="text-xs font-mono break-all opacity-90">{hash}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ChainSelector
            label={t('admin.crosschain_configs_view.source_chain')}
            chains={state.sourceChains}
            selectedChainId={state.manualSourceChainId}
            onSelect={(chain) => actions.handleManualSourceChainChange(chain?.id || '')}
            placeholder={t('admin.crosschain_configs_view.select_source_chain')}
          />
          <ChainSelector
            label={t('admin.crosschain_configs_view.destination_chain')}
            chains={state.destinationChains}
            selectedChainId={state.manualDestChainId}
            onSelect={(chain) => actions.handleManualDestChainChange(chain?.id || '')}
            placeholder={t('admin.crosschain_configs_view.select_destination_chain')}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80 ml-1">{t('admin.crosschain_configs_view.default_bridge_type')}</label>
            <select
              className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
              value={state.manualBridgeType}
              onChange={(e) => actions.handleManualBridgeTypeChange(e.target.value)}
            >
              {manualBridgeOptions.map((item: any) => (
                <option key={String(item.bridgeType)} value={String(item.bridgeType)}>
                  {String(item.bridgeType)} - {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="primary"
            onClick={() => actions.setDefaultBridgeQuick()}
            disabled={state.isPending || !state.manualSourceChainId || !state.manualDestChainId}
          >
            {t('admin.crosschain_configs_view.manual_set_default')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80 ml-1">{t('admin.crosschain_configs_view.manual_adapter_contract')}</label>
            <select
              className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
              value={state.manualAdapterAddress}
              onChange={(e) => actions.setManualAdapterAddress(e.target.value)}
              disabled={!state.manualSourceChainId || state.manualCurrentStep !== 1}
            >
              <option value="">{t('admin.crosschain_configs_view.select_adapter_contract')}</option>
              {(state.manualSourceAdapterContracts || []).map((contract: any) => (
                <option key={contract.id} value={contract.contractAddress}>
                  {contract.name} ({contract.contractAddress})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button size="sm" variant="secondary" onClick={() => actions.registerAdapterManual()} disabled={state.isPending || state.manualCurrentStep !== 1}>
                {t('admin.crosschain_configs_view.manual_register_adapter')}
              </Button>
              <Button size="sm" variant="primary" onClick={() => actions.setDefaultBridgeManual()} disabled={state.isPending || state.manualCurrentStep !== 2}>
                {t('admin.crosschain_configs_view.manual_set_default')}
              </Button>
            </div>
          </div>
        </div>

        {isManualHyperbridge && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label={t('admin.crosschain_configs_view.manual_state_machine_hex')}
              placeholder={t('admin.crosschain_configs_view.manual_state_machine_auto_placeholder')}
              value={state.manualStateMachineIdHex}
              onChange={(e) => actions.setManualStateMachineIdHex(e.target.value)}
              disabled={state.manualBridgeType !== '0' || state.manualCurrentStep !== 3}
              readOnly
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">{t('admin.crosschain_configs_view.manual_destination_hyper_contract')}</label>
              <select
                className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
                value={state.manualDestinationContractHex}
                onChange={(e) => actions.setManualDestinationContractHex(e.target.value)}
                disabled={!state.manualDestChainId || state.manualBridgeType !== '0' || state.manualCurrentStep !== 3}
              >
                <option value="">{t('admin.crosschain_configs_view.select_destination_hyper_contract')}</option>
                {(state.manualDestHyperContracts || []).map((contract: any) => (
                  <option key={contract.id} value={String(contract.contractAddress || '').toLowerCase()}>
                    {contract.name} ({contract.contractAddress})
                  </option>
                ))}
              </select>
              {state.manualDestinationContractHex && (
                <p className="text-xs text-muted mt-1 break-all">
                  {t('admin.crosschain_configs_view.manual_auto_hex')}: {state.manualDestinationContractHex}
                </p>
              )}
            </div>
          </div>
        )}
        {isManualHyperbridge && (
          <div className="flex justify-end">
            <Button size="sm" variant="secondary" onClick={() => actions.setHyperbridgeManual()} disabled={state.isPending || state.manualBridgeType !== '0' || state.manualCurrentStep !== 3}>
              {t('admin.crosschain_configs_view.manual_save_hyperbridge')}
            </Button>
          </div>
        )}

        {isManualCCIP && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Input
                label={t('admin.crosschain_configs_view.manual_ccip_chain_selector')}
                placeholder="CCIP selector uint64"
                value={state.manualCCIPChainSelector}
                onChange={(e) => actions.setManualCCIPChainSelector(e.target.value)}
                disabled={state.manualBridgeType !== '1' || state.manualCurrentStep !== 3}
              />
              <p className="text-xs text-muted mt-1">Gunakan CCIP chain selector, bukan EVM chainId.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">{t('admin.crosschain_configs_view.manual_destination_ccip_contract')}</label>
              <select
                className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
                value={state.manualCCIPDestinationAdapterHex}
                onChange={(e) => actions.setManualCCIPDestinationAdapterHex(e.target.value)}
                disabled={!state.manualDestChainId || state.manualBridgeType !== '1' || state.manualCurrentStep !== 3}
              >
                <option value="">{t('admin.crosschain_configs_view.select_destination_ccip_contract')}</option>
                {(state.manualDestCCIPContracts || []).map((contract: any) => (
                  <option key={contract.id} value={addressToPaddedBytesHex(contract.contractAddress)}>
                    {contract.name} ({contract.contractAddress})
                  </option>
                ))}
              </select>
              {state.manualCCIPDestinationAdapterHex && (
                <p className="text-xs text-muted mt-1 break-all">
                  {t('admin.crosschain_configs_view.manual_auto_hex')}: {state.manualCCIPDestinationAdapterHex}
                </p>
              )}
            </div>
            <Input
              label="CCIP Source Chain Selector (trust)"
              placeholder="source selector uint64"
              value={state.manualCCIPSourceChainSelector}
              onChange={(e) => actions.setManualCCIPSourceChainSelector(e.target.value)}
              disabled={state.manualBridgeType !== '1' || state.manualCurrentStep !== 3}
            />
            <Input
              label="CCIP Destination Gas Limit"
              placeholder="200000"
              value={state.manualCCIPDestinationGasLimit}
              onChange={(e) => actions.setManualCCIPDestinationGasLimit(e.target.value)}
              disabled={state.manualBridgeType !== '1' || state.manualCurrentStep !== 3}
            />
            <Input
              label="CCIP Extra Args (hex)"
              placeholder="0x"
              value={state.manualCCIPDestinationExtraArgsHex}
              onChange={(e) => actions.setManualCCIPDestinationExtraArgsHex(e.target.value)}
              disabled={state.manualBridgeType !== '1' || state.manualCurrentStep !== 3}
            />
            <Input
              label="CCIP Fee Token Address"
              placeholder="0x0000000000000000000000000000000000000000"
              value={state.manualCCIPDestinationFeeTokenAddress}
              onChange={(e) => actions.setManualCCIPDestinationFeeTokenAddress(e.target.value)}
              disabled={state.manualBridgeType !== '1' || state.manualCurrentStep !== 3}
            />
            <Input
              label="CCIP Trusted Sender (bytes32)"
              placeholder="0x000000000000000000000000..."
              value={state.manualCCIPTrustedSenderHex}
              onChange={(e) => actions.setManualCCIPTrustedSenderHex(e.target.value)}
              disabled={state.manualBridgeType !== '1' || state.manualCurrentStep !== 3}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">Allow Source Chain</label>
              <select
                className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
                value={state.manualCCIPAllowSourceChain ? 'true' : 'false'}
                onChange={(e) => actions.setManualCCIPAllowSourceChain(String(e.target.value) === 'true')}
                disabled={state.manualBridgeType !== '1' || state.manualCurrentStep !== 3}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
          </div>
        )}
        {isManualCCIP && (
          <div className="flex justify-end">
            <Button size="sm" variant="secondary" onClick={() => actions.setCCIPManual()} disabled={state.isPending || state.manualBridgeType !== '1' || state.manualCurrentStep !== 3}>
              {t('admin.crosschain_configs_view.manual_save_ccip')}
            </Button>
          </div>
        )}
        {isManualLayerZero && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">LayerZero Source Sender</label>
              <select
                className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
                value={state.manualLayerZeroSenderAddress}
                onChange={(e) => actions.setManualLayerZeroSenderAddress(e.target.value)}
                disabled={!state.manualSourceChainId || state.manualBridgeType !== '2' || state.manualCurrentStep !== 3}
              >
                <option value="">{t('admin.crosschain_configs_view.manual_source_adapter')}</option>
                {(state.manualSourceAdapterContracts || []).map((contract: any) => (
                  <option key={contract.id} value={contract.contractAddress}>
                    {contract.name} ({contract.contractAddress})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">LayerZero Destination Receiver</label>
              <select
                className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
                value={state.manualLayerZeroReceiverAddress}
                onChange={(e) => actions.setManualLayerZeroReceiverAddress(e.target.value)}
                disabled={!state.manualDestChainId || state.manualBridgeType !== '2' || state.manualCurrentStep !== 3}
              >
                <option value="">{t('admin.crosschain_configs_view.select_destination_layerzero_contract')}</option>
                {(state.manualDestLayerZeroContracts || []).map((contract: any) => (
                  <option key={contract.id} value={contract.contractAddress}>
                    {contract.name} ({contract.contractAddress})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label={t('admin.crosschain_configs_view.manual_layerzero_dst_eid')}
              placeholder="30110"
              value={state.manualLayerZeroDstEid}
              onChange={(e) => actions.setManualLayerZeroDstEid(e.target.value)}
              disabled={state.manualBridgeType !== '2' || state.manualCurrentStep !== 3}
            />
            <Input
              label="LayerZero Source EID"
              placeholder="30184"
              value={state.manualLayerZeroSrcEid}
              onChange={(e) => actions.setManualLayerZeroSrcEid(e.target.value)}
              disabled={state.manualBridgeType !== '2' || state.manualCurrentStep !== 3}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">{t('admin.crosschain_configs_view.manual_layerzero_peer_contract')}</label>
              <select
                className="h-11 rounded-full bg-white/5 border border-white/10 px-3 text-sm w-full"
                value={state.manualLayerZeroPeerHex}
                onChange={(e) => actions.setManualLayerZeroPeerHex(e.target.value)}
                disabled={!state.manualDestChainId || state.manualBridgeType !== '2' || state.manualCurrentStep !== 3}
              >
                <option value="">{t('admin.crosschain_configs_view.select_destination_layerzero_contract')}</option>
                {(state.manualDestLayerZeroContracts || []).map((contract: any) => (
                  <option key={contract.id} value={addressToPaddedBytesHex(contract.contractAddress)}>
                    {contract.name} ({contract.contractAddress})
                  </option>
                ))}
              </select>
              {state.manualLayerZeroPeerHex && (
                <p className="text-xs text-muted mt-1 break-all">
                  {t('admin.crosschain_configs_view.manual_auto_hex')}: {state.manualLayerZeroPeerHex}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <Input
                label={t('admin.crosschain_configs_view.manual_layerzero_options_hex')}
                placeholder="0x"
                value={state.manualLayerZeroOptionsHex}
                onChange={(e) => actions.setManualLayerZeroOptionsHex(e.target.value)}
                disabled={state.manualBridgeType !== '2' || state.manualCurrentStep !== 3}
              />
            </div>
          </div>
        )}
        {isManualLayerZero && (
          <div className="flex justify-end">
            <Button size="sm" variant="secondary" onClick={() => actions.setLayerZeroManual()} disabled={state.isPending || state.manualBridgeType !== '2' || state.manualCurrentStep !== 3}>
              {t('admin.crosschain_configs_view.manual_save_layerzero')}
            </Button>
          </div>
        )}
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="primary"
            onClick={() => actions.verifySelectedSource()}
            disabled={state.isPending || state.manualCurrentStep !== 4}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            {t('admin.crosschain_configs_view.verify_selected_source')}
          </Button>
        </div>
      </Card>

      <Card className="p-5 bg-white/5 border-white/10 space-y-3">
        <h3 className="text-base font-semibold text-foreground">{t('admin.crosschain_configs_view.wizard_title')}</h3>
        <p className="text-sm text-muted">{t('admin.crosschain_configs_view.wizard_subtitle')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-muted uppercase tracking-wide">{t('admin.crosschain_configs_view.wizard_step_1')}</p>
            <p className="text-sm text-foreground mt-1">
              {state.sourceChainId || '-'}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-muted uppercase tracking-wide">{t('admin.crosschain_configs_view.wizard_step_2')}</p>
            <p className="text-sm text-foreground mt-1">
              {state.selectedSourceRoutes.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-muted uppercase tracking-wide">{t('admin.crosschain_configs_view.wizard_step_3')}</p>
            <p className="text-sm text-red-300 mt-1">
              {state.selectedSourceErrorRoutes.length}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => actions.autoFixSelectedSourceErrors()}
            disabled={state.isPending || state.isLoading}
          >
            <Wrench className="w-3.5 h-3.5" />
            {t('admin.crosschain_configs_view.auto_fix_error_only')}
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => actions.verifySelectedSource()}
            disabled={state.isPending || state.isLoading}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            {t('admin.crosschain_configs_view.verify_selected_source')}
          </Button>
        </div>
      </Card>
      {state.wizardReport && (
        <Card className="p-5 bg-white/5 border-white/10 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-foreground">{t('admin.crosschain_configs_view.report_title')}</h3>
            <Button size="sm" variant="secondary" onClick={() => actions.exportWizardReport()}>
              <Download className="w-3.5 h-3.5" />
              {t('admin.crosschain_configs_view.export_report')}
            </Button>
          </div>
          <p className="text-sm text-muted">
            {actionLabel(state.wizardReport.action, t)} • {state.wizardReport.sourceChainId}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted uppercase tracking-wide">{t('admin.crosschain_configs_view.report_total_routes')}</p>
              <p className="text-lg text-foreground mt-1">{state.wizardReport.totalRoutes}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted uppercase tracking-wide">{t('admin.crosschain_configs_view.report_before')}</p>
              <p className="text-sm text-foreground mt-1">
                {t('admin.crosschain_configs_view.report_ready')}: {state.wizardReport.beforeReady}
              </p>
              <p className="text-sm text-red-300">
                {t('admin.crosschain_configs_view.report_error')}: {state.wizardReport.beforeError}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted uppercase tracking-wide">{t('admin.crosschain_configs_view.report_after')}</p>
              <p className="text-sm text-emerald-300 mt-1">
                {t('admin.crosschain_configs_view.report_ready')}: {state.wizardReport.afterReady}
              </p>
              <p className="text-sm text-red-300">
                {t('admin.crosschain_configs_view.report_error')}: {state.wizardReport.afterError}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted">
            {t('admin.crosschain_configs_view.report_timestamp')}: {new Date(state.wizardReport.timestamp).toLocaleString()}
          </p>
        </Card>
      )}

      <Card className="p-0 bg-white/5 border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px]">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="text-left px-4 py-3">{t('admin.crosschain_configs_view.route')}</th>
                <th className="text-left px-4 py-3">{t('admin.crosschain_configs_view.default_bridge_type')}</th>
                <th className="text-left px-4 py-3">{t('admin.crosschain_configs_view.adapter_registered')}</th>
                <th className="text-left px-4 py-3">{t('admin.crosschain_configs_view.hyperbridge_configured')}</th>
                <th className="text-left px-4 py-3">{t('admin.crosschain_configs_view.ccip_configured')}</th>
                <th className="text-left px-4 py-3">{t('admin.crosschain_configs_view.fee_quote')}</th>
                <th className="text-left px-4 py-3">{t('admin.crosschain_configs_view.issue_count')}</th>
                <th className="text-left px-4 py-3">{t('admin.crosschain_configs_view.status')}</th>
                <th className="text-left px-4 py-3">{t('admin.crosschain_configs_view.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {state.isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-sm text-muted">
                    {t('admin.crosschain_configs_view.loading')}
                  </td>
                </tr>
              ) : state.routes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-sm text-muted">
                    <p className="font-medium">{t('admin.crosschain_configs_view.empty_title')}</p>
                    <p className="text-xs mt-1">{t('admin.crosschain_configs_view.empty_desc')}</p>
                  </td>
                </tr>
              ) : (
                state.routes.map((route: any) => {
                  const issueCount = Array.isArray(route.issues) ? route.issues.length : 0;
                  const routeQuotePathUsed = String(route.quotePathUsed || '').trim();
                  const routeQuoteFailureReason = String(route.quoteFailureReason || '').trim();
                  const routeQuoteSchemaMismatch =
                    Boolean(route.quoteSchemaMismatch) ||
                    isQuoteSchemaMismatchMessage(routeQuoteFailureReason);
                  return (
                    <tr key={route.routeKey} className="border-t border-white/10 align-top">
                      <td className="px-4 py-3 text-sm">
                        <p className="text-foreground font-medium">{route.sourceChainName} → {route.destChainName}</p>
                        <p className="text-xs text-muted mt-1">{route.sourceChainId} → {route.destChainId}</p>
                        {issueCount > 0 && (
                          <ul className="mt-2 space-y-1">
                            {route.issues.slice(0, 2).map((issue: any) => (
                              <li key={`${route.routeKey}-${issue.code}`} className="text-xs text-red-300/90">
                                {normalizeCrosschainErrorMessage(issue.message)}
                                {recommendActionByErrorCode(String(issue.code || '')) && (
                                  <span className="block text-amber-300/90">
                                    {t('admin.crosschain_configs_view.issue_action_label')}: {recommendActionByErrorCode(String(issue.code || ''))}
                                  </span>
                                )}
                              </li>
                            ))}
                            {issueCount > 2 && (
                              <li className="text-xs text-muted">+{issueCount - 2} {t('admin.crosschain_configs_view.issues')}</li>
                            )}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{route.defaultBridgeType}</td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {boolText(route.adapterRegistered, t('admin.crosschain_configs_view.yes'), t('admin.crosschain_configs_view.no'))}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {boolText(route.hyperbridgeConfigured, t('admin.crosschain_configs_view.yes'), t('admin.crosschain_configs_view.no'))}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {boolText(route.ccipConfigured, t('admin.crosschain_configs_view.yes'), t('admin.crosschain_configs_view.no'))}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {boolText(route.feeQuoteHealthy, t('admin.crosschain_configs_view.yes'), t('admin.crosschain_configs_view.no'))}
                        {routeQuoteSchemaMismatch && (
                          <p className="text-[11px] mt-1 text-amber-300/90">schema mismatch: yes</p>
                        )}
                        {routeQuotePathUsed && (
                          <p className="text-[11px] mt-1 text-cyan-300/90">
                            path: <span className="font-mono">{routeQuotePathUsed}</span>
                          </p>
                        )}
                        {routeQuoteFailureReason && (
                          <p className="text-[11px] mt-1 text-red-300/90">
                            reason: {normalizeCrosschainErrorMessage(routeQuoteFailureReason)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {issueCount || t('admin.crosschain_configs_view.no_issues')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium ${statusClass(route.overallStatus)}`}>
                          {String(route.overallStatus || '').toUpperCase() === 'READY'
                            ? t('admin.crosschain_configs_view.success_status')
                            : String(route.overallStatus || '').toUpperCase() === 'ERROR'
                              ? t('admin.crosschain_configs_view.error_status')
                              : t('admin.crosschain_configs_view.unknown_status')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2 min-w-[132px]">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => actions.recheckRoute({ sourceChainId: route.sourceChainId, destChainId: route.destChainId })}
                            disabled={state.isPending}
                          >
                            <RefreshCcw className="w-3.5 h-3.5" />
                            {t('admin.crosschain_configs_view.recheck')}
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              actions.autoFixRoute({
                                sourceChainId: route.sourceChainId,
                                destChainId: route.destChainId,
                                bridgeType: Number(route.defaultBridgeType || 0),
                              })
                            }
                            disabled={state.isPending}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            {t('admin.crosschain_configs_view.auto_fix')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
