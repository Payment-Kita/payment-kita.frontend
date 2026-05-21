'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useRegisterMutation } from '@/data/usecase';
import { useAppKitAccount } from '@reown/appkit/react';
import { useAccount, useSignMessage } from 'wagmi';
import { useTranslation } from '@/presentation/hooks';

export enum RegisterStep {
  ACCOUNT = 1,
  WALLET = 2,
  MERCHANT_PROFILE = 3,
}

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Merchant Profile
  businessName: string;
  businessCategory: string;
  businessWebsite: string;
  businessDescription: string;
};

export function useRegister() {
  const { t } = useTranslation();
  const [step, setStep] = useState<RegisterStep>(RegisterStep.ACCOUNT);
  const router = useRouter();
  const { mutate: register, isPending } = useRegisterMutation();
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const form = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      businessCategory: '',
      businessWebsite: '',
      businessDescription: '',
    },
    mode: 'onBlur',
  });

  const registerSchema = z.object({
    name: z.string().min(2, t('auth.validation.name_min')),
    email: z.string().email(t('auth.validation.email_invalid')),
    password: z.string().min(8, t('auth.validation.password_min_register')),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.validation.password_mismatch'),
    path: ['confirmPassword'],
  });

  const merchantSchema = z.object({
    businessName: z.string().min(1, t('auth.validation.business_name_required')),
    businessCategory: z.string().min(1, t('auth.validation.business_category_required')),
    businessWebsite: z.string().url().optional().or(z.literal('')),
    businessDescription: z.string().optional(),
  });

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = form.getValues();
    const result = await registerSchema.safeParseAsync(values);
    
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as keyof RegisterFormData, { message: issue.message });
      });
      return;
    }
    setStep(RegisterStep.WALLET);
  };

  const handleWalletNext = () => {
    if (!isConnected || !address) {
      form.setError('root', { message: t('auth.wallet_required_error') });
      return;
    }
    setStep(RegisterStep.MERCHANT_PROFILE);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = form.getValues();
    const result = await merchantSchema.safeParseAsync(values);
    
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as keyof RegisterFormData, { message: issue.message });
      });
      return;
    }

    if (!address) {
      form.setError('root', { message: t('auth.wallet_required_error') });
      return;
    }

    try {
      const message = [
        t('auth.sign_wallet_message_prefix'),
        '',
        `${t('auth.sign_wallet_message_wallet')}: ${address}`,
        `${t('auth.sign_wallet_message_timestamp')}: ${Date.now()}`,
      ].join('\n');
      
      const signature = await signMessageAsync({ message });

      // Convert chainId to EIP155 format if possible
      const formattedChainId = chainId ? `eip155:${chainId}` : 'eip155:1';

      register(
        {
          name: values.name,
          email: values.email,
          password: values.password,
          walletAddress: address,
          walletChainId: formattedChainId,
          walletSignature: signature,
          businessName: values.businessName,
          businessCategory: values.businessCategory,
          businessWebsite: values.businessWebsite,
          businessDescription: values.businessDescription,
        },
        {
          onSuccess: (response: any) => {
            if (response?.error) {
              const msg = response.error;
              toast.error(msg);
              form.setError('root', { message: msg });
              return;
            }
            toast.success(t('toasts.auth.register_success'));
            router.push('/dashboard');
          },
          onError: (err) => {
            const message = err.message || t('toasts.auth.register_failed');
            toast.error(message);
            form.setError('root', { message });
          },
        }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('toasts.auth.register_failed');
      toast.error(message);
      form.setError('root', { message });
    }
  };

  return {
    step,
    setStep,
    form,
    isPending,
    address,
    isConnected,
    handleAccountSubmit,
    handleWalletNext,
    handleFinalSubmit,
  };
}
