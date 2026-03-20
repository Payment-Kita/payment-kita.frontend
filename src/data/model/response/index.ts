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
  WebhookLog,
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
      value?: string;
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

export interface WebhookLogsResponse {
  items: WebhookLog[];
  meta: Pagination;
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
      value?: string;
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

export interface PartnerPaymentInstructionResponse {
  chain_id: string;
  to?: string;
  value?: string;
  data?: string;
  program_id?: string;
  data_base58?: string;
  data_base64?: string;
}

export interface PartnerPaymentSessionResponse {
  payment_id: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED' | 'FAILED';
  amount: string;
  amount_decimals: number;
  dest_chain: string;
  dest_token: string;
  dest_wallet: string;
  expires_at: string;
  payment_url: string;
  payment_code: string;
  payment_instruction: PartnerPaymentInstructionResponse;
}

export interface ResolvePartnerPaymentCodeResponse {
  payment_id: string;
  merchant_id: string;
  amount: string;
  amount_decimals: number;
  dest_chain: string;
  dest_token: string;
  dest_wallet: string;
  expires_at: string;
  payment_instruction: PartnerPaymentInstructionResponse;
}

export interface MerchantSettlementProfileResponse {
  configured: boolean;
  merchant_id: string;
  invoice_currency?: string;
  dest_chain?: string;
  dest_token?: string;
  dest_wallet?: string;
  bridge_token_symbol?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePartnerCreatePaymentResponse {
  payment_id: string;
  merchant_id: string;
  amount: string;
  invoice_currency: string;
  invoice_amount: string;
  payer_selected_chain?: string;
  payer_selected_token?: string;
  payer_selected_token_symbol?: string;
  quoted_token_symbol: string;
  quoted_token_amount: string;
  quoted_token_amount_atomic: string;
  quoted_token_decimals: number;
  quote_rate: string;
  quote_source: string;
  quote_expires_at: string;
  dest_chain: string;
  dest_token: string;
  dest_wallet: string;
  settlement_dest_chain?: string;
  settlement_dest_token?: string;
  settlement_dest_wallet?: string;
  expire_time: string;
  payment_url: string;
  payment_code: string;
  payment_instruction: PartnerPaymentInstructionResponse;
}
