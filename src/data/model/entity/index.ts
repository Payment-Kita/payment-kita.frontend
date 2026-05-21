// User entity
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  kycStatus: string;
}

// Payment entity
export interface Payment {
  paymentId: string;
  senderId: string;
  merchantId?: string;
  sourceChainId: string;
  destChainId: string;
  sourceTokenAddress: string;
  destTokenAddress: string;
  sourceAmount: string;
  destAmount: string;
  feeAmount: string;
  status: string;
  bridgeType?: string;
  sourceTxHash?: string;
  destTxHash?: string;
  receiverAddress: string;
  decimals: number;
  createdAt: string;
  updatedAt: string;
}

// Payment event entity
export interface PaymentEvent {
  id: string;
  paymentId: string;
  eventType: string;
  chain: string;
  txHash?: string;
  blockNumber?: number;
  metadata?: unknown;
  createdAt: string;
}

export interface PaymentQuoteSnapshotPreviewApproval {
  requiredNativeFee?: string;
  approvalToken?: string;
  approvalAmount?: string;
  approvalSpender?: string;
}

export interface PaymentQuoteSnapshotCost {
  platformFeeToken?: string;
  bridgeFeeNative?: string;
  totalSourceTokenRequired?: string;
  bridgeType?: number;
  isSameChain?: boolean;
  bridgeQuoteOk?: boolean;
  bridgeQuoteReason?: string;
}

export interface PaymentQuoteSnapshot {
  schema: 'payment_quote_snapshot.v1';
  previewApproval?: PaymentQuoteSnapshotPreviewApproval;
  quotePaymentCost?: PaymentQuoteSnapshotCost;
}

export interface PaymentPrivacyStatus {
  paymentId: string;
  stage: string;
  isPrivacyCandidate: boolean;
  signals?: string[];
  reason?: string;
}

export type PaymentPrivacyRecoveryAction = 'retry' | 'claim' | 'refund';

export interface PaymentPrivacyRecoveryTx {
  action: PaymentPrivacyRecoveryAction;
  paymentId: string;
  onchainPaymentId: string;
  stage: string;
  chainId: string;
  contractAddress: string;
  method: string;
  calldata: string;
  value: string;
  signals?: string[];
  reason?: string;
}

// Chain entity
export interface Chain {
  id: number;
  networkId: string;
  caip2: string;
  namespace: string;
  name: string;
  chainType: string;
  rpcUrl: string;
  explorerUrl: string;
  symbol: string;
  logoUrl?: string;
  isActive: boolean;
  ccipChainSelector?: string;
  stargateEid?: number;
}

// Token entity
export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  isStablecoin: boolean;
  contractAddress?: string;
}

// Supported token entity
export interface SupportedToken extends Token {
  chainId: number;
  contractAddress: string;
  minAmount: string;
  maxAmount: string;
}

// Wallet entity
export interface Wallet {
  id: string;
  userId: string;
  chainId: string;
  address: string;
  isPrimary: boolean;
  createdAt: string;
}

// Merchant entity
export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  businessEmail: string;
  merchantType: string;
  status: string;
  taxId?: string;
  businessAddress?: string;
  callbackUrl?: string;
  webhookSecret?: string;
  webhookIsActive?: boolean;
}

// Webhook Log entity
export interface WebhookLog {
  id: string;
  merchantId: string;
  paymentId: string;
  eventType: string;
  payload: any;
  deliveryStatus: 'pending' | 'delivering' | 'delivered' | 'retrying' | 'failed' | 'dropped';
  httpStatus?: number;
  responseBody?: string;
  retryCount: number;
  nextRetryAt?: string;
  lastAttemptAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Key entity
export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  secretMasked: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
