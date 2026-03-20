import { useMutation, useQuery } from '@tanstack/react-query';
import { partnerPaymentSessionRepository } from '../repositories/repository_impl/partner_payment_session_repository_impl';
import type { ResolvePartnerPaymentCodeRequest } from '../model/request';

export function usePartnerPaymentSessionQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: ['partnerPaymentSession', id],
    queryFn: async () => {
      const response = await partnerPaymentSessionRepository.getPartnerPaymentSession(id);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to fetch partner payment session');
      return response.data;
    },
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' ? 5000 : false;
    },
  });
}

export function useResolvePartnerPaymentCodeMutation() {
  return useMutation({
    mutationFn: async (request: ResolvePartnerPaymentCodeRequest) => {
      const response = await partnerPaymentSessionRepository.resolvePartnerPaymentCode(request);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to resolve partner payment code');
      return response.data;
    },
  });
}
