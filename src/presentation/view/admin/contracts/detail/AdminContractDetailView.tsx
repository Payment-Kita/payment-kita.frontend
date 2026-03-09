'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button, Card } from '@/presentation/components/atoms';
import { useTranslation } from '@/presentation/hooks';
import { useAdminContractDetail } from './useAdminContractDetail';
import { Input } from '@/presentation/components/atoms';
import { useAdminGenericInteract, useRegisterOnchainAdapter, useSetCCIPConfig, useSetHyperbridgeConfig, useSetLayerZeroConfig, useSetOnchainDefaultBridge } from '@/data/usecase/useAdmin';
import { toast } from 'sonner';

type Props = {
  id: string;
};

const statusBadgeClass = (status?: string) => {
  const value = String(status || '').toUpperCase();
  if (value === 'ERROR') return 'bg-red-500/10 text-red-300 border-red-500/20';
  if (value === 'WARN') return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
  return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
};

export const AdminContractDetailView = ({ id }: Props) => {
  const { t } = useTranslation();
  const { state, actions } = useAdminContractDetail(id);
  const registerAdapterMutation = useRegisterOnchainAdapter();
  const setDefaultBridgeMutation = useSetOnchainDefaultBridge();
  const setHyperbridgeConfigMutation = useSetHyperbridgeConfig();
  const setCCIPConfigMutation = useSetCCIPConfig();
  const setLayerZeroConfigMutation = useSetLayerZeroConfig();
  const genericInteractMutation = useAdminGenericInteract();
  const [selectedFunction, setSelectedFunction] = useState('');
  const [functionInputValues, setFunctionInputValues] = useState<Record<string, string>>({});
  const [genericResult, setGenericResult] = useState<any>(null);

  const selectedFn = useMemo(
    () => state.allFunctions.find((fn) => fn.name === selectedFunction),
    [state.allFunctions, selectedFunction]
  );

  const updateInput = (key: string, value: string) => {
    setFunctionInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleRunAction = async () => {
    if (!selectedFn || !state.contract) return;
    const sourceChainId = String(state.contract.chainId || '');
    try {
      setGenericResult(null);
      if (selectedFn.name === 'registerAdapter') {
        await registerAdapterMutation.mutateAsync({
          sourceChainId,
          destChainId: functionInputValues.destChainId || '',
          bridgeType: Number(functionInputValues.bridgeType || '0'),
          adapterAddress: functionInputValues.adapter || '',
        });
        toast.success(t('admin.contracts_view.detail.action_success'));
        actions.refetch();
        return;
      }
      if (selectedFn.name === 'setDefaultBridgeType') {
        await setDefaultBridgeMutation.mutateAsync({
          sourceChainId,
          destChainId: functionInputValues.destChainId || '',
          bridgeType: Number(functionInputValues.bridgeType || '0'),
        });
        toast.success(t('admin.contracts_view.detail.action_success'));
        actions.refetch();
        return;
      }
      if (selectedFn.name === 'setStateMachineId' || selectedFn.name === 'setDestinationContract') {
        await setHyperbridgeConfigMutation.mutateAsync({
          sourceChainId,
          destChainId: functionInputValues.chainId || functionInputValues.destChainId || '',
          stateMachineIdHex: functionInputValues.stateMachineId || '',
          destinationContractHex: functionInputValues.destination || '',
        });
        toast.success(t('admin.contracts_view.detail.action_success'));
        actions.refetch();
        return;
      }
      if (selectedFn.name === 'setChainSelector' || selectedFn.name === 'setDestinationAdapter') {
        await setCCIPConfigMutation.mutateAsync({
          sourceChainId,
          destChainId: functionInputValues.chainId || functionInputValues.destChainId || '',
          chainSelector: String(functionInputValues.selector || '').trim() || undefined,
          destinationAdapterHex: functionInputValues.adapter || '',
        });
        toast.success(t('admin.contracts_view.detail.action_success'));
        actions.refetch();
        return;
      }
      if (selectedFn.name === 'setRoute') {
        await setLayerZeroConfigMutation.mutateAsync({
          sourceChainId,
          destChainId: functionInputValues.destChainId || '',
          dstEid: functionInputValues.dstEid ? Number(functionInputValues.dstEid) : undefined,
          peerHex: functionInputValues.peer || '',
        });
        toast.success(t('admin.contracts_view.detail.action_success'));
        actions.refetch();
        return;
      }
      if (selectedFn.name === 'setEnforcedOptions') {
        await setLayerZeroConfigMutation.mutateAsync({
          sourceChainId,
          destChainId: functionInputValues.destChainId || '',
          optionsHex: functionInputValues.options || '',
        });
        toast.success(t('admin.contracts_view.detail.action_success'));
        actions.refetch();
        return;
      }

      // Generic Fallback
      const response = await genericInteractMutation.mutateAsync({
        sourceChainId,
        contractAddress: state.contract.contractAddress,
        method: selectedFn.name,
        abi: JSON.stringify(state.contract.abi),
        args: (selectedFn.inputs || []).map((input: any) => {
          const key = input.name || input.type;
          return functionInputValues[key] || '';
        }),
      });

      setGenericResult(response.result);
      if (response.isWrite) {
        toast.success(t('admin.contracts_view.detail.action_success'));
      } else {
        toast.success(t('admin.contracts_view.detail.query_success'));
      }
      actions.refetch();

    } catch (error: any) {
      toast.error(error?.message || t('admin.contracts_view.detail.action_failed'));
    }
  };

  if (state.isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted">{t('admin.contracts_view.loading')}</div>
      </div>
    );
  }

  if (state.isError || !state.contract) {
    return (
      <div className="space-y-4">
        <Link href="/admin/contracts" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          {t('admin.contracts_view.back_to_list')}
        </Link>
        <Card className="p-4 bg-red-500/10 border-red-500/20">
          <p className="text-sm text-red-200">{state.errorMessage || t('common.error')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Link href="/admin/contracts" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            {t('admin.contracts_view.back_to_list')}
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{state.contract.name}</h1>
          <p className="text-sm text-muted">{state.contract.contractAddress}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={actions.refetch}>
          <RefreshCw className="w-4 h-4" />
          {t('admin.onchain_adapters_view.refresh')}
        </Button>
      </div>

      <Card className="p-5 bg-white/5 border-white/10 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <p><span className="text-muted">{t('admin.contracts_view.detail.type')}:</span> {state.contract.type}</p>
          <p><span className="text-muted">{t('admin.contracts_view.detail.chain')}:</span> {state.contract.chainId}</p>
          <p><span className="text-muted">{t('admin.contracts_view.detail.version')}:</span> {state.contract.version}</p>
        </div>
      </Card>

      <Card className="p-5 bg-white/5 border-white/10 space-y-3">
        <h3 className="text-base font-semibold">{t('admin.contracts_view.detail.action_builder')}</h3>
        <div className="space-y-2">
          <label className="text-sm text-muted">{t('admin.contracts_view.detail.select_function')}</label>
          <select
            value={selectedFunction}
            onChange={(e) => {
              setSelectedFunction(e.target.value);
              setFunctionInputValues({});
            }}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
          >
            <option value="">{t('admin.contracts_view.detail.select_function_placeholder')}</option>
            {state.allFunctions.map((fn) => (
              <option key={fn.name} value={fn.name}>
                {fn.name}
              </option>
            ))}
          </select>
        </div>

        {selectedFn && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedFn.inputs.map((input: { name: string; type: string }) => {
              const key = input.name || input.type;
              return (
                <Input
                  key={`${selectedFn.name}-${key}`}
                  label={`${input.name || 'arg'} (${input.type})`}
                  placeholder={input.type}
                  value={functionInputValues[key] || ''}
                  onChange={(e) => updateInput(key, e.target.value)}
                />
              );
            })}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunAction}
            disabled={!selectedFn}
            loading={
              registerAdapterMutation.isPending ||
              setDefaultBridgeMutation.isPending ||
              setHyperbridgeConfigMutation.isPending ||
              setCCIPConfigMutation.isPending ||
              setLayerZeroConfigMutation.isPending ||
              genericInteractMutation.isPending
            }
          >
            {t('admin.contracts_view.detail.run_action')}
          </Button>
        </div>

        {genericResult !== null && (
          <div className="mt-4 p-3 rounded-lg border border-white/10 bg-black/20 space-y-2">
            <h4 className="text-sm font-medium text-emerald-300">{t('admin.contracts_view.detail.result')}</h4>
            <pre className="text-xs text-foreground/80 overflow-x-auto whitespace-pre-wrap">
              {typeof genericResult === 'object' ? JSON.stringify(genericResult, null, 2) : String(genericResult)}
            </pre>
          </div>
        )}
      </Card>

      <Card className="p-5 bg-white/5 border-white/10 space-y-3">
        <h3 className="text-base font-semibold">{t('admin.contracts_view.detail.generated_fields')}</h3>
        <div className="flex flex-wrap gap-2">
          {state.generatedFields.length ? state.generatedFields.map((field) => (
            <span key={field} className="px-2 py-1 text-xs rounded-full border border-primary/20 bg-primary/10 text-primary">
              {field}
            </span>
          )) : <span className="text-xs text-muted">-</span>}
        </div>
        <h4 className="text-sm font-medium text-foreground/80">{t('admin.contracts_view.detail.abi_functions')}</h4>
        <div className="max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="flex flex-wrap gap-2">
            {state.abiFunctions.map((fn) => (
              <span key={fn} className="px-2 py-1 text-xs rounded-full border border-white/10 bg-white/5 text-foreground">
                {fn}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {state.config && (
        <Card className="p-5 bg-white/5 border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full border text-xs ${statusBadgeClass(state.config.overallStatus)}`}>
              {state.config.overallStatus}
            </span>
            <span className="text-xs text-muted">
              OK {state.config.summary?.ok || 0} • WARN {state.config.summary?.warn || 0} • ERROR {state.config.summary?.error || 0}
            </span>
          </div>

          {(state.config.destinationAudits || []).map((audit: any) => (
            <div key={audit.destChainId} className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{audit.destChainName} ({audit.destChainId})</p>
                <span className={`px-2 py-1 rounded-full border text-[11px] ${statusBadgeClass(audit.overallStatus)}`}>
                  {audit.overallStatus}
                </span>
              </div>
              <div className="space-y-1">
                {(audit.checks || []).map((check: any, idx: number) => (
                  <p key={`${audit.destChainId}-${check.code}-${idx}`} className="text-xs text-muted">
                    [{check.status}] {check.message}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};
