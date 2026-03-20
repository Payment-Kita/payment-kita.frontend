import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation, useUrlQueryState } from '@/presentation/hooks';
import { QUERY_PARAM_KEYS } from '@/core/constants';
import {
  useAdminChains,
  useAdminContracts,
  useAdminPaymentBridges,
  useAutoFixCrosschainRoute,
  useAutoFixCrosschainRoutesBulk,
  useConfigureStargateE2E,
  useCrosschainConfigPreflight,
  useCrosschainConfigOverview,
  useStargateE2EStatus,
  useRegisterOnchainAdapter,
  useOnchainAdapterStatus,
  useRecheckCrosschainRoute,
  useRecheckCrosschainRoutesBulk,
  useSetCCIPConfig,
  useSetStargateConfig,
  useSetHyperbridgeConfig,
  useSetHyperbridgeTokenGatewayConfig,
  useSetOnchainDefaultBridge,
  useRoutePolicies,
  useCreateRoutePolicy,
  useUpdateRoutePolicy,
} from '@/data/usecase/useAdmin';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 200;
type BridgeOption = { bridgeType: string; name: string };
const BRIDGE_TYPE_META: Record<string, string> = {
  '0': 'Hyperbridge',
  '1': 'CCIP',
  '2': 'Stargate',
  '3': 'Hyperbridge Token Gateway',
};

const toHex = (input: string) =>
  Array.from(new TextEncoder().encode(input))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const addressToPaddedBytesHex = (address: string): string => {
  const value = String(address || '').trim().toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(value)) return '';
  return `0x${value.slice(2).padStart(64, '0')}`;
};

const resolveStargateDstEid = (chain: any): string => {
  const candidates = [
    chain?.stargateEid,
    chain?.stargateDstEid,
    chain?.stargateDstEid,
    chain?.lzDstEid,
    chain?.dstEid,
    chain?.metadata?.stargateDstEid,
    chain?.metadata?.stargateDstEid,
    chain?.metadata?.lzDstEid,
    chain?.metadata?.dstEid,
  ];
  for (const candidate of candidates) {
    const raw = String(candidate ?? '').trim();
    if (/^[0-9]+$/.test(raw)) return raw;
  }

  const caip2 = String(chain?.caip2 || '').trim().toLowerCase();
  const networkId = String(chain?.networkId || '').trim();
  const fallbackByCAIP2: Record<string, string> = {
    'eip155:8453': '30184', // Base
    'eip155:137': '30109', // Polygon
    'eip155:42161': '30110', // Arbitrum
    'eip155:56': '30102', // BSC
  };
  const fallbackByNetworkId: Record<string, string> = {
    '8453': '30184',
    '137': '30109',
    '42161': '30110',
    '56': '30102',
  };
  if (caip2 && fallbackByCAIP2[caip2]) return fallbackByCAIP2[caip2];
  if (networkId && fallbackByNetworkId[networkId]) return fallbackByNetworkId[networkId];

  return '';
};

const resolveStargateSrcEid = (chain: any): string => {
  const candidates = [
    chain?.stargateEid,
    chain?.stargateSrcEid,
    chain?.stargateSrcEid,
    chain?.lzSrcEid,
    chain?.srcEid,
    chain?.metadata?.stargateEid,
    chain?.metadata?.stargateSrcEid,
    chain?.metadata?.stargateSrcEid,
    chain?.metadata?.lzSrcEid,
    chain?.metadata?.srcEid,
  ];
  for (const candidate of candidates) {
    const raw = String(candidate ?? '').trim();
    if (/^[0-9]+$/.test(raw)) return raw;
  }
  const caip2 = String(chain?.caip2 || '').trim().toLowerCase();
  const networkId = String(chain?.networkId || '').trim();
  const fallbackByCAIP2: Record<string, string> = {
    'eip155:8453': '30184', // Base
    'eip155:137': '30109', // Polygon
    'eip155:42161': '30110', // Arbitrum
    'eip155:56': '30102', // BSC
  };
  const fallbackByNetworkId: Record<string, string> = {
    '8453': '30184',
    '137': '30109',
    '42161': '30110',
    '56': '30102',
  };
  if (caip2 && fallbackByCAIP2[caip2]) return fallbackByCAIP2[caip2];
  if (networkId && fallbackByNetworkId[networkId]) return fallbackByNetworkId[networkId];
  return '';
};

const bytes32ToAddress = (value: string): string => {
  const hex = String(value || '').trim().toLowerCase();
  if (!/^0x[0-9a-f]{64}$/.test(hex)) return '';
  const addr = `0x${hex.slice(26)}`;
  if (!/^0x[0-9a-f]{40}$/.test(addr)) return '';
  if (addr === '0x0000000000000000000000000000000000000000') return '';
  return addr;
};

const resolveLzEidFromChainRef = (value: string): number | undefined => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return undefined;
  const normalized =
    raw.startsWith('eip155:')
      ? raw
      : /^[0-9]+$/.test(raw)
        ? `eip155:${raw}`
        : raw;
  const map: Record<string, number> = {
    'eip155:8453': 30184, // Base
    'eip155:137': 30109, // Polygon
    'eip155:42161': 30110, // Arbitrum
    'eip155:56': 30102, // BSC
  };
  return map[normalized];
};

const deriveEvmStateMachineHex = (value: string, chainType?: string): string => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (raw.includes(':')) {
    const [namespace, reference] = raw.split(':');
    if (namespace?.toLowerCase() === 'eip155' && reference) {
      return `0x${toHex(`EVM-${reference}`)}`;
    }
    return '';
  }

  if (String(chainType || '').toUpperCase() === 'EVM' || /^[0-9]+$/.test(raw)) {
    return `0x${toHex(`EVM-${raw}`)}`;
  }

  return '';
};

const resolveCCIPChainSelector = (chain: any): string => {
  const candidates = [
    chain?.ccipChainSelector,
    chain?.ccip_selector,
    chain?.chainSelector,
    chain?.ccipSelector,
    chain?.metadata?.ccipChainSelector,
    chain?.metadata?.ccip_selector,
    chain?.metadata?.chainSelector,
  ];
  for (const candidate of candidates) {
    const raw = String(candidate ?? '').trim();
    if (/^[0-9]+$/.test(raw)) return raw;
  }

  const caip2 = String(chain?.caip2 || '').trim().toLowerCase();
  const networkId = String(chain?.networkId || '').trim();
  // Fallback map for environments where chain metadata has not been populated yet.
  // Keep these aligned with RotateCCIPAdapters.s.sol constants.
  const fallbackByCAIP2: Record<string, string> = {
    'eip155:8453': '15971525489660198786', // Base
    'eip155:137': '4051577828743386545', // Polygon
    'eip155:42161': '4949039107694359620', // Arbitrum
    'eip155:56': '11344663589394136015', // BSC
  };
  const fallbackByNetworkId: Record<string, string> = {
    '8453': '15971525489660198786',
    '137': '4051577828743386545',
    '42161': '4949039107694359620',
    '56': '11344663589394136015',
  };
  if (caip2 && fallbackByCAIP2[caip2]) return fallbackByCAIP2[caip2];
  if (networkId && fallbackByNetworkId[networkId]) return fallbackByNetworkId[networkId];

  return '';
};

