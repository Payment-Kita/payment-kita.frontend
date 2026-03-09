import {
  AdminDataSource,
  AdminStats,
  BridgeConfigPayload,
  LayerZeroConfigPayload,
  LayerZeroE2EConfigurePayload,
  LayerZeroE2EStatusParams,
  CrosschainBulkAutoFixPayload,
  CrosschainBulkRecheckPayload,
  CrosschainAutoFixPayload,
  CrosschainOverviewParams,
  CrosschainRecheckPayload,
  CCIPConfigPayload,
  ContractConfigCheckParams,
  RouteErrorDiagnosticsParams,
  FeeConfigPayload,
  HyperbridgeConfigPayload,
  OnchainAdapterDefaultPayload,
  OnchainAdapterRegisterPayload,
  OnchainAdapterStatusParams,
  PaymentBridgePayload,
  RoutePolicyPayload,
  TeamMemberPayload,
  ContractInteractPayload,
} from '../data_source/admin_data_source';

export class AdminRepository {
  private dataSource: AdminDataSource;

  constructor() {
    this.dataSource = AdminDataSource.getInstance();
  }

  async getStats(): Promise<AdminStats> {
    return this.dataSource.getStats();
  }

  async getUsers(search?: string): Promise<any[]> {
    return this.dataSource.getUsers(search);
  }

  async getMerchants(): Promise<any[]> {
    return this.dataSource.getMerchants();
  }

  async updateMerchantStatus(id: string, status: string): Promise<void> {
    return this.dataSource.updateMerchantStatus(id, status);
  }

  async getChains(page?: number, limit?: number): Promise<{ items: any[], meta?: any }> {
    return this.dataSource.getChains(page, limit);
  }

  async createChain(data: any): Promise<void> {
    return this.dataSource.createChain(data);
  }

  async updateChain(id: string, data: any): Promise<void> {
    return this.dataSource.updateChain(id, data);
  }

  async deleteChain(id: string): Promise<void> {
    return this.dataSource.deleteChain(id);
  }

  async createRpc(data: any): Promise<void> {
    return this.dataSource.createRpc(data);
  }

  async updateRpc(id: string, data: any): Promise<void> {
    return this.dataSource.updateRpc(id, data);
  }

  async deleteRpc(id: string): Promise<void> {
    return this.dataSource.deleteRpc(id);
  }

  async getContracts(page?: number, limit?: number, chainId?: string, type?: string): Promise<{ items: any[], meta?: any }> {
    return this.dataSource.getContracts(page, limit, chainId, type);
  }

  async getContractById(id: string): Promise<any> {
    return this.dataSource.getContractById(id);
  }

  async createContract(data: any): Promise<void> {
    return this.dataSource.createContract(data);
  }

  async updateContract(id: string, data: any): Promise<void> {
    return this.dataSource.updateContract(id, data);
  }

  async deleteContract(id: string): Promise<void> {
    return this.dataSource.deleteContract(id);
  }

  async getPublicTeams(): Promise<any[]> {
    return this.dataSource.getPublicTeams();
  }

  async getAdminTeams(search?: string): Promise<any[]> {
    return this.dataSource.getAdminTeams(search);
  }

  async createTeam(data: TeamMemberPayload): Promise<void> {
    return this.dataSource.createTeam(data);
  }

  async updateTeam(id: string, data: TeamMemberPayload): Promise<void> {
    return this.dataSource.updateTeam(id, data);
  }

  async deleteTeam(id: string): Promise<void> {
    return this.dataSource.deleteTeam(id);
  }

  async getPaymentBridges(page?: number, limit?: number): Promise<{ items: any[], meta?: any }> {
    return this.dataSource.getPaymentBridges(page, limit);
  }

  async createPaymentBridge(data: PaymentBridgePayload): Promise<void> {
    return this.dataSource.createPaymentBridge(data);
  }

  async updatePaymentBridge(id: string, data: PaymentBridgePayload): Promise<void> {
    return this.dataSource.updatePaymentBridge(id, data);
  }

  async deletePaymentBridge(id: string): Promise<void> {
    return this.dataSource.deletePaymentBridge(id);
  }

  async getBridgeConfigs(params?: { page?: number; limit?: number; sourceChainId?: string; destChainId?: string; bridgeId?: string }): Promise<{ items: any[], meta?: any }> {
    return this.dataSource.getBridgeConfigs(params);
  }

  async createBridgeConfig(data: BridgeConfigPayload): Promise<void> {
    return this.dataSource.createBridgeConfig(data);
  }

  async updateBridgeConfig(id: string, data: BridgeConfigPayload): Promise<void> {
    return this.dataSource.updateBridgeConfig(id, data);
  }

