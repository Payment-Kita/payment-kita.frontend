import { useMemo, useState } from 'react';
import { useAdminChains, useOnchainAdapterStatus, useRegisterOnchainAdapter, useSetCCIPConfig, useSetHyperbridgeConfig, useSetOnchainDefaultBridge } from '@/data/usecase/useAdmin';

export const useAdminOnchainAdapters = () => {
  const [sourceChainId, setSourceChainId] = useState('');
  const [destChainId, setDestChainId] = useState('');
  const [registerBridgeType, setRegisterBridgeType] = useState('0');
  const [registerAdapterAddress, setRegisterAdapterAddress] = useState('');
  const [defaultBridgeType, setDefaultBridgeType] = useState('0');
  const [stateMachineIdHex, setStateMachineIdHex] = useState('');
  const [destinationContractHex, setDestinationContractHex] = useState('');
  const [ccipChainSelector, setCcipChainSelector] = useState('');
  const [destinationAdapterHex, setDestinationAdapterHex] = useState('');

  const chainQuery = useAdminChains(1, 300);
  const statusQuery = useOnchainAdapterStatus(sourceChainId || undefined, destChainId || undefined);
  const registerMutation = useRegisterOnchainAdapter();
  const setDefaultMutation = useSetOnchainDefaultBridge();
  const setHyperbridgeConfigMutation = useSetHyperbridgeConfig();
  const setCCIPConfigMutation = useSetCCIPConfig();

  const isPending =
    registerMutation.isPending ||
    setDefaultMutation.isPending ||
    setHyperbridgeConfigMutation.isPending ||
    setCCIPConfigMutation.isPending;

  const chains = useMemo(() => {
    const items = chainQuery.data?.items || [];
    return items.filter((chain: any) => String(chain.chainType || '').toUpperCase() === 'EVM');
  }, [chainQuery.data?.items]);

  const syncFromStatus = () => {
    const current = statusQuery.data;
    if (!current) return;
    setDefaultBridgeType(String(current.defaultBridgeType ?? 0));
  };

  return {
    state: {
      sourceChainId,
      destChainId,
      registerBridgeType,
      registerAdapterAddress,
      defaultBridgeType,
      stateMachineIdHex,
      destinationContractHex,
      ccipChainSelector,
      destinationAdapterHex,
      chains,
      status: statusQuery.data,
      isStatusLoading: statusQuery.isLoading,
      isPending,
    },
    actions: {
      setSourceChainId,
      setDestChainId,
      setRegisterBridgeType,
      setRegisterAdapterAddress,
      setDefaultBridgeType,
      setStateMachineIdHex,
      setDestinationContractHex,
      setCcipChainSelector,
      setDestinationAdapterHex,
      syncFromStatus,
      refreshStatus: statusQuery.refetch,
      registerAdapter: () =>
        registerMutation.mutateAsync({
          sourceChainId,
          destChainId,
          bridgeType: Number(registerBridgeType),
          adapterAddress: registerAdapterAddress,
        }),
      setDefaultBridge: () =>
        setDefaultMutation.mutateAsync({
          sourceChainId,
          destChainId,
          bridgeType: Number(defaultBridgeType),
        }),
      setHyperbridgeConfig: () =>
        setHyperbridgeConfigMutation.mutateAsync({
          sourceChainId,
          destChainId,
          stateMachineIdHex,
          destinationContractHex,
        }),
      setCCIPConfig: () =>
        setCCIPConfigMutation.mutateAsync({
          sourceChainId,
          destChainId,
          chainSelector: String(ccipChainSelector || '').trim() || undefined,
          destinationAdapterHex,
        }),
    },
  };
};