export const useAdminCrosschainConfigs = () => {
  const { t } = useTranslation();
  const { getString, setMany } = useUrlQueryState();
  const sourceChainId = getString(QUERY_PARAM_KEYS.sourceChainId);
  const destChainId = getString(QUERY_PARAM_KEYS.destChainId);
  const statusFilter = (getString(QUERY_PARAM_KEYS.status, 'ALL') as 'ALL' | 'READY' | 'ERROR');
  const [manualSourceChainId, setManualSourceChainId] = useState('');
  const [manualDestChainId, setManualDestChainId] = useState('');
  const [manualBridgeType, setManualBridgeType] = useState<string>('0');
  const [manualAdapterAddress, setManualAdapterAddress] = useState('');
  const [manualStateMachineIdHex, setManualStateMachineIdHex] = useState('');
  const [manualDestinationContractHex, setManualDestinationContractHex] = useState('');
  const [manualCCIPChainSelector, setManualCCIPChainSelector] = useState('');
  const [manualCCIPDestinationAdapterHex, setManualCCIPDestinationAdapterHex] = useState('');
  const [manualCCIPDestinationGasLimit, setManualCCIPDestinationGasLimit] = useState('');
  const [manualCCIPDestinationExtraArgsHex, setManualCCIPDestinationExtraArgsHex] = useState('');
  const [manualCCIPDestinationFeeTokenAddress, setManualCCIPDestinationFeeTokenAddress] = useState('');
  const [manualCCIPSourceChainSelector, setManualCCIPSourceChainSelector] = useState('');
  const [manualCCIPTrustedSenderHex, setManualCCIPTrustedSenderHex] = useState('');
  const [manualCCIPAllowSourceChain, setManualCCIPAllowSourceChain] = useState(true);
  const [manualStargateDstEid, setManualStargateDstEid] = useState('');
  const [manualStargateSrcEid, setManualStargateSrcEid] = useState('');
  const [manualStargateSenderAddress, setManualStargateSenderAddress] = useState('');
  const [manualStargateReceiverAddress, setManualStargateReceiverAddress] = useState('');
  const [manualStargatePeerHex, setManualStargatePeerHex] = useState('');
  const [manualStargateOptionsHex, setManualStargateOptionsHex] = useState('');
  const [policyDefaultBridgeType, setPolicyDefaultBridgeType] = useState<string>('0');
  const [policyFallbackMode, setPolicyFallbackMode] = useState<'strict' | 'auto_fallback'>('strict');
  const [policyFallbackOrderInput, setPolicyFallbackOrderInput] = useState('');
  const [policyPerByteRate, setPolicyPerByteRate] = useState('');
  const [policyOverheadBytes, setPolicyOverheadBytes] = useState('');
  const [policyMinFee, setPolicyMinFee] = useState('');
  const [policyMaxFee, setPolicyMaxFee] = useState('');
  const [manualCurrentStep, setManualCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [manualStepCompleted, setManualStepCompleted] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });
  const [manualExecution, setManualExecution] = useState<{
    step1: { status: 'PENDING' | 'SUCCESS' | 'FAILED'; message?: string; txHashes: string[] };
    step2: { status: 'PENDING' | 'SUCCESS' | 'FAILED'; message?: string; txHashes: string[] };
    step3: { status: 'PENDING' | 'SUCCESS' | 'FAILED'; message?: string; txHashes: string[] };
    step4: { status: 'PENDING' | 'SUCCESS' | 'FAILED'; message?: string; txHashes: string[] };
  }>({
    step1: { status: 'PENDING', txHashes: [] },
    step2: { status: 'PENDING', txHashes: [] },
    step3: { status: 'PENDING', txHashes: [] },
    step4: { status: 'PENDING', txHashes: [] },
  });
  const [wizardReport, setWizardReport] = useState<{
    action: 'SETUP' | 'AUTO_FIX_ERROR_ONLY' | 'VERIFY';
    sourceChainId: string;
    totalRoutes: number;
    beforeReady: number;
    beforeError: number;
    afterReady: number;
    afterError: number;
    timestamp: string;
  } | null>(null);

  const chainQuery = useAdminChains(DEFAULT_PAGE, DEFAULT_LIMIT);
  const paymentBridgesQuery = useAdminPaymentBridges(1, 200);
  const overviewQuery = useCrosschainConfigOverview({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    sourceChainId: sourceChainId || undefined,
    destChainId: destChainId || undefined,
  });
  const preflightQuery = useCrosschainConfigPreflight(sourceChainId || undefined, destChainId || undefined);

  const recheckMutation = useRecheckCrosschainRoute();
  const autoFixMutation = useAutoFixCrosschainRoute();
  const recheckBulkMutation = useRecheckCrosschainRoutesBulk();
  const autoFixBulkMutation = useAutoFixCrosschainRoutesBulk();
  const registerAdapterMutation = useRegisterOnchainAdapter();
  const setDefaultBridgeMutation = useSetOnchainDefaultBridge();
  const setHyperbridgeConfigMutation = useSetHyperbridgeConfig();
  const setHyperbridgeTokenGatewayConfigMutation = useSetHyperbridgeTokenGatewayConfig();
  const setCCIPConfigMutation = useSetCCIPConfig();
  const setStargateConfigMutation = useSetStargateConfig();
  const configureStargateE2EMutation = useConfigureStargateE2E();
  const routePoliciesQuery = useRoutePolicies({
    page: 1,
    limit: 1,
    sourceChainId: sourceChainId || undefined,
    destChainId: destChainId || undefined,
  });
  const createRoutePolicyMutation = useCreateRoutePolicy();
  const updateRoutePolicyMutation = useUpdateRoutePolicy();
  const manualOnchainStatusQuery = useOnchainAdapterStatus(
    manualSourceChainId || undefined,
    manualDestChainId || undefined
  );
  const selectedOnchainStatusQuery = useOnchainAdapterStatus(
    sourceChainId || undefined,
    destChainId || undefined
  );

  const normalizeBridgeType = (raw: any): string => {
    const val = String(raw ?? '').trim();
    if (val === '0' || val === '1' || val === '2' || val === '3') return val;
    return '';
  };
  const resolveBridgeType = (value: any): string => {
    const direct = normalizeBridgeType(value?.bridgeType ?? value?.type ?? value?.bridge_type);
    if (direct) return direct;

    const name = String(value?.name || '').toLowerCase();
    if (name.includes('stargate') || /\blz\b/.test(name)) return '2';
    if (name.includes('ccip')) return '1';
    if (name.includes('token gateway')) return '3';
    if (name.includes('hyperbridge') || name.includes('hyperlane')) return '0';
    return '';
  };
  const manualBridgeOptions = useMemo<BridgeOption[]>(() => {
    const fromDbRaw = (paymentBridgesQuery.data?.items || [])
      .map((item: any) => {
        const type = resolveBridgeType(item);
        if (!type) {
          // Keep this warning to detect invalid DB bridge rows early.
          console.warn('[CrosschainConfig] Unknown bridge type row', item);
          return null;
        }
        return { bridgeType: type, name: BRIDGE_TYPE_META[type] || String(item?.name || `Bridge ${type}`) };
      })
      .filter(Boolean) as BridgeOption[];
    const fromDb = Array.from(
      new Map(fromDbRaw.map((item) => [String(item.bridgeType), item])).values() // Deduplication by bridgeType
    );

    const fromPreflight = (preflightQuery.data?.bridges || [])
      .map((item: any) => ({
        bridgeType: normalizeBridgeType(item?.bridgeType),
        name: BRIDGE_TYPE_META[String(item?.bridgeType ?? '')] || String(item?.bridgeName || `Bridge ${item?.bridgeType ?? ''}`),
      }))
      .filter((item: BridgeOption) => item.bridgeType);

    const combined = new Map<string, BridgeOption>();
    
    // 1. Add from DB
    fromDb.forEach((item) => combined.set(String(item.bridgeType), item));

    // 2. Add from Preflight (if not exists)
    fromPreflight.forEach((item: BridgeOption) => {
      const key = String(item.bridgeType);
      if (!combined.has(key)) {
        combined.set(key, item);
      }
    });

    const result = Array.from(combined.values()).sort((a, b) => Number(a.bridgeType) - Number(b.bridgeType));

    if (result.length > 0) return result;
    return [
      { bridgeType: '0', name: 'Hyperbridge' },
      { bridgeType: '1', name: 'CCIP' },
      { bridgeType: '2', name: 'Stargate' },
      { bridgeType: '3', name: 'Hyperbridge Token Gateway' },
    ];
  }, [paymentBridgesQuery.data?.items, preflightQuery.data?.bridges]);

  useEffect(() => {
    if (!manualBridgeOptions.length) return;
    const exists = manualBridgeOptions.some((item) => String(item.bridgeType) === String(manualBridgeType));
    if (!exists) {
      setManualBridgeType(String(manualBridgeOptions[0].bridgeType));
    }
  }, [manualBridgeOptions, manualBridgeType]);

  const sourceAdapterType =
    manualBridgeType === '0'
      ? 'ADAPTER_HYPERBRIDGE'
      : manualBridgeType === '1'
        ? 'ADAPTER_CCIP'
        : manualBridgeType === '3'
          ? 'ADAPTER_HYPERBRIDGE'
          : 'ADAPTER_STARGATE';
  const sourceAdapterContractsQuery = useAdminContracts(1, 200, manualSourceChainId || undefined, sourceAdapterType);
  const destHyperContractsQuery = useAdminContracts(1, 200, manualDestChainId || undefined, 'ADAPTER_HYPERBRIDGE');
  const destHBTokenContractsQuery = useAdminContracts(1, 200, manualDestChainId || undefined, 'ADAPTER_HYPERBRIDGE');
  const destCCIPContractsQuery = useAdminContracts(1, 200, manualDestChainId || undefined, 'ADAPTER_CCIP');
  const destStargateContractsQuery = useAdminContracts(1, 200, manualDestChainId || undefined, 'ADAPTER_STARGATE');
  const selectedSourceHyperContractsQuery = useAdminContracts(1, 200, sourceChainId || undefined, 'ADAPTER_HYPERBRIDGE');
  const selectedSourceCCIPContractsQuery = useAdminContracts(1, 200, sourceChainId || undefined, 'ADAPTER_CCIP');
  const selectedSourceStargateContractsQuery = useAdminContracts(1, 200, sourceChainId || undefined, 'ADAPTER_STARGATE');
  const selectedSourceHBTokenContractsQuery = useAdminContracts(1, 200, sourceChainId || undefined, 'ADAPTER_HYPERBRIDGE');
  const selectedDestHyperContractsQuery = useAdminContracts(1, 200, destChainId || undefined, 'ADAPTER_HYPERBRIDGE');
  const selectedDestHBTokenContractsQuery = useAdminContracts(1, 200, destChainId || undefined, 'ADAPTER_HYPERBRIDGE');
  const selectedDestCCIPContractsQuery = useAdminContracts(1, 200, destChainId || undefined, 'ADAPTER_CCIP');
  const selectedDestStargateContractsQuery = useAdminContracts(1, 200, destChainId || undefined, 'ADAPTER_STARGATE');
  const manualSourceAdapterContracts = sourceAdapterContractsQuery.data?.items || [];
  const manualDestHyperContracts = destHyperContractsQuery.data?.items || [];
  const manualDestHBTokenContracts = destHBTokenContractsQuery.data?.items || [];
  const manualDestCCIPContracts = destCCIPContractsQuery.data?.items || [];
  const manualDestStargateContracts = destStargateContractsQuery.data?.items || [];
  const selectedSourceHyperContracts = selectedSourceHyperContractsQuery.data?.items || [];
  const selectedSourceCCIPContracts = selectedSourceCCIPContractsQuery.data?.items || [];
  const selectedSourceStargateContracts = selectedSourceStargateContractsQuery.data?.items || [];
  const selectedSourceHBTokenContracts = selectedSourceHBTokenContractsQuery.data?.items || [];
  const selectedDestHyperContracts = selectedDestHyperContractsQuery.data?.items || [];
  const selectedDestHBTokenContracts = selectedDestHBTokenContractsQuery.data?.items || [];
  const selectedDestCCIPContracts = selectedDestCCIPContractsQuery.data?.items || [];
  const selectedDestStargateContracts = selectedDestStargateContractsQuery.data?.items || [];

  const statusSourceSenderAddress = String(
    selectedOnchainStatusQuery.data?.adapterType2 ||
    selectedSourceStargateContracts?.[0]?.contractAddress ||
    manualStargateSenderAddress ||
    ''
  ).trim();
  const statusDestinationReceiverAddress = String(
    bytes32ToAddress(String(selectedOnchainStatusQuery.data?.stargatePeer || '')) ||
    selectedDestStargateContracts?.[0]?.contractAddress ||
    manualStargateReceiverAddress ||
    ''
  ).trim();

  const chains = useMemo(() => chainQuery.data?.items || [], [chainQuery.data?.items]);
  const selectedSourceChain = useMemo(
    () => chains.find((chain: any) => String(chain.id) === String(sourceChainId)),
    [chains, sourceChainId]
  );
  const selectedDestChain = useMemo(
    () => chains.find((chain: any) => String(chain.id) === String(destChainId)),
    [chains, destChainId]
  );
  const chainLookup = useMemo(() => {
    const map = new Map<string, any>();
    for (const chain of chains) {
      map.set(String(chain?.id || ''), chain);
    }
    return map;
  }, [chains]);
  const matchesSelectedChain = (routeChainId: string, selectedChainId: string) => {
    const routeValue = String(routeChainId || '').trim();
    const selectedValue = String(selectedChainId || '').trim();
    if (!routeValue || !selectedValue) return false;
    if (routeValue === selectedValue) return true;

    const selectedChain = chainLookup.get(selectedValue);
    if (!selectedChain) return false;

    const selectedCAIP2 = String(selectedChain?.caip2 || '').trim();
    const selectedNetworkID = String(selectedChain?.networkId || '').trim();
    if (selectedCAIP2 && routeValue === selectedCAIP2) return true;
    if (selectedNetworkID && routeValue === selectedNetworkID) return true;
    return false;
  };
  const matchesSelectedPair = (route: any, sourceId: string, destId?: string) => {
    if (!matchesSelectedChain(String(route?.sourceChainId || ''), sourceId)) return false;
    if (!destId) return true;
    return matchesSelectedChain(String(route?.destChainId || ''), destId);
  };
  const sourceChains = useMemo(
    () => chains.filter((chain: any) => String(chain.chainType || '').toUpperCase() === 'EVM'),
    [chains]
  );
  const destinationChains = chains;
  const selectedManualDestChain = useMemo(
    () => destinationChains.find((chain: any) => String(chain.id) === String(manualDestChainId)),
    [destinationChains, manualDestChainId]
  );
  const selectedManualSourceChain = useMemo(
    () => sourceChains.find((chain: any) => String(chain.id) === String(manualSourceChainId)),
    [sourceChains, manualSourceChainId]
  );
  const stargateE2EStatusQuery = useStargateE2EStatus(
    {
      sourceChainId: sourceChainId || undefined,
      destChainId: destChainId || undefined,
      destinationReceiverAddress: statusDestinationReceiverAddress,
      destinationSrcEid: Number(resolveStargateSrcEid(selectedSourceChain || {})) || undefined,
      destinationSrcSenderHex: addressToPaddedBytesHex(statusSourceSenderAddress),
    },
    Boolean(sourceChainId && destChainId)
  );

  const isPending =
    recheckMutation.isPending ||
    autoFixMutation.isPending ||
    recheckBulkMutation.isPending ||
    autoFixBulkMutation.isPending ||
    registerAdapterMutation.isPending ||
    setDefaultBridgeMutation.isPending ||
    setHyperbridgeConfigMutation.isPending ||
    setHyperbridgeTokenGatewayConfigMutation.isPending ||
    setCCIPConfigMutation.isPending ||
    setStargateConfigMutation.isPending ||
    configureStargateE2EMutation.isPending ||
    createRoutePolicyMutation.isPending ||
    updateRoutePolicyMutation.isPending;
  const routes = useMemo(() => {
    const all = overviewQuery.data?.items || [];
    if (statusFilter === 'ALL') return all;
    return all.filter((route: any) => String(route.overallStatus || '').toUpperCase() === statusFilter);
  }, [overviewQuery.data?.items, statusFilter]);
  const selectedSourceRoutes = useMemo(
    () => routes.filter((route: any) => !sourceChainId || matchesSelectedChain(String(route.sourceChainId || ''), sourceChainId)),
    [routes, sourceChainId, chainLookup]
  );
  const selectedSourceErrorRoutes = useMemo(
    () => selectedSourceRoutes.filter((route: any) => String(route.overallStatus || '').toUpperCase() === 'ERROR'),
    [selectedSourceRoutes]
  );
  const activeRoutePolicy = useMemo(
    () => (routePoliciesQuery.data?.items || [])[0] || null,
    [routePoliciesQuery.data?.items]
  );

  useEffect(() => {
    if (!sourceChainId || !destChainId) {
      setPolicyDefaultBridgeType('0');
      setPolicyFallbackMode('strict');
      setPolicyFallbackOrderInput('');
      setPolicyPerByteRate('');
      setPolicyOverheadBytes('');
      setPolicyMinFee('');
      setPolicyMaxFee('');
      return;
    }

    const bridgeType = String(activeRoutePolicy?.defaultBridgeType ?? activeRoutePolicy?.default_bridge_type ?? '');
    if (bridgeType === '0' || bridgeType === '1' || bridgeType === '2' || bridgeType === '3') {
      setPolicyDefaultBridgeType(bridgeType);
    } else if (manualBridgeOptions.length) {
      setPolicyDefaultBridgeType(String(manualBridgeOptions[0].bridgeType));
    }

    const fallbackMode = String(activeRoutePolicy?.fallbackMode || activeRoutePolicy?.fallback_mode || '').trim();
    setPolicyFallbackMode(fallbackMode === 'auto_fallback' ? 'auto_fallback' : 'strict');

    const fallbackOrderRaw = activeRoutePolicy?.fallbackOrder ?? activeRoutePolicy?.fallback_order;
    if (Array.isArray(fallbackOrderRaw)) {
      setPolicyFallbackOrderInput(
        fallbackOrderRaw
          .map((item: any) => Number(item))
          .filter((item: any) => Number.isFinite(item))
          .join(',')
      );
      return;
    }
    if (typeof fallbackOrderRaw === 'string' && fallbackOrderRaw.trim()) {
      setPolicyFallbackOrderInput(fallbackOrderRaw.trim().replace(/[\[\]\s]/g, ''));
    } else {
      setPolicyFallbackOrderInput('');
    }
    setPolicyPerByteRate(String(activeRoutePolicy?.perByteRate ?? activeRoutePolicy?.per_byte_rate ?? '').trim());
    setPolicyOverheadBytes(String(activeRoutePolicy?.overheadBytes ?? activeRoutePolicy?.overhead_bytes ?? '').trim());
    setPolicyMinFee(String(activeRoutePolicy?.minFee ?? activeRoutePolicy?.min_fee ?? '').trim());
    setPolicyMaxFee(String(activeRoutePolicy?.maxFee ?? activeRoutePolicy?.max_fee ?? '').trim());
  }, [sourceChainId, destChainId, activeRoutePolicy, manualBridgeOptions]);

  useEffect(() => {
    if (manualBridgeType !== '0') return;
    if (!manualDestChainId) {
      setManualStateMachineIdHex('');
      return;
    }

    const statusStateMachine = String(manualOnchainStatusQuery.data?.hyperbridgeStateMachineId || '').trim();
    if (statusStateMachine && statusStateMachine !== '0x') {
      setManualStateMachineIdHex(statusStateMachine);
      return;
    }

    const rawChainReference =
      String(selectedManualDestChain?.caip2 || '').trim() ||
      String(selectedManualDestChain?.id || '').trim() ||
      String(manualDestChainId || '').trim();
    const autoHex = deriveEvmStateMachineHex(rawChainReference, selectedManualDestChain?.chainType);
    setManualStateMachineIdHex(autoHex);
  }, [manualBridgeType, manualDestChainId, selectedManualDestChain, manualOnchainStatusQuery.data?.hyperbridgeStateMachineId]);

  useEffect(() => {
    if (manualBridgeType !== '3') return;
    if (!manualDestChainId) {
      setManualStateMachineIdHex('');
      setManualDestinationContractHex('');
      return;
    }

    const statusStateMachine = String(manualOnchainStatusQuery.data?.hyperbridgeTokenGatewayStateMachineId || '').trim();
    if (statusStateMachine && statusStateMachine !== '0x') {
      setManualStateMachineIdHex(statusStateMachine);
    } else {
      const rawChainReference =
        String(selectedManualDestChain?.caip2 || '').trim() ||
        String(selectedManualDestChain?.id || '').trim() ||
        String(manualDestChainId || '').trim();
      const autoHex = deriveEvmStateMachineHex(rawChainReference, selectedManualDestChain?.chainType);
      setManualStateMachineIdHex(autoHex);
    }

    const allValues = manualDestHBTokenContracts
      .map((contract: any) => String(contract.contractAddress || '').trim())
      .filter((addr) => /^0x[0-9a-fA-F]{40}$/.test(addr));
    const statusSettlement = String(manualOnchainStatusQuery.data?.hyperbridgeTokenGatewaySettlementExecutor || '').trim();
    if (/^0x[0-9a-fA-F]{40}$/.test(statusSettlement)) {
      setManualDestinationContractHex(statusSettlement);
      return;
    }
    if (!allValues.length) {
      setManualDestinationContractHex('');
      return;
    }
    const current = String(manualDestinationContractHex || '').toLowerCase();
    const exists = allValues.some((item) => item.toLowerCase() === current);
    if (!exists) {
      setManualDestinationContractHex(allValues[0]);
    }
  }, [
    manualBridgeType,
    manualDestChainId,
    selectedManualDestChain,
    manualDestHBTokenContracts,
    manualDestinationContractHex,
    manualOnchainStatusQuery.data?.hyperbridgeTokenGatewayStateMachineId,
    manualOnchainStatusQuery.data?.hyperbridgeTokenGatewaySettlementExecutor,
  ]);

  useEffect(() => {
    if (manualBridgeType !== '1') return;
    if (!manualDestChainId) {
      setManualCCIPChainSelector('');
      return;
    }

    // Do not derive uint64 selector from status numeric field, because JSON->JS Number
    // can lose precision for large uint64 values (e.g. CCIP chain selectors).
    setManualCCIPChainSelector(resolveCCIPChainSelector(selectedManualDestChain));
  }, [manualBridgeType, manualDestChainId, selectedManualDestChain]);

  useEffect(() => {
    if (manualBridgeType !== '1') return;
    if (!manualSourceChainId) {
      setManualCCIPSourceChainSelector('');
      return;
    }
    setManualCCIPSourceChainSelector(resolveCCIPChainSelector(selectedManualSourceChain || {}));
  }, [manualBridgeType, manualSourceChainId, selectedManualSourceChain]);

  useEffect(() => {
    if (manualBridgeType !== '1') return;
    const senderAddress = String(manualAdapterAddress || manualSourceAdapterContracts?.[0]?.contractAddress || '').trim();
    if (!senderAddress) {
      setManualCCIPTrustedSenderHex('');
      return;
    }
    const senderHex = addressToPaddedBytesHex(senderAddress);
    if (!senderHex) return;
    if (String(manualCCIPTrustedSenderHex || '').toLowerCase() !== senderHex.toLowerCase()) {
      setManualCCIPTrustedSenderHex(senderHex);
    }
  }, [manualBridgeType, manualAdapterAddress, manualSourceAdapterContracts, manualCCIPTrustedSenderHex]);

  useEffect(() => {
    if (manualBridgeType !== '2') return;
    if (!manualDestChainId) {
      setManualStargateDstEid('');
      return;
    }
    const statusDstEid = Number(manualOnchainStatusQuery.data?.stargateDstEid || 0);
    if (Number.isFinite(statusDstEid) && statusDstEid > 0) {
      setManualStargateDstEid(String(statusDstEid));
      return;
    }
    setManualStargateDstEid(resolveStargateDstEid(selectedManualDestChain));
  }, [manualBridgeType, manualDestChainId, selectedManualDestChain, manualOnchainStatusQuery.data?.stargateDstEid]);

  useEffect(() => {
    if (manualBridgeType !== '2') return;
    if (!manualSourceChainId) {
      setManualStargateSrcEid('');
      return;
    }
    setManualStargateSrcEid(resolveStargateSrcEid(selectedManualSourceChain || {}));
  }, [manualBridgeType, manualSourceChainId, selectedManualSourceChain]);

  useEffect(() => {
    if (manualBridgeType !== '2') return;
    if (!manualSourceChainId) {
      setManualStargateSenderAddress('');
      return;
    }
    const sender = String(
      manualOnchainStatusQuery.data?.adapterType2 ||
      manualAdapterAddress ||
      manualSourceAdapterContracts?.[0]?.contractAddress ||
      ''
    ).trim();
    if (!sender) return;
    if (String(manualStargateSenderAddress || '').toLowerCase() !== sender.toLowerCase()) {
      setManualStargateSenderAddress(sender);
    }
  }, [manualBridgeType, manualSourceChainId, manualAdapterAddress, manualSourceAdapterContracts, manualStargateSenderAddress, manualOnchainStatusQuery.data?.adapterType2]);

  useEffect(() => {
    if (manualBridgeType !== '2') return;
    if (!manualDestChainId) {
      setManualStargateReceiverAddress('');
      return;
    }
    const receiver = String(
      bytes32ToAddress(String(manualOnchainStatusQuery.data?.stargatePeer || '')) ||
      manualDestStargateContracts?.[0]?.contractAddress ||
      ''
    ).trim();
    if (!receiver) return;
    if (String(manualStargateReceiverAddress || '').toLowerCase() !== receiver.toLowerCase()) {
      setManualStargateReceiverAddress(receiver);
    }
  }, [manualBridgeType, manualDestChainId, manualDestStargateContracts, manualStargateReceiverAddress, manualOnchainStatusQuery.data?.stargatePeer]);

  useEffect(() => {
    if (!manualSourceChainId) {
      setManualAdapterAddress('');
      return;
    }
    if (!manualSourceAdapterContracts.length) {
      setManualAdapterAddress('');
      return;
    }
    const exists = manualSourceAdapterContracts.some(
      (contract: any) => String(contract.contractAddress).toLowerCase() === String(manualAdapterAddress).toLowerCase()
    );
    if (!exists) {
      setManualAdapterAddress(String(manualSourceAdapterContracts[0].contractAddress || ''));
    }
  }, [manualSourceChainId, manualSourceAdapterContracts, manualAdapterAddress]);

  useEffect(() => {
    if (manualBridgeType !== '0') return;
    if (!manualDestChainId) {
      setManualDestinationContractHex('');
      return;
    }
    if (!manualDestHyperContracts.length) {
      setManualDestinationContractHex('');
      return;
    }
    const allValues = manualDestHyperContracts
      .map((contract: any) => String(contract.contractAddress || '').toLowerCase())
      .filter((addr) => /^0x[0-9a-f]{40}$/.test(addr));
    if (!allValues.length) {
      setManualDestinationContractHex('');
      return;
    }
    const onchainDestHex = String(manualOnchainStatusQuery.data?.hyperbridgeDestinationContract || '').trim().toLowerCase();
    if (onchainDestHex && onchainDestHex !== '0x') {
      // Hyperbridge status might return longer bytes if it's stored differently, 
      // but if it's 20 bytes (0x + 40 chars), we use it.
      if (onchainDestHex.length === 42) {
        setManualDestinationContractHex(onchainDestHex);
        return;
      }
    }
    if (!allValues.includes(String(manualDestinationContractHex).toLowerCase())) {
      setManualDestinationContractHex(allValues[0]);
    }
  }, [manualBridgeType, manualDestChainId, manualDestHyperContracts, manualOnchainStatusQuery.data?.hyperbridgeDestinationContract]);

  useEffect(() => {
    if (manualBridgeType !== '1') return;
    if (!manualDestChainId) {
      setManualCCIPDestinationAdapterHex('');
      setManualCCIPDestinationGasLimit('');
      setManualCCIPDestinationExtraArgsHex('');
      setManualCCIPDestinationFeeTokenAddress('');
      return;
    }
    if (!manualDestCCIPContracts.length) {
      setManualCCIPDestinationAdapterHex('');
      return;
    }
    const allValues = manualDestCCIPContracts
      .map((contract: any) => addressToPaddedBytesHex(String(contract.contractAddress || '')))
      .filter(Boolean);
    if (!allValues.length) {
      setManualCCIPDestinationAdapterHex('');
      return;
    }
    const onchainDestHex = String(manualOnchainStatusQuery.data?.ccipDestinationAdapter || '').trim();
    if (onchainDestHex) {
      setManualCCIPDestinationAdapterHex(onchainDestHex);
    } else if (!allValues.includes(String(manualCCIPDestinationAdapterHex))) {
      setManualCCIPDestinationAdapterHex(allValues[0]);
    }
    const statusGasLimit = String(manualOnchainStatusQuery.data?.ccipDestinationGasLimit || '').trim();
    if (statusGasLimit) {
      setManualCCIPDestinationGasLimit(statusGasLimit);
    }
    const statusExtraArgs = String(manualOnchainStatusQuery.data?.ccipDestinationExtraArgsHex || '').trim();
    if (statusExtraArgs) {
      setManualCCIPDestinationExtraArgsHex(statusExtraArgs);
    }
    const statusFeeToken = String(manualOnchainStatusQuery.data?.ccipDestinationFeeTokenAddress || '').trim();
    if (statusFeeToken && /^0x[0-9a-fA-F]{40}$/.test(statusFeeToken)) {
      setManualCCIPDestinationFeeTokenAddress(statusFeeToken);
    }
  }, [
    manualBridgeType,
    manualDestChainId,
    manualDestCCIPContracts,
    manualOnchainStatusQuery.data?.ccipDestinationAdapter,
    manualOnchainStatusQuery.data?.ccipDestinationGasLimit,
    manualOnchainStatusQuery.data?.ccipDestinationExtraArgsHex,
    manualOnchainStatusQuery.data?.ccipDestinationFeeTokenAddress,
    manualCCIPDestinationAdapterHex,
  ]);

  useEffect(() => {
    if (manualBridgeType !== '2') return;
    if (!manualDestChainId) {
      setManualStargatePeerHex('');
      return;
    }
    if (!manualDestStargateContracts.length) {
      setManualStargatePeerHex('');
      return;
    }
    const allValues = manualDestStargateContracts
      .map((contract: any) => addressToPaddedBytesHex(String(contract.contractAddress || '')))
      .filter(Boolean);
    if (!allValues.length) {
      setManualStargatePeerHex('');
      return;
    }
    const onchainPeer = String(manualOnchainStatusQuery.data?.stargatePeer || '').trim();
    if (onchainPeer) {
      setManualStargatePeerHex(onchainPeer);
      return;
    }
    const receiverPeer = addressToPaddedBytesHex(String(manualStargateReceiverAddress || ''));
    if (receiverPeer && allValues.includes(receiverPeer)) {
      if (String(manualStargatePeerHex || '').toLowerCase() !== receiverPeer.toLowerCase()) {
        setManualStargatePeerHex(receiverPeer);
      }
      return;
    }
    if (!allValues.includes(String(manualStargatePeerHex))) {
      setManualStargatePeerHex(allValues[0]);
    }
  }, [
    manualBridgeType,
    manualDestChainId,
    manualDestStargateContracts,
    manualOnchainStatusQuery.data?.stargatePeer,
    manualStargatePeerHex,
    manualStargateReceiverAddress,
  ]);

  useEffect(() => {
    if (manualBridgeType !== '2') return;
    if (!manualDestChainId) {
      setManualStargateOptionsHex('');
      return;
    }

    const onchainOptions = String(manualOnchainStatusQuery.data?.stargateOptionsHex || '').trim();
    if (onchainOptions) {
      setManualStargateOptionsHex(onchainOptions);
      return;
    }

    // Keep a deterministic default for manual flow even if on-chain value not set yet.
    if (!String(manualStargateOptionsHex || '').trim()) {
      setManualStargateOptionsHex('0x');
    }
  }, [manualBridgeType, manualDestChainId, manualOnchainStatusQuery.data?.stargateOptionsHex, manualStargateOptionsHex]);

  const handleRecheck = async (payload: { sourceChainId: string; destChainId: string }) => {
    try {
      await recheckMutation.mutateAsync(payload);
      toast.success(t('admin.crosschain_configs_view.toasts.recheck_success'));
      await overviewQuery.refetch();
      await preflightQuery.refetch();
    } catch (error: any) {
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.recheck_failed'));
    }
  };

  const resetManualStepper = () => {
    setManualCurrentStep(1);
    setManualStepCompleted({ step1: false, step2: false, step3: false, step4: false });
    setManualExecution({
      step1: { status: 'PENDING', txHashes: [] },
      step2: { status: 'PENDING', txHashes: [] },
      step3: { status: 'PENDING', txHashes: [] },
      step4: { status: 'PENDING', txHashes: [] },
    });
  };

  const handleManualSourceChainChange = (value: string) => {
    setManualSourceChainId(value);
    resetManualStepper();
  };

  const handleManualDestChainChange = (value: string) => {
    setManualDestChainId(value);
    resetManualStepper();
  };

  const handleManualBridgeTypeChange = (value: string) => {
    setManualBridgeType(value);
    setManualAdapterAddress('');
    setManualStateMachineIdHex('');
    setManualDestinationContractHex('');
    setManualCCIPChainSelector('');
    setManualCCIPDestinationAdapterHex('');
    setManualCCIPDestinationGasLimit('');
    setManualCCIPDestinationExtraArgsHex('');
    setManualCCIPDestinationFeeTokenAddress('');
    setManualCCIPSourceChainSelector('');
    setManualCCIPTrustedSenderHex('');
    setManualCCIPAllowSourceChain(true);
    setManualStargateDstEid('');
    setManualStargateSrcEid('');
    setManualStargateSenderAddress('');
    setManualStargateReceiverAddress('');
    setManualStargatePeerHex('');
    setManualStargateOptionsHex('');
    resetManualStepper();
  };

  const getSuggestedStep = (checks: { adapterRegistered?: boolean; routeConfigured?: boolean; feeQuoteHealthy?: boolean }) => {
    if (!checks.adapterRegistered) return 'REGISTER_ADAPTER' as const;
    if (!checks.routeConfigured) return 'CONFIGURE_ROUTE' as const;
    if (!checks.feeQuoteHealthy) return 'VERIFY_ROUTE' as const;
    return 'READY' as const;
  };

  const setManualStepByChecks = (checks: { adapterRegistered?: boolean; routeConfigured?: boolean; feeQuoteHealthy?: boolean }) => {
    const hasAdapter = Boolean(checks.adapterRegistered);
    const hasRoute = Boolean(checks.routeConfigured);
    const feeHealthy = Boolean(checks.feeQuoteHealthy);

    if (!hasAdapter) {
      setManualCurrentStep(1);
      setManualStepCompleted({ step1: false, step2: false, step3: false, step4: false });
      setManualExecution({
        step1: { status: 'PENDING', txHashes: [] },
        step2: { status: 'PENDING', txHashes: [] },
        step3: { status: 'PENDING', txHashes: [] },
        step4: { status: 'PENDING', txHashes: [] },
      });
      return;
    }

    if (!hasRoute) {
      setManualCurrentStep(3);
      setManualStepCompleted({ step1: true, step2: true, step3: false, step4: false });
      setManualExecution({
        step1: { status: 'SUCCESS', txHashes: [] },
        step2: { status: 'SUCCESS', txHashes: [] },
        step3: { status: 'PENDING', txHashes: [] },
        step4: { status: 'PENDING', txHashes: [] },
      });
      return;
    }

    if (!feeHealthy) {
      setManualCurrentStep(4);
      setManualStepCompleted({ step1: true, step2: true, step3: true, step4: false });
      setManualExecution({
        step1: { status: 'SUCCESS', txHashes: [] },
        step2: { status: 'SUCCESS', txHashes: [] },
        step3: { status: 'SUCCESS', txHashes: [] },
        step4: { status: 'PENDING', txHashes: [] },
      });
      return;
    }

    setManualCurrentStep(4);
    setManualStepCompleted({ step1: true, step2: true, step3: true, step4: true });
    setManualExecution({
      step1: { status: 'SUCCESS', txHashes: [] },
      step2: { status: 'SUCCESS', txHashes: [] },
      step3: { status: 'SUCCESS', txHashes: [] },
      step4: { status: 'SUCCESS', txHashes: [] },
    });
  };

  const handleApplyPreflightSuggestion = (
    bridgeType: number,
    checks: { adapterRegistered?: boolean; routeConfigured?: boolean; feeQuoteHealthy?: boolean },
    options?: { silent?: boolean }
  ) => {
    const selectedSource = sourceChainId || manualSourceChainId;
    const selectedDest = destChainId || manualDestChainId;
    if (!selectedSource || !selectedDest) {
      toast.error(t('admin.crosschain_configs_view.toasts.select_source_chain_first'));
      return;
    }

    if (manualSourceChainId !== selectedSource) setManualSourceChainId(selectedSource);
    if (manualDestChainId !== selectedDest) setManualDestChainId(selectedDest);
    const normalizedBridgeType = String(bridgeType);
    const sourceContracts =
      normalizedBridgeType === '0'
        ? (selectedSourceHyperContracts.length ? selectedSourceHyperContracts : manualSourceAdapterContracts)
        : normalizedBridgeType === '1'
          ? (selectedSourceCCIPContracts.length ? selectedSourceCCIPContracts : manualSourceAdapterContracts)
          : normalizedBridgeType === '3'
            ? (selectedSourceHBTokenContracts.length ? selectedSourceHBTokenContracts : manualSourceAdapterContracts)
          : manualSourceAdapterContracts;
    const destContracts =
      normalizedBridgeType === '0'
        ? (selectedDestHyperContracts.length ? selectedDestHyperContracts : manualDestHyperContracts)
        : normalizedBridgeType === '1'
          ? (selectedDestCCIPContracts.length ? selectedDestCCIPContracts : manualDestCCIPContracts)
          : normalizedBridgeType === '3'
            ? (selectedDestHBTokenContracts.length ? selectedDestHBTokenContracts : manualDestHBTokenContracts)
            : (selectedDestStargateContracts.length ? selectedDestStargateContracts : manualDestStargateContracts);

    if (manualBridgeType !== normalizedBridgeType) {
      setManualBridgeType(normalizedBridgeType);
      setManualAdapterAddress('');
      setManualStateMachineIdHex('');
      setManualDestinationContractHex('');
      setManualCCIPChainSelector('');
      setManualCCIPDestinationAdapterHex('');
      setManualCCIPDestinationGasLimit('');
      setManualCCIPDestinationExtraArgsHex('');
      setManualCCIPDestinationFeeTokenAddress('');
      setManualCCIPSourceChainSelector('');
      setManualCCIPTrustedSenderHex('');
      setManualCCIPAllowSourceChain(true);
      setManualStargateDstEid('');
      setManualStargateSrcEid('');
      setManualStargateSenderAddress('');
      setManualStargateReceiverAddress('');
      setManualStargatePeerHex('');
      setManualStargateOptionsHex('');
    }

    const firstSourceAddress = String(sourceContracts?.[0]?.contractAddress || '');
    if (firstSourceAddress) {
      setManualAdapterAddress(firstSourceAddress);
      if (normalizedBridgeType === '2') {
        setManualStargateSenderAddress(firstSourceAddress);
      }
    }
    if (normalizedBridgeType === '0') {
      const firstDestinationAddress = String(destContracts?.[0]?.contractAddress || '');
      if (firstDestinationAddress) {
        setManualDestinationContractHex(addressToPaddedBytesHex(firstDestinationAddress));
      }
    } else if (normalizedBridgeType === '3') {
      const firstDestinationAddress = String(destContracts?.[0]?.contractAddress || '');
      if (firstDestinationAddress) {
        setManualDestinationContractHex(firstDestinationAddress);
      }
    } else if (normalizedBridgeType === '1') {
      const firstSourceAddress = String(sourceContracts?.[0]?.contractAddress || '');
      const firstDestinationAddress = String(destContracts?.[0]?.contractAddress || '');
      if (firstDestinationAddress) {
        setManualCCIPDestinationAdapterHex(addressToPaddedBytesHex(firstDestinationAddress));
      }
      if (!manualCCIPChainSelector) {
        const selectedDestChain = chains.find((item: any) => String(item?.id || '') === String(selectedDest));
        const chainSelector = resolveCCIPChainSelector(selectedDestChain);
        if (chainSelector) setManualCCIPChainSelector(chainSelector);
      }
      if (!manualCCIPSourceChainSelector) {
        const selectedSourceChain = chains.find((item: any) => String(item?.id || '') === String(selectedSource));
        const sourceSelector = resolveCCIPChainSelector(selectedSourceChain);
        if (sourceSelector) setManualCCIPSourceChainSelector(sourceSelector);
      }
      if (firstSourceAddress && !manualCCIPTrustedSenderHex) {
        setManualCCIPTrustedSenderHex(addressToPaddedBytesHex(firstSourceAddress));
      }
    } else if (normalizedBridgeType === '2') {
      const firstDestinationAddress = String(
        statusDestinationReceiverAddress ||
        destContracts?.[0]?.contractAddress ||
        ''
      );
      if (firstDestinationAddress) {
        setManualStargateReceiverAddress(firstDestinationAddress);
        setManualStargatePeerHex(addressToPaddedBytesHex(firstDestinationAddress));
      }
      if (!manualStargateDstEid) {
        const selectedDestChain = chains.find((item: any) => String(item?.id || '') === String(selectedDest));
        const dstEid = resolveStargateDstEid(selectedDestChain);
        if (dstEid) setManualStargateDstEid(dstEid);
      }
      if (!manualStargateSrcEid) {
        const selectedSourceChain = chains.find((item: any) => String(item?.id || '') === String(selectedSource));
        const srcEid = resolveStargateSrcEid(selectedSourceChain);
        if (srcEid) setManualStargateSrcEid(srcEid);
      }
    }

    setManualStepByChecks(checks);
    if (!options?.silent) {
      toast.success(t('admin.crosschain_configs_view.toasts.preflight_suggestion_applied'));
    }
  };

  const handleRunPreflightNextStep = async (
    bridgeType: number,
    checks: { adapterRegistered?: boolean; routeConfigured?: boolean; feeQuoteHealthy?: boolean }
  ) => {
    const selectedSource = sourceChainId || manualSourceChainId;
    const selectedDest = destChainId || manualDestChainId;
    if (!selectedSource || !selectedDest) {
      toast.error(t('admin.crosschain_configs_view.toasts.select_source_chain_first'));
      return;
    }

    const normalizedBridgeType = String(bridgeType);
    const sourceContracts =
      normalizedBridgeType === '0'
        ? (selectedSourceHyperContracts.length ? selectedSourceHyperContracts : manualSourceAdapterContracts)
        : normalizedBridgeType === '1'
          ? (selectedSourceCCIPContracts.length ? selectedSourceCCIPContracts : manualSourceAdapterContracts)
          : normalizedBridgeType === '3'
            ? (selectedSourceHBTokenContracts.length ? selectedSourceHBTokenContracts : manualSourceAdapterContracts)
          : manualSourceAdapterContracts;
    const destContracts =
      normalizedBridgeType === '0'
        ? (selectedDestHyperContracts.length ? selectedDestHyperContracts : manualDestHyperContracts)
        : normalizedBridgeType === '1'
          ? (selectedDestCCIPContracts.length ? selectedDestCCIPContracts : manualDestCCIPContracts)
          : normalizedBridgeType === '3'
            ? (selectedDestHBTokenContracts.length ? selectedDestHBTokenContracts : manualDestHBTokenContracts)
            : (selectedDestStargateContracts.length ? selectedDestStargateContracts : manualDestStargateContracts);
    const suggestedStep = getSuggestedStep(checks);

    handleApplyPreflightSuggestion(bridgeType, checks, { silent: true });

    try {
      if (suggestedStep === 'REGISTER_ADAPTER') {
        const adapterAddress = String(sourceContracts?.[0]?.contractAddress || '');
        if (!adapterAddress) {
          toast.error(t('admin.crosschain_configs_view.toasts.preflight_missing_adapter_contract'));
          return;
        }
        await registerAdapterMutation.mutateAsync({
          sourceChainId: selectedSource,
          destChainId: selectedDest,
          bridgeType: Number(normalizedBridgeType),
          adapterAddress,
        });
        toast.success(t('admin.crosschain_configs_view.toasts.manual_register_adapter_success'));
      } else if (suggestedStep === 'CONFIGURE_ROUTE') {
        if (normalizedBridgeType === '0') {
          const selectedDestChain = chains.find((item: any) => String(item?.id || '') === String(selectedDest));
          const rawChainReference =
            String(selectedDestChain?.caip2 || '').trim() ||
            String(selectedDestChain?.id || '').trim() ||
            String(selectedDest || '').trim();
          const stateMachineIdHex = deriveEvmStateMachineHex(rawChainReference, selectedDestChain?.chainType);
          const destinationAddress = String(destContracts?.[0]?.contractAddress || '');
          const destinationContractHex = destinationAddress ? addressToPaddedBytesHex(destinationAddress) : '';
          if (!stateMachineIdHex && !destinationContractHex) {
            toast.error(t('admin.crosschain_configs_view.toasts.preflight_missing_route_payload'));
            return;
          }
          await setHyperbridgeConfigMutation.mutateAsync({
            sourceChainId: selectedSource,
            destChainId: selectedDest,
            stateMachineIdHex: stateMachineIdHex || undefined,
            destinationContractHex: destinationContractHex || undefined,
          });
          toast.success(t('admin.crosschain_configs_view.toasts.manual_hyperbridge_success'));
        } else if (normalizedBridgeType === '1') {
          const destinationAddress = String(destContracts?.[0]?.contractAddress || '');
          const destinationAdapterHex = destinationAddress ? addressToPaddedBytesHex(destinationAddress) : '';
          const selectedDestChain = chains.find((item: any) => String(item?.id || '') === String(selectedDest));
          const chainSelectorRaw = resolveCCIPChainSelector(selectedDestChain);
          const chainSelector = String(chainSelectorRaw || '').trim() || undefined;
          if (!chainSelector && !destinationAdapterHex) {
            toast.error(t('admin.crosschain_configs_view.toasts.preflight_missing_route_payload'));
            return;
          }
          await setCCIPConfigMutation.mutateAsync({
            sourceChainId: selectedSource,
            destChainId: selectedDest,
            chainSelector,
            destinationAdapterHex: destinationAdapterHex || undefined,
          });
          toast.success(t('admin.crosschain_configs_view.toasts.manual_ccip_success'));
        } else if (normalizedBridgeType === '2') {
          const senderAddress = String(
            statusSourceSenderAddress ||
            sourceContracts?.[0]?.contractAddress ||
            ''
          );
          const destinationAddress = String(
            statusDestinationReceiverAddress ||
            destContracts?.[0]?.contractAddress ||
            ''
          );
          const peerHex = destinationAddress ? addressToPaddedBytesHex(destinationAddress) : '';
          const selectedDestChain = chains.find((item: any) => String(item?.id || '') === String(selectedDest));
          const selectedSourceChain = chains.find((item: any) => String(item?.id || '') === String(selectedSource));
          const dstEidRaw = resolveStargateDstEid(selectedDestChain);
          const srcEidRaw = resolveStargateSrcEid(selectedSourceChain);
          const dstEid = dstEidRaw ? Number(dstEidRaw) : undefined;
          const srcEid = srcEidRaw ? Number(srcEidRaw) : undefined;
          const srcSenderHex = senderAddress ? addressToPaddedBytesHex(senderAddress) : '';
          if (!dstEid || !peerHex || !senderAddress || !destinationAddress || !srcEid || !srcSenderHex) {
            toast.error(t('admin.crosschain_configs_view.toasts.preflight_missing_route_payload'));
            return;
          }
          await configureStargateE2EMutation.mutateAsync({
            sourceChainId: selectedSource,
            destChainId: selectedDest,
            source: {
              registerAdapterIfMissing: false,
              setDefaultBridgeType: false,
              senderAddress,
              dstEid,
              dstPeerHex: peerHex,
              optionsHex: '',
              registerDelegate: false,
              authorizeVaultSpender: false,
            },
            destination: {
              receiverAddress: destinationAddress,
              srcEid,
              srcSenderHex,
              authorizeVaultSpender: false,
              authorizeGatewayAdapter: false,
            },
          });
          toast.success(t('admin.crosschain_configs_view.toasts.manual_stargate_success'));
        } else if (normalizedBridgeType === '3') {
          const selectedDestChain = chains.find((item: any) => String(item?.id || '') === String(selectedDest));
          const rawChainReference =
            String(selectedDestChain?.caip2 || '').trim() ||
            String(selectedDestChain?.id || '').trim() ||
            String(selectedDest || '').trim();
          const stateMachineIdHex = deriveEvmStateMachineHex(rawChainReference, selectedDestChain?.chainType);
          const settlementExecutorAddress = String(destContracts?.[0]?.contractAddress || '').trim();
          if (!stateMachineIdHex && !settlementExecutorAddress) {
            toast.error(t('admin.crosschain_configs_view.toasts.preflight_missing_route_payload'));
            return;
          }
          await setHyperbridgeTokenGatewayConfigMutation.mutateAsync({
            sourceChainId: selectedSource,
            destChainId: selectedDest,
            stateMachineIdHex: stateMachineIdHex || undefined,
            settlementExecutorAddress: settlementExecutorAddress || undefined,
          });
          toast.success(t('admin.crosschain_configs_view.toasts.manual_hyperbridge_success'));
        } else {
          toast.error(t('admin.crosschain_configs_view.toasts.manual_step_invalid'));
          return;
        }
      } else if (suggestedStep === 'VERIFY_ROUTE') {
        const pairRoutes = routes.filter((route: any) => matchesSelectedPair(route, selectedSource, selectedDest));
        const payloadRoutes =
          pairRoutes.length > 0
            ? pairRoutes.map((route: any) => ({ sourceChainId: route.sourceChainId, destChainId: route.destChainId }))
            : [{ sourceChainId: selectedSource, destChainId: selectedDest }];
        const result = await recheckBulkMutation.mutateAsync({ routes: payloadRoutes });
        const readyCount = result.filter((item: any) => String(item?.overallStatus || '').toUpperCase() === 'READY').length;
        toast.success(
          t('admin.crosschain_configs_view.toasts.verify_source_result')
            .replace('{ready}', String(readyCount))
            .replace('{total}', String(payloadRoutes.length))
        );
      } else {
        toast.success(t('admin.crosschain_configs_view.toasts.preflight_route_ready'));
      }

      await overviewQuery.refetch();
      await preflightQuery.refetch();
    } catch (error: any) {
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.recheck_failed'));
    }
  };

  const handleRegisterAdapterManual = async () => {
    if (manualCurrentStep !== 1) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_step_invalid'));
      return;
    }
    if (!manualSourceChainId || !manualDestChainId || !manualAdapterAddress) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_required_fields'));
      return;
    }
    try {
      const result = await registerAdapterMutation.mutateAsync({
        sourceChainId: manualSourceChainId,
        destChainId: manualDestChainId,
        bridgeType: Number(manualBridgeType),
        adapterAddress: manualAdapterAddress,
      });
      toast.success(t('admin.crosschain_configs_view.toasts.manual_register_adapter_success'));
      setManualStepCompleted((prev) => ({ ...prev, step1: true }));
      setManualExecution((prev) => ({
        ...prev,
        step1: {
          status: 'SUCCESS',
          message: t('admin.crosschain_configs_view.toasts.manual_register_adapter_success'),
          txHashes: result?.txHash ? [String(result.txHash)] : [],
        },
      }));
      setManualCurrentStep(2);
      await overviewQuery.refetch();
      await preflightQuery.refetch();
    } catch (error: any) {
      setManualExecution((prev) => ({
        ...prev,
        step1: { status: 'FAILED', message: error?.message || t('admin.crosschain_configs_view.toasts.manual_register_adapter_failed'), txHashes: [] },
      }));
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.manual_register_adapter_failed'));
    }
  };

  const handleSetDefaultBridgeManual = async () => {
    if (!manualStepCompleted.step1 || manualCurrentStep !== 2) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_step_invalid'));
      return;
    }
    if (!manualSourceChainId || !manualDestChainId) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_required_fields'));
      return;
    }
    try {
      const result = await setDefaultBridgeMutation.mutateAsync({
        sourceChainId: manualSourceChainId,
        destChainId: manualDestChainId,
        bridgeType: Number(manualBridgeType),
      });
      toast.success(t('admin.crosschain_configs_view.toasts.manual_set_default_success'));
      setManualStepCompleted((prev) => ({ ...prev, step2: true }));
      setManualExecution((prev) => ({
        ...prev,
        step2: {
          status: 'SUCCESS',
          message: t('admin.crosschain_configs_view.toasts.manual_set_default_success'),
          txHashes: result?.txHash ? [String(result.txHash)] : [],
        },
      }));
      setManualCurrentStep(3);
      await overviewQuery.refetch();
      await preflightQuery.refetch();
    } catch (error: any) {
      setManualExecution((prev) => ({
        ...prev,
        step2: { status: 'FAILED', message: error?.message || t('admin.crosschain_configs_view.toasts.manual_set_default_failed'), txHashes: [] },
      }));
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.manual_set_default_failed'));
    }
  };

  const handleSetDefaultBridgeQuick = async () => {
    if (!manualSourceChainId || !manualDestChainId) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_required_fields'));
      return;
    }
    try {
      const result = await setDefaultBridgeMutation.mutateAsync({
        sourceChainId: manualSourceChainId,
        destChainId: manualDestChainId,
        bridgeType: Number(manualBridgeType),
      });
      toast.success(t('admin.crosschain_configs_view.toasts.manual_set_default_success'));

      setManualExecution((prev) => ({
        ...prev,
        step2: {
          status: 'SUCCESS',
          message: t('admin.crosschain_configs_view.toasts.manual_set_default_success'),
          txHashes: result?.txHash ? [String(result.txHash)] : [],
        },
      }));

      await overviewQuery.refetch();
      await preflightQuery.refetch();
    } catch (error: any) {
      setManualExecution((prev) => ({
        ...prev,
        step2: { status: 'FAILED', message: error?.message || t('admin.crosschain_configs_view.toasts.manual_set_default_failed'), txHashes: [] },
      }));
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.manual_set_default_failed'));
    }
  };

  const handleSetHyperbridgeManual = async () => {
    if (!manualStepCompleted.step2 || manualCurrentStep !== 3) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_step_invalid'));
      return;
    }
    if (!manualSourceChainId || !manualDestChainId || (!manualStateMachineIdHex && !manualDestinationContractHex)) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_required_fields'));
      return;
    }
    try {
      const result = await setHyperbridgeConfigMutation.mutateAsync({
        sourceChainId: manualSourceChainId,
        destChainId: manualDestChainId,
        stateMachineIdHex: manualStateMachineIdHex || undefined,
        destinationContractHex: manualDestinationContractHex || undefined,
      });
      toast.success(t('admin.crosschain_configs_view.toasts.manual_hyperbridge_success'));
      setManualStepCompleted((prev) => ({ ...prev, step3: true }));
      setManualExecution((prev) => ({
        ...prev,
        step3: {
          status: 'SUCCESS',
          message: t('admin.crosschain_configs_view.toasts.manual_hyperbridge_success'),
          txHashes: Array.isArray(result?.txHashes) ? result.txHashes.map((item: any) => String(item)) : [],
        },
      }));
      setManualCurrentStep(4);
      await overviewQuery.refetch();
      await preflightQuery.refetch();
    } catch (error: any) {
      setManualExecution((prev) => ({
        ...prev,
        step3: { status: 'FAILED', message: error?.message || t('admin.crosschain_configs_view.toasts.manual_hyperbridge_failed'), txHashes: [] },
      }));
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.manual_hyperbridge_failed'));
    }
  };

  const handleSetHyperbridgeTokenGatewayManual = async () => {
    if (!manualStepCompleted.step2 || manualCurrentStep !== 3) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_step_invalid'));
      return;
    }
    if (!manualSourceChainId || !manualDestChainId || (!manualStateMachineIdHex && !manualDestinationContractHex)) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_required_fields'));
      return;
    }
    try {
      const result = await setHyperbridgeTokenGatewayConfigMutation.mutateAsync({
        sourceChainId: manualSourceChainId,
        destChainId: manualDestChainId,
        stateMachineIdHex: manualStateMachineIdHex || undefined,
        settlementExecutorAddress: manualDestinationContractHex || undefined,
      });
      toast.success(t('admin.crosschain_configs_view.toasts.manual_hyperbridge_success'));
      setManualStepCompleted((prev) => ({ ...prev, step3: true }));
      setManualExecution((prev) => ({
        ...prev,
        step3: {
          status: 'SUCCESS',
          message: t('admin.crosschain_configs_view.toasts.manual_hyperbridge_success'),
          txHashes: Array.isArray(result?.txHashes) ? result.txHashes.map((item: any) => String(item)) : [],
        },
      }));
      setManualCurrentStep(4);
      await overviewQuery.refetch();
      await preflightQuery.refetch();
    } catch (error: any) {
      setManualExecution((prev) => ({
        ...prev,
        step3: { status: 'FAILED', message: error?.message || t('admin.crosschain_configs_view.toasts.manual_hyperbridge_failed'), txHashes: [] },
      }));
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.manual_hyperbridge_failed'));
    }
  };

  const handleSetCCIPManual = async () => {
    if (!manualStepCompleted.step2 || manualCurrentStep !== 3) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_step_invalid'));
      return;
    }
    if (!manualSourceChainId || !manualDestChainId || (!manualCCIPChainSelector && !manualCCIPDestinationAdapterHex)) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_required_fields'));
      return;
    }
    try {
      const result = await setCCIPConfigMutation.mutateAsync({
        sourceChainId: manualSourceChainId,
        destChainId: manualDestChainId,
        chainSelector: String(manualCCIPChainSelector || '').trim() || undefined,
        destinationAdapterHex: manualCCIPDestinationAdapterHex || undefined,
        destinationGasLimit: manualCCIPDestinationGasLimit ? Number(manualCCIPDestinationGasLimit) : undefined,
        destinationExtraArgsHex: manualCCIPDestinationExtraArgsHex || undefined,
        destinationFeeTokenAddress: manualCCIPDestinationFeeTokenAddress || undefined,
      });
      toast.success(t('admin.crosschain_configs_view.toasts.manual_ccip_success'));
      setManualStepCompleted((prev) => ({ ...prev, step3: true }));
      setManualExecution((prev) => ({
        ...prev,
        step3: {
          status: 'SUCCESS',
          message: t('admin.crosschain_configs_view.toasts.manual_ccip_success'),
          txHashes: Array.isArray(result?.txHashes) ? result.txHashes.map((item: any) => String(item)) : [],
        },
      }));
      setManualCurrentStep(4);
      await overviewQuery.refetch();
      await preflightQuery.refetch();
    } catch (error: any) {
      setManualExecution((prev) => ({
        ...prev,
        step3: { status: 'FAILED', message: error?.message || t('admin.crosschain_configs_view.toasts.manual_ccip_failed'), txHashes: [] },
      }));
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.manual_ccip_failed'));
    }
  };

  const handleSetStargateManual = async () => {
    if (!manualStepCompleted.step2 || manualCurrentStep !== 3) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_step_invalid'));
      return;
    }
    if (!manualSourceChainId || !manualDestChainId) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_required_fields'));
      return;
    }
    try {
      const senderAddress = String(
        manualStargateSenderAddress || manualAdapterAddress || manualSourceAdapterContracts?.[0]?.contractAddress || ''
      );
      const receiverAddress = String(
        manualStargateReceiverAddress || manualDestStargateContracts?.[0]?.contractAddress || ''
      );
      const dstEid = Number(manualStargateDstEid || resolveStargateDstEid(selectedManualDestChain || {})) || undefined;
      const srcEid = Number(manualStargateSrcEid || resolveStargateSrcEid(selectedManualSourceChain || {})) || undefined;
      const dstPeerHex = manualStargatePeerHex || (receiverAddress ? addressToPaddedBytesHex(receiverAddress) : '');
      const srcSenderHex = senderAddress ? addressToPaddedBytesHex(senderAddress) : '';
      const missing: string[] = [];
      if (!senderAddress) missing.push('senderAddress');
      if (!receiverAddress) missing.push('receiverAddress');
      if (!dstEid) missing.push('dstEid');
      if (!srcEid) missing.push('srcEid');
      if (!dstPeerHex) missing.push('dstPeerHex');
      if (!srcSenderHex) missing.push('srcSenderHex');
      if (missing.length > 0) {
        toast.error(`${t('admin.crosschain_configs_view.toasts.preflight_missing_route_payload')} (${missing.join(', ')})`);
        return;
      }

      const result = await configureStargateE2EMutation.mutateAsync({
        sourceChainId: manualSourceChainId,
        destChainId: manualDestChainId,
        source: {
          registerAdapterIfMissing: false,
          setDefaultBridgeType: false,
          senderAddress,
          dstEid,
          dstPeerHex,
          optionsHex: manualStargateOptionsHex || '',
          registerDelegate: false,
          authorizeVaultSpender: true,
        },
        destination: {
          receiverAddress,
          srcEid,
          srcSenderHex,
          authorizeVaultSpender: true,
          authorizeGatewayAdapter: true,
        },
      });
      toast.success(t('admin.crosschain_configs_view.toasts.manual_stargate_success'));
      setManualStepCompleted((prev) => ({ ...prev, step3: true }));
      setManualExecution((prev) => ({
        ...prev,
        step3: {
          status: 'SUCCESS',
          message: t('admin.crosschain_configs_view.toasts.manual_stargate_success'),
          txHashes: Array.isArray(result?.txHashes) ? result.txHashes.map((item: any) => String(item)) : [],
        },
      }));
      setManualCurrentStep(4);
      await overviewQuery.refetch();
      await preflightQuery.refetch();
      await stargateE2EStatusQuery.refetch();
    } catch (error: any) {
      setManualExecution((prev) => ({
        ...prev,
        step3: { status: 'FAILED', message: error?.message || t('admin.crosschain_configs_view.toasts.manual_stargate_failed'), txHashes: [] },
      }));
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.manual_stargate_failed'));
    }
  };

  const handleConfigureStargateE2ESelected = async () => {
    if (!sourceChainId || !destChainId) {
      toast.error(t('admin.crosschain_configs_view.toasts.select_source_chain_first'));
      return;
    }

    const senderAddress = String(
      selectedOnchainStatusQuery.data?.adapterType2 ||
      selectedSourceStargateContracts?.[0]?.contractAddress ||
      ''
    );
    const receiverAddress = String(
      selectedDestStargateContracts?.[0]?.contractAddress ||
      manualDestStargateContracts?.[0]?.contractAddress ||
      bytes32ToAddress(String(selectedOnchainStatusQuery.data?.stargatePeer || '')) ||
      ''
    );
    const dstEid =
      Number(selectedOnchainStatusQuery.data?.stargateDstEid || 0) ||
      Number(resolveStargateDstEid(selectedDestChain || {})) ||
      resolveLzEidFromChainRef(String(selectedOnchainStatusQuery.data?.destChainId || '')) ||
      undefined;
    const srcEid =
      Number(resolveStargateSrcEid(selectedSourceChain || {})) ||
      resolveLzEidFromChainRef(String(selectedOnchainStatusQuery.data?.sourceChainId || '')) ||
      undefined;
    const dstPeerHex = receiverAddress
      ? addressToPaddedBytesHex(receiverAddress)
      : String(selectedOnchainStatusQuery.data?.stargatePeer || '').trim();
    const srcSenderHex = senderAddress ? addressToPaddedBytesHex(senderAddress) : '';

    const missing: string[] = [];
    if (!senderAddress) missing.push('senderAddress');
    if (!receiverAddress) missing.push('receiverAddress');
    if (!dstEid) missing.push('dstEid');
    if (!srcEid) missing.push('srcEid');
    if (!dstPeerHex) missing.push('dstPeerHex');
    if (!srcSenderHex) missing.push('srcSenderHex');
    if (missing.length > 0) {
      toast.error(`${t('admin.crosschain_configs_view.toasts.preflight_missing_route_payload')} (${missing.join(', ')})`);
      return;
    }

    try {
      await configureStargateE2EMutation.mutateAsync({
        sourceChainId,
        destChainId,
        source: {
          registerAdapterIfMissing: true,
          setDefaultBridgeType: true,
          senderAddress,
          dstEid,
          dstPeerHex,
          optionsHex: '',
          registerDelegate: true,
          authorizeVaultSpender: true,
        },
        destination: {
          receiverAddress,
          srcEid,
          srcSenderHex,
          authorizeVaultSpender: true,
          authorizeGatewayAdapter: true,
        },
      });
      await overviewQuery.refetch();
      await preflightQuery.refetch();
      await stargateE2EStatusQuery.refetch();
      toast.success(t('admin.crosschain_configs_view.toasts.manual_stargate_success'));
    } catch (error: any) {
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.manual_stargate_failed'));
    }
  };

  const handleAutoFix = async (payload: { sourceChainId: string; destChainId: string; bridgeType?: number }) => {
    try {
      await autoFixMutation.mutateAsync(payload);
      toast.success(t('admin.crosschain_configs_view.toasts.auto_fix_success'));
      await overviewQuery.refetch();
      await preflightQuery.refetch();
    } catch (error: any) {
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.auto_fix_failed'));
    }
  };

  const handleRecheckVisible = async () => {
    const visibleRoutes = routes;
    if (!visibleRoutes.length) return;
    try {
      const result = await recheckBulkMutation.mutateAsync({
        routes: visibleRoutes.map((route: any) => ({
          sourceChainId: route.sourceChainId,
          destChainId: route.destChainId,
        })),
      });
      const successCount = result.filter((item: any) => String(item?.overallStatus || '').toUpperCase() === 'READY').length;
      await overviewQuery.refetch();
      await preflightQuery.refetch();
      toast.success(`${t('admin.crosschain_configs_view.recheck')}: ${successCount}/${visibleRoutes.length}`);
    } catch (error: any) {
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.recheck_failed'));
    }
  };

  const handleAutoFixVisible = async () => {
    const visibleRoutes = routes;
    if (!visibleRoutes.length) return;
    try {
      const result = await autoFixBulkMutation.mutateAsync({
        routes: visibleRoutes.map((route: any) => ({
          sourceChainId: route.sourceChainId,
          destChainId: route.destChainId,
          bridgeType: Number(route.defaultBridgeType || 0),
        })),
      });
      const successCount = result.filter((item: any) => Array.isArray(item?.steps) && item.steps.every((step: any) => step.status !== 'FAILED')).length;
      await overviewQuery.refetch();
      await preflightQuery.refetch();
      toast.success(`${t('admin.crosschain_configs_view.auto_fix')}: ${successCount}/${visibleRoutes.length}`);
    } catch (error: any) {
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.auto_fix_failed'));
    }
  };

  const handleSetupSelectedSource = async () => {
    if (!sourceChainId) {
      toast.error(t('admin.crosschain_configs_view.toasts.select_source_chain_first'));
      return;
    }
    const sourceRoutes = selectedSourceRoutes;
    if (!sourceRoutes.length) {
      toast.error(t('admin.crosschain_configs_view.toasts.no_routes_for_source'));
      return;
    }

    try {
      const beforeReady = sourceRoutes.filter((route: any) => String(route.overallStatus || '').toUpperCase() === 'READY').length;
      const beforeError = sourceRoutes.filter((route: any) => String(route.overallStatus || '').toUpperCase() === 'ERROR').length;

      await autoFixBulkMutation.mutateAsync({
        routes: sourceRoutes.map((route: any) => ({
          sourceChainId: route.sourceChainId,
          destChainId: route.destChainId,
          bridgeType: Number(route.defaultBridgeType || 0),
        })),
      });
      const checked = await recheckBulkMutation.mutateAsync({
        routes: sourceRoutes.map((route: any) => ({
          sourceChainId: route.sourceChainId,
          destChainId: route.destChainId,
        })),
      });
      const readyCount = checked.filter((item: any) => String(item?.overallStatus || '').toUpperCase() === 'READY').length;
      const errorCount = checked.filter((item: any) => String(item?.overallStatus || '').toUpperCase() === 'ERROR').length;
      setWizardReport({
        action: 'SETUP',
        sourceChainId,
        totalRoutes: sourceRoutes.length,
        beforeReady,
        beforeError,
        afterReady: readyCount,
        afterError: errorCount,
        timestamp: new Date().toISOString(),
      });
      await overviewQuery.refetch();
      await preflightQuery.refetch();
      toast.success(
        t('admin.crosschain_configs_view.toasts.setup_source_result')
          .replace('{ready}', String(readyCount))
          .replace('{total}', String(sourceRoutes.length))
      );
    } catch (error: any) {
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.setup_source_failed'));
    }
  };

  const handleAutoFixSelectedSourceErrors = async () => {
    if (!sourceChainId) {
      toast.error(t('admin.crosschain_configs_view.toasts.select_source_chain_first'));
      return;
    }
    if (!selectedSourceErrorRoutes.length) {
      toast.success(t('admin.crosschain_configs_view.toasts.no_error_routes_for_source'));
      return;
    }
    try {
      const beforeReady = selectedSourceRoutes.filter((route: any) => String(route.overallStatus || '').toUpperCase() === 'READY').length;
      const beforeError = selectedSourceRoutes.filter((route: any) => String(route.overallStatus || '').toUpperCase() === 'ERROR').length;

      await autoFixBulkMutation.mutateAsync({
        routes: selectedSourceErrorRoutes.map((route: any) => ({
          sourceChainId: route.sourceChainId,
          destChainId: route.destChainId,
          bridgeType: Number(route.defaultBridgeType || 0),
        })),
      });
      const checked = await recheckBulkMutation.mutateAsync({
        routes: selectedSourceRoutes.map((route: any) => ({
          sourceChainId: route.sourceChainId,
          destChainId: route.destChainId,
        })),
      });
      const readyCount = checked.filter((item: any) => String(item?.overallStatus || '').toUpperCase() === 'READY').length;
      const errorCount = checked.filter((item: any) => String(item?.overallStatus || '').toUpperCase() === 'ERROR').length;
      setWizardReport({
        action: 'AUTO_FIX_ERROR_ONLY',
        sourceChainId,
        totalRoutes: selectedSourceRoutes.length,
        beforeReady,
        beforeError,
        afterReady: readyCount,
        afterError: errorCount,
        timestamp: new Date().toISOString(),
      });
      await overviewQuery.refetch();
      await preflightQuery.refetch();
      toast.success(
        t('admin.crosschain_configs_view.toasts.auto_fix_error_only_done')
          .replace('{fixed}', String(selectedSourceErrorRoutes.length))
      );
    } catch (error: any) {
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.auto_fix_failed'));
    }
  };

  const handleVerifySelectedSource = async () => {
    if (manualSourceChainId && manualDestChainId && !manualStepCompleted.step3 && manualCurrentStep === 4) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_step_invalid'));
      return;
    }
    const effectiveSourceChainId = sourceChainId || manualSourceChainId;
    if (!effectiveSourceChainId) {
      toast.error(t('admin.crosschain_configs_view.toasts.select_source_chain_first'));
      return;
    }
    const shouldUseManualPair = manualStepCompleted.step3 && !!manualSourceChainId && !!manualDestChainId;
    const effectiveDestChainId = shouldUseManualPair ? manualDestChainId : undefined;
    const routesToVerify = routes.filter((route: any) =>
      matchesSelectedPair(route, effectiveSourceChainId, effectiveDestChainId)
    );
    if (!routesToVerify.length) {
      toast.error(t('admin.crosschain_configs_view.toasts.no_routes_for_source'));
      return;
    }
    try {
      const beforeReady = routesToVerify.filter((route: any) => String(route.overallStatus || '').toUpperCase() === 'READY').length;
      const beforeError = routesToVerify.filter((route: any) => String(route.overallStatus || '').toUpperCase() === 'ERROR').length;

      const checked = await recheckBulkMutation.mutateAsync({
        routes: routesToVerify.map((route: any) => ({
          sourceChainId: route.sourceChainId,
          destChainId: route.destChainId,
        })),
      });
      const readyCount = checked.filter((item: any) => String(item?.overallStatus || '').toUpperCase() === 'READY').length;
      const errorCount = checked.filter((item: any) => String(item?.overallStatus || '').toUpperCase() === 'ERROR').length;
      const allReady = readyCount === routesToVerify.length;
      const summaryMessage = t('admin.crosschain_configs_view.toasts.verify_source_result')
        .replace('{ready}', String(readyCount))
        .replace('{total}', String(routesToVerify.length));
      const firstIssueMessage = checked
        .flatMap((item: any) => Array.isArray(item?.issues) ? item.issues : [])
        .find((issue: any) => String(issue?.status || '').toUpperCase() === 'ERROR')?.message;
      setWizardReport({
        action: 'VERIFY',
        sourceChainId: effectiveSourceChainId,
        totalRoutes: routesToVerify.length,
        beforeReady,
        beforeError,
        afterReady: readyCount,
        afterError: errorCount,
        timestamp: new Date().toISOString(),
      });
      await overviewQuery.refetch();
      await preflightQuery.refetch();
      if (manualStepCompleted.step3) {
        setManualStepCompleted((prev) => ({ ...prev, step4: true }));
        setManualExecution((prev) => ({
          ...prev,
          step4: {
            status: allReady ? 'SUCCESS' : 'FAILED',
            message: summaryMessage,
            txHashes: [],
          },
        }));
      }
      if (allReady) {
        toast.success(summaryMessage);
      } else if (readyCount > 0) {
        toast.warning(firstIssueMessage ? `${summaryMessage} — ${firstIssueMessage}` : summaryMessage);
      } else {
        toast.error(firstIssueMessage ? `${summaryMessage} — ${firstIssueMessage}` : summaryMessage);
      }
    } catch (error: any) {
      if (manualStepCompleted.step3) {
        setManualExecution((prev) => ({
          ...prev,
          step4: { status: 'FAILED', message: error?.message || t('admin.crosschain_configs_view.toasts.recheck_failed'), txHashes: [] },
        }));
      }
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.recheck_failed'));
    }
  };

  const handleExportWizardReport = () => {
    if (!wizardReport) {
      toast.error(t('admin.crosschain_configs_view.toasts.no_report_to_export'));
      return;
    }

    const payload = {
      report: wizardReport,
      filters: {
        sourceChainId,
        destChainId,
        statusFilter,
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeSource = (wizardReport.sourceChainId || 'all').replace(/[^a-zA-Z0-9:-]/g, '_');
    const safeTime = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = url;
    link.download = `crosschain-report-${safeSource}-${safeTime}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(t('admin.crosschain_configs_view.toasts.report_exported'));
  };

  const parseFallbackOrder = (raw: string): number[] => {
    const normalized = String(raw || '')
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item) && item >= 0 && item <= 255);
    return Array.from(new Set(normalized));
  };

  const normalizeUnsignedInteger = (raw: string): string => {
    const trimmed = String(raw || '').trim();
    if (!trimmed) return '';
    return /^[0-9]+$/.test(trimmed) ? trimmed : '';
  };

  const handleSaveRoutePolicy = async () => {
    if (!sourceChainId || !destChainId) {
      toast.error(t('admin.crosschain_configs_view.toasts.select_source_chain_first'));
      return;
    }

    const defaultBridgeType = Number(policyDefaultBridgeType);
    if (!Number.isFinite(defaultBridgeType)) {
      toast.error(t('admin.crosschain_configs_view.toasts.manual_required_fields'));
      return;
    }

    const fallbackOrder = parseFallbackOrder(policyFallbackOrderInput);
    const payload: any = {
      sourceChainId,
      destChainId,
      defaultBridgeType,
      fallbackMode: policyFallbackMode,
      perByteRate: normalizeUnsignedInteger(policyPerByteRate),
      overheadBytes: normalizeUnsignedInteger(policyOverheadBytes),
      minFee: normalizeUnsignedInteger(policyMinFee),
      maxFee: normalizeUnsignedInteger(policyMaxFee),
    };
    if (fallbackOrder.length > 0) {
      payload.fallbackOrder = fallbackOrder;
    }

    try {
      if (activeRoutePolicy?.id) {
        await updateRoutePolicyMutation.mutateAsync({
          id: String(activeRoutePolicy.id),
          data: payload,
        });
      } else {
        await createRoutePolicyMutation.mutateAsync(payload);
      }
      await routePoliciesQuery.refetch();
      await overviewQuery.refetch();
      await preflightQuery.refetch();
      toast.success(t('admin.crosschain_configs_view.toasts.route_policy_saved'));
    } catch (error: any) {
      toast.error(error?.message || t('admin.crosschain_configs_view.toasts.route_policy_save_failed'));
    }
  };

  return {
    state: {
      sourceChainId,
      destChainId,
      statusFilter,
      manualSourceChainId,
      manualDestChainId,
      manualBridgeType,
      manualBridgeOptions,
      manualAdapterAddress,
      manualStateMachineIdHex,
      manualDestinationContractHex,
      manualCCIPChainSelector,
      manualCCIPDestinationAdapterHex,
      manualCCIPDestinationGasLimit,
      manualCCIPDestinationExtraArgsHex,
      manualCCIPDestinationFeeTokenAddress,
      manualCCIPSourceChainSelector,
      manualCCIPTrustedSenderHex,
      manualCCIPAllowSourceChain,
      manualStargateDstEid,
      manualStargateSrcEid,
      manualStargateSenderAddress,
      manualStargateReceiverAddress,
      manualStargatePeerHex,
      manualStargateOptionsHex,
      policyDefaultBridgeType,
      policyFallbackMode,
      policyFallbackOrderInput,
      policyPerByteRate,
      policyOverheadBytes,
      policyMinFee,
      policyMaxFee,
      manualCurrentStep,
      manualStepCompleted,
      manualExecution,
      sourceChains,
      destinationChains,
      manualSourceAdapterContracts,
      manualDestHyperContracts,
      manualDestHBTokenContracts,
      manualDestCCIPContracts,
      manualDestStargateContracts,
      routes,
      activeRoutePolicy,
      selectedSourceRoutes,
      selectedSourceErrorRoutes,
      wizardReport,
      preflight: preflightQuery.data,
      stargateE2EStatus: stargateE2EStatusQuery.data,
      isStargateE2EStatusLoading: stargateE2EStatusQuery.isLoading || stargateE2EStatusQuery.isFetching,
      isRoutePolicyLoading: routePoliciesQuery.isLoading || routePoliciesQuery.isFetching,
      isPreflightLoading: preflightQuery.isLoading || preflightQuery.isFetching,
      isLoading: chainQuery.isLoading || overviewQuery.isLoading,
      isPending,
    },
    actions: {
      setSourceChainId: (value: string) => setMany({ [QUERY_PARAM_KEYS.sourceChainId]: value }),
      setDestChainId: (value: string) => setMany({ [QUERY_PARAM_KEYS.destChainId]: value }),
      setStatusFilter: (value: 'ALL' | 'READY' | 'ERROR') => setMany({ [QUERY_PARAM_KEYS.status]: value }),
      setManualSourceChainId,
      setManualDestChainId,
      setManualBridgeType,
      handleManualSourceChainChange,
      handleManualDestChainChange,
      handleManualBridgeTypeChange,
      setManualAdapterAddress,
      setManualStateMachineIdHex,
      setManualDestinationContractHex,
      setManualCCIPChainSelector,
      setManualCCIPDestinationAdapterHex,
      setManualCCIPDestinationGasLimit,
      setManualCCIPDestinationExtraArgsHex,
      setManualCCIPDestinationFeeTokenAddress,
      setManualCCIPSourceChainSelector,
      setManualCCIPTrustedSenderHex,
      setManualCCIPAllowSourceChain,
      setManualStargateDstEid,
      setManualStargateSrcEid,
      setManualStargateSenderAddress,
      setManualStargateReceiverAddress,
      setManualStargatePeerHex,
      setManualStargateOptionsHex,
      setPolicyDefaultBridgeType,
      setPolicyFallbackMode,
      setPolicyFallbackOrderInput,
      setPolicyPerByteRate,
      setPolicyOverheadBytes,
      setPolicyMinFee,
      setPolicyMaxFee,
      saveRoutePolicy: handleSaveRoutePolicy,
      registerAdapterManual: handleRegisterAdapterManual,
      setDefaultBridgeManual: handleSetDefaultBridgeManual,
      setDefaultBridgeQuick: handleSetDefaultBridgeQuick,
      setHyperbridgeManual: handleSetHyperbridgeManual,
      setHyperbridgeTokenGatewayManual: handleSetHyperbridgeTokenGatewayManual,
      setCCIPManual: handleSetCCIPManual,
      setStargateManual: handleSetStargateManual,
      refresh: async () => {
        await overviewQuery.refetch();
        if (sourceChainId && destChainId) {
          await preflightQuery.refetch();
        }
      },
      recheckRoute: handleRecheck,
      autoFixRoute: handleAutoFix,
      recheckVisible: handleRecheckVisible,
      autoFixVisible: handleAutoFixVisible,
      setupSelectedSource: handleSetupSelectedSource,
      autoFixSelectedSourceErrors: handleAutoFixSelectedSourceErrors,
      verifySelectedSource: handleVerifySelectedSource,
      exportWizardReport: handleExportWizardReport,
      applyPreflightSuggestion: handleApplyPreflightSuggestion,
      runPreflightNextStep: handleRunPreflightNextStep,
      configureStargateE2ESelected: handleConfigureStargateE2ESelected,
    },
  };
};
