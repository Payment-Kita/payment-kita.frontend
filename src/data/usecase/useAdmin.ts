import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminRepository } from '../repositories/admin_repository';

const adminRepository = new AdminRepository();

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminRepository.getStats(),
  });
};

export const useAdminUsers = (search?: string) => {
  return useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => adminRepository.getUsers(search),
  });
};

export const useAdminMerchants = () => {
  return useQuery({
    queryKey: ['admin', 'merchants'],
    queryFn: () => adminRepository.getMerchants(),
  });
};

export const useAdminChains = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['chains', page, limit],
    queryFn: () => adminRepository.getChains(page, limit),
  });
};

export const useCreateRpc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminRepository.createRpc(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rpcs'] });
    },
  });
};

export const useUpdateRpc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminRepository.updateRpc(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rpcs'] });
    },
  });
};

export const useDeleteRpc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRepository.deleteRpc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rpcs'] });
    },
  });
};

export const useUpdateMerchantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      adminRepository.updateMerchantStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] });
    },
  });
};

export const useCreateChain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminRepository.createChain(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chains'] });
    },
  });
};

export const useUpdateChain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminRepository.updateChain(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chains'] });
    },
  });
};

export const useDeleteChain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRepository.deleteChain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chains'] });
    },
  });
};

export const useAdminContracts = (page?: number, limit?: number, chainId?: string, type?: string) => {
  return useQuery({
    queryKey: ['contracts', page, limit, chainId, type],
    queryFn: () => adminRepository.getContracts(page, limit, chainId, type),
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminRepository.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminRepository.updateContract(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRepository.deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const usePublicTeams = () => {
  return useQuery({
    queryKey: ['teams', 'public'],
    queryFn: () => adminRepository.getPublicTeams(),
  });
};

export const useAdminTeams = (search?: string) => {
  return useQuery({
    queryKey: ['admin', 'teams', search],
    queryFn: () => adminRepository.getAdminTeams(search),
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminRepository.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', 'public'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminRepository.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', 'public'] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRepository.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', 'public'] });
    },
  });
};

export const useAdminPaymentBridges = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['admin', 'payment-bridges', page, limit],
    queryFn: () => adminRepository.getPaymentBridges(page, limit),
  });
};

export const useCreatePaymentBridge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminRepository.createPaymentBridge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-bridges'] });
    },
  });
};

export const useUpdatePaymentBridge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminRepository.updatePaymentBridge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-bridges'] });
    },
  });
};

export const useDeletePaymentBridge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRepository.deletePaymentBridge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-bridges'] });
    },
  });
};

export const useAdminBridgeConfigs = (params?: { page?: number; limit?: number; sourceChainId?: string; destChainId?: string; bridgeId?: string }) => {
  return useQuery({
    queryKey: ['admin', 'bridge-configs', params?.page, params?.limit, params?.sourceChainId, params?.destChainId, params?.bridgeId],
    queryFn: () => adminRepository.getBridgeConfigs(params),
  });
};

export const useCreateBridgeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminRepository.createBridgeConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bridge-configs'] });
    },
  });
};

export const useUpdateBridgeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminRepository.updateBridgeConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bridge-configs'] });
    },
  });
};

export const useDeleteBridgeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRepository.deleteBridgeConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bridge-configs'] });
    },
  });
};

export const useAdminFeeConfigs = (params?: { page?: number; limit?: number; chainId?: string; tokenId?: string }) => {
  return useQuery({
    queryKey: ['admin', 'fee-configs', params?.page, params?.limit, params?.chainId, params?.tokenId],
    queryFn: () => adminRepository.getFeeConfigs(params),
  });
};

export const useCreateFeeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminRepository.createFeeConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'fee-configs'] });
    },
  });
};

export const useUpdateFeeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminRepository.updateFeeConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'fee-configs'] });
    },
  });
};

export const useDeleteFeeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRepository.deleteFeeConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'fee-configs'] });
    },
  });
};

