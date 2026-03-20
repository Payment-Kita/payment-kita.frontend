/**
 * Common Repository Implementations
 * Uses respective DataSources for HTTP operations
 */
import {
  chainDataSource,
  tokenDataSource,
  walletDataSource,
  merchantDataSource,
  paymentRequestDataSource,
} from '../../data_source';
import type {
  IChainRepository,
  ITokenRepository,
  IWalletRepository,
  IMerchantRepository,
} from '../repository/common_repository';
import type { ConnectWalletRequest, ApplyMerchantRequest, CreatePaymentRequestRequest, MerchantSettlementProfileRequest } from '../../model/request';

// ============== Chain Repository ==============
class ChainRepositoryImpl implements IChainRepository {
  async listChains() {
    return chainDataSource.list();
  }
}

export const chainRepository = new ChainRepositoryImpl();

// ============== Token Repository ==============
class TokenRepositoryImpl implements ITokenRepository {
  async listTokens() {
    return tokenDataSource.list();
  }

  async listStablecoins() {
    return tokenDataSource.listStablecoins();
  }
}

export const tokenRepository = new TokenRepositoryImpl();

// ============== Wallet Repository ==============
class WalletRepositoryImpl implements IWalletRepository {
  async listWallets() {
    return walletDataSource.list();
  }

  async connectWallet(input: ConnectWalletRequest) {
    return walletDataSource.connect(input);
  }

  async setPrimaryWallet(id: string) {
    return walletDataSource.setPrimary(id);
  }

  async deleteWallet(id: string) {
    return walletDataSource.delete(id);
  }
}

export const walletRepository = new WalletRepositoryImpl();

// ============== Merchant Repository ==============
class MerchantRepositoryImpl implements IMerchantRepository {
  async getMe() {
    return merchantDataSource.getMe();
  }

  async applyMerchant(input: ApplyMerchantRequest) {
    return merchantDataSource.apply(input);
  }

  async getMerchantStatus() {
    return merchantDataSource.getStatus();
  }

  async updateSettings(input: { callbackUrl: string; webhookIsActive: boolean }) {
    return merchantDataSource.updateSettings(input);
  }

  async getSettlementProfile() {
    return merchantDataSource.getSettlementProfile();
  }

  async updateSettlementProfile(input: MerchantSettlementProfileRequest) {
    return merchantDataSource.updateSettlementProfile(input);
  }
}

export const merchantRepository = new MerchantRepositoryImpl();

// ============== Payment Request Repository ==============
class PaymentRequestRepositoryImpl {
  async createPaymentRequest(input: CreatePaymentRequestRequest) {
    return paymentRequestDataSource.create(input);
  }

  async getPaymentRequest(id: string) {
    return paymentRequestDataSource.getById(id);
  }

  async listPaymentRequests(page = 1, limit = 10) {
    return paymentRequestDataSource.list(page, limit);
  }

  async getPublicPaymentRequest(id: string) {
    return paymentRequestDataSource.getPublic(id);
  }
}

export const paymentRequestRepository = new PaymentRequestRepositoryImpl();
