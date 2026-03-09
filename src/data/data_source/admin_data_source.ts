import { httpClient } from '@/core/network';
import { API_ENDPOINTS } from '@/core/constants';

export interface AdminStats {
  totalUsers: number;
  totalMerchants: number;
  totalVolume: string;
  activeChains: number;
}

export interface AdminMerchantUpdateInput {
  status: string;
}

export interface TeamMemberPayload {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface PaymentBridgePayload {
  name: string;
}

export interface BridgeConfigPayload {
  bridgeId: string;
  sourceChainId: string;
  destChainId: string;
  routerAddress?: string;
  feePercentage?: string;
  config?: string;
  isActive?: boolean;
}

export interface FeeConfigPayload {
  chainId: string;
  tokenId: string;
  platformFeePercent?: string;
  fixedBaseFee?: string;
  minFee?: string;
  maxFee?: string | null;
}

export interface OnchainAdapterStatusParams {
  sourceChainId: string;
  destChainId: string;
}

export interface OnchainAdapterRegisterPayload {
  sourceChainId: string;
  destChainId: string;
  bridgeType: number;
  adapterAddress: string;
}

export interface OnchainAdapterDefaultPayload {
  sourceChainId: string;
  destChainId: string;
  bridgeType: number;
}

export interface HyperbridgeConfigPayload {
  sourceChainId: string;
  destChainId: string;
  stateMachineIdHex?: string;
  destinationContractHex?: string;
}

export interface CCIPConfigPayload {
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
}

export interface LayerZeroConfigPayload {
  sourceChainId: string;
  destChainId: string;
  dstEid?: number;
  peerHex?: string;
  optionsHex?: string;
}

export interface LayerZeroE2EConfigurePayload {
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
}

export interface LayerZeroE2EStatusParams {
  sourceChainId: string;
  destChainId: string;
  destinationReceiverAddress?: string;
  destinationSrcEid?: number;
  destinationSrcSenderHex?: string;
  destinationVaultAddress?: string;
  destinationGatewayAddress?: string;
}

export interface RoutePolicyPayload {
  sourceChainId: string;
  destChainId: string;
  defaultBridgeType: number;
  fallbackMode?: 'strict' | 'auto_fallback';
  fallbackOrder?: number[];
  perByteRate?: string;
  overheadBytes?: string;
  minFee?: string;
  maxFee?: string;
}

export interface CrosschainOverviewParams {
  page?: number;
  limit?: number;
  sourceChainId?: string;
  destChainId?: string;
}

export interface CrosschainRecheckPayload {
  sourceChainId: string;
  destChainId: string;
}

export interface CrosschainAutoFixPayload {
  sourceChainId: string;
  destChainId: string;
  bridgeType?: number;
}

export interface CrosschainBulkRecheckPayload {
  routes: CrosschainRecheckPayload[];
}

export interface CrosschainBulkAutoFixPayload {
  routes: CrosschainAutoFixPayload[];
}

export interface ContractConfigCheckParams {
  sourceChainId: string;
  destChainId?: string;
}

export interface RouteErrorDiagnosticsParams {
  sourceChainId: string;
  paymentId: string;
}

export interface ContractInteractPayload {
  sourceChainId: string;
  contractAddress: string;
  method: string;
  abi: string;
  args: any[];
}

export class AdminDataSource {
  private static instance: AdminDataSource;

  private constructor() {}

  public static getInstance(): AdminDataSource {
    if (!AdminDataSource.instance) {
      AdminDataSource.instance = new AdminDataSource();
    }
    return AdminDataSource.instance;
  }

  async getStats(): Promise<AdminStats> {
    const { data, error } = await httpClient.get<AdminStats>(API_ENDPOINTS.ADMIN_STATS);
    if (error) throw new Error(error);
    return data!;
  }

  async getUsers(search?: string): Promise<any[]> {
    const url = search 
      ? `${API_ENDPOINTS.ADMIN_USERS}?search=${encodeURIComponent(search)}` 
      : API_ENDPOINTS.ADMIN_USERS;
    const { data, error } = await httpClient.get<{ users: any[] }>(url);
    if (error) throw new Error(error);
    return data?.users || [];
  }