export const useAdminContractConfigCheck = (sourceChainId?: string, destChainId?: string) => {
  return useQuery({
    queryKey: ['admin', 'contracts', 'config-check', sourceChainId, destChainId],
    queryFn: () => adminRepository.getContractConfigCheck({ sourceChainId: sourceChainId!, destChainId }),
    enabled: !!sourceChainId,
  });
};

export const useAdminContractById = (id?: string) => {
  return useQuery({
    queryKey: ['admin', 'contracts', id],
    queryFn: () => adminRepository.getContractById(id!),
    enabled: !!id,
  });
};

export const useAdminContractConfigCheckById = (id?: string) => {
  return useQuery({
    queryKey: ['admin', 'contracts', id, 'config-check'],
    queryFn: () => adminRepository.getContractConfigCheckById(id!),
    enabled: !!id,
  });
};

export const useOnchainAdapterStatus = (sourceChainId?: string, destChainId?: string) => {
  return useQuery({
    queryKey: ['admin', 'onchain-adapters', 'status', sourceChainId, destChainId],
    queryFn: () => adminRepository.getOnchainAdapterStatus({ sourceChainId: sourceChainId!, destChainId: destChainId! }),
    enabled: !!sourceChainId && !!destChainId,
  });
};

export const useRegisterOnchainAdapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { sourceChainId: string; destChainId: string; bridgeType: number; adapterAddress: string }) =>
      adminRepository.registerOnchainAdapter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'onchain-adapters', 'status'] });
    },
  });
};

export const useSetOnchainDefaultBridge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { sourceChainId: string; destChainId: string; bridgeType: number }) =>
      adminRepository.setOnchainDefaultBridge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'onchain-adapters', 'status'] });
    },
  });
};

export const useSetHyperbridgeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { sourceChainId: string; destChainId: string; stateMachineIdHex?: string; destinationContractHex?: string }) =>
      adminRepository.setHyperbridgeConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'onchain-adapters', 'status'] });
    },
  });
};

export const useSetCCIPConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      sourceChainId: string;
      destChainId: string;
      chainSelector?: string | number;
      destinationAdapterHex?: string;
      destinationGasLimit?: number;
      destinationExtraArgsHex?: string;
      destinationFeeTokenAddress?: string;
      destinationReceiverAddress?: string;
      sourceChainSelector?: string | number;
      trustedSenderHex?: string;
      allowSourceChain?: boolean;
    }) =>
      adminRepository.setCCIPConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'onchain-adapters', 'status'] });
    },
  });
};

export const useSetLayerZeroConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { sourceChainId: string; destChainId: string; dstEid?: number; peerHex?: string; optionsHex?: string }) =>
      adminRepository.setLayerZeroConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'onchain-adapters', 'status'] });
    },
  });
};

export const useConfigureLayerZeroE2E = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      sourceChainId: string;
      destChainId: string;
      source: {
        registerAdapterIfMissing?: boolean;
        setDefaultBridgeType?: boolean;
        senderAddress?: string;
        dstEid?: number;
        dstPeerHex?: string;
        optionsHex?: string;
        registerDelegate?: boolean;
        authorizeVaultSpender?: boolean;
      };
      destination: {
        receiverAddress?: string;
        srcEid?: number;
        srcSenderHex?: string;
        vaultAddress?: string;
        gatewayAddress?: string;
        authorizeVaultSpender?: boolean;
        authorizeGatewayAdapter?: boolean;
      };
    }) => adminRepository.configureLayerZeroE2E(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'onchain-adapters', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'layerzero-e2e-status'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'crosschain-config', 'overview'] });
    },
  });
};

