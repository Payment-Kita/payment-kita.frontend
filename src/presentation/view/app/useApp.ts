import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAccount, useSwitchChain, useSendTransaction, usePublicClient } from 'wagmi';
import {
  useCreatePaymentAppMutation,
  useChainsQuery,
  useClaimPrivacyEscrowMutation,
  usePaymentPrivacyStatusQuery,
  useRefundPrivacyEscrowMutation,
  useRetryPrivacyForwardMutation,
  useTokensQuery,
} from '@/data/usecase';
import type { CreatePaymentAppRequest } from '@/data/model/request';
import type { PaymentPrivacyRecoveryAction } from '@/data/model/entity';
import { encodeFunctionData, erc20Abi, formatUnits, parseUnits } from 'viem';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { signedProxyHttpClient } from '@/core/network';
import type { RouteErrorDiagnostics } from '@/data/data_source/payment_app_data_source';
import { paymentAppRepository } from '@/data/repositories/repository_impl/payment_app_repository_impl';
import { ChainItemData } from '@/presentation/components/molecules/ChainListItem';
import { TokenItemData } from '@/presentation/components/molecules/TokenListItem';
import { ChainTokenItem } from '@/presentation/components/organisms/ChainTokenSelector';
import { useTranslation } from '@/presentation/hooks';
import { useUnifiedWallet } from '@/presentation/providers/UnifiedWalletProvider';
import {
  formatMoneyDisplay,
  sanitizeNumberWithDecimals,
  stripMoneyFormat,
  validateAddress,
} from '@/core/utils/validators';

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export interface UseAppReturn {
  isConnected: boolean;
  address: string | undefined;
  chains: ChainItemData[];
  tokens: TokenItemData[];
  sourceChainId: string;
  setSourceChainId: (id: string) => void;
  destChainId: string;
  setDestChainId: (id: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  sourceTokenAddress: string;
  destTokenAddress: string;
  receiver: string;
  setReceiver: (addr: string) => void;
  paymentMode: 'regular' | 'privacy';
  setPaymentMode: (mode: 'regular' | 'privacy') => void;
  bridgeOptionSelection: 'default' | '0' | '1' | '2';
  setBridgeOptionSelection: (value: 'default' | '0' | '1' | '2') => void;
  bridgeTokenSource: string;
  setBridgeTokenSource: (value: string) => void;
  minBridgeAmountOut: string;
  setMinBridgeAmountOut: (value: string) => void;
  minDestAmountOut: string;
  setMinDestAmountOut: (value: string) => void;
  filteredTokens: TokenItemData[];
  selectedToken: TokenItemData | undefined;
  chainTokenItems: ChainTokenItem[];
  selectedSourceChainTokenId?: string;
  selectedDestChainTokenId?: string;
  handleSourceChainTokenSelect: (item: ChainTokenItem) => void;
  handleDestChainTokenSelect: (item: ChainTokenItem) => void;
  amountDisplay: string;
  handleAmountChange: (value: string) => void;
  handleMaxClick: () => void;
  selectedTokenSymbol: string;
  formattedBalance: string;
  canUseMax: boolean;
  addressError: string | null;
  receiverPlaceholder: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  routeErrorDiagnostics: RouteErrorDiagnostics | null;
  paymentCostPreview: {
    sourceAmountRaw: string;
    sourceAmountDisplay: string;
    platformFeeRaw: string;
    platformFeeDisplay: string;
    bridgeFeeNativeRaw: string;
    totalSourceRequiredRaw: string;
    totalSourceRequiredDisplay: string;
    bridgeQuoteOk: boolean | null;
    bridgeQuoteReason: string;
    bridgeType?: number;
    isSameChain?: boolean;
    feeSource: 'onchain' | 'legacy';
  } | null;
  txPlanPreview: {
    chainType: 'EVM' | 'SVM' | 'UNKNOWN';
    approval?: {
      to?: string;
      spender?: string;
      amount?: string;
      data?: string;
    };
    transactions: Array<{
      kind?: string;
      to?: string;
      value?: string;
      data?: string;
      spender?: string;
      amount?: string;
    }>;
    finalCall?: {
      to?: string;
      value?: string;
      data?: string;
      programId?: string;
    };
  } | null;
  txHash: string | null;
  activePaymentId: string | null;
  privacyStatus: {
    paymentId: string;
    stage: string;
    isPrivacyCandidate: boolean;
    signals?: string[];
    reason?: string;
  } | null;
  privacyStatusLoading: boolean;
  privacyStatusError: string | null;
  privacyActionLoading: boolean;
  privacyActionError: string | null;
  handlePrivacyAction: (action: PaymentPrivacyRecoveryAction) => Promise<void>;
  currentChain: any | undefined;
  handlePay: () => void;
  isOwnAddress: boolean;
  setIsOwnAddress: (val: boolean) => void;
  handleReversePair: () => void;
}

export interface CreatePaymentAppParams {
  sourceChainId: string;
  destChainId: string;
  sourceTokenAddress: string;
  destTokenAddress: string;
  amount: string;
  decimals: number;
  receiverAddress: string;
}

export function useApp(): UseAppReturn {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { address: evmAddress, isConnected: isEvmConnected, chainId } = useAccount();
  const { publicKey, sendTransaction: sendSolTransaction } = useWallet();
  const isSvmConnected = Boolean(publicKey);
  const isConnected = isEvmConnected || isSvmConnected;
  const address = isEvmConnected ? evmAddress : publicKey?.toBase58();
  
  const { data: chainsData } = useChainsQuery();
  const { data: tokensData } = useTokensQuery();
  const { switchChain } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();
  const { getNativeBalance, getErc20Balance, getSplTokenBalance } = useUnifiedWallet();
  const createPaymentMutation = useCreatePaymentAppMutation();
  const retryPrivacyMutation = useRetryPrivacyForwardMutation();
  const claimPrivacyMutation = useClaimPrivacyEscrowMutation();
  const refundPrivacyMutation = useRefundPrivacyEscrowMutation();
  const { connection } = useConnection();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeErrorDiagnostics, setRouteErrorDiagnostics] = useState<RouteErrorDiagnostics | null>(null);
  const [paymentCostPreview, setPaymentCostPreview] = useState<UseAppReturn['paymentCostPreview']>(null);
  const [txPlanPreview, setTxPlanPreview] = useState<UseAppReturn['txPlanPreview']>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [privacyActionError, setPrivacyActionError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [sourceChainId, setSourceChainId] = useState('');
  const [destChainId, setDestChainId] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceTokenAddress, setSourceTokenAddress] = useState('');
  const [destTokenAddress, setDestTokenAddress] = useState('');
  const [receiver, setReceiver] = useState('');
  const [paymentMode, setPaymentMode] = useState<'regular' | 'privacy'>('regular');
  const [bridgeOptionSelection, setBridgeOptionSelection] = useState<'default' | '0' | '1' | '2'>('default');
  const [bridgeTokenSource, setBridgeTokenSource] = useState('');
  const [minBridgeAmountOut, setMinBridgeAmountOut] = useState('');
  const [minDestAmountOut, setMinDestAmountOut] = useState('');
  const [isOwnAddress, setIsOwnAddress] = useState(false);
  const [initializedFromQuery, setInitializedFromQuery] = useState(false);
  const {
    data: privacyStatusResponse,
    isLoading: privacyStatusLoading,
    error: privacyStatusQueryError,
    refetch: refetchPrivacyStatus,
  } = usePaymentPrivacyStatusQuery(activePaymentId || '');
  const privacyStatus = privacyStatusResponse?.privacyStatus ?? null;
  const privacyStatusError =
    privacyStatusQueryError instanceof Error
      ? privacyStatusQueryError.message
      : privacyStatusQueryError
        ? 'Failed to fetch privacy status'
        : null;
  const privacyActionLoading =
    retryPrivacyMutation.isPending || claimPrivacyMutation.isPending || refundPrivacyMutation.isPending;

  // Derived Data
  const chainItems = useMemo<ChainItemData[]>(() => 
    (chainsData?.items || []).map((chain) => ({
      id: String(chain.id),
      networkId: String(chain.networkId || chain.id),
      name: chain.name,
      logoUrl: chain.logoUrl,
      chainType: chain.chainType,
      explorerUrl: chain.explorerUrl,
    })), [chainsData]);

  const tokenItems = useMemo<TokenItemData[]>(() => 
    ((tokensData?.items as any[]) || []).map((token: any) => ({
      id: token.id,
      symbol: token.symbol,
      name: token.name,
      logoUrl: token.logoUrl,
      address: token.contractAddress,
      isNative: token.isNative,
      chainId: String(token.chainId),
      decimals: token.decimals,
    })), [tokensData]);

  const filteredTokens = useMemo(() => 
    tokenItems.filter((token) => token.chainId === sourceChainId),
    [tokenItems, sourceChainId]
  );

  const selectedToken = useMemo(() => 
    filteredTokens.find(
      (token) =>
        token.address === sourceTokenAddress ||
        (token.isNative && sourceTokenAddress === '0x0000000000000000000000000000000000000000')
    ), [filteredTokens, sourceTokenAddress]);

  const selectedDestToken = useMemo(
    () =>
      tokenItems.find(
        (token) =>
          token.chainId === destChainId &&
          (token.address === destTokenAddress ||
            (token.isNative && destTokenAddress === '0x0000000000000000000000000000000000000000'))
      ),
    [tokenItems, destChainId, destTokenAddress]
  );

  const chainTokenItems = useMemo<ChainTokenItem[]>(
    () =>
      tokenItems
        .map((token) => {
          const chain = chainItems.find((item) => item.id === token.chainId);
          if (!chain || !token.address) return null;
          const normalizedChainType = String(chain.chainType || '').toUpperCase();
          const parsedNetworkId = Number(String(chain.networkId || '').trim());
          const evmChainId =
            normalizedChainType === 'EVM' && Number.isFinite(parsedNetworkId) && parsedNetworkId > 0
              ? parsedNetworkId
              : undefined;

          return {
            id: `${chain.id}:${token.id}`,
            chainId: chain.id,
            chainName: chain.name,
            chainLogoUrl: chain.logoUrl,
            chainType: normalizedChainType,
            evmChainId,
            tokenName: token.name,
            tokenSymbol: token.symbol,
            tokenAddress: token.isNative
              ? '0x0000000000000000000000000000000000000000'
              : String(token.address),
            tokenLogoUrl: token.logoUrl,
            decimals: token.decimals,
            isNative: token.isNative,
          };
        })
        .filter(Boolean) as ChainTokenItem[],
    [chainItems, tokenItems]
  );

  const selectedSourceChainTokenId = useMemo(() => {
    if (!sourceChainId || !sourceTokenAddress) return undefined;
    return chainTokenItems.find(
      (item) =>
        item.chainId === sourceChainId &&
        item.tokenAddress.toLowerCase() === sourceTokenAddress.toLowerCase()
    )?.id;
  }, [chainTokenItems, sourceChainId, sourceTokenAddress]);

  const selectedDestChainTokenId = useMemo(() => {
    if (!destChainId || !destTokenAddress) return undefined;
    return chainTokenItems.find(
      (item) =>
        item.chainId === destChainId &&
        item.tokenAddress.toLowerCase() === destTokenAddress.toLowerCase()
    )?.id;
  }, [chainTokenItems, destChainId, destTokenAddress]);

  const handleSourceChainTokenSelect = (item: ChainTokenItem) => {
    setSourceChainId(item.chainId);
    if (!destChainId) setDestChainId(item.chainId);
    setSourceTokenAddress(item.tokenAddress);
  };

  const handleDestChainTokenSelect = (item: ChainTokenItem) => {
    setDestChainId(item.chainId);
    setDestTokenAddress(item.tokenAddress);
  };

  const handleReversePair = () => {
    const tempChainId = sourceChainId;
    const tempTokenAddress = sourceTokenAddress;

    setSourceChainId(destChainId);
    setSourceTokenAddress(destTokenAddress);

    setDestChainId(tempChainId);
    setDestTokenAddress(tempTokenAddress);
  };

  const selectedDestChain = useMemo(
    () => chainItems.find((chain) => chain.id === destChainId),
    [chainItems, destChainId]
  );

  const receiverPlaceholder = useMemo(() => {
    const type = String(selectedDestChain?.chainType || '').toUpperCase();
    if (type === 'SVM') return 'So11111111111111111111111111111111111111112';
    return '0x...';
  }, [selectedDestChain?.chainType]);

  const addressError = useMemo(() => {
    if (!receiver || !selectedDestChain?.chainType) return null;
    const result = validateAddress(receiver, String(selectedDestChain.chainType));
    return result === true ? null : result;
  }, [receiver, selectedDestChain?.chainType]);

  const [walletBalance, setWalletBalance] = useState<{ formatted: string; symbol: string } | null>(null);

  const sourceChainType = useMemo(
    () => String(chainItems.find((chain) => chain.id === sourceChainId)?.chainType || '').toUpperCase(),
    [chainItems, sourceChainId]
  );

  useEffect(() => {
    let mounted = true;
    const fetchBalance = async () => {
      if (!sourceChainId || !sourceTokenAddress) {
        if (mounted) setWalletBalance(null);
        return;
      }
      try {
        if (sourceChainType === 'EVM') {
          if (!isEvmConnected) {
            if (mounted) setWalletBalance(null);
            return;
          }
          const result =
            sourceTokenAddress === '0x0000000000000000000000000000000000000000'
              ? await getNativeBalance({ ecosystem: 'evm' })
              : await getErc20Balance(sourceTokenAddress as `0x${string}`, {
                  decimals: selectedToken?.decimals,
                });
          if (mounted) {
            setWalletBalance(result ? { formatted: result.formatted, symbol: result.symbol } : null);
          }
          return;
        }

        if (sourceChainType === 'SVM') {
          if (!isSvmConnected) {
            if (mounted) setWalletBalance(null);
            return;
          }
          const result =
            selectedToken?.isNative
              ? await getNativeBalance({ ecosystem: 'svm' })
              : await getSplTokenBalance(sourceTokenAddress);
          if (mounted) {
            setWalletBalance(result ? { formatted: result.formatted, symbol: result.symbol } : null);
          }
          return;
        }

        if (mounted) setWalletBalance(null);
      } catch {
        if (mounted) setWalletBalance(null);
      }
    };

    void fetchBalance();
    return () => {
      mounted = false;
    };
  }, [
    sourceChainId,
    sourceTokenAddress,
    sourceChainType,
    isEvmConnected,
    isSvmConnected,
    selectedToken?.decimals,
    selectedToken?.isNative,
    getNativeBalance,
    getErc20Balance,
    getSplTokenBalance,
  ]);
  
  useEffect(() => {
    if (isOwnAddress) {
      setReceiver(address || '');
    }
  }, [isOwnAddress, address]);

  const formattedBalance = walletBalance?.formatted || '0';
  const canUseMax = Boolean(walletBalance && sourceChainId && sourceTokenAddress);
  const selectedTokenSymbol = selectedToken?.symbol || walletBalance?.symbol || '';
  const [amountDisplay, setAmountDisplay] = useState('');

  const resolveChainSelectorId = (value: string) => {
    if (!value) return '';
    const found = (chainsData?.items || []).find((chain) =>
      String(chain.id) === value ||
      String(chain.networkId) === value ||
      chain.caip2 === value ||
      `${chain.namespace}:${chain.networkId}` === value
    );
    return found ? String(found.id) : '';
  };

  const caip2ToEvmChainId = (value: string): number => {
    if (!value) return NaN;
    if (value.startsWith('eip155:')) return Number(value.split(':')[1]);
    return Number(value);
  };

  // Initialization Logic
  useEffect(() => {
    if (!searchParams || initializedFromQuery || !chainsData?.items?.length) return;

    const amountParam = searchParams.get('amount') || '';
    const tokenParam = searchParams.get('tokenAddress') || '';
    const destTokenParam = searchParams.get('destTokenAddress') || tokenParam;
    const chainParam = searchParams.get('chainId') || '';
    const destChainParam = searchParams.get('destChainId') || chainParam;
    const receiverParam = searchParams.get('receiver') || '';

    const resolvedChainId = resolveChainSelectorId(chainParam);

    setAmount(amountParam);
    setSourceTokenAddress(tokenParam);
    setDestTokenAddress(destTokenParam);
    setReceiver(receiverParam);
    setSourceChainId(resolvedChainId);
    setDestChainId(resolveChainSelectorId(destChainParam) || resolvedChainId);

    const apiKey = searchParams.get('apiKey');
    const secretKey = searchParams.get('secretKey');
    if (apiKey && secretKey) {
      signedProxyHttpClient.setCredentials(apiKey, secretKey);
    }

    setInitializedFromQuery(true);
  }, [searchParams, chainsData, initializedFromQuery]);

  useEffect(() => {
    if (!initializedFromQuery || !searchParams) return;

    const params = new URLSearchParams(searchParams.toString());
    const sourceChain = (chainsData?.items || []).find((chain) => String(chain.id) === sourceChainId);
    const destChain = (chainsData?.items || []).find((chain) => String(chain.id) === destChainId);
    const sourceChainQuery = sourceChain?.caip2 || sourceChainId;
    const destChainQuery = destChain?.caip2 || destChainId;

    if (sourceChainQuery) params.set('chainId', sourceChainQuery);
    else params.delete('chainId');

    if (destChainQuery) params.set('destChainId', destChainQuery);
    else params.delete('destChainId');

    if (sourceTokenAddress) params.set('tokenAddress', sourceTokenAddress);
    else params.delete('tokenAddress');

    if (destTokenAddress) params.set('destTokenAddress', destTokenAddress);
    else params.delete('destTokenAddress');

    if (amount) params.set('amount', amount);
    else params.delete('amount');

    if (receiver) params.set('receiver', receiver);
    else params.delete('receiver');

    const current = searchParams.toString();
    const next = params.toString();
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [
    initializedFromQuery,
    searchParams,
    router,
    pathname,
    chainsData,
    sourceChainId,
    destChainId,
    sourceTokenAddress,
    destTokenAddress,
    amount,
    receiver,
  ]);

  useEffect(() => {
    if (!amount) {
      setAmountDisplay('');
      return;
    }
    setAmountDisplay(formatMoneyDisplay(amount));
  }, [amount]);

  const handleAmountChange = (value: string) => {
    const raw = stripMoneyFormat(value);
    const decimals = selectedToken?.decimals ?? 18;
    const sanitized = sanitizeNumberWithDecimals(raw, decimals);
    setAmount(sanitized);
    setAmountDisplay(formatMoneyDisplay(sanitized));
  };

  const handleMaxClick = () => {
    if (!formattedBalance) return;
    const decimals = selectedToken?.decimals ?? 18;
    const sanitized = sanitizeNumberWithDecimals(formattedBalance, decimals);
    setAmount(sanitized);
    setAmountDisplay(formatMoneyDisplay(sanitized));
  };

  const handlePrivacyAction = async (action: PaymentPrivacyRecoveryAction) => {
    try {
      setPrivacyActionError(null);
      if (!activePaymentId) {
        throw new Error('No active paymentId for privacy recovery');
      }
      if (!isEvmConnected || !evmAddress) {
        throw new Error(t('payments.connect_wallet_notice'));
      }

      const txData = await (async () => {
        if (action === 'retry') {
          return retryPrivacyMutation.mutateAsync(activePaymentId);
        }
        if (action === 'claim') {
          return claimPrivacyMutation.mutateAsync(activePaymentId);
        }
        return refundPrivacyMutation.mutateAsync(activePaymentId);
      })();

      const targetChainIdNum = caip2ToEvmChainId(txData.chainId || '');
      if (Number.isFinite(targetChainIdNum) && targetChainIdNum > 0 && chainId !== targetChainIdNum) {
        await switchChain({ chainId: targetChainIdNum });
      }

      const hash = await sendTransactionAsync({
        to: txData.contractAddress as `0x${string}`,
        data: txData.calldata as `0x${string}`,
        value: txData.value ? BigInt(txData.value) : parseUnits('0', 0),
      });
      setTxHash(hash);
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== 'success') {
          throw new Error('Privacy recovery transaction failed');
        }
      }
      await refetchPrivacyStatus();
    } catch (e: any) {
      const message = e instanceof Error ? e.message : 'Failed to execute privacy recovery action';
      setPrivacyActionError(message);
    }
  };

  const handlePay = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    setActivePaymentId(null);
    setPrivacyActionError(null);
    setError(null);
    setRouteErrorDiagnostics(null);
    setPaymentCostPreview(null);
    setTxPlanPreview(null);
    let diagnosticsTarget: { paymentId: string; sourceChainId: string } | null = null;
    try {
      if (!isEvmConnected || !evmAddress) {
        throw new Error(t('payments.connect_wallet_notice'));
      }

      if (!sourceChainId || !destChainId || !sourceTokenAddress || !destTokenAddress || !amount || !receiver) {
        throw new Error(t('app_view.complete_fields_error'));
      }
      if (addressError) {
        throw new Error(addressError);
      }
      const bridgeTokenSourceValue = bridgeTokenSource.trim();
      if (bridgeTokenSourceValue && !/^0x[a-fA-F0-9]{40}$/.test(bridgeTokenSourceValue)) {
        throw new Error('Bridge Token Source must be a valid EVM address');
      }
      const sourceDecimals = selectedToken?.decimals ?? 18;
      const destDecimals = selectedDestToken?.decimals ?? sourceDecimals;
      const bridgeTokenDecimals = (() => {
        if (!bridgeTokenSourceValue) return sourceDecimals;
        const token = tokenItems.find(
          (item) =>
            item.chainId === sourceChainId &&
            String(item.address || '').toLowerCase() === bridgeTokenSourceValue.toLowerCase()
        );
        return token?.decimals ?? sourceDecimals;
      })();
      const parseDisplayAmountToRaw = (displayValue: string, decimals: number, label: string): string | null => {
        const normalized = stripMoneyFormat(displayValue).replace(/,/g, '').trim();
        if (!normalized) return null;
        if (!/^\d+(\.\d+)?$/.test(normalized)) {
          throw new Error(`${label} must be a valid number`);
        }
        try {
          return parseUnits(normalized, decimals).toString();
        } catch {
          throw new Error(`${label} is invalid for token decimals`);
        }
      };
      const minBridgeAmountOutValue = parseDisplayAmountToRaw(
        minBridgeAmountOut,
        bridgeTokenDecimals,
        'Min Bridge Amount Out'
      );
      const minDestAmountOutValue = parseDisplayAmountToRaw(
        minDestAmountOut,
        destDecimals,
        'Min Destination Amount Out'
      );

      const selectedSourceChain = (chainsData?.items || []).find((chain) => String(chain.id) === sourceChainId);
      const selectedDestChain = (chainsData?.items || []).find((chain) => String(chain.id) === destChainId);

      // 1. Create Payment Record on Backend
      const request: CreatePaymentAppRequest = {
        senderWalletAddress: isEvmConnected ? evmAddress! : publicKey!.toBase58(),
        sourceChainId: selectedSourceChain?.caip2 || sourceChainId,
        destChainId: selectedDestChain?.caip2 || destChainId,
        sourceTokenAddress,
        destTokenAddress,
        amount,
        decimals: selectedToken?.decimals ?? 18,
        receiverAddress: receiver,
        mode: paymentMode,
        bridgeOption: bridgeOptionSelection === 'default' ? null : Number(bridgeOptionSelection),
        bridgeTokenSource: bridgeTokenSourceValue || null,
        minBridgeAmountOut: minBridgeAmountOutValue || null,
        minDestAmountOut: minDestAmountOutValue || null,
        privacyIntentId: null,
        privacyStealthReceiver: null,
      };
      
      const payment = await createPaymentMutation.mutateAsync(request);
      if (!payment) throw new Error(t('pay_page.process_failed'));
      setActivePaymentId(payment.paymentId);
      const paymentSourceChain = String(payment.sourceChainId || selectedSourceChain?.caip2 || '');
      const previewChainType: 'EVM' | 'SVM' | 'UNKNOWN' = paymentSourceChain.startsWith('eip155:')
        ? 'EVM'
        : paymentSourceChain.startsWith('solana:')
          ? 'SVM'
          : 'UNKNOWN';
      const previewTransactions = Array.isArray(payment.signatureData?.transactions)
        ? payment.signatureData.transactions.map((item) => ({
          kind: item?.kind,
          to: item?.to,
          value: undefined,
          data: item?.data,
          spender: item?.spender,
          amount: item?.amount,
        }))
        : [];
      setTxPlanPreview({
        chainType: previewChainType,
        approval: payment.signatureData?.approval
          ? {
            to: payment.signatureData.approval.to,
            spender: payment.signatureData.approval.spender,
            amount: payment.signatureData.approval.amount,
            data: payment.signatureData.approval.data,
          }
          : undefined,
        transactions: previewTransactions,
        finalCall: {
          to: payment.signatureData?.to,
          value: payment.signatureData?.value,
          data: payment.signatureData?.data,
          programId: payment.signatureData?.programId,
        },
      });

      const sourceChain = payment.sourceChainId || selectedSourceChain?.caip2 || '';
      if (!sourceChain) throw new Error(t('common.error'));
      diagnosticsTarget = { paymentId: payment.paymentId, sourceChainId: sourceChain };

      if (sourceChain.startsWith('eip155:')) {
        if (!isEvmConnected || !evmAddress) throw new Error(t('payments.connect_wallet_notice'));
        const targetChainIdNum = caip2ToEvmChainId(sourceChain);
        if (chainId !== targetChainIdNum) {
          await switchChain({ chainId: targetChainIdNum });
        }

        const approvalTo = payment.signatureData?.approval?.to as `0x${string}` | undefined;
        const approvalSpender = payment.signatureData?.approval?.spender as `0x${string}` | undefined;
        const approvalAmountRaw = String(payment.signatureData?.approval?.amount || '').trim();
        const approvalDataRaw = payment.signatureData?.approval?.data as `0x${string}` | undefined;
        let approvalData = approvalDataRaw;

        const sourceAmountUnits = parseUnits(amount, selectedToken?.decimals ?? 18);
        const expectedApprovalAmount = (() => {
          const onchainTotalRaw = String(payment.onchainCost?.totalSourceTokenRequired || '').trim();
          if (onchainTotalRaw) {
            try {
              return BigInt(onchainTotalRaw);
            } catch {
              // fallback below
            }
          }

          const feeUnits = (() => {
            const raw = String(payment.feeBreakdown?.totalFee || '').trim();
            if (!raw) return BigInt(0);
            try {
              return BigInt(raw);
            } catch {
              return BigInt(0);
            }
          })();
          return sourceAmountUnits + feeUnits;
        })();
        const approvalAmount = (() => {
          if (approvalAmountRaw) {
            try {
              return BigInt(approvalAmountRaw);
            } catch {
              return expectedApprovalAmount;
            }
          }
          return expectedApprovalAmount;
        })();

        const toDisplayAmount = (raw: string) => {
          try {
            const normalized = raw.trim() || '0';
            const decimals = selectedToken?.decimals ?? 18;
            return formatMoneyDisplay(formatUnits(BigInt(normalized), decimals));
          } catch {
            return '0';
          }
        };

        const onchainCost = payment.onchainCost;
        const platformFeeRaw = String(onchainCost?.platformFeeToken || payment.feeBreakdown?.platformFee || '0');
        const totalSourceRequiredRaw = approvalAmount.toString();
        const sourceAmountRaw = sourceAmountUnits.toString();

        setPaymentCostPreview({
          sourceAmountRaw,
          sourceAmountDisplay: toDisplayAmount(sourceAmountRaw),
          platformFeeRaw,
          platformFeeDisplay: toDisplayAmount(platformFeeRaw),
          bridgeFeeNativeRaw: String(onchainCost?.bridgeFeeNative || '0'),
          totalSourceRequiredRaw,
          totalSourceRequiredDisplay: toDisplayAmount(totalSourceRequiredRaw),
          bridgeQuoteOk: typeof onchainCost?.bridgeQuoteOk === 'boolean' ? onchainCost.bridgeQuoteOk : null,
          bridgeQuoteReason: String(onchainCost?.bridgeQuoteReason || ''),
          bridgeType: onchainCost?.bridgeType,
          isSameChain: onchainCost?.isSameChain,
          feeSource: onchainCost ? 'onchain' : 'legacy',
        });

        if (approvalTo && approvalSpender) {
          approvalData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [approvalSpender, approvalAmount],
          });
        }

        if (approvalTo && approvalData) {
          const approvalHash = await sendTransactionAsync({
            to: approvalTo,
            data: approvalData,
            value: parseUnits('0', 0),
          });
          if (publicClient) {
            const receipt = await publicClient.waitForTransactionReceipt({ hash: approvalHash });
            if (receipt.status !== 'success') {
              throw new Error('Approval transaction failed');
            }
          }
        }

        const hash = await sendTransactionAsync({
          to: payment.signatureData?.to as `0x${string}`,
          data: payment.signatureData?.data as `0x${string}`,
          value: payment.signatureData?.value ? BigInt(payment.signatureData.value) : parseUnits('0', 0),
        });
        setTxHash(hash);
      } else if (sourceChain.startsWith('solana:')) {
        if (!publicKey || !sendSolTransaction) throw new Error(t('pay_page.connect_solana'));
        if (!payment.signatureData?.programId || !payment.signatureData?.data) {
          throw new Error(t('common.error'));
        }
        if (!sourceTokenAddress || sourceTokenAddress.startsWith('0x')) {
          throw new Error(t('common.error'));
        }

        const programId = new PublicKey(payment.signatureData.programId);
        const instructionData = decodeBase58(payment.signatureData.data);
        const paymentIdBytes32 = uuidToBytes32(payment.paymentId);
        const sourceMint = new PublicKey(sourceTokenAddress);

        const [configPda] = PublicKey.findProgramAddressSync([utf8('config')], programId);
        const [paymentPda] = PublicKey.findProgramAddressSync([utf8('payment'), paymentIdBytes32], programId);
        const [vaultTokenPda] = PublicKey.findProgramAddressSync([utf8('vault'), configPda.toBytes()], programId);
        const senderTokenAccount = deriveAssociatedTokenAddress(publicKey, sourceMint);

        const ix = new TransactionInstruction({
          programId,
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: configPda, isSigner: false, isWritable: false },
            { pubkey: paymentPda, isSigner: false, isWritable: true },
            { pubkey: senderTokenAccount, isSigner: false, isWritable: true },
            { pubkey: vaultTokenPda, isSigner: false, isWritable: true },
            { pubkey: sourceMint, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          data: Buffer.from(instructionData),
        });

        const { blockhash } = await connection.getLatestBlockhash();
        const tx = new Transaction();
        tx.feePayer = publicKey;
        tx.recentBlockhash = blockhash;
        tx.add(ix);

        const sig = await sendSolTransaction(tx, connection);
        setTxHash(sig);
      } else {
        throw new Error(`Unsupported source chain: ${sourceChain}`);
      }
      setIsSuccess(true);

    } catch (e: any) {
      console.error(e);
      let message = e instanceof Error ? e.message : '';
      const shouldDiagnose =
        !!diagnosticsTarget &&
        (message.toLowerCase().includes('route payment failed') ||
          message.toLowerCase().includes('execution reverted') ||
          message.includes('#1002'));
      if (shouldDiagnose && diagnosticsTarget) {
        try {
          const diagnostics = await paymentAppRepository.getRouteErrorDiagnostics({
            sourceChainId: diagnosticsTarget.sourceChainId,
            paymentId: diagnosticsTarget.paymentId,
          });
          if (diagnostics) {
            setRouteErrorDiagnostics(diagnostics);
            const hint = buildRouteErrorHint(diagnostics);
            if (hint) {
              message = `${message || t('pay_page.process_failed')} (${hint})`;
            } else {
              const decodedName = diagnostics.decoded?.name || diagnostics.decoded?.selector;
              const decodedMessage = diagnostics.decoded?.message;
              if (decodedName || decodedMessage) {
                message = `${message || t('pay_page.process_failed')} (${[decodedName, decodedMessage].filter(Boolean).join(': ')})`;
              }
            }
          }
        } catch (diagErr) {
          console.warn('failed to fetch route diagnostics', diagErr);
        }
      }
      setError(message || t('pay_page.process_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!activePaymentId || paymentMode !== 'privacy') return;
    const stage = String(privacyStatus?.stage || '').toLowerCase();
    if (stage === 'privacy_forwarded_final' || stage === 'not_privacy') return;
    const timer = setInterval(() => {
      void refetchPrivacyStatus();
    }, 5000);
    return () => clearInterval(timer);
  }, [activePaymentId, paymentMode, privacyStatus?.stage, refetchPrivacyStatus]);

  return {
    isConnected,
    address,
    chains: chainItems,
    tokens: tokenItems,
    sourceChainId,
    setSourceChainId,
    destChainId,
    setDestChainId,
    amount,
    setAmount,
    sourceTokenAddress,
    destTokenAddress,
    receiver,
    setReceiver,
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
    filteredTokens,
    selectedToken,
    chainTokenItems,
    selectedSourceChainTokenId,
    selectedDestChainTokenId,
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
    isLoading,
    isSuccess,
    error,
    routeErrorDiagnostics,
    paymentCostPreview,
    txPlanPreview,
    txHash,
    activePaymentId,
    privacyStatus,
    privacyStatusLoading,
    privacyStatusError,
    privacyActionLoading,
    privacyActionError,
    handlePrivacyAction,
    currentChain: chainsData?.items?.find(c => String(c.networkId) === String(chainId) || c.id === chainId),
    handlePay,
    isOwnAddress,
    setIsOwnAddress,
    handleReversePair,
  };
}