  async getMerchants(): Promise<any[]> {
    const { data, error } = await httpClient.get<{ merchants: any[] }>(API_ENDPOINTS.ADMIN_MERCHANTS);
    if (error) throw new Error(error);
    return data?.merchants || [];
  }

  async updateMerchantStatus(id: string, status: string): Promise<void> {
    const { error } = await httpClient.put(API_ENDPOINTS.ADMIN_MERCHANT_STATUS(id), { status });
    if (error) throw new Error(error);
  }

  // Chain Management
  // TODO: Verify if these endpoints are correct on backend. Assuming /v1/chains for now as per api_endpoints.ts
  async getChains(page?: number, limit?: number): Promise<{ items: any[], meta?: any }> {
    const query = new URLSearchParams();
    if (page) query.append('page', page.toString());
    if (limit) query.append('limit', limit.toString());
    
    const url = query.toString() ? `${API_ENDPOINTS.CHAINS}?${query.toString()}` : API_ENDPOINTS.CHAINS;
    const { data, error } = await httpClient.get<{ items: any[], meta: any }>(url);
    if (error) throw new Error(error);
    return {
      items: data?.items || [],
      meta: data?.meta
    };
  }

  async createChain(data: any): Promise<void> {
    const { error } = await httpClient.post(API_ENDPOINTS.ADMIN_CHAINS, data);
    if (error) throw new Error(error);
  }

  async updateChain(id: string, data: any): Promise<void> {
    const { error } = await httpClient.put(API_ENDPOINTS.ADMIN_CHAIN_BY_ID(id), data);
    if (error) throw new Error(error);
  }

  async deleteChain(id: string): Promise<void> {
    const { error } = await httpClient.delete(API_ENDPOINTS.ADMIN_CHAIN_BY_ID(id));
    if (error) throw new Error(error);
  }

  // RPC Management
  async createRpc(data: any): Promise<void> {
    const { error } = await httpClient.post(API_ENDPOINTS.ADMIN_RPCS, data);
    if (error) throw new Error(error);
  }

  async updateRpc(id: string, data: any): Promise<void> {
    const { error } = await httpClient.put(API_ENDPOINTS.ADMIN_RPC_BY_ID(id), data);
    if (error) throw new Error(error);
  }

  async deleteRpc(id: string): Promise<void> {
    const { error } = await httpClient.delete(API_ENDPOINTS.ADMIN_RPC_BY_ID(id));
    if (error) throw new Error(error);
  }

  // Contract Management
  async getContracts(page?: number, limit?: number, chainId?: string, type?: string): Promise<{ items: any[], meta?: any }> {
    const query = new URLSearchParams();
    if (page) query.append('page', page.toString());
    if (limit) query.append('limit', limit.toString());
    if (chainId) query.append('chainId', chainId);
    if (type) query.append('type', type);

    const url = query.toString() ? `${API_ENDPOINTS.CONTRACTS}?${query.toString()}` : API_ENDPOINTS.CONTRACTS;
    const { data, error } = await httpClient.get<{ items: any[], meta: any }>(url);
    if (error) throw new Error(error);
    return {
      items: data?.items || [],
      meta: data?.meta
    };
  }

  async getContractById(id: string): Promise<any> {
    const { data, error } = await httpClient.get<{ contract: any }>(API_ENDPOINTS.CONTRACT_BY_ID(id));
    if (error) throw new Error(error);
    return data?.contract;
  }

  async createContract(data: any): Promise<void> {
    const { error } = await httpClient.post(API_ENDPOINTS.CONTRACTS, data);
    if (error) throw new Error(error);
  }

  async updateContract(id: string, data: any): Promise<void> {
    const { error } = await httpClient.put(`${API_ENDPOINTS.CONTRACTS}/${id}`, data);
    if (error) throw new Error(error);
  }