export const useLayerZeroE2EStatus = (
  params?: {
    sourceChainId?: string;
    destChainId?: string;
    destinationReceiverAddress?: string;
    destinationSrcEid?: number;
    destinationSrcSenderHex?: string;
    destinationVaultAddress?: string;
    destinationGatewayAddress?: string;
  },
  enabled = true
) => {
  return useQuery({
    queryKey: [
      'admin',
      'layerzero-e2e-status',
      params?.sourceChainId,
      params?.destChainId,
      params?.destinationReceiverAddress,
      params?.destinationSrcEid,
      params?.destinationSrcSenderHex,
      params?.destinationVaultAddress,
      params?.destinationGatewayAddress,
    ],
    queryFn: () =>
      adminRepository.getLayerZeroE2EStatus({
        sourceChainId: params!.sourceChainId!,
        destChainId: params!.destChainId!,
        destinationReceiverAddress: params?.destinationReceiverAddress,
        destinationSrcEid: params?.destinationSrcEid,
        destinationSrcSenderHex: params?.destinationSrcSenderHex,
        destinationVaultAddress: params?.destinationVaultAddress,
        destinationGatewayAddress: params?.destinationGatewayAddress,
      }),
    enabled: Boolean(enabled && params?.sourceChainId && params?.destChainId),
  });
};

export const useCrosschainConfigPreflight = (sourceChainId?: string, destChainId?: string) => {
  return useQuery({
    queryKey: ['admin', 'crosschain-config', 'preflight', sourceChainId, destChainId],
    queryFn: () => adminRepository.getCrosschainPreflight({ sourceChainId: sourceChainId!, destChainId: destChainId! }),
    enabled: !!sourceChainId && !!destChainId,
  });
};

export const useCrosschainConfigOverview = (params?: { page?: number; limit?: number; sourceChainId?: string; destChainId?: string }) => {
  return useQuery({
    queryKey: ['admin', 'crosschain-config', 'overview', params?.page, params?.limit, params?.sourceChainId, params?.destChainId],
    queryFn: () => adminRepository.getCrosschainOverview(params),
  });
};

export const useRecheckCrosschainRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { sourceChainId: string; destChainId: string }) => adminRepository.recheckCrosschainRoute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'crosschain-config', 'overview'] });
    },
  });
};

export const useRecheckCrosschainRoutesBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { routes: Array<{ sourceChainId: string; destChainId: string }> }) =>
      adminRepository.recheckCrosschainRoutesBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'crosschain-config', 'overview'] });
    },
  });
};

export const useAutoFixCrosschainRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { sourceChainId: string; destChainId: string; bridgeType?: number }) =>
      adminRepository.autoFixCrosschainRoute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'crosschain-config', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'onchain-adapters', 'status'] });
    },
  });
};

export const useAutoFixCrosschainRoutesBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { routes: Array<{ sourceChainId: string; destChainId: string; bridgeType?: number }> }) =>
      adminRepository.autoFixCrosschainRoutesBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'crosschain-config', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'onchain-adapters', 'status'] });
    },
  });
};

export const useRoutePolicies = (params?: { page?: number; limit?: number; sourceChainId?: string; destChainId?: string }) => {
  return useQuery({
    queryKey: ['admin', 'route-policies', params?.page, params?.limit, params?.sourceChainId, params?.destChainId],
    queryFn: () => adminRepository.getRoutePolicies(params),
  });
};

export const useCreateRoutePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminRepository.createRoutePolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'route-policies'] });
    },
  });
};

export const useUpdateRoutePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminRepository.updateRoutePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'route-policies'] });
    },
  });
};

export const useDeleteRoutePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRepository.deleteRoutePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'route-policies'] });
    },
  });
};

export const useRouteErrorDiagnostics = (sourceChainId?: string, paymentId?: string) => {
  return useQuery({
    queryKey: ['admin', 'diagnostics', 'route-error', sourceChainId, paymentId],
    queryFn: () => adminRepository.getRouteErrorDiagnostics({ sourceChainId: sourceChainId!, paymentId: paymentId! }),
    enabled: !!sourceChainId && !!paymentId,
  });
};

export const useCheckTokenPairSupport = () => {
  return useMutation({
    mutationFn: (params: { chainId: string; tokenIn: string; tokenOut: string }) =>
      adminRepository.checkTokenPairSupport(params),
  });
};

export const useAdminGenericInteract = () => {
  return useMutation({
    mutationFn: (payload: any) => adminRepository.interactWithContract(payload),
  });
};
