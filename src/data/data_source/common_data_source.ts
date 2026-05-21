/**
 * Common Data Source
 * Acts as HTTP connector for Chain, Token, Wallet, Merchant, and legacy public pay fallbacks.
 */
import { httpClient } from '@/core/network';
import type { ApiResponse } from '@/core/network';
import { API_ENDPOINTS } from '@/core/constants';
import type {
  ConnectWalletRequest,
  ApplyMerchantRequest,
  MerchantSettlementProfileRequest,
} from '../model/request';
import type {
  ChainsResponse,
  TokensResponse,
  WalletResponse,
  WalletsResponse,
  MerchantStatusResponse,
  MessageResponse,
  PaymentRequestResponse,
  MerchantSettlementProfileResponse,
} from '../model/response';
import type { Merchant } from '../model/entity';

// ============== Chain Data Source ==============
class ChainDataSource {
  async list() {
    return httpClient.get<ChainsResponse>(API_ENDPOINTS.CHAINS);
  }
}

export const chainDataSource = new ChainDataSource();

// ============== Token Data Source ==============
class TokenDataSource {
  async list() {
    return httpClient.get<TokensResponse>(API_ENDPOINTS.TOKENS);
  }

  async listStablecoins() {
    return httpClient.get<TokensResponse>(API_ENDPOINTS.TOKENS_STABLECOINS);
  }
}

export const tokenDataSource = new TokenDataSource();

// ============== Wallet Data Source ==============
class WalletDataSource {
  async list() {
    return httpClient.get<WalletsResponse>(API_ENDPOINTS.WALLETS);
  }

  async connect(request: ConnectWalletRequest) {
    return httpClient.post<WalletResponse>(API_ENDPOINTS.WALLET_CONNECT, request);
  }

  async setPrimary(id: string) {
    return httpClient.put<WalletResponse>(API_ENDPOINTS.WALLET_PRIMARY(id), {});
  }

  async delete(id: string) {
    return httpClient.delete<MessageResponse>(API_ENDPOINTS.WALLET_BY_ID(id));
  }
}

export const walletDataSource = new WalletDataSource();

// ============== Merchant Data Source ==============
class MerchantDataSource {
  async getMe() {
    return httpClient.get<Merchant>(API_ENDPOINTS.MERCHANT_ME);
  }

  async apply(request: ApplyMerchantRequest) {
    return httpClient.post<Merchant>(API_ENDPOINTS.MERCHANT_APPLY, request);
  }

  async getStatus() {
    return httpClient.get<MerchantStatusResponse>(API_ENDPOINTS.MERCHANT_STATUS);
  }

  async updateSettings(request: { callbackUrl: string; webhookIsActive: boolean }) {
    return httpClient.patch<Merchant>(API_ENDPOINTS.MERCHANT_UPDATE_SETTINGS, request);
  }

  async getSettlementProfile() {
    return httpClient.get<MerchantSettlementProfileResponse>(API_ENDPOINTS.MERCHANT_SETTLEMENT_PROFILE);
  }

  async updateSettlementProfile(request: MerchantSettlementProfileRequest) {
    return httpClient.put<MerchantSettlementProfileResponse>(API_ENDPOINTS.MERCHANT_SETTLEMENT_PROFILE, request);
  }
}

export const merchantDataSource = new MerchantDataSource();

// ============== Legacy Public Pay Data Source ==============
class PaymentRequestDataSource {
  async getCreatePaymentById(id: string): Promise<ApiResponse<PaymentRequestResponse>> {
    return httpClient.get<PaymentRequestResponse>(API_ENDPOINTS.CREATE_PAYMENT_BY_ID(id));
  }

  async getPublic(id: string): Promise<ApiResponse<PaymentRequestResponse>> {
    return httpClient.get<PaymentRequestResponse>(API_ENDPOINTS.PAY_PUBLIC(id));
  }

  async getResolvedPublic(id: string): Promise<ApiResponse<PaymentRequestResponse>> {
    return httpClient.get<PaymentRequestResponse>(API_ENDPOINTS.PAYMENT_RESOLVE_PUBLIC(id));
  }
}

export const paymentRequestDataSource = new PaymentRequestDataSource();
