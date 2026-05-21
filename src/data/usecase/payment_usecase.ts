/**
 * Payment Usecases - React Query hooks for payments
 */
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { paymentRepository } from '../repositories/repository_impl';
import type { CreatePaymentRequest, CreatePartnerCreatePaymentRequest } from '../model/request';
import type {
  PaymentEvent,
  PaymentPrivacyRecoveryAction,
  PaymentPrivacyStatus,
  PaymentQuoteSnapshot,
} from '../model/entity';

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

export function extractPaymentQuoteSnapshot(events: PaymentEvent[] | undefined | null): PaymentQuoteSnapshot | null {
  if (!Array.isArray(events) || events.length === 0) {
    return null;
  }

  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (String(event?.eventType || '').trim().toUpperCase() !== 'QUOTE_SNAPSHOT_CAPTURED') {
      continue;
    }

    const metadata = event?.metadata;
    if (!metadata || typeof metadata !== 'object') {
      continue;
    }

    const record = metadata as Record<string, unknown>;
    if (record.schema !== 'payment_quote_snapshot.v1') {
      continue;
    }

    return {
      schema: 'payment_quote_snapshot.v1',
      previewApproval:
        record.previewApproval && typeof record.previewApproval === 'object'
          ? (record.previewApproval as PaymentQuoteSnapshot['previewApproval'])
          : undefined,
      quotePaymentCost:
        record.quotePaymentCost && typeof record.quotePaymentCost === 'object'
          ? (record.quotePaymentCost as PaymentQuoteSnapshot['quotePaymentCost'])
          : undefined,
    };
  }

  return null;
}

export function usePaymentQuoteSnapshotQuery(id: string) {
  const eventsQuery = usePaymentEventsQuery(id);

  return {
    ...eventsQuery,
    data: eventsQuery.data
      ? {
          ...eventsQuery.data,
          quoteSnapshot: extractPaymentQuoteSnapshot(eventsQuery.data.events),
        }
      : undefined,
  };
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

export function useCreateMerchantPaymentBillMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePartnerCreatePaymentRequest) => paymentRepository.createMerchantPaymentBill(input),
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
