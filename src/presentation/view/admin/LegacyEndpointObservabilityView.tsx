'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminLegacyEndpointObservability } from '@/data/usecase/useAdmin';
import { Card, Badge, Button } from '@/presentation/components/atoms';

export function LegacyEndpointObservabilityView() {
  const { data, isLoading } = useAdminLegacyEndpointObservability();
  const [selectedFamily, setSelectedFamily] = useState<'resolve_payment_code' | 'pay_read' | 'payment_requests'>('resolve_payment_code');
  const [selectedMode, setSelectedMode] = useState<'warn' | 'disabled'>('warn');
  const cutoverChecklist = [
    'Observe the diagnostics page for at least 3 full business days.',
    'Confirm merchant hit counts are zero or only test merchants remain.',
    'Disable only one endpoint family at a time.',
    'Verify the replacement partner route before and after flipping the mode.',
    'Rollback immediately to warn if any production merchant is still affected.',
  ];
  const envVarMap = {
    resolve_payment_code: 'LEGACY_RESOLVE_PAYMENT_CODE_MODE',
    pay_read: 'LEGACY_PAY_READ_MODE',
    payment_requests: 'LEGACY_PAYMENT_REQUESTS_MODE',
  } as const;
  const generatedSnippet = `${envVarMap[selectedFamily]}=${selectedMode}`;

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(generatedSnippet);
    } catch (error) {
      console.error('failed to copy env snippet', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-black tracking-tight">Legacy Endpoint Observability</h1>
        <Card className="rounded-[2rem] bg-white/5 border-white/10">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-64 rounded bg-white/10" />
            <div className="h-24 rounded bg-white/5" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Legacy Endpoint Observability</h1>
          <p className="text-muted max-w-3xl">
            Operator-facing view of deprecated runtime usage before staged disablement. This surface tracks active legacy traffic without touching `/v1/payment-app`.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" className="rounded-2xl">Back to Admin Dashboard</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="rounded-[2rem] bg-white/5 border-white/10">
          <p className="text-xs uppercase tracking-[0.25em] text-muted font-black">Tracked Endpoints</p>
          <p className="mt-2 text-4xl font-black">{data?.summary?.tracked_endpoints ?? 0}</p>
        </Card>
        <Card className="rounded-[2rem] bg-white/5 border-white/10">
          <p className="text-xs uppercase tracking-[0.25em] text-muted font-black">Total Hits</p>
          <p className="mt-2 text-4xl font-black">{data?.summary?.total_hits ?? 0}</p>
        </Card>
        <Card className="rounded-[2rem] bg-white/5 border-white/10">
          <p className="text-xs uppercase tracking-[0.25em] text-muted font-black">Last Seen</p>
          <p className="mt-2 text-sm font-mono break-all">{data?.summary?.last_seen_at ?? 'never'}</p>
        </Card>
      </div>

      <div className="grid gap-4">
        {(data?.endpoints ?? []).map((endpoint) => (
          <Card key={endpoint.endpoint_family} className="rounded-[2rem] bg-white/5 border-white/10">
            <div className="space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight">{endpoint.endpoint_family}</h2>
                  <p className="text-sm text-muted">Replacement: <code>{endpoint.replacement}</code></p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={endpoint.mode === 'disabled' ? 'destructive' : 'warning'}>
                    {endpoint.mode}
                  </Badge>
                  <Badge variant="outline">{endpoint.total_hits} hits</Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted font-black">Sunset</p>
                  <p className="mt-1 font-mono break-all">{endpoint.sunset_at}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted font-black">Last Seen</p>
                  <p className="mt-1 font-mono break-all">{endpoint.last_seen_at ?? 'never'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted font-black">Merchant Breakdown</p>
                  <p className="mt-1">{Object.keys(endpoint.merchant_hits ?? {}).length} merchants</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 text-xs uppercase tracking-[0.2em] text-muted font-black">
                  Merchant Hits
                </div>
                <div className="divide-y divide-white/5">
                  {Object.entries(endpoint.merchant_hits ?? {}).length === 0 && (
                    <div className="px-4 py-3 text-sm text-muted">No merchant-scoped hits recorded.</div>
                  )}
                  {Object.entries(endpoint.merchant_hits ?? {}).map(([merchantID, hits]) => (
                    <div key={merchantID} className="px-4 py-3 flex items-center justify-between gap-3">
                      <code className="text-xs break-all">{merchantID}</code>
                      <Badge variant="outline">{hits}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-[2rem] bg-white/5 border-white/10">
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">Disable Runbook Summary</h2>
              <p className="text-sm text-muted">
                Operator checklist before changing any legacy endpoint family from <code>warn</code> to <code>disabled</code>.
              </p>
            </div>
            <a
              href="/legacy-endpoint-disable-runbook.md"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Open Full Runbook
            </a>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {cutoverChecklist.map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/90"
              >
                <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-muted">
                  Step {index + 1}
                </div>
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-muted">
            Env vars used for staged shutdown:
            <div className="mt-3 grid gap-2 font-mono text-xs text-primary-100">
              <code>LEGACY_RESOLVE_PAYMENT_CODE_MODE=warn|disabled</code>
              <code>LEGACY_PAY_READ_MODE=warn|disabled</code>
              <code>LEGACY_PAYMENT_REQUESTS_MODE=warn|disabled</code>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Generate Env Snippet</h3>
              <p className="text-sm text-muted">
                Generate a one-line env change for a single endpoint family. Keep rollout incremental and reversible.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted font-black">Endpoint Family</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(envVarMap).map((family) => (
                    <button
                      key={family}
                      type="button"
                      onClick={() => setSelectedFamily(family as keyof typeof envVarMap)}
                      className={`rounded-full border px-4 py-2 text-sm transition-all ${
                        selectedFamily === family
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20'
                      }`}
                    >
                      {family}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted font-black">Target Mode</p>
                <div className="flex gap-2">
                  {(['warn', 'disabled'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSelectedMode(mode)}
                      className={`rounded-full border px-4 py-2 text-sm transition-all ${
                        selectedMode === mode
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted font-black">Generated Snippet</p>
              <code className="mt-3 block break-all text-sm text-primary-100">{generatedSnippet}</code>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={copySnippet}>
                Copy Env Snippet
              </Button>
              <span className="text-xs text-muted self-center">
                Apply this only after replacement partner route smoke tests are green.
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
