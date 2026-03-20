// Environment configuration
export const ENV = {
  // API base URL - uses proxy route for client-side, direct backend for server-side
  API_BASE_URL: '/api',

  // Backend URL for server-side direct calls (only available server-side)
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8080',

  // Public API URL for direct public HTTP calls
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',

  // Shared secret between frontend proxy and backend middleware
  INTERNAL_PROXY_SECRET: process.env.INTERNAL_PROXY_SECRET || '',

  // WalletConnect
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

  // Server-side crypto/auth settings
  ENCRYPT_KEY: process.env.ENCRYPT_KEY || 'default-secret-key-must-be-32-chars',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || '',
  ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || '',

  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;
