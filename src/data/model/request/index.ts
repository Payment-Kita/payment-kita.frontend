// Auth requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  walletAddress?: string;
  walletChainId?: string;
  walletSignature?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Payment requests
export interface CreatePaymentRequest {
  sourceChainId: string;
  destChainId: string;
  sourceTokenAddress: string;
  destTokenAddress: string;
  amount: string;
  receiverAddress: string;
  decimals: number;
}

// Payment request requests
export interface CreatePaymentRequestRequest {
  chainId: string;
  tokenAddress: string;
  amount: string;
  decimals: number;
  description?: string;
}

// Wallet requests
export interface ConnectWalletRequest {
  chainId: string;
  address: string;
  signature: string;
}

// Merchant requests
export interface ApplyMerchantRequest {
  businessName: string;
  businessEmail: string;
  merchantType: string;
  taxId?: string;
  businessAddress?: string;
}

export interface MerchantSettlementProfileRequest {
  invoice_currency?: string;
  dest_chain: string;
  dest_token: string;
  dest_wallet: string;
  bridge_token_symbol?: string;
}

// API Key requests
export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
  expiresAt?: string;
}

// Payment App requests
export interface CreatePaymentAppRequest {
  senderWalletAddress: string;
  sourceChainId: string;
  destChainId: string;
  sourceTokenAddress: string;
  destTokenAddress: string;
  amount: string;
  decimals: number;
  receiverAddress: string;
  mode?: 'regular' | 'privacy';
  bridgeOption?: number | null;
  bridgeTokenSource?: string | null;
  minBridgeAmountOut?: string | null;
  minDestAmountOut?: string | null;
  privacyIntentId?: string | null;
  privacyStealthReceiver?: string | null;
}

export interface PaymentPrivacyRecoveryRequest {
  onchainPaymentId?: string;
}

export interface ResolvePartnerPaymentCodeRequest {
  payment_code: string;
  payer_wallet?: string;
}