  async deleteContract(id: string): Promise<void> {
    const { error } = await httpClient.delete(API_ENDPOINTS.CONTRACT_BY_ID(id));
    if (error) throw new Error(error);
  }

  // Team Management
  async getPublicTeams(): Promise<any[]> {
    const { data, error } = await httpClient.get<{ items: any[] }>(API_ENDPOINTS.TEAMS);
    if (error) throw new Error(error);
    return data?.items || [];
  }

  async getAdminTeams(search?: string): Promise<any[]> {
    const url = search?.trim()
      ? `${API_ENDPOINTS.ADMIN_TEAMS}?search=${encodeURIComponent(search.trim())}`
      : API_ENDPOINTS.ADMIN_TEAMS;
    const { data, error } = await httpClient.get<{ items: any[] }>(url);
    if (error) throw new Error(error);
    return data?.items || [];
  }

  async createTeam(data: TeamMemberPayload): Promise<void> {
    const { error } = await httpClient.post(API_ENDPOINTS.ADMIN_TEAMS, data);
    if (error) throw new Error(error);
  }

  async updateTeam(id: string, data: TeamMemberPayload): Promise<void> {
    const { error } = await httpClient.put(API_ENDPOINTS.ADMIN_TEAM_BY_ID(id), data);
    if (error) throw new Error(error);
  }

  async deleteTeam(id: string): Promise<void> {
    const { error } = await httpClient.delete(API_ENDPOINTS.ADMIN_TEAM_BY_ID(id));
    if (error) throw new Error(error);
  }

  // Payment Bridge management
  async getPaymentBridges(page?: number, limit?: number): Promise<{ items: any[]; meta?: any }> {
    const query = new URLSearchParams();
    if (page) query.append('page', page.toString());
    if (limit) query.append('limit', limit.toString());
    const url = query.toString() ? `${API_ENDPOINTS.ADMIN_PAYMENT_BRIDGES}?${query.toString()}` : API_ENDPOINTS.ADMIN_PAYMENT_BRIDGES;
    const { data, error } = await httpClient.get<{ items: any[]; meta?: any }>(url);
    if (error) throw new Error(error);
    return { items: data?.items || [], meta: data?.meta };
  }

  async createPaymentBridge(data: PaymentBridgePayload): Promise<void> {
    const { error } = await httpClient.post(API_ENDPOINTS.ADMIN_PAYMENT_BRIDGES, data);
    if (error) throw new Error(error);
  }

  async updatePaymentBridge(id: string, data: PaymentBridgePayload): Promise<void> {
    const { error } = await httpClient.put(API_ENDPOINTS.ADMIN_PAYMENT_BRIDGE_BY_ID(id), data);
    if (error) throw new Error(error);
  }

  async deletePaymentBridge(id: string): Promise<void> {
    const { error } = await httpClient.delete(API_ENDPOINTS.ADMIN_PAYMENT_BRIDGE_BY_ID(id));
    if (error) throw new Error(error);
  }

  // Bridge Config management
  async getBridgeConfigs(params?: { page?: number; limit?: number; sourceChainId?: string; destChainId?: string; bridgeId?: string }): Promise<{ items: any[]; meta?: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.sourceChainId) query.append('sourceChainId', params.sourceChainId);
    if (params?.destChainId) query.append('destChainId', params.destChainId);
    if (params?.bridgeId) query.append('bridgeId', params.bridgeId);
    const url = query.toString() ? `${API_ENDPOINTS.ADMIN_BRIDGE_CONFIGS}?${query.toString()}` : API_ENDPOINTS.ADMIN_BRIDGE_CONFIGS;
    const { data, error } = await httpClient.get<{ items: any[]; meta?: any }>(url);
    if (error) throw new Error(error);
    return { items: data?.items || [], meta: data?.meta };
  }

  async createBridgeConfig(data: BridgeConfigPayload): Promise<void> {
    const { error } = await httpClient.post(API_ENDPOINTS.ADMIN_BRIDGE_CONFIGS, data);
    if (error) throw new Error(error);
  }

