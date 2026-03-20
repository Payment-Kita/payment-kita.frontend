'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@/presentation/components/atoms';
import { useAdminMerchantSettlementProfile, useUpdateMerchantSettlementProfile } from '@/data/usecase/useAdmin';
import { toast } from 'sonner';
import { ArrowLeftRight, Save, Settings2 } from 'lucide-react';

interface Props {
  merchantId: string;
}

export function AdminMerchantSettlementProfileView({ merchantId }: Props) {
  const { data, isLoading } = useAdminMerchantSettlementProfile(merchantId);
  const updateMutation = useUpdateMerchantSettlementProfile();
  const [form, setForm] = useState({
    invoice_currency: '',
    dest_chain: '',
    dest_token: '',
    dest_wallet: '',
    bridge_token_symbol: 'USDC',
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      invoice_currency: data.invoice_currency ?? '',
      dest_chain: data.dest_chain ?? '',
      dest_token: data.dest_token ?? '',
      dest_wallet: data.dest_wallet ?? '',
      bridge_token_symbol: data.bridge_token_symbol ?? 'USDC',
    });
  }, [data]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    updateMutation.mutate(
      { id: merchantId, payload: form },
      {
        onSuccess: () => toast.success('Settlement profile updated'),
        onError: (error: any) => toast.error(error?.message || 'Failed to update settlement profile'),
      },
    );
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-muted text-sm mb-2">
            <Link href="/admin/merchants" className="hover:text-foreground transition-colors">Admin Merchants</Link>
            <span>/</span>
            <span>Settlement Profile</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-primary" />
            Merchant Settlement Profile
          </h1>
          <p className="text-sm text-muted mt-2 max-w-3xl">
            Configure the authoritative settlement target used by `POST /api/v1/create-payment`: invoice currency,
            destination chain, destination token, merchant destination wallet, and optional bridge token symbol.
          </p>
        </div>
        <Link href="/admin/merchants">
          <Button variant="outline" className="rounded-2xl">Back to Merchants</Button>
        </Link>
      </div>

      <Card className="rounded-3xl bg-white/5 border-white/10">
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Invoice Currency" value={form.invoice_currency} onChange={(e) => setField('invoice_currency', e.target.value.toUpperCase())} placeholder="IDRX" disabled={isLoading || updateMutation.isPending} />
          <Input label="Destination Chain" value={form.dest_chain} onChange={(e) => setField('dest_chain', e.target.value)} placeholder="eip155:8453" disabled={isLoading || updateMutation.isPending} />
          <Input label="Destination Token" value={form.dest_token} onChange={(e) => setField('dest_token', e.target.value)} placeholder="0x..." disabled={isLoading || updateMutation.isPending} />
          <Input label="Destination Wallet" value={form.dest_wallet} onChange={(e) => setField('dest_wallet', e.target.value)} placeholder="0xmerchant..." disabled={isLoading || updateMutation.isPending} />
          <Input label="Bridge Token Symbol" value={form.bridge_token_symbol} onChange={(e) => setField('bridge_token_symbol', e.target.value.toUpperCase())} placeholder="USDC" disabled={isLoading || updateMutation.isPending} />
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-muted">
            {data?.configured ? 'Existing settlement profile loaded from the dedicated repository.' : 'No settlement profile found yet. Saving this form will create one.'}
          </div>
          <Button onClick={handleSubmit} loading={updateMutation.isPending} className="rounded-2xl">
            <Save className="w-4 h-4" />
            Save Settlement Profile
          </Button>
        </div>
      </Card>

      <Card className="rounded-3xl bg-white/5 border-white/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-2 text-sm text-muted leading-relaxed">
            <p>
              This profile is authoritative for settlement. Customer-selected source chain and token can vary, but the backend will always normalize the quote and final destination against this merchant profile.
            </p>
            <p>
              Use <code>bridge_token_symbol</code> to control the normalization token for cross-chain pricing. Leave it at <code>USDC</code> unless you have a specific routing reason to change it.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
