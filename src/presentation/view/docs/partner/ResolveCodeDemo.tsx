'use client';

import { useState } from 'react';
import { Button, Card } from '@/presentation/components/atoms';
import { useResolvePartnerPaymentCodeMutation } from '@/data/usecase';

export function ResolveCodeDemo() {
  const [paymentCode, setPaymentCode] = useState('');
  const [payerWallet, setPayerWallet] = useState('');
  const resolveMutation = useResolvePartnerPaymentCodeMutation();

  return (
    <Card variant="glass" size="lg" className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border-t-accent-blue/20">
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Resolve Payment Code Demo</h3>
          <p className="text-sm text-muted leading-relaxed">
            This demo uses the real FE mutation hook for `POST /api/v1/partner/payment-sessions/resolve-code`.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted">Payment Code</label>
            <textarea
              value={paymentCode}
              onChange={(e) => setPaymentCode(e.target.value)}
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none"
              placeholder="Paste encrypted payment_code here"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted">Payer Wallet (Optional)</label>
            <input
              value={payerWallet}
              onChange={(e) => setPayerWallet(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none"
              placeholder="0x..."
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            className="rounded-2xl"
            loading={resolveMutation.isPending}
            disabled={!paymentCode.trim()}
            onClick={() => resolveMutation.mutate({ payment_code: paymentCode.trim(), payer_wallet: payerWallet.trim() || undefined })}
          >
            Resolve Code
          </Button>
          {resolveMutation.isError ? (
            <span className="text-sm text-destructive">{resolveMutation.error.message}</span>
          ) : null}
        </div>

        {resolveMutation.data ? (
          <pre className="overflow-x-auto rounded-3xl border border-white/10 bg-black/60 p-6 text-xs leading-loose text-accent-green/90">
            {JSON.stringify(resolveMutation.data, null, 2)}
          </pre>
        ) : null}
      </div>
    </Card>
  );
}