  async deleteBridgeConfig(id: string): Promise<void> {
    return this.dataSource.deleteBridgeConfig(id);
  }

  async getFeeConfigs(params?: { page?: number; limit?: number; chainId?: string; tokenId?: string }): Promise<{ items: any[], meta?: any }> {
    return this.dataSource.getFeeConfigs(params);
  }

  async createFeeConfig(data: FeeConfigPayload): Promise<void> {
    return this.dataSource.createFeeConfig(data);
  }

  async updateFeeConfig(id: string, data: FeeConfigPayload): Promise<void> {
    return this.dataSource.updateFeeConfig(id, data);
  }

  async deleteFeeConfig(id: string): Promise<void> {
    return this.dataSource.deleteFeeConfig(id);
  }

  async getOnchainAdapterStatus(params: OnchainAdapterStatusParams): Promise<any> {
    return this.dataSource.getOnchainAdapterStatus(params);
  }

  async registerOnchainAdapter(data: OnchainAdapterRegisterPayload): Promise<any> {
    return this.dataSource.registerOnchainAdapter(data);
  }

  async setOnchainDefaultBridge(data: OnchainAdapterDefaultPayload): Promise<any> {
    return this.dataSource.setOnchainDefaultBridge(data);
  }

  async getContractConfigCheck(params: ContractConfigCheckParams): Promise<any> {
    return this.dataSource.getContractConfigCheck(params);
  }

  async getContractConfigCheckById(id: string): Promise<any> {
    return this.dataSource.getContractConfigCheckById(id);
  }

  async setHyperbridgeConfig(data: HyperbridgeConfigPayload): Promise<any> {
    return this.dataSource.setHyperbridgeConfig(data);
  }

  async setCCIPConfig(data: CCIPConfigPayload): Promise<any> {
    return this.dataSource.setCCIPConfig(data);
  }

  async setLayerZeroConfig(data: LayerZeroConfigPayload): Promise<any> {
    return this.dataSource.setLayerZeroConfig(data);
  }

  async configureLayerZeroE2E(data: LayerZeroE2EConfigurePayload): Promise<any> {
    return this.dataSource.configureLayerZeroE2E(data);
  }

  async getLayerZeroE2EStatus(params: LayerZeroE2EStatusParams): Promise<any> {
    return this.dataSource.getLayerZeroE2EStatus(params);
  }

  async getCrosschainOverview(params?: CrosschainOverviewParams): Promise<{ items: any[]; meta?: any }> {
    return this.dataSource.getCrosschainOverview(params);
  }

  async getCrosschainPreflight(params: { sourceChainId: string; destChainId: string }): Promise<any> {
    return this.dataSource.getCrosschainPreflight(params);
  }

  async recheckCrosschainRoute(payload: CrosschainRecheckPayload): Promise<any> {
    return this.dataSource.recheckCrosschainRoute(payload);
  }

  async recheckCrosschainRoutesBulk(payload: CrosschainBulkRecheckPayload): Promise<any[]> {
    return this.dataSource.recheckCrosschainRoutesBulk(payload);
  }

  async autoFixCrosschainRoute(payload: CrosschainAutoFixPayload): Promise<any> {
    return this.dataSource.autoFixCrosschainRoute(payload);
  }

  async autoFixCrosschainRoutesBulk(payload: CrosschainBulkAutoFixPayload): Promise<any[]> {
    return this.dataSource.autoFixCrosschainRoutesBulk(payload);
  }

  async getRoutePolicies(params?: { page?: number; limit?: number; sourceChainId?: string; destChainId?: string }): Promise<{ items: any[]; meta?: any }> {
    return this.dataSource.getRoutePolicies(params);
  }

  async createRoutePolicy(data: RoutePolicyPayload): Promise<any> {
    return this.dataSource.createRoutePolicy(data);
  }

  async updateRoutePolicy(id: string, data: RoutePolicyPayload): Promise<any> {
    return this.dataSource.updateRoutePolicy(id, data);
  }

  async deleteRoutePolicy(id: string): Promise<void> {
    return this.dataSource.deleteRoutePolicy(id);
  }

  async getRouteErrorDiagnostics(params: RouteErrorDiagnosticsParams): Promise<any> {
    return this.dataSource.getRouteErrorDiagnostics(params);
  }

  async checkTokenPairSupport(params: { chainId: string; tokenIn: string; tokenOut: string }): Promise<{ exists: boolean; isDirect: boolean; path: string[]; executable?: boolean; reasons?: string[]; swapRouterV3?: string; universalRouter?: string }> {
    return this.dataSource.checkTokenPairSupport(params);
  }

  async interactWithContract(payload: ContractInteractPayload): Promise<{ result: any; isWrite: boolean }> {
    return this.dataSource.interactWithContract(payload);
  }
}
