import { useMemo, useState } from 'react';
import { useTokenList } from '@/presentation/hooks/useTokenList/useTokenList';
import { useAdminChains, useAdminContracts } from '@/data/usecase/useAdmin';
import { useCreateToken } from '@/presentation/hooks/useTokenList/useCreateToken';
import { useUpdateToken } from '@/presentation/hooks/useTokenList/useUpdateToken';
import { useDeleteToken } from '@/presentation/hooks/useTokenList/useDeleteToken';
import { useDebounce } from '@/presentation/hooks/useDebounce';
import { useUrlQueryState } from '@/presentation/hooks';
import { QUERY_PARAM_KEYS } from '@/core/constants';
import { SupportedTokenEntity } from '@/src/domain/entity/token/TokenEntity';
import { useCheckTokenPairSupport } from '@/data/usecase/useAdmin';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TOKEN_SWAPPER_ABI } from '@/core/constants/abis';
import { toast } from 'sonner';
import { useTranslation } from '@/presentation/hooks';

export const useAdminTokens = () => {
  const { t } = useTranslation();
  const { getString, getNumber, getSearch, setMany } = useUrlQueryState();
  const searchTerm = getSearch();
  const filterChainId = getString(QUERY_PARAM_KEYS.chainId);
  const page = getNumber(QUERY_PARAM_KEYS.page, 1);
  const [limit] = useState(10);

  const { isConnected, chain: currentChain } = useAccount();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    decimals: 18,
    logoUrl: '',
    type: 'ERC20',
    chainId: '',
    contractAddress: '',
    minAmount: '',
    maxAmount: '',
  });

  const [pairCheckChainId, setPairCheckChainId] = useState('');
  const [tokenInId, setTokenInId] = useState('');
  const [tokenOutId, setTokenOutId] = useState('');
  const [pairCheckResult, setPairCheckResult] = useState<{ exists: boolean; isDirect: boolean; path: string[]; executable?: boolean; reasons?: string[]; swapRouterV3?: string; universalRouter?: string } | null>(null);

  // Registration state
  const [directFee, setDirectFee] = useState<number>(3000);
  const [intermediateTokenIds, setIntermediateTokenIds] = useState<string[]>([]);

  const checkPairSupport = useCheckTokenPairSupport();

  const activeTab = getString('tab') || 'tokens';
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch Tokens
  const { data: tokenData, isLoading: isTokensLoading } = useTokenList({
    chainId: filterChainId || undefined,
    search: debouncedSearch,
    page,
    limit,
  });

  // Fetch ALL tokens for verification tab (no pagination)
  const { data: verificationTokensData } = useTokenList({
    chainId: pairCheckChainId || undefined,
    limit: 0,
  }, {
    enabled: activeTab === 'verification' && !!pairCheckChainId,
  });

  // Fetch Chains
  const { data: chains } = useAdminChains();

  // Fetch Swapper Contract for the selected chain
  const { data: swapperContracts } = useAdminContracts(1, 1, pairCheckChainId, 'TOKEN_SWAPPER');
  const swapperAddress = swapperContracts?.items?.[0]?.contractAddress as `0x${string}` | undefined;

  const createToken = useCreateToken();
  const updateToken = useUpdateToken();
  const deleteToken = useDeleteToken();

  // Wagmi Write Contract
  const { writeContract, data: hash, isPending: isTxPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ symbol: '', name: '', decimals: 18, logoUrl: '', type: 'ERC20', chainId: filterChainId || '', contractAddress: '', minAmount: '', maxAmount: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (token: SupportedTokenEntity) => {
    setEditingId(token.id);
    setFormData({
      symbol: token.symbol || '',
      name: token.name || '',
      decimals: token.decimals || 18,
      logoUrl: token.logoUrl || '',
      type: token.type || 'ERC20',
      chainId: token.chainId,
      contractAddress: token.contractAddress || '',
      minAmount: token.minAmount || '',
      maxAmount: token.maxAmount || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingId) {
      updateToken.mutate({ id: editingId, data: formData }, {
        onSuccess: handleCloseModal,
      });
    } else {
      createToken.mutate(formData, {
        onSuccess: handleCloseModal,
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteToken.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const clearFilters = () => {
    setMany({
      [QUERY_PARAM_KEYS.q]: null,
      [QUERY_PARAM_KEYS.legacySearch]: null,
      [QUERY_PARAM_KEYS.chainId]: null,
      [QUERY_PARAM_KEYS.page]: 1,
    });
  };

  const handleCheckPair = () => {
    if (!pairCheckChainId || !tokenInId || !tokenOutId) return;

    const tokenIn = verificationTokensData?.items.find(t => t.id === tokenInId);
    const tokenOut = verificationTokensData?.items.find(t => t.id === tokenOutId);

    if (!tokenIn?.contractAddress || !tokenOut?.contractAddress) return;

    checkPairSupport.mutate({
      chainId: pairCheckChainId,
      tokenIn: tokenIn.contractAddress,
      tokenOut: tokenOut.contractAddress,
    }, {
      onSuccess: (data) => {
        setPairCheckResult(data);
      },
    });
  };

  const handleRegisterDirectPair = () => {
    if (!swapperAddress || !tokenInId || !tokenOutId) return;
    
    const tokenIn = verificationTokensData?.items.find(t => t.id === tokenInId);
    const tokenOut = verificationTokensData?.items.find(t => t.id === tokenOutId);

    if (!tokenIn?.contractAddress || !tokenOut?.contractAddress) return;

    writeContract({
      address: swapperAddress,
      abi: TOKEN_SWAPPER_ABI,
      functionName: 'setV3Pool',
      args: [tokenIn.contractAddress as `0x${string}`, tokenOut.contractAddress as `0x${string}`, directFee],
    }, {
      onSuccess: () => toast.success(t('admin.tokens_view.toasts.create_success', 'Registration transaction submitted')),
      onError: (err) => toast.error(`${t('admin.tokens_view.toasts.create_failed', 'Registration failed')}: ${err.message}`),
    });
  };

  const handleRegisterMultiHopPath = () => {
    if (!swapperAddress || !tokenInId || !tokenOutId || intermediateTokenIds.length === 0) return;
    
    const tokenIn = verificationTokensData?.items.find(t => t.id === tokenInId);
    const tokenOut = verificationTokensData?.items.find(t => t.id === tokenOutId);
    
    const intermediateTokens = intermediateTokenIds
      .map(id => verificationTokensData?.items.find(t => t.id === id))
      .filter((t): t is SupportedTokenEntity => !!t);

    if (!tokenIn?.contractAddress || !tokenOut?.contractAddress || intermediateTokens.length !== intermediateTokenIds.length) return;

    const path = [
      tokenIn.contractAddress as `0x${string}`,
      ...intermediateTokens.map(t => t.contractAddress as `0x${string}`),
      tokenOut.contractAddress as `0x${string}`
    ];

    writeContract({
      address: swapperAddress,
      abi: TOKEN_SWAPPER_ABI,
      functionName: 'setMultiHopPath',
      args: [
        tokenIn.contractAddress as `0x${string}`, 
        tokenOut.contractAddress as `0x${string}`, 
        path
      ],
    }, {
      onSuccess: () => toast.success(t('admin.tokens_view.toasts.create_success', 'Registration transaction submitted')),
      onError: (err) => toast.error(`${t('admin.tokens_view.toasts.create_failed', 'Registration failed')}: ${err.message}`),
    });
  };
  
  const handleResetV3Pool = () => {
    if (!swapperAddress || !tokenInId || !tokenOutId) return;
    const items = verificationTokensData?.items || [];
    const tokenIn = items.find(t => t.id === tokenInId);
    const tokenOut = items.find(t => t.id === tokenOutId);
    if (!tokenIn || !tokenOut) return;

    writeContract({
      address: swapperAddress,
      abi: TOKEN_SWAPPER_ABI,
      functionName: 'removeV3Pool',
      args: [tokenIn.contractAddress as `0x${string}`, tokenOut.contractAddress as `0x${string}`],
    }, {
      onSuccess: () => {
        toast.success(t('admin.tokens_view.pair_check.reset_success_v3', 'V3 fallback route removed successfully'));
        handleCheckPair();
      },
      onError: (error) => {
        toast.error(t('admin.tokens_view.pair_check.reset_error_v3', 'Failed to remove V3 fallback route'));
        console.error(error);
      }
    });
  };

  const handleResetDirectPool = () => {
    if (!swapperAddress || !tokenInId || !tokenOutId) return;
    const items = verificationTokensData?.items || [];
    const tokenIn = items.find(t => t.id === tokenInId);
    const tokenOut = items.find(t => t.id === tokenOutId);
    if (!tokenIn || !tokenOut) return;

    writeContract({
      address: swapperAddress,
      abi: TOKEN_SWAPPER_ABI,
      functionName: 'removeDirectPool',
      args: [tokenIn.contractAddress as `0x${string}`, tokenOut.contractAddress as `0x${string}`],
    }, {
      onSuccess: () => {
        toast.success(t('admin.tokens_view.pair_check.reset_success_v4', 'Direct V4 route removed successfully'));
        handleCheckPair();
      },
      onError: (error) => {
        toast.error(t('admin.tokens_view.pair_check.reset_error_v4', 'Failed to remove direct V4 route'));
        console.error(error);
      }
    });
  };

  const handleResetMultiHopPath = () => {
    if (!swapperAddress || !tokenInId || !tokenOutId) return;
    const items = verificationTokensData?.items || [];
    const tokenIn = items.find(t => t.id === tokenInId);
    const tokenOut = items.find(t => t.id === tokenOutId);
    if (!tokenIn || !tokenOut) return;

    writeContract({
      address: swapperAddress,
      abi: TOKEN_SWAPPER_ABI,
      functionName: 'removeMultiHopPath',
      args: [tokenIn.contractAddress as `0x${string}`, tokenOut.contractAddress as `0x${string}`],
    }, {
      onSuccess: () => {
        toast.success(t('admin.tokens_view.pair_check.reset_success_multihop', 'Multi-hop path removed successfully'));
        handleCheckPair();
      },
      onError: (error) => {
        toast.error(t('admin.tokens_view.pair_check.reset_error_multihop', 'Failed to remove multi-hop path'));
        console.error(error);
      }
    });
  };

  const resetPairCheck = () => {
    setPairCheckResult(null);
    setIntermediateTokenIds([]);
  };

  return {
    state: {
      searchTerm,
      filterChainId,
      page,
      limit,
      tokenData,
      isTokensLoading,
      chains,
      isModalOpen,
      editingId,
      deleteId,
      formData,
      isMutationPending: createToken.isPending || updateToken.isPending || deleteToken.isPending,
      pairCheckChainId,
      verificationTokensData,
      tokenInId,
      tokenOutId,
      pairCheckResult,
      isPairChecking: checkPairSupport.isPending,
      activeTab,
      swapperAddress,
      isConnected,
      isRegistrationPending: isTxPending || isWaitingForReceipt,
      isTxSuccess,
      directFee,
      intermediateTokenIds,
    },
    actions: {
      setActiveTab: (tab: string) => setMany({ tab }),
      setSearchTerm: (term: string) =>
        setMany({
          [QUERY_PARAM_KEYS.q]: term,
          [QUERY_PARAM_KEYS.legacySearch]: null,
          [QUERY_PARAM_KEYS.page]: 1,
        }),
      setFilterChainId: (id: string) => setMany({ [QUERY_PARAM_KEYS.chainId]: id, [QUERY_PARAM_KEYS.page]: 1 }),
      setPage: (value: number | ((prev: number) => number)) => {
        const next = typeof value === 'function' ? value(page) : value;
        setMany({ [QUERY_PARAM_KEYS.page]: next });
      },
      setFormData,
      setDeleteId,
      handleOpenAdd,
      handleOpenEdit,
      handleCloseModal,
      handleSubmit,
      handleDelete,
      clearFilters,
      setPairCheckChainId,
      setTokenInId,
      setTokenOutId,
      handleCheckPair,
      resetPairCheck,
      setDirectFee,
      setIntermediateTokenIds,
      addHop: () => setIntermediateTokenIds(prev => [...prev, '']),
      removeHop: (index: number) => setIntermediateTokenIds(prev => prev.filter((_, i) => i !== index)),
      updateHop: (index: number, id: string) => setIntermediateTokenIds(prev => {
        const next = [...prev];
        next[index] = id;
        return next;
      }),
      handleRegisterDirectPair,
      handleRegisterMultiHopPath,
      handleResetV3Pool,
      handleResetDirectPool,
      handleResetMultiHopPath,
    }
  };
};