function buildRouteErrorHint(diagnostics: RouteErrorDiagnostics): string {
  const name = diagnostics.decoded?.name || '';
  const details = diagnostics.decoded?.details as Record<string, unknown> | undefined;
  if (name === 'RouteNotConfigured') {
    const dest = String(details?.destChainId || '');
    return dest ? `route belum dikonfigurasi untuk ${dest}` : 'route belum dikonfigurasi';
  }
  if (name === 'ChainSelectorMissing') {
    const dest = String(details?.destChainId || '');
    return dest ? `CCIP chain selector belum diset untuk ${dest}` : 'CCIP chain selector belum diset';
  }
  if (name === 'DestinationAdapterMissing') {
    const dest = String(details?.destChainId || '');
    return dest ? `adapter tujuan belum diset untuk ${dest}` : 'adapter tujuan belum diset';
  }
  if (name === 'StateMachineIdNotSet') {
    const dest = String(details?.destChainId || '');
    return dest ? `state machine id Hyperbridge belum diset untuk ${dest}` : 'state machine id Hyperbridge belum diset';
  }
  if (name === 'DestinationNotSet') {
    const dest = String(details?.destChainId || '');
    return dest ? `destination Hyperbridge belum diset untuk ${dest}` : 'destination Hyperbridge belum diset';
  }
  if (name === 'InsufficientNativeFee') {
    const required = String(details?.requiredWei || '');
    const provided = String(details?.providedWei || '');
    if (required && provided) {
      return `native fee kurang (required ${required} wei, provided ${provided} wei)`;
    }
    return 'native fee kurang';
  }
  if (name === 'NativeFeeQuoteUnavailable') {
    return 'fee quote bridge belum tersedia';
  }
  if (name === 'FeeQuoteFailed') {
    return 'fee quote bridge gagal';
  }
  return '';
}

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

function deriveAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return ata;
}

function decodeBase58(input: string): Uint8Array {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const base = BigInt(58);
  let value = BigInt(0);
  for (const c of input) {
    const idx = alphabet.indexOf(c);
    if (idx < 0) throw new Error('invalid base58');
    value = value * base + BigInt(idx);
  }
  const out: number[] = [];
  while (value > 0) {
    out.push(Number(value % BigInt(256)));
    value /= BigInt(256);
  }
  out.reverse();
  let leading = 0;
  while (leading < input.length && input[leading] === '1') leading += 1;
  return new Uint8Array([...new Array(leading).fill(0), ...out]);
}

function utf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function uuidToBytes32(value: string): Uint8Array {
  const hex = value.replace(/-/g, '');
  if (hex.length !== 32) throw new Error('invalid uuid');
  const out = new Uint8Array(32);
  for (let i = 0; i < 16; i += 1) {
    out[16 + i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
