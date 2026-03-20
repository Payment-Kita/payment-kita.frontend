'use client';

import { useState } from 'react';

export function usePartnerAPI() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const headers = [
    { name: 'X-PK-Key', value: 'your_api_key', desc: 'Your partner API key' },
    { name: 'X-PK-Signature', value: 'hmac_signature', desc: 'HMAC-SHA256 of timestamp + method + path + body_hash' },
    { name: 'X-PK-Timestamp', value: 'unix_timestamp', desc: 'Current Unix timestamp in seconds' },
    { name: 'Content-Type', value: 'application/json', desc: 'Must be application/json' }
  ];

  const requestSchema = [
    { field: 'merchant_id', type: 'string', required: false, desc: 'Optional merchant UUID override for admin/internal use. Normal merchant-authenticated requests should omit it.' },
    { field: 'chain_id', type: 'string', required: true, desc: 'CAIP-2 chain id selected by the customer, for example eip155:8453.' },
    { field: 'selected_token', type: 'string', required: true, desc: 'Token address or mint selected by the customer on chain_id.' },
    { field: 'pricing_type', type: 'string', required: true, desc: 'One of invoice_currency, payment_token_fixed, or payment_token_dynamic.' },
    { field: 'requested_amount', type: 'string', required: true, desc: 'Human-readable decimal string. Backend converts it into atomic units based on pricing_type and token decimals.' },
  ];

  const webhookSchema = [
    { field: 'paymentId', type: 'string', desc: 'Internal payment identifier for payment runtime events' },
    { field: 'status', type: 'string', desc: 'Runtime payment status such as completed, failed, refunded' },
    { field: 'sourceTxHash', type: 'string', desc: 'Origin chain transaction hash when available' },
    { field: 'destTxHash', type: 'string', desc: 'Destination chain transaction hash when available' },
    { field: 'reason', type: 'string', desc: 'Failure reason for PAYMENT_FAILED when present' },
  ];

  return {
    copiedCode,
    handleCopy,
    headers,
    requestSchema,
    webhookSchema
  };
}
