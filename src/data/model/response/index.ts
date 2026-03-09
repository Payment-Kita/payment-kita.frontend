import type {
  User,
  Payment,
  PaymentEvent,
  Chain,
  Token,
  SupportedToken,
  Wallet,
  PaymentRequest,
  ApiKey,
  PaymentPrivacyStatus,
  PaymentPrivacyRecoveryTx,
} from '../entity';

// Auth responses
export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

// Payment responses
export interface CreatePaymentResponse {
  paymentId: string;
  status: string;
  sourceAmount: string;
  destAmount: string;
  feeAmount: string;
  bridgeType?: string;
  feeBreakdown: {
    platformFee: string;
    bridgeFee: string;
    gasFee: string;
    totalFee: string;
    netAmount: string;
  };
  signatureData?: {
    to?: string;
    data?: string;
    value?: string;
    programId?: string;
    approval?: {
      to?: string;
      data?: string;
      spender?: string;
      amount?: string;
    };
    transactions?: Array<{
      kind?: string;
      to?: string;
      data?: string;
      spender?: string;
      amount?: string;
    }>;
  };
}

export interface PaymentResponse {
  payment: Payment;
}

export interface PaymentsResponse {
  payments: Payment[];
  pagination: Pagination;
}

export interface PaymentEventsResponse {
  events: PaymentEvent[];
}

export interface PaymentPrivacyStatusResponse {
  privacyStatus: PaymentPrivacyStatus;
}

export interface PaymentPrivacyRecoveryTxResponse {
  txData: PaymentPrivacyRecoveryTx;
}

// Chain & Token responses
export interface ChainsResponse {
  items: Chain[];
  meta: Pagination;
}

export interface TokensResponse {
  items: Token[] | SupportedToken[];
  meta: Pagination;
}

// Wallet responses
export interface WalletResponse {
  wallet: Wallet;
}

export interface WalletsResponse {
  wallets: Wallet[];
}

// Merchant responses
export interface MerchantStatusResponse {
  status: string;
  merchantType?: string;
  businessName?: string;
  message: string;
}

// Payment Request responses
export interface PaymentRequestResponse {
  requestId: string;
  txData: {
    hex?: string;
    base58?: string;
    base64?: string;
    to?: string;
    programId?: string;
  };
  contractAddress: string;
  amount: string;
  decimals: number;
  chainId: string;
  walletAddress?: string;
  expiresAt: string;
}

export interface PaymentRequestsResponse {
  paymentRequests: PaymentRequest[];
  pagination: Pagination;
}

// Common
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Key responses
export interface CreateApiKeyResponse {
  id: string;
  name: string;
  apiKey: string;
  secretKey: string;
  createdAt: string;
}

export type ApiKeyResponse = ApiKey;

export interface ApiKeysResponse {
  items: ApiKey[];
}

// Payment App responses
export interface CreatePaymentAppResponse {
  paymentId: string;
  status: string;
  sourceChainId?: string;
  destChainId?: string;
  feeBreakdown?: {
    platformFee: string;
    bridgeFee: string;
    totalFee: string;
  };
  signatureData?: {
    to?: string;
    data?: string;
    value?: string;
    programId?: string;
    approval?: {
      to?: string;
      data?: string;
      spender?: string;
      amount?: string;
    };
    transactions?: Array<{
      kind?: string;
      to?: string;
      data?: string;
      spender?: string;
      amount?: string;
    }>;
  };
  onchainCost?: {
    platformFeeToken: string;
    bridgeFeeNative: string;
    totalSourceTokenRequired: string;
    bridgeType: number;
    isSameChain: boolean;
    bridgeQuoteOk: boolean;
    bridgeQuoteReason: string;
  };
}
