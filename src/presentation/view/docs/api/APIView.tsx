'use client';

import { useState } from 'react';
import { ENV } from '@/core/config/env';
import { Card, Badge, Button, Input } from '@/presentation/components/atoms';
import { Copy, Check, Shield, Globe, Terminal, AlertCircle } from 'lucide-react';
import { DocsCodeBlock } from '@/presentation/components/molecules/DocsCodeBlock';
import { DocsEndpointAccordionItem } from '@/presentation/components/molecules/DocsEndpointAccordionItem';
import { useAPI, type ApiEndpointDoc } from './useAPI';
import { useTranslation } from '@/presentation/hooks/useTranslation';

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function APIView() {
  const { endpoints, copiedEndpoint, handleCopy, getMethodVariant } = useAPI();
  const { t } = useTranslation();
  const docsBaseUrl = ENV.NEXT_PUBLIC_BACKEND_URL;
  const [openId, setOpenId] = useState<string | null>(endpoints[0]?.items[0]?.id ?? null);
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [pathValue, setPathValue] = useState('/api/v1/partner/payment-sessions/replace-with-session-id');
  const [bodyById, setBodyById] = useState<Record<string, string>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [resultById, setResultById] = useState<Record<string, string>>({});
  const [requestStateById, setRequestStateById] = useState<Record<string, 'idle' | 'success' | 'error'>>({});

  const normalizedBody = Object.fromEntries(endpoints.flatMap((section) => section.items.map((item) => [item.id, bodyById[item.id] ?? item.bodyTemplate ?? ''])));

  const resolveRequestUrl = (path: string) => {
    if (/^https?:\/\//i.test(path)) return path;
    const base = docsBaseUrl.replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  };

  const runTest = async (endpoint: ApiEndpointDoc) => {
    setTestingId(endpoint.id);
    setRequestStateById((current) => ({ ...current, [endpoint.id]: 'idle' }));
    try {
      const isPathParam = endpoint.path.includes(':id');
      const requestPath = isPathParam ? pathValue : endpoint.path;
      const requestUrl = resolveRequestUrl(requestPath);
      const body = normalizedBody[endpoint.id] || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (endpoint.auth === 'partner') {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const bodyHash = await sha256Hex(body || '{}');
        const message = `${timestamp}.${endpoint.testMethod}.${requestPath}.${bodyHash}`;
        headers['X-PK-Key'] = apiKey;
        headers['X-PK-Timestamp'] = timestamp;
        headers['X-PK-Signature'] = await hmacSha256Hex(secretKey, message);
      }

      const response = await fetch(requestUrl, {
        method: endpoint.testMethod,
        headers,
        body: endpoint.testMethod === 'POST' ? body : undefined,
      });
      const text = await response.text();
      setResultById((current) => ({ ...current, [endpoint.id]: `HTTP ${response.status}\nURL: ${requestUrl}\n${text}` }));
      setRequestStateById((current) => ({ ...current, [endpoint.id]: response.ok ? 'success' : 'error' }));
    } catch (error) {
      setResultById((current) => ({ ...current, [endpoint.id]: String(error) }));
      setRequestStateById((current) => ({ ...current, [endpoint.id]: 'error' }));
    } finally {
      setTestingId(null);
    }
  };

  const tryTitle = t('docs.api.try_title', 'Try This API');
  const pathOverrideHint = t('docs.api.path_override_hint', 'Use the Path Override field above for routes with `:id` placeholders.');
  const sendLabel = t('docs.api.send_test', 'Send Test Request');
  const sendingLabel = t('docs.api.sending', 'Sending...');
  const successLabel = t('docs.api.request_succeeded', 'Request Succeeded');
  const failedLabel = t('docs.api.request_failed', 'Request Failed');

  return (
    <div className="max-w-7xl space-y-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="heading-1 text-foreground">{t('docs.api.title', 'API Reference')}</h1>
          <p className="body-lg text-muted mt-2">{t('docs.api.subtitle', 'Interactive runtime reference for partner and legacy compatibility routes.')}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted uppercase tracking-wider">v1 partner runtime</span>
        </div>
      </div>

      <Card variant="glass" size="lg" className="bg-white/5 border-white/10 rounded-3xl">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{t('docs.api.base_url_title', 'Base URL')}</h3>
              <p className="text-sm text-muted">{t('docs.api.base_url_desc', 'Use the same origin in local development or prepend your production API host.')}</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex-1 bg-black/40 p-4 rounded-2xl text-[13px] font-mono border border-white/10 text-primary-100 flex items-center justify-between">
              <span>{docsBaseUrl}</span>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(docsBaseUrl, 'base-url')} className="h-8 w-8 p-0 rounded-lg">
                {copiedEndpoint === 'base-url' ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4 text-muted" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="glass" size="lg" className="bg-white/5 border-white/10 rounded-3xl">
        <div className="grid gap-4 lg:grid-cols-3">
          <Input label="Partner API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="pk_live_..." />
          <Input label="Partner Secret Key" type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="sk_live_..." />
          <Input label="Path Override for :id Routes" value={pathValue} onChange={(e) => setPathValue(e.target.value)} placeholder="/api/v1/partner/payment-sessions/replace-with-session-id" />
        </div>
      </Card>

      <Card variant="glass" size="lg" className="bg-white/5 border-white/10 rounded-3xl overflow-hidden">
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold text-foreground">{t('docs.api.create_flow_title', 'Recommended Create Payment Flow')}</h3>
              <p className="text-sm text-muted mt-2 max-w-3xl">
                {t('docs.api.create_flow_desc', 'The current create payment contract is not the legacy payment request route. Merchant sets the invoice currency first, customer selects a destination stablecoin, then the runtime derives the payable token amount from the live Uniswap pool route.')}
              </p>
            </div>
            <Badge variant="success">{t('docs.api.create_flow_badge', 'Current partner flow')}</Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                title: t('docs.api.create_flow_step1_title', '1. Merchant defines invoice'),
                desc: t('docs.api.create_flow_step1_desc', 'Example: invoice is fixed at 50.000 IDRX. This is the business amount the merchant wants to receive.'),
              },
              {
                title: t('docs.api.create_flow_step2_title', '2. Customer selects payment stablecoin'),
                desc: t('docs.api.create_flow_step2_desc', 'Example: customer chooses USDC or USDT on the destination chain. The quote route decides how much stablecoin is needed.'),
              },
              {
                title: t('docs.api.create_flow_step3_title', '3. Runtime returns payable instruction'),
                desc: t('docs.api.create_flow_step3_desc', 'Example: 50.000 IDRX becomes 2,95 USDC based on the active Uniswap pool route, then create session returns payment_url, payment_code, and hex calldata.'),
              },
            ].map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted font-black">Step {index + 1}</div>
                <h4 className="text-base font-bold text-foreground">{item.title}</h4>
                <p className="mt-2 text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-muted font-black">{t('docs.api.mental_model_badge', 'Mental Model')}</div>
            <p className="mt-3 text-base font-semibold text-foreground">
              {t('docs.api.mental_model_formula', 'invoice currency -> pool quote -> selected stablecoin amount')}
            </p>
            <p className="mt-2 text-sm text-muted max-w-4xl">
              {t('docs.api.mental_model_desc', 'Merchant decides the invoice side first. The quote engine then maps that business amount into the stablecoin chosen by the customer using the active on-chain pool route and returns the payable amount plus execution payload.')}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DocsCodeBlock
              code={`POST /api/v1/create-payment
{
  "merchant_id": "019d0c4e-9726-76bf-ab20-0bed0752af1a",
  "chain_id": "eip155:8453",
  "selected_token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "pricing_type": "invoice_currency",
  "requested_amount": "50000"
}`}
              copied={copiedEndpoint === 'recommended-create-payment-request'}
              onCopy={() => handleCopy(`POST /api/v1/create-payment
{
  "merchant_id": "019d0c4e-9726-76bf-ab20-0bed0752af1a",
  "chain_id": "eip155:8453",
  "selected_token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "pricing_type": "invoice_currency",
  "requested_amount": "50000"
}`, 'recommended-create-payment-request')}
            />
            <DocsCodeBlock
              code={`HTTP 200
{
  "payment_id": "0195f1d4-6d3a-7f5f-b8e9-9b4c04d5a111",
  "invoice_currency": "IDRX",
  "invoice_amount": "50000",
  "quoted_token_symbol": "USDC",
  "quoted_token_amount": "2.95",
  "quoted_token_amount_atomic": "2950000",
  "quoted_token_decimals": 6,
  "quote_rate": "1 IDRX = 0.000059 USDC",
  "quote_source": "Uniswap Pool",
  "payment_url": "https://pay.paymentkita.com/checkout/0195f1d4",
  "payment_instruction": {
    "chain_id": "eip155:8453",
    "to": "0xGateway",
    "value": "0",
    "data": "0xafc93ccd...",
    "approval_to": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "approval_hex_data": "0x095ea7b3..."
  }
}`}
              copied={copiedEndpoint === 'recommended-create-payment-response'}
              onCopy={() => handleCopy(`HTTP 200
{
  "payment_id": "0195f1d4-6d3a-7f5f-b8e9-9b4c04d5a111",
  "invoice_currency": "IDRX",
  "invoice_amount": "50000",
  "quoted_token_symbol": "USDC",
  "quoted_token_amount": "2.95",
  "quoted_token_amount_atomic": "2950000",
  "quoted_token_decimals": 6,
  "quote_rate": "1 IDRX = 0.000059 USDC",
  "quote_source": "Uniswap Pool",
  "payment_url": "https://pay.paymentkita.com/checkout/0195f1d4",
  "payment_instruction": {
    "chain_id": "eip155:8453",
    "to": "0xGateway",
    "value": "0",
    "data": "0xafc93ccd...",
    "approval_to": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "approval_hex_data": "0x095ea7b3..."
  }
}`, 'recommended-create-payment-response')}
              tone="response"
            />
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5">
            <p className="text-sm font-semibold text-amber-100">`payment_code` is the encrypted QR payload</p>
            <p className="mt-2 text-sm text-amber-50/85 leading-relaxed">
              Display `payment_code` as the QR value shown to the payer. It is not meant to be decoded in the client.
              Only `POST /api/v1/partner/payment-sessions/resolve-code` should decrypt it and return the normalized payment instruction.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DocsCodeBlock
              code={`POST /api/v1/create-payment
{
  "merchant_id": "019d0c4e-9726-76bf-ab20-0bed0752af1a",
  "chain_id": "eip155:42161",
  "selected_token": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  "pricing_type": "payment_token_fixed",
  "requested_amount": "2.95"
}`}
              copied={copiedEndpoint === 'recommended-usdt-request'}
              onCopy={() => handleCopy(`POST /api/v1/create-payment
{
  "merchant_id": "019d0c4e-9726-76bf-ab20-0bed0752af1a",
  "chain_id": "eip155:42161",
  "selected_token": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  "pricing_type": "payment_token_fixed",
  "requested_amount": "2.95"
}`, 'recommended-usdt-request')}
            />
            <DocsCodeBlock
              code={`HTTP 200
{
  "payment_id": "0195f1d4-6d3a-7f5f-b8e9-9b4c04d5a112",
  "invoice_currency": "IDRX",
  "invoice_amount": "50000",
  "quoted_token_symbol": "USDT",
  "quoted_token_amount": "2.95",
  "quoted_token_amount_atomic": "2950000",
  "quoted_token_decimals": 6,
  "quote_rate": "1 IDRX = 0.000059 USDT",
  "quote_source": "Uniswap Pool",
  "payment_url": "https://pay.paymentkita.com/checkout/0195f1d4",
  "payment_instruction": {
    "chain_id": "eip155:42161",
    "to": "0xGateway",
    "value": "0",
    "data": "0xafc93ccd...",
    "approval_to": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    "approval_hex_data": "0x095ea7b3..."
  }
}`}
              copied={copiedEndpoint === 'recommended-usdt-response'}
              onCopy={() => handleCopy(`HTTP 200
{
  "payment_id": "0195f1d4-6d3a-7f5f-b8e9-9b4c04d5a112",
  "invoice_currency": "IDRX",
  "invoice_amount": "50000",
  "quoted_token_symbol": "USDT",
  "quoted_token_amount": "2.95",
  "quoted_token_amount_atomic": "2950000",
  "quoted_token_decimals": 6,
  "quote_rate": "1 IDRX = 0.000059 USDT",
  "quote_source": "Uniswap Pool",
  "payment_url": "https://pay.paymentkita.com/checkout/0195f1d4",
  "payment_instruction": {
    "chain_id": "eip155:42161",
    "to": "0xGateway",
    "value": "0",
    "data": "0xafc93ccd...",
    "approval_to": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    "approval_hex_data": "0x095ea7b3..."
  }
}`, 'recommended-usdt-response')}
              tone="response"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-10">
        {endpoints.map((section) => (
          <div key={section.category} className="space-y-4">
            <h2 className="heading-3 text-foreground flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary/60" />
              {section.category}
            </h2>
            <div className="grid gap-4">
              {section.items.map((endpoint) => {
                const expanded = openId === endpoint.id;
                const bodyValue = normalizedBody[endpoint.id];
                const requestState = requestStateById[endpoint.id] ?? 'idle';
                return (
                  <DocsEndpointAccordionItem
                    key={endpoint.id}
                    endpoint={endpoint}
                    expanded={expanded}
                    copiedEndpoint={copiedEndpoint}
                    bodyValue={bodyValue}
                    result={resultById[endpoint.id] ?? ''}
                    requestState={requestState}
                    testing={testingId === endpoint.id}
                    methodVariant={getMethodVariant(endpoint.method)}
                    onToggle={() => setOpenId(expanded ? null : endpoint.id)}
                    onCopy={handleCopy}
                    onBodyChange={(value) => setBodyById((current) => ({ ...current, [endpoint.id]: value }))}
                    onRun={() => runTest(endpoint)}
                    tryTitle={tryTitle}
                    pathOverrideHint={pathOverrideHint}
                    sendLabel={sendLabel}
                    sendingLabel={sendingLabel}
                    successLabel={successLabel}
                    failedLabel={failedLabel}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Card variant="outlined" size="md" className="border-amber-500/30 bg-amber-500/5">
        <div className="flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-200">{t('docs.api.auth_warning_title', 'Security note')}</h3>
            <p className="mt-1 text-sm text-amber-100/80 leading-relaxed">
              {t('docs.api.auth_warning_desc', 'Interactive testing sends your API key and secret from the browser. Use this only in trusted development or internal environments.')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
