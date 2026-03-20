'use client';

import { useState } from 'react';
import { useTranslation } from '@/presentation/hooks/useTranslation';

export type ApiEndpointDoc = {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  auth: 'partner' | 'jwt' | 'public';
  description: string;
  requestExample?: string;
  responseExample: string;
  testMethod: 'GET' | 'POST';
  bodyTemplate?: string;
};

export function useAPI() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(id);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const endpoints: { category: string; items: ApiEndpointDoc[] }[] = [
    {
      category: t('docs.api.category_partner_flow', 'Partner Flow'),
      items: [
        {
          id: 'partner-create-payment',
          method: 'POST' as const,
          path: '/api/v1/create-payment',
          auth: 'partner' as const,
          description: t('docs.api.endpoint_create_payment_desc', 'Create a payment in one merchant-facing call. Backend resolves merchant config, pricing mode, quote path, and final payment instruction.'),
          testMethod: 'POST' as const,
          bodyTemplate: JSON.stringify({ merchant_id: '019d0c4e-9726-76bf-ab20-0bed0752af1a', chain_id: 'eip155:8453', selected_token: '0x833589fcd6edb6e08f4c7c32d4f71b54bdA02913', pricing_type: 'invoice_currency', requested_amount: '50000' }, null, 2),
          requestExample: `POST /api/v1/create-payment
X-PK-Key: pk_live_...
X-PK-Timestamp: 1710000000
X-PK-Signature: ...

{
  "merchant_id": "019d0c4e-9726-76bf-ab20-0bed0752af1a",
  "chain_id": "eip155:8453",
  "selected_token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "pricing_type": "invoice_currency",
  "requested_amount": "50000"
}` ,
          responseExample: `{
  "payment_id": "0195f1d4-6d3a-7f5f-b8e9-9b4c04d5a111",
  "merchant_id": "019d0c4e-9726-76bf-ab20-0bed0752af1a",
  "invoice_currency": "IDRX",
  "invoice_amount": "50000",
  "payer_selected_chain": "eip155:8453",
  "payer_selected_token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "payer_selected_token_symbol": "USDC",
  "quoted_token_symbol": "USDC",
  "quoted_token_amount": "2.95",
  "quoted_token_amount_atomic": "2950000",
  "quoted_token_decimals": 6,
  "quote_rate": "1 IDRX = 0.000059 USDC",
  "quote_source": "Uniswap Pool",
  "quote_expires_at": "2026-03-20T10:20:00Z",
  "dest_chain": "eip155:8453",
  "dest_token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "dest_wallet": "0xMerchantDestination",
  "settlement_dest_chain": "eip155:8453",
  "settlement_dest_token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "settlement_dest_wallet": "0xMerchantDestination",
  "expire_time": "2026-03-20T10:20:00Z",
  "payment_url": "https://pay.paymentkita.com/checkout/0195f1d4",
  "payment_code": "eyJhbGciOi...",
  "payment_instruction": {
    "chain_id": "eip155:8453",
    "to": "0xReceiver",
    "value": "0x0",
    "data": "0xafc93ccd..."
  }
}`
        },
        {
          id: 'partner-session-read',
          method: 'GET' as const,
          path: '/api/v1/partner/payment-sessions/:id',
          auth: 'public' as const,
          description: t('docs.api.endpoint_partner_session_read_desc', 'Read hosted checkout state for rendering, refresh, and polling.'),
          testMethod: 'GET' as const,
          responseExample: `{
  "payment_id": "0195-session",
  "status": "PENDING",
  "quoted_token_amount_atomic": "2950000",
  "quoted_token_decimals": 6,
  "dest_chain": "eip155:8453",
  "dest_token": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "dest_wallet": "0xMerchantDestination",
  "expires_at": "2026-03-20T10:20:00Z",
  "payment_url": "https://pay.paymentkita.com/checkout/0195-session",
  "payment_code": "eyJhbGciOi...",
  "payment_instruction": {
    "chain_id": "eip155:8453",
    "to": "0xGateway",
    "value": "0",
    "data": "0xafc93ccd..."
  }
}`
        },
        {
          id: 'partner-resolve-code',
          method: 'POST' as const,
          path: '/api/v1/partner/payment-sessions/resolve-code',
          auth: 'public' as const,
          description: t('docs.api.endpoint_partner_resolve_desc', 'Resolve an encrypted payment_code into a normalized payment instruction.'),
          testMethod: 'POST' as const,
          bodyTemplate: JSON.stringify({ payment_code: 'replace-with-payment-code' }, null, 2),
          requestExample: `POST /api/v1/partner/payment-sessions/resolve-code
{
  "payment_code": "eyJhbGciOi..."
}` ,
          responseExample: `{
  "payment_id": "0195f1d4-6d3a-7f5f-b8e9-9b4c04d5a111",
  "quoted_token_amount_atomic": "2950000",
  "quoted_token_decimals": 6,
  "dest_chain": "eip155:8453",
  "dest_token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "dest_wallet": "0xMerchantDestination",
  "expires_at": "2026-03-20T10:20:00Z",
  "payment_instruction": {
    "chain_id": "eip155:8453",
    "to": "0xGateway",
    "value": "0",
    "data": "0xafc93ccd..."
  }
}`
        },
      ]
    },
    {
      category: t('docs.api.category_runtime_support', 'Runtime Support'),
      items: [
        {
          id: 'partner-quotes',
          method: 'POST' as const,
          path: '/api/v1/partner/quotes',
          auth: 'partner' as const,
          description: t('docs.api.endpoint_partner_quotes_desc', 'Internal/runtime quote primitive retained for orchestration and diagnostics.'),
          testMethod: 'POST' as const,
          bodyTemplate: JSON.stringify({ invoice_currency: 'IDRX', invoice_amount: '50000000000', selected_chain: 'eip155:8453', selected_token: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', dest_wallet: '0xMerchantDestination' }, null, 2),
          requestExample: `POST /api/v1/partner/quotes
X-PK-Key: pk_live_...
X-PK-Timestamp: 1710000000
X-PK-Signature: ...

{
  "invoice_currency": "IDRX",
  "invoice_amount": "50000000000",
  "selected_chain": "eip155:8453",
  "selected_token": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "dest_wallet": "0xMerchantDestination"
}`,
          responseExample: `{
  "quote_id": "0195d4b4-1e2c-7f2f-9aa1-123456789012",
  "quoted_amount": "2950000",
  "quote_decimals": 6,
  "quote_rate": "0.000059",
  "price_source": "uniswap-v4-base-usdc-idrx"
}`
        },
        {
          id: 'partner-session-create',
          method: 'POST' as const,
          path: '/api/v1/partner/payment-sessions',
          auth: 'partner' as const,
          description: t('docs.api.endpoint_partner_session_create_desc', 'Internal/runtime session primitive retained for orchestration and diagnostics.'),
          testMethod: 'POST' as const,
          bodyTemplate: JSON.stringify({ quote_id: 'replace-with-quote-id', dest_wallet: '0xMerchantDestination' }, null, 2),
          requestExample: `POST /api/v1/partner/payment-sessions
X-PK-Key: pk_live_...
X-PK-Timestamp: 1710000000
X-PK-Signature: ...

{
  "quote_id": "replace-with-quote-id",
  "dest_wallet": "0xMerchantDestination"
}`,
          responseExample: `{
  "payment_id": "0195-session",
  "payment_url": "https://pay.paymentkita.com/checkout/0195-session",
  "payment_code": "eyJhbGciOi...",
  "status": "PENDING"
}`
        },
      ]
    },
    {
      category: t('docs.api.category_legacy', 'Legacy Compatibility'),
      items: [
        {
          id: 'legacy-payment-requests',
          method: 'POST' as const,
          path: '/api/v1/payment-requests',
          auth: 'jwt' as const,
          description: t('docs.api.endpoint_legacy_payment_requests_desc', 'Deprecated legacy payment request creation. Kept only for staged cutover.'),
          testMethod: 'POST' as const,
          bodyTemplate: JSON.stringify({ chainId: 'eip155:8453', tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', amount: '1000', decimals: 6, description: 'Legacy test' }, null, 2),
          responseExample: `{
  "requestId": "legacy-request-id",
  "txData": { "to": "0xGateway", "data": "0x..." },
  "expiresAt": "2026-03-20T10:20:00Z"
}`
        },
        {
          id: 'legacy-pay-read',
          method: 'GET' as const,
          path: '/api/v1/pay/:id',
          auth: 'public' as const,
          description: t('docs.api.endpoint_legacy_pay_read_desc', 'Deprecated legacy hosted read model. Use partner session read instead.'),
          testMethod: 'GET' as const,
          responseExample: `{
  "requestId": "legacy-request-id",
  "paymentCode": "pay:legacy-request-id"
}`
        },
        {
          id: 'legacy-resolve',
          method: 'GET' as const,
          path: '/api/v1/resolve-payment-code?code=...',
          auth: 'public' as const,
          description: t('docs.api.endpoint_legacy_resolve_desc', 'Deprecated legacy resolve contract. Use partner resolve-code instead.'),
          testMethod: 'GET' as const,
          responseExample: `{
  "session_id": "legacy-session",
  "instruction": { "to": "0xGateway", "data": "0x..." }
}`
        },
      ]
    },
  ];

  const getMethodVariant = (method: string): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' => {
    switch (method) {
      case 'GET': return 'secondary';
      case 'POST': return 'success';
      default: return 'default';
    }
  };

  return { endpoints, copiedEndpoint, handleCopy, getMethodVariant };
}
