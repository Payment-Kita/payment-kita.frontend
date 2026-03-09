/**
 * Payment Usecases - React Query hooks for payments
 */
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { paymentRepository } from '../repositories/repository_impl';
import type { CreatePaymentRequest } from '../model/request';
import type { PaymentPrivacyRecoveryAction, PaymentPrivacyStatus } from '../model/entity';

export function usePaymentsQuery(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['payments', page, limit],
    queryFn: async () => {
      const response = await paymentRepository.listPayments(page, limit);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to fetch payments');
      return response.data;
    },
  });
}

export function usePaymentQuery(id: string) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      const response = await paymentRepository.getPayment(id);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to fetch payment');
      return response.data;
    },
    enabled: !!id,
  });
}

export function usePaymentEventsQuery(id: string) {
  return useQuery({
    queryKey: ['paymentEvents', id],
    queryFn: async () => {
      const response = await paymentRepository.getPaymentEvents(id);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to fetch payment events');
      return response.data;
    },
    enabled: !!id,
  });
}

export function usePaymentPrivacyStatusQuery(id: string) {
  return useQuery({
    queryKey: ['paymentPrivacyStatus', id],
    queryFn: async () => {
      const response = await paymentRepository.getPaymentPrivacyStatus(id);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to fetch payment privacy status');
      return response.data;
    },
    enabled: !!id,
  });
}

export function usePaymentPrivacyStatusesQuery(ids: string[]) {
  const normalizedIds = useMemo(
    () => Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.length > 0))),
    [ids]
  );

  const queries = useQueries({
    queries: normalizedIds.map((id) => ({
      queryKey: ['paymentPrivacyStatus', id],
      queryFn: async () => {
        const response = await paymentRepository.getPaymentPrivacyStatus(id);
        if (response.error) throw new Error(response.error);
        if (!response.data) throw new Error('Failed to fetch payment privacy status');
        return response.data;
      },
      enabled: !!id,
      staleTime: 30_000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const statusByPaymentId = useMemo(() => {
    const map: Record<string, PaymentPrivacyStatus> = {};
    for (let i = 0; i < normalizedIds.length; i += 1) {
      const id = normalizedIds[i];
      const data = queries[i]?.data?.privacyStatus;
      if (!data) continue;
      map[id] = data;
    }
    return map;
  }, [queries, normalizedIds]);

  return {
    statusByPaymentId,
    isLoading,
    isError,
  };
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePaymentRequest) => paymentRepository.createPayment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

function usePrivacyRecoveryMutation(action: PaymentPrivacyRecoveryAction) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      if (!paymentId) throw new Error('paymentId is required');

      switch (action) {
        case 'retry': {
          const response = await paymentRepository.retryPrivacyForward(paymentId, {});
          if (response.error) throw new Error(response.error);
          if (!response.data?.txData) throw new Error('Failed to build retry transaction');
          return response.data.txData;
        }
        case 'claim': {
          const response = await paymentRepository.claimPrivacyEscrow(paymentId, {});
          if (response.error) throw new Error(response.error);
          if (!response.data?.txData) throw new Error('Failed to build claim transaction');
          return response.data.txData;
        }
        case 'refund': {
          const response = await paymentRepository.refundPrivacyEscrow(paymentId, {});
          if (response.error) throw new Error(response.error);
          if (!response.data?.txData) throw new Error('Failed to build refund transaction');
          return response.data.txData;
        }
        default:
          throw new Error('Unsupported privacy action');
      }
    },
    onSuccess: (_, paymentId) => {
      if (paymentId) {
        queryClient.invalidateQueries({ queryKey: ['paymentPrivacyStatus', paymentId] });
        queryClient.invalidateQueries({ queryKey: ['paymentEvents', paymentId] });
      }
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useRetryPrivacyForwardMutation() {
  return usePrivacyRecoveryMutation('retry');
}

export function useClaimPrivacyEscrowMutation() {
  return usePrivacyRecoveryMutation('claim');
}

export function useRefundPrivacyEscrowMutation() {
  return usePrivacyRecoveryMutation('refund');
}
