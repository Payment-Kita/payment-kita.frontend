'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useChainsQuery,
  useCreateMerchantPaymentBillMutation,
  useMerchantSettlementProfileQuery,
  useWalletsQuery,
} from '@/data/usecase';
import type { ChainItemData } from '@/presentation/components/molecules/ChainListItem';
import type { TokenItemData } from '@/presentation/components/molecules/TokenListItem';
import type {
  CreatePartnerCreatePaymentRequest,
  CreatePaymentPricingType,
} from '@/data/model/request';
import type { ChainsResponse, CreatePartnerCreatePaymentResponse, MerchantSettlementProfileResponse } from '@/data/model/response';

const MIN_EXPIRES_IN_SECONDS = 30;
const MAX_EXPIRES_IN_SECONDS = 86400;

export type CreatePaymentExpiryMode = 'default' | 'custom' | 'unlimited';

const paymentSchema = z.object({
  chain_id: z.string().min(1, 'Source Chain is required'),
  selected_token: z.string().min(1, 'Source Token is required'),
  pricing_type: z.enum(['invoice_currency', 'payment_token_fixed', 'payment_token_dynamic']),
  requested_amount: z.string().regex(/^\d+(\.\d+)?$/, 'Amount must be a positive number'),
  expiry_mode: z.enum(['default', 'custom', 'unlimited']).default('default'),
  expires_in_custom: z.string().optional(),

  // Legacy fields retained temporarily for current UI compatibility.
  sourceChainId: z.string().optional(),
  destChainId: z.string().optional(),
  sourceTokenAddress: z.string().optional(),
  destTokenAddress: z.string().optional(),
  amount: z.string().optional(),
  receiverAddress: z.string().optional(),
  decimals: z.number().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

interface UseNewPaymentOptions {
  initialChains?: ChainsResponse;
  initialSettlementProfile?: MerchantSettlementProfileResponse | null;
}

export function useNewPayment(options: UseNewPaymentOptions = {}) {
  const chainsQuery = useChainsQuery(options.initialChains);
  const settlementQuery = useMerchantSettlementProfileQuery(options.initialSettlementProfile);
  const { data: chainsData } = chainsQuery;
  const { data: settlementProfile } = settlementQuery;
  const { data: walletsData } = useWalletsQuery();
  const primaryWallet = walletsData?.wallets.find(w => w.isPrimary);
  const createMerchantPaymentBillMutation = useCreateMerchantPaymentBillMutation();
  const [error, setError] = useState<string | null>(null);
  const [createdBill, setCreatedBill] = useState<CreatePartnerCreatePaymentResponse | null>(null);

  const form = useForm<PaymentFormValues>({
    mode: 'onChange',
    defaultValues: {
      chain_id: '',
      selected_token: '',
      pricing_type: 'invoice_currency',
      requested_amount: '',
      expiry_mode: 'default',
      expires_in_custom: '',

      sourceChainId: '',
      destChainId: '',
      sourceTokenAddress: '',
      destTokenAddress: '',
      decimals: 18,
    },
  });

  const { setValue, watch, trigger } = form; // Destructure useForm methods
  
  // Watch values for selectors
  const sourceChainId = watch('sourceChainId');
  const destChainId = watch('destChainId');
  const sourceTokenAddress = watch('sourceTokenAddress');
  const pricingType = watch('pricing_type');
  const expiryMode = watch('expiry_mode');
  const expiresInCustom = watch('expires_in_custom');

  const resolveChainCAIP2ByNumericID = (id: string) => {
    if (!id) return '';
    const matched = chainsData?.items?.find((chain: any) => String(chain.id) === id);
    return matched?.caip2 || '';
  };

  const handleSourceChainSelect = (chain?: ChainItemData) => {
    const selectedID = chain?.id?.toString() || '';
    const selectedCAIP2 = resolveChainCAIP2ByNumericID(selectedID);

    setValue('sourceChainId', selectedID);
    setValue('chain_id', selectedCAIP2 || selectedID);
    // Reset token when chain changes
    setValue('sourceTokenAddress', '');
    setValue('selected_token', '');
    trigger('sourceChainId');
    trigger('chain_id');
  };

  const handleDestChainSelect = (chain?: ChainItemData) => {
    setValue('destChainId', chain?.id?.toString() || '');
    trigger('destChainId');
  };

  const handleTokenSelect = (token?: TokenItemData) => {
    const tokenAddress = token?.address || (token?.isNative ? '0x0000000000000000000000000000000000000000' : '');
    setValue('sourceTokenAddress', tokenAddress);
    setValue('selected_token', tokenAddress);
    if (token?.decimals) {
      setValue('decimals', token.decimals);
    }
    // For token-based pricing, reset amount when token changes (decimals may differ).
    if (pricingType !== 'invoice_currency') {
      setValue('amount', '');
      setValue('requested_amount', '');
    }
    trigger('sourceTokenAddress');
    trigger('selected_token');
  };

  const mapCreateBillErrorMessage = (status?: number, fallbackMessage?: string) => {
    const message = (fallbackMessage || '').trim();
    if (status === 401) {
      return 'Your session has expired. Please login again.';
    }
    if (status === 403) {
      return 'Merchant context required. Please ensure your account is linked to an active merchant profile.';
    }
    if (status === 400) {
      if (message) return message;
      return 'Invalid create payment request. Please check input and settlement profile.';
    }
    if (message) return message;
    return 'Failed to create payment bill';
  };

  const resolveExpiresInValue = (mode: CreatePaymentExpiryMode, customRaw: string | undefined): string | undefined => {
    if (mode === 'default') return undefined;
    if (mode === 'unlimited') return 'unlimited';

    const trimmed = String(customRaw || '').trim();
    if (!/^\d+$/.test(trimmed)) {
      form.setError('expires_in_custom', { message: 'Expiry seconds must be a positive integer' });
      return undefined;
    }
    const seconds = Number(trimmed);
    if (!Number.isFinite(seconds) || seconds < MIN_EXPIRES_IN_SECONDS) {
      form.setError('expires_in_custom', { message: `Minimum expiry is ${MIN_EXPIRES_IN_SECONDS} seconds` });
      return undefined;
    }
    if (seconds > MAX_EXPIRES_IN_SECONDS) {
      form.setError('expires_in_custom', { message: `Maximum expiry is ${MAX_EXPIRES_IN_SECONDS} seconds` });
      return undefined;
    }
    return String(seconds);
  };

  const handleExpiryModeSelect = (mode: CreatePaymentExpiryMode) => {
    setValue('expiry_mode', mode, { shouldValidate: true });
    form.clearErrors('expiry_mode');
    if (mode !== 'custom') {
      setValue('expires_in_custom', '', { shouldValidate: false });
      form.clearErrors('expires_in_custom');
    }
  };

  const handleExpiresInCustomChange = (raw: string) => {
    const numericOnly = raw.replace(/[^\d]/g, '');
    setValue('expires_in_custom', numericOnly, { shouldValidate: true });
    form.clearErrors('expires_in_custom');
  };

  const onSubmit = async (data: z.infer<typeof paymentSchema>) => {
    setError(null);
    setCreatedBill(null);
    form.clearErrors('expires_in_custom');

    const resolvedExpiresIn = resolveExpiresInValue(data.expiry_mode || 'default', data.expires_in_custom);
    if ((data.expiry_mode || 'default') === 'custom' && !resolvedExpiresIn) {
      return;
    }

    const payload: CreatePartnerCreatePaymentRequest = {
      chain_id: (data.chain_id || resolveChainCAIP2ByNumericID(data.sourceChainId || '') || '').trim(),
      selected_token: (data.selected_token || data.sourceTokenAddress || '').trim(),
      pricing_type: (data.pricing_type || 'invoice_currency') as CreatePaymentPricingType,
      requested_amount: (data.requested_amount || data.amount || '').trim(),
      ...(resolvedExpiresIn ? { expires_in: resolvedExpiresIn } : {}),
    };

    const parsed = paymentSchema.safeParse({
      ...data,
      chain_id: payload.chain_id,
      selected_token: payload.selected_token,
      pricing_type: payload.pricing_type,
      requested_amount: payload.requested_amount,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const rawKey = issue.path[0] as keyof PaymentFormValues | undefined;
        let key = rawKey;
        if (rawKey === 'chain_id') key = 'sourceChainId';
        if (rawKey === 'selected_token') key = 'sourceTokenAddress';
        if (rawKey === 'requested_amount') key = 'amount';
        if (key) {
          form.setError(key, { message: issue.message });
        }
      }
      return;
    }

    if (settlementProfile && settlementProfile.configured === false) {
      setError('Merchant settlement profile is not configured');
      return;
    }

    const response = await createMerchantPaymentBillMutation.mutateAsync(payload);

    if (response.error || !response.data) {
      setError(mapCreateBillErrorMessage(response.status, response.error));
      return;
    }

    setCreatedBill(response.data);
  };

  return {
    form,
    loading: createMerchantPaymentBillMutation.isPending,
    error,
    createdBill,
    chainsData,
    chainsError: chainsQuery.error instanceof Error ? chainsQuery.error.message : null,
    refetchChains: chainsQuery.refetch,
    settlementProfile,
    settlementConfigured: settlementProfile?.configured === true,
    handleSubmit: form.handleSubmit(onSubmit),
    primaryWallet,
    // Export handlers and watched values
    handleSourceChainSelect,
    handleDestChainSelect,
    handleTokenSelect,
    sourceChainId,
    destChainId,
    sourceTokenAddress,
    pricingType,
    expiryMode,
    expiresInCustom,
    handleExpiryModeSelect,
    handleExpiresInCustomChange,
    setValue, // Export setValue for other uses (like setting max amount)
  };
}
