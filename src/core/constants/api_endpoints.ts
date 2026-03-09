// API Endpoints - All backend routes
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/v1/auth/register',
  AUTH_LOGIN: '/v1/auth/login',
  AUTH_VERIFY_EMAIL: '/v1/auth/verify-email',
  AUTH_REFRESH: '/v1/auth/refresh',
  AUTH_ME: '/v1/auth/me',
  AUTH_CHANGE_PASSWORD: '/v1/auth/change-password',

  // Payments
  PAYMENTS: '/v1/payments',
  PAYMENT_BY_ID: (id: string) => `/v1/payments/${id}`,
  PAYMENT_EVENTS: (id: string) => `/v1/payments/${id}/events`,
  PAYMENT_PRIVACY_STATUS: (id: string) => `/v1/payments/${id}/privacy-status`,
  PAYMENT_PRIVACY_RETRY: (id: string) => `/v1/payments/${id}/privacy/retry`,
  PAYMENT_PRIVACY_CLAIM: (id: string) => `/v1/payments/${id}/privacy/claim`,
  PAYMENT_PRIVACY_REFUND: (id: string) => `/v1/payments/${id}/privacy/refund`,

  // Payment Requests
  PAYMENT_REQUESTS: '/v1/payment-requests',
  PAYMENT_REQUEST_BY_ID: (id: string) => `/v1/payment-requests/${id}`,
  PAY_PUBLIC: (id: string) => `/v1/pay/${id}`,

  // Wallets
  WALLETS: '/v1/wallets',
  WALLET_CONNECT: '/v1/wallets/connect',
  WALLET_PRIMARY: (id: string) => `/v1/wallets/${id}/primary`,
  WALLET_BY_ID: (id: string) => `/v1/wallets/${id}`,

  // Merchants
  MERCHANT_APPLY: '/v1/merchants/apply',
  MERCHANT_STATUS: '/v1/merchants/status',

  // Admin
  ADMIN_STATS: '/v1/admin/stats',
  ADMIN_USERS: '/v1/admin/users',
  ADMIN_MERCHANTS: '/v1/admin/merchants',
  ADMIN_MERCHANT_STATUS: (id: string) => `/v1/admin/merchants/${id}/status`,
  ADMIN_CHAINS: '/v1/admin/chains',
  ADMIN_CHAIN_BY_ID: (id: number | string) => `/v1/admin/chains/${id}`,
  ADMIN_RPCS: '/v1/admin/rpcs',
  ADMIN_RPC_BY_ID: (id: string) => `/v1/admin/rpcs/${id}`,
  ADMIN_TOKENS: '/v1/admin/tokens',
  ADMIN_TEAMS: '/v1/admin/teams',
  ADMIN_TEAM_BY_ID: (id: string) => `/v1/admin/teams/${id}`,
  ADMIN_PAYMENT_BRIDGES: '/v1/admin/payment-bridges',
  ADMIN_PAYMENT_BRIDGE_BY_ID: (id: string) => `/v1/admin/payment-bridges/${id}`,
  ADMIN_BRIDGE_CONFIGS: '/v1/admin/bridge-configs',
  ADMIN_BRIDGE_CONFIG_BY_ID: (id: string) => `/v1/admin/bridge-configs/${id}`,
  ADMIN_FEE_CONFIGS: '/v1/admin/fee-configs',
  ADMIN_FEE_CONFIG_BY_ID: (id: string) => `/v1/admin/fee-configs/${id}`,
  ADMIN_ONCHAIN_ADAPTER_STATUS: '/v1/admin/onchain-adapters/status',
  ADMIN_ONCHAIN_ADAPTER_REGISTER: '/v1/admin/onchain-adapters/register',
  ADMIN_ONCHAIN_ADAPTER_SET_DEFAULT: '/v1/admin/onchain-adapters/default-bridge',
  ADMIN_ONCHAIN_ADAPTER_HYPERBRIDGE_CONFIG: '/v1/admin/onchain-adapters/hyperbridge-config',
  ADMIN_ONCHAIN_ADAPTER_CCIP_CONFIG: '/v1/admin/onchain-adapters/ccip-config',
  ADMIN_ONCHAIN_ADAPTER_LAYERZERO_CONFIG: '/v1/admin/onchain-adapters/layerzero-config',
  ADMIN_ONCHAIN_ADAPTER_LAYERZERO_CONFIGURE_E2E: '/v1/admin/onchain-adapters/layerzero-configure-e2e',
  ADMIN_ONCHAIN_ADAPTER_LAYERZERO_E2E_STATUS: '/v1/admin/onchain-adapters/layerzero-e2e-status',
  ADMIN_CONTRACTS_CONFIG_CHECK: '/v1/admin/contracts/config-check',
  ADMIN_CONTRACT_INTERACT: '/v1/admin/contracts/interact',
  ADMIN_CONTRACT_BY_ID_CONFIG_CHECK: (id: string) => `/v1/admin/contracts/${id}/config-check`,
  ADMIN_CROSSCHAIN_CONFIG_OVERVIEW: '/v1/admin/crosschain-config/overview',
  ADMIN_CROSSCHAIN_CONFIG_PREFLIGHT: '/v1/admin/crosschain-config/preflight',
  ADMIN_CROSSCHAIN_CONFIG_RECHECK: '/v1/admin/crosschain-config/recheck',
  ADMIN_CROSSCHAIN_CONFIG_RECHECK_BULK: '/v1/admin/crosschain-config/recheck-bulk',
  ADMIN_CROSSCHAIN_CONFIG_AUTO_FIX: '/v1/admin/crosschain-config/auto-fix',
  ADMIN_CROSSCHAIN_CONFIG_AUTO_FIX_BULK: '/v1/admin/crosschain-config/auto-fix-bulk',
  ADMIN_ROUTE_POLICIES: '/v1/admin/route-policies',
  ADMIN_ROUTE_POLICY_BY_ID: (id: string) => `/v1/admin/route-policies/${id}`,
  ADMIN_DIAGNOSTICS_ROUTE_ERROR: (paymentId: string) => `/v1/admin/diagnostics/route-error/${paymentId}`,

  // Chains
  CHAINS: '/v1/chains',

  // Tokens
  TOKENS: '/v1/tokens',
  TOKENS_STABLECOINS: '/v1/tokens/stablecoins',
  TOKENS_CHECK_PAIR: '/v1/tokens/check-pair',

  // Teams
  TEAMS: '/v1/teams',

  // Smart Contracts
  CONTRACTS: '/v1/contracts',
  CONTRACT_BY_ID: (id: string) => `/v1/contracts/${id}`,
  CONTRACT_LOOKUP: '/v1/contracts/lookup',

  // Webhooks (internal)
  WEBHOOK_INDEXER: '/v1/webhooks/indexer',

  // API Keys
  API_KEYS: '/v1/api-keys',
  API_KEY_BY_ID: (id: string) => `/v1/api-keys/${id}`,

  // Payment App (Public)
  PAYMENT_APP: '/v1/payment-app',
  PAYMENT_APP_DIAGNOSTICS_ROUTE_ERROR: (paymentId: string) => `/v1/payment-app/diagnostics/route-error/${paymentId}`,
  PAYMENT_BRIDGES: '/v1/payment-bridges',
  BRIDGE_CONFIGS: '/v1/bridge-configs',
  FEE_CONFIGS: '/v1/fee-configs',
} as const;
