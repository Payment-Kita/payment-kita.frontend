'use client';

import { Card, Badge, Button } from '@/presentation/components/atoms';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/organisms/table';
import { Copy, Check, ShieldCheck, Key, Zap, Bell, Repeat, Code2, Globe } from 'lucide-react';
import { usePartnerAPI } from './usePartnerAPI';
import { ResolveCodeDemo } from './ResolveCodeDemo';
import { useTranslation } from '@/presentation/hooks/useTranslation';

export function PartnerAPIView() {
  const { copiedCode, handleCopy, headers, requestSchema, webhookSchema } = usePartnerAPI();
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl space-y-16 animate-fade-in pb-20">
      <div className="space-y-4 animate-fade-in-up">
        <h1 className="heading-display bg-linear-to-r from-primary via-accent-blue to-accent-green bg-clip-text text-transparent">
          {t('docs.partner.title', 'Partner API Documentation')}
        </h1>
        <p className="body-lg text-muted max-w-4xl leading-relaxed">
          {t('docs.partner.subtitle', 'Runtime contract for the additive partner flow. This flow is separate from `/v1/payment-app` and is the authoritative path for partner quote, hosted checkout session, hosted read model, and QR resolve.')}
        </p>
      </div>

      <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="heading-2 text-foreground flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-primary" />
          {t('docs.partner.security_title', 'Security & Authentication')}
        </h2>
        <Card variant="glass" size="lg" className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border-t-primary/20">
          <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Key className="w-5 h-5 text-accent-blue" />
                    {t('docs.partner.hmac_title', 'HMAC Authentication')}
                  </h3>
                  <p className="text-muted mt-2 text-sm leading-relaxed">
                    {t('docs.partner.hmac_desc', 'Partner write routes require canonical signing with `timestamp + method + path + body_hash`.')}
                  </p>
                </div>

                <div className="grid gap-3">
                  <span className="text-xs font-bold text-muted uppercase tracking-[0.2em] opacity-60">Required Headers</span>
                  {headers.map((header) => (
                    <div key={header.name} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 group hover:border-accent-blue/30 transition-all">
                      <div className="flex flex-col">
                        <code className="text-sm font-bold text-primary-100">{header.name}</code>
                        <span className="text-[11px] text-muted-foreground mt-0.5">{header.desc}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-muted font-mono bg-white/5 px-2 py-1 rounded-md">{header.value}</code>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleCopy(header.value, header.name)}>
                          {copiedCode === header.name ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-black/60 rounded-3xl border border-white/10 overflow-hidden shadow-inner h-full">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-muted uppercase tracking-wider">Node.js Signature</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => handleCopy('const crypto = require(\'crypto\');...', 'hmac-code')}>
                      {copiedCode === 'hmac-code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <pre className="p-6 text-[13px] font-mono leading-relaxed text-primary-100/90 overflow-x-auto">
{`const crypto = require('crypto');

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function generateSignature({ timestamp, method, path, body }, secret) {
  const bodyString = JSON.stringify(body ?? {});
  const bodyHash = sha256Hex(bodyString);
  const message = \`${'${timestamp}'}${'${method.toUpperCase()}'}${'${path}'}${'${bodyHash}'}\`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <h2 className="heading-2 text-foreground flex items-center gap-3">
          <Globe className="w-7 h-7 text-accent-green" />
          {t('docs.partner.endpoint_map_title', 'Endpoint Map')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['POST', '/api/v1/create-payment', t('docs.partner.endpoint_create_payment_desc', 'Create a merchant-facing payment in a single call. Backend resolves pricing mode, quote path, and final instruction.')],
            ['GET', '/api/v1/partner/payment-sessions/:id', t('docs.partner.endpoint_read_desc', 'Public hosted checkout read model for rendering and polling.')],
            ['POST', '/api/v1/partner/payment-sessions/resolve-code', t('docs.partner.endpoint_resolve_desc', 'Resolve encrypted payment_code into normalized instruction.')],
            ['POST', '/api/v1/partner/quotes', t('docs.partner.endpoint_quotes_desc', 'Internal/runtime quote primitive retained for orchestration and diagnostics.')],
          ].map(([method, path, desc]) => (
            <Card key={path} className="rounded-4xl bg-white/5 border-white/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={method === 'GET' ? 'outline' : 'success'}>{method}</Badge>
                  <code className="text-[11px] text-primary-100 break-all">{path}</code>
                </div>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="heading-2 text-foreground flex items-center gap-3">
          <Zap className="w-7 h-7 text-accent-green" />
          {t('docs.partner.create_payment_title', 'Create Payment')}
        </h2>
        <Card variant="glass" size="lg" className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border-t-accent-green/20">
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">POST /api/v1/create-payment</h3>
                <p className="text-muted mt-1">{t('docs.partner.create_payment_intro', 'Merchant-facing contract. Backend handles pricing resolution and session construction internally.')}</p>
              </div>
              <Badge variant="success" className="px-6 py-2 rounded-xl text-xs">POST</Badge>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted uppercase tracking-widest px-1">Request Schema</h4>
              <Card variant="glass" className="p-0 overflow-hidden rounded-3xl border-white/5 bg-black/20">
                <Table>
                  <TableHeader className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <TableRow>
                      <TableHead className="p-5">Field</TableHead>
                      <TableHead className="p-5">Type</TableHead>
                      <TableHead className="p-5">Required</TableHead>
                      <TableHead className="p-5">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-white/5">
                    {requestSchema.map((field) => (
                      <TableRow key={field.field} className="hover:bg-white/2 transition-colors border-white/5">
                        <TableCell className="p-5 font-mono text-[13px] text-primary-200 font-bold">{field.field}</TableCell>
                        <TableCell className="p-5"><code className="text-[11px] bg-white/10 px-2 py-1 rounded text-accent-blue font-bold">{field.type}</code></TableCell>
                        <TableCell className="p-5">{field.required ? <Badge variant="success" className="px-3 py-1">Yes</Badge> : <Badge variant="outline" className="px-3 py-1">Optional</Badge>}</TableCell>
                        <TableCell className="p-5 text-sm text-white/50 leading-relaxed font-medium">{field.desc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <pre className="p-6 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-primary-100 overflow-x-auto leading-loose">
{`curl -X POST https://api.payment-kita.com/api/v1/create-payment \\
  -H "X-PK-Key: pk_live_..." \\
  -H "X-PK-Signature: ..." \\
  -H "X-PK-Timestamp: 1234567890" \\
  -d '{
    "merchant_id": "019d0c4e-9726-76bf-ab20-0bed0752af1a",
    "chain_id": "eip155:8453",
    "selected_token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "pricing_type": "invoice_currency",
    "requested_amount": "50000"
  }'`}
              </pre>
              <pre className="p-6 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-accent-green/90 overflow-x-auto leading-loose">
{`{
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
  "payment_code": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0...",
  "payment_instruction": {
    "chain_id": "eip155:8453",
    "to": "0xReceiver",
    "value": "0x0",
    "data": "0xafc93ccd..."
  }
}`}
              </pre>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '225ms' }}>
        <h2 className="heading-2 text-foreground flex items-center gap-3">
          <Code2 className="w-7 h-7 text-accent-blue" />
          {t('docs.partner.backend_example_title', 'Merchant Backend End-to-End Example')}
        </h2>
        <Card variant="glass" size="lg" className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 space-y-6">
            <p className="text-sm text-muted leading-relaxed max-w-4xl">
              {t('docs.partner.backend_example_desc', 'Recommended backend flow: call `create-payment` once using merchant credentials, let backend resolve pricing internally, then return `payment_url` to the frontend or customer channel. This keeps pricing and signing on the merchant server, not in the browser.')}
            </p>
            <pre className="p-6 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-primary-100 overflow-x-auto leading-loose">
{`import crypto from 'crypto';

const API_KEY = process.env.PK_API_KEY!;
const SECRET_KEY = process.env.PK_SECRET_KEY!;
const BASE_URL = 'https://api.payment-kita.com';

function sha256Hex(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function sign(method: string, path: string, body: unknown) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = JSON.stringify(body ?? {});
  const bodyHash = sha256Hex(bodyString);
  const message = \`\${timestamp}\${method.toUpperCase()}\${path}\${bodyHash}\`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(message).digest('hex');
  return { timestamp, signature, bodyString };
}

async function partnerPost(path: string, body: unknown) {
  const { timestamp, signature, bodyString } = sign('POST', path, body);
  const res = await fetch(\`\${BASE_URL}\${path}\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-PK-Key': API_KEY,
      'X-PK-Timestamp': timestamp,
      'X-PK-Signature': signature,
    },
    body: bodyString,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createCustomerPayment() {
  const payment = await partnerPost('/api/v1/create-payment', {
    merchant_id: '019d0c4e-9726-76bf-ab20-0bed0752af1a',
    chain_id: 'eip155:8453',
    selected_token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    pricing_type: 'invoice_currency',
    requested_amount: '50000',
  });

  return {
    payment_url: payment.payment_url,
    payment_code: payment.payment_code,
    payment_instruction: payment.payment_instruction,
  };
}`}
            </pre>
          </div>
        </Card>
      </section>

      <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
        <h2 className="heading-2 text-foreground flex items-center gap-3">
          <Globe className="w-7 h-7 text-primary" />
          {t('docs.partner.topology_title', 'Same-Chain vs Cross-Chain')}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card variant="glass" size="lg" className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 space-y-4">
              <Badge variant="success">same-chain</Badge>
              <h3 className="text-xl font-bold text-foreground">{t('docs.partner.same_chain_title', 'Same-chain settlement')}</h3>
              <p className="text-sm text-muted leading-relaxed">
                {t('docs.partner.same_chain_desc', 'Use the same create-payment contract when invoice currency and customer-selected stablecoin settle on the same destination chain. The payment instruction remains single-chain, but pricing still comes from the live pool route.')}
              </p>
              <pre className="p-5 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-primary-100 overflow-x-auto">{`IDRX invoice -> Base quote -> USDC amount -> Base payment instruction`}</pre>
            </div>
          </Card>

          <Card variant="glass" size="lg" className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 space-y-4">
              <Badge variant="warning">cross-chain</Badge>
              <h3 className="text-xl font-bold text-foreground">{t('docs.partner.cross_chain_title', 'Cross-chain settlement')}</h3>
              <p className="text-sm text-muted leading-relaxed">
                {t('docs.partner.cross_chain_desc', 'Use the same create-payment contract for cross-chain flows as well. Backend still prices the customer-selected stablecoin, while the returned payment instruction encapsulates the bridge and destination execution path.')}
              </p>
              <pre className="p-5 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-primary-100 overflow-x-auto">{`IDRX invoice -> Arbitrum quote -> USDT amount -> bridge + destination execution payload`}</pre>
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '245ms' }}>
        <h2 className="heading-2 text-foreground flex items-center gap-3">
          <Repeat className="w-7 h-7 text-accent-green" />
          {t('docs.partner.sequence_title', 'Merchant Backend to Hosted Checkout Sequence')}
        </h2>
        <Card variant="glass" size="lg" className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 space-y-4">
            <p className="text-sm text-muted leading-relaxed">
              {t('docs.partner.sequence_desc', 'This is the recommended request order for merchant-controlled pricing and hosted checkout delivery.')}
            </p>
            <pre className="p-6 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-primary-100 overflow-x-auto leading-loose">{`Merchant Backend -> Partner API: POST /api/v1/create-payment
Partner API -> Merchant Backend: payment_id + payment_url + payment_code + payment_instruction
Merchant Backend -> Customer UI: payment_url
Customer UI -> Hosted Checkout: GET /api/v1/partner/payment-sessions/:id
Customer Wallet / QR Consumer -> Partner API: POST /api/v1/partner/payment-sessions/resolve-code
Partner API -> Customer Wallet / QR Consumer: normalized instruction
Indexer / Webhook -> Merchant Backend: payment completion callback`}</pre>
          </div>
        </Card>
      </section>

      <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
        <h2 className="heading-2 text-foreground flex items-center gap-3">
          <Zap className="w-7 h-7 text-accent-blue" />
          {t('docs.partner.session_read_resolve_title', 'Session, Hosted Read, and Resolve')}
        </h2>
        <div className="grid gap-6 grid-cols-1">
          <Card variant="glass" size="lg" className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 space-y-6">
              <h3 className="text-xl font-bold text-foreground">POST /api/v1/create-payment</h3>
              <pre className="p-6 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-primary-100 overflow-x-auto leading-loose">
{`{
  "merchant_id": "0195-merchant",
  "chain_id": "eip155:8453",
  "selected_token": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "pricing_type": "invoice_currency",
  "requested_amount": "50000"
}`}
              </pre>
              <pre className="p-6 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-accent-green/90 overflow-x-auto leading-loose">
{`{
  "payment_id": "0195-session",
  "merchant_id": "0195-merchant",
  "invoice_currency": "IDRX",
  "invoice_amount": "50000",
  "quoted_token_symbol": "USDC",
  "quoted_token_amount": "2.95",
  "quoted_token_amount_atomic": "2950000",
  "quoted_token_decimals": 6,
  "quote_rate": "1 IDRX = 0.000059 USDC",
  "quote_source": "uniswap-v4-base-usdc-idrx",
  "quote_expires_at": "2026-03-20T10:20:00Z",
  "dest_chain": "eip155:8453",
  "dest_token": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "dest_wallet": "0xMerchantDestination",
  "expire_time": "2026-03-20T10:20:00Z",
  "payment_url": "https://pay.paymentkita.com/checkout/0195-session",
  "payment_code": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0...",
  "payment_instruction": {
    "chain_id": "eip155:8453",
    "to": "0xGateway",
    "value": "0",
    "data": "0xafc93ccd..."
  }
}`}
              </pre>
              <p className="text-sm text-muted leading-relaxed">
                `payment_code` is the encrypted payment payload intended to be rendered as a QR value. Client apps should not decrypt it locally.
                Use `POST /api/v1/partner/payment-sessions/resolve-code` to turn it back into a normalized payment instruction.
              </p>
            </div>
          </Card>

          <Card variant="glass" size="lg" className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 space-y-6">
              <h3 className="text-xl font-bold text-foreground">GET /api/v1/partner/payment-sessions/:id</h3>
              <pre className="p-6 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-primary-100 overflow-x-auto leading-loose">
{`GET /api/v1/partner/payment-sessions/0195-session`}
              </pre>
              <pre className="p-6 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-accent-green/90 overflow-x-auto leading-loose">
{`{
  "payment_id": "0195-session",
  "status": "PENDING",
  "amount": "2950000",
  "amount_decimals": 6,
  "dest_chain": "eip155:8453",
  "dest_token": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "dest_wallet": "0xMerchantDestination",
  "expires_at": "2026-03-20T10:20:00Z",
  "payment_url": "https://pay.paymentkita.com/checkout/0195-session",
  "payment_code": "eyJ...",
  "payment_instruction": {
    "chain_id": "eip155:8453",
    "to": "0xGateway",
    "value": "0",
    "data": "0xafc93ccd..."
  }
}`}
              </pre>
            </div>
          </Card>

          <Card variant="glass" size="lg" className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 space-y-6">
              <h3 className="text-xl font-bold text-foreground">POST /api/v1/partner/payment-sessions/resolve-code</h3>
              <pre className="p-6 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-primary-100 overflow-x-auto leading-loose">
{`{
  "payment_code": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0...",
  "payer_wallet": "0xPayerWallet"
}`}
              </pre>
              <pre className="p-6 bg-black/60 rounded-3xl border border-white/10 text-xs font-mono text-accent-green/90 overflow-x-auto leading-loose">
{`{
  "payment_id": "0195-session",
  "merchant_id": "0195-merchant",
  "amount": "2950000",
  "amount_decimals": 6,
  "dest_chain": "eip155:8453",
  "dest_token": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "dest_wallet": "0xMerchantDestination",
  "expires_at": "2026-03-20T10:20:00Z",
  "payment_instruction": {
    "chain_id": "eip155:8453",
    "to": "0xGateway",
    "value": "0",
    "data": "0xafc93ccd..."
  }
}`}
              </pre>
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <h2 className="heading-2 text-foreground flex items-center gap-3">
          <Bell className="w-7 h-7 text-accent-orange" />
          {t('docs.partner.webhooks_title', 'Webhooks Integration')}
        </h2>
        <Card variant="glass" size="lg" className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] border-t-yellow-500/20">
          <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-yellow-500/5 border border-yellow-500/10 space-y-4">
                  <div className="flex items-center gap-3 text-yellow-500 font-bold">
                    <ShieldCheck className="w-5 h-5" />
                    Verification Required
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {t('docs.partner.webhooks_desc', 'Webhook runtime now signs canonical payloads using `timestamp + "." + raw_json_payload`. Verify the new header first. The legacy signature header is still emitted for transition.')}
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-bold text-muted uppercase tracking-widest">Event Payload Fields</h4>
                  <div className="rounded-3xl border border-white/5 overflow-hidden bg-black/20">
                    {webhookSchema.map((field) => (
                      <div key={field.field} className="p-4 border-b border-white/5 last:border-0 flex items-center justify-between group hover:bg-white/5 transition-colors">
                        <div className="flex flex-col">
                          <code className="text-sm font-bold text-primary-200">{field.field}</code>
                          <span className="text-[11px] text-muted-foreground mt-0.5">{field.desc}</span>
                        </div>
                        <code className="text-[11px] bg-white/5 px-2 py-1 rounded text-accent-blue opacity-60 group-hover:opacity-100">{field.type}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-muted uppercase tracking-widest">Webhook Handler</h4>
                <div className="bg-black/60 rounded-3xl border border-white/10 p-6 flex-1 min-h-[300px]">
                  <pre className="text-[13px] font-mono leading-relaxed text-primary-200/80">
{`app.post('/webhook', (req, res) => {
  const sig = req.headers['x-webhook-signature'];
  const ts = req.headers['x-webhook-timestamp'];
  const event = req.headers['x-webhook-event'];
  const deliveryId = req.headers['x-webhook-delivery-id'];

  if (verifyWebhook(req.rawBody, sig, ts, SECRET)) {
    const payload = req.body;

    if (event === 'PAYMENT_COMPLETED') {
      await processOrder(payload.paymentId);
    }

    if (event === 'PAYMENT_FAILED') {
      await markOrderFailed(payload.paymentId, payload.reason);
    }

    console.log('delivery', deliveryId);
    return res.status(200).send('OK');
  }

  return res.status(401).send('Invalid');
});`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-accent-blue/5 border border-accent-blue/10 flex items-start gap-4">
              <div className="bg-accent-blue/10 p-3 rounded-2xl">
                <Repeat className="w-6 h-6 text-accent-blue" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Retry Schedule</h4>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  {t('docs.partner.retry_desc', 'Runtime retry is explicit and capped at 10 attempts with scheduled backoff: 1m, 2m, 5m, 10m, 15m, 30m, 1h, 2h, 4h, 8h.')}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-foreground">Legacy Notice</h4>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {t('docs.partner.legacy_notice_desc', 'Legacy routes `/api/v1/payment-requests`, `/api/v1/pay/:id`, and `/api/v1/resolve-payment-code` remain available only for compatibility. New partner integrations should not build on top of them.')}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-6 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <h2 className="heading-2 text-foreground flex items-center gap-3">
          <Code2 className="w-7 h-7 text-primary" />
          Resolve-Code Consumer
        </h2>
        <ResolveCodeDemo />
      </section>

    </div>
  );
}