  async updateBridgeConfig(id: string, data: BridgeConfigPayload): Promise<void> {
    const { error } = await httpClient.put(API_ENDPOINTS.ADMIN_BRIDGE_CONFIG_BY_ID(id), data);
    if (error) throw new Error(error);
  }

  async deleteBridgeConfig(id: string): Promise<void> {
    const { error } = await httpClient.delete(API_ENDPOINTS.ADMIN_BRIDGE_CONFIG_BY_ID(id));
    if (error) throw new Error(error);
  }

  // Fee Config management
  async getFeeConfigs(params?: { page?: number; limit?: number; chainId?: string; tokenId?: string }): Promise<{ items: any[]; meta?: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.chainId) query.append('chainId', params.chainId);
    if (params?.tokenId) query.append('tokenId', params.tokenId);
    const url = query.toString() ? `${API_ENDPOINTS.ADMIN_FEE_CONFIGS}?${query.toString()}` : API_ENDPOINTS.ADMIN_FEE_CONFIGS;
    const { data, error } = await httpClient.get<{ items: any[]; meta?: any }>(url);
    if (error) throw new Error(error);
    return { items: data?.items || [], meta: data?.meta };
  }

  async createFeeConfig(data: FeeConfigPayload): Promise<void> {
    const { error } = await httpClient.post(API_ENDPOINTS.ADMIN_FEE_CONFIGS, data);
    if (error) throw new Error(error);
  }

  async updateFeeConfig(id: string, data: FeeConfigPayload): Promise<void> {
    const { error } = await httpClient.put(API_ENDPOINTS.ADMIN_FEE_CONFIG_BY_ID(id), data);
    if (error) throw new Error(error);
  }

  async deleteFeeConfig(id: string): Promise<void> {
    const { error } = await httpClient.delete(API_ENDPOINTS.ADMIN_FEE_CONFIG_BY_ID(id));
    if (error) throw new Error(error);
  }

  // On-chain adapter management
  async getOnchainAdapterStatus(params: OnchainAdapterStatusParams): Promise<any> {
    const query = new URLSearchParams();
    query.append('sourceChainId', params.sourceChainId);
    query.append('destChainId', params.destChainId);
    const { data, error } = await httpClient.get<{ status: any }>(`${API_ENDPOINTS.ADMIN_ONCHAIN_ADAPTER_STATUS}?${query.toString()}`);
    if (error) throw new Error(error);
    return data?.status;
  }

  async registerOnchainAdapter(data: OnchainAdapterRegisterPayload): Promise<any> {
    const { data: response, error } = await httpClient.post<any>(API_ENDPOINTS.ADMIN_ONCHAIN_ADAPTER_REGISTER, data);
    if (error) throw new Error(error);
    return response;
  }

  async setOnchainDefaultBridge(data: OnchainAdapterDefaultPayload): Promise<any> {
    const { data: response, error } = await httpClient.post<any>(API_ENDPOINTS.ADMIN_ONCHAIN_ADAPTER_SET_DEFAULT, data);
    if (error) throw new Error(error);
    return response;
  }

  async setHyperbridgeConfig(data: HyperbridgeConfigPayload): Promise<any> {
    const { data: response, error } = await httpClient.post<any>(API_ENDPOINTS.ADMIN_ONCHAIN_ADAPTER_HYPERBRIDGE_CONFIG, data);
    if (error) throw new Error(error);
    return response;
  }

  async setCCIPConfig(data: CCIPConfigPayload): Promise<any> {
    const { data: response, error } = await httpClient.post<any>(API_ENDPOINTS.ADMIN_ONCHAIN_ADAPTER_CCIP_CONFIG, data);
    if (error) throw new Error(error);
    return response;
  }

  async setLayerZeroConfig(data: LayerZeroConfigPayload): Promise<any> {
    const { data: response, error } = await httpClient.post<any>(API_ENDPOINTS.ADMIN_ONCHAIN_ADAPTER_LAYERZERO_CONFIG, data);
    if (error) throw new Error(error);
    return response;
  }

  async configureLayerZeroE2E(data: LayerZeroE2EConfigurePayload): Promise<any> {
    const { data: response, error } = await httpClient.post<any>(API_ENDPOINTS.ADMIN_ONCHAIN_ADAPTER_LAYERZERO_CONFIGURE_E2E, data);
    if (error) throw new Error(error);
    return response?.result || response;
  }

  async getLayerZeroE2EStatus(params: LayerZeroE2EStatusParams): Promise<any> {
    const query = new URLSearchParams();
    query.append('sourceChainId', params.sourceChainId);
    query.append('destChainId', params.destChainId);
    if (params.destinationReceiverAddress) query.append('destinationReceiverAddress', params.destinationReceiverAddress);
    if (params.destinationSrcEid !== undefined) query.append('destinationSrcEid', String(params.destinationSrcEid));
    if (params.destinationSrcSenderHex) query.append('destinationSrcSenderHex', params.destinationSrcSenderHex);
    if (params.destinationVaultAddress) query.append('destinationVaultAddress', params.destinationVaultAddress);
    if (params.destinationGatewayAddress) query.append('destinationGatewayAddress', params.destinationGatewayAddress);
    const { data, error } = await httpClient.get<{ status: any }>(`${API_ENDPOINTS.ADMIN_ONCHAIN_ADAPTER_LAYERZERO_E2E_STATUS}?${query.toString()}`);
    if (error) throw new Error(error);
    return data?.status;
  }

  async getCrosschainPreflight(params: { sourceChainId: string; destChainId: string }): Promise<any> {
    const query = new URLSearchParams();
    query.append('sourceChainId', params.sourceChainId);
    query.append('destChainId', params.destChainId);
    const { data, error } = await httpClient.get<{ preflight: any }>(`${API_ENDPOINTS.ADMIN_CROSSCHAIN_CONFIG_PREFLIGHT}?${query.toString()}`);
    if (error) throw new Error(error);
    return data?.preflight;
  }

  async getContractConfigCheck(params: ContractConfigCheckParams): Promise<any> {
    const query = new URLSearchParams();
    query.append('sourceChainId', params.sourceChainId);
    if (params.destChainId) query.append('destChainId', params.destChainId);

    const { data, error } = await httpClient.get<{ result: any }>(`${API_ENDPOINTS.ADMIN_CONTRACTS_CONFIG_CHECK}?${query.toString()}`);
    if (error) throw new Error(error);
    return data?.result;
  }

  async getContractConfigCheckById(id: string): Promise<any> {
    const { data, error } = await httpClient.get<{ result: any }>(API_ENDPOINTS.ADMIN_CONTRACT_BY_ID_CONFIG_CHECK(id));
    if (error) throw new Error(error);
    return data?.result;
  }

  async getCrosschainOverview(params?: CrosschainOverviewParams): Promise<{ items: any[]; meta?: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.sourceChainId) query.append('sourceChainId', params.sourceChainId);
    if (params?.destChainId) query.append('destChainId', params.destChainId);
    const url = query.toString() ? `${API_ENDPOINTS.ADMIN_CROSSCHAIN_CONFIG_OVERVIEW}?${query.toString()}` : API_ENDPOINTS.ADMIN_CROSSCHAIN_CONFIG_OVERVIEW;
    const { data, error } = await httpClient.get<{ items: any[]; meta?: any }>(url);
    if (error) throw new Error(error);
    return { items: data?.items || [], meta: data?.meta };
  }

  async recheckCrosschainRoute(payload: CrosschainRecheckPayload): Promise<any> {
    const { data, error } = await httpClient.post<{ route: any }>(API_ENDPOINTS.ADMIN_CROSSCHAIN_CONFIG_RECHECK, payload);
    if (error) throw new Error(error);
    return data?.route;
  }

  async recheckCrosschainRoutesBulk(payload: CrosschainBulkRecheckPayload): Promise<any[]> {
    const { data, error } = await httpClient.post<{ items: any[] }>(API_ENDPOINTS.ADMIN_CROSSCHAIN_CONFIG_RECHECK_BULK, payload);
    if (error) throw new Error(error);
    return data?.items || [];
  }

  async autoFixCrosschainRoute(payload: CrosschainAutoFixPayload): Promise<any> {
    const { data, error } = await httpClient.post<{ result: any }>(API_ENDPOINTS.ADMIN_CROSSCHAIN_CONFIG_AUTO_FIX, payload);
    if (error) throw new Error(error);
    return data?.result;
  }

  async autoFixCrosschainRoutesBulk(payload: CrosschainBulkAutoFixPayload): Promise<any[]> {
    const { data, error } = await httpClient.post<{ items: any[] }>(API_ENDPOINTS.ADMIN_CROSSCHAIN_CONFIG_AUTO_FIX_BULK, payload);
    if (error) throw new Error(error);
    return data?.items || [];
  }

  async getRoutePolicies(params?: { page?: number; limit?: number; sourceChainId?: string; destChainId?: string }): Promise<{ items: any[]; meta?: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.sourceChainId) query.append('sourceChainId', params.sourceChainId);
    if (params?.destChainId) query.append('destChainId', params.destChainId);
    const url = query.toString() ? `${API_ENDPOINTS.ADMIN_ROUTE_POLICIES}?${query.toString()}` : API_ENDPOINTS.ADMIN_ROUTE_POLICIES;
    const { data, error } = await httpClient.get<{ items: any[]; meta?: any }>(url);
    if (error) throw new Error(error);
    return { items: data?.items || [], meta: data?.meta };
  }

  async createRoutePolicy(data: RoutePolicyPayload): Promise<any> {
    const { data: response, error } = await httpClient.post<any>(API_ENDPOINTS.ADMIN_ROUTE_POLICIES, data);
    if (error) throw new Error(error);
    return response;
  }

  async updateRoutePolicy(id: string, data: RoutePolicyPayload): Promise<any> {
    const { data: response, error } = await httpClient.put<any>(API_ENDPOINTS.ADMIN_ROUTE_POLICY_BY_ID(id), data);
    if (error) throw new Error(error);
    return response;
  }

  async deleteRoutePolicy(id: string): Promise<void> {
    const { error } = await httpClient.delete(API_ENDPOINTS.ADMIN_ROUTE_POLICY_BY_ID(id));
    if (error) throw new Error(error);
  }

  async getRouteErrorDiagnostics(params: RouteErrorDiagnosticsParams): Promise<any> {
    const query = new URLSearchParams();
    query.append('sourceChainId', params.sourceChainId);
    const { data, error } = await httpClient.get<{ diagnostics: any }>(
      `${API_ENDPOINTS.ADMIN_DIAGNOSTICS_ROUTE_ERROR(params.paymentId)}?${query.toString()}`
    );
    if (error) throw new Error(error);
    return data?.diagnostics;
  }

  async checkTokenPairSupport(params: { chainId: string; tokenIn: string; tokenOut: string }): Promise<{ exists: boolean; isDirect: boolean; path: string[]; executable?: boolean; reasons?: string[]; swapRouterV3?: string; universalRouter?: string }> {
    const query = new URLSearchParams();
    query.append('chainId', params.chainId);
    query.append('tokenIn', params.tokenIn);
    query.append('tokenOut', params.tokenOut);

    const { data, error } = await httpClient.get<{ exists: boolean; isDirect: boolean; path: string[]; executable?: boolean; reasons?: string[]; swapRouterV3?: string; universalRouter?: string }>(
      `${API_ENDPOINTS.TOKENS_CHECK_PAIR}?${query.toString()}`
    );
    if (error) throw new Error(error);
    return data!;
  }

  async interactWithContract(payload: ContractInteractPayload): Promise<{ result: any; isWrite: boolean }> {
    const { data, error } = await httpClient.post<{ result: any; isWrite: boolean }>(
      API_ENDPOINTS.ADMIN_CONTRACT_INTERACT,
      payload
    );
    if (error) throw new Error(error);
    return data!;
  }
}
