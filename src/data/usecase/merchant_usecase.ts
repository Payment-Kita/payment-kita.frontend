import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { merchantRepository } from '../repositories/repository_impl';
import type { MerchantSettlementProfileResponse } from '../model/response';

export const useMerchantMeQuery = () => {
  return useQuery({
    queryKey: ['merchant', 'me'],
    queryFn: () => merchantRepository.getMe().then((res) => {
      if (res.error) throw new Error(res.error);
      return res.data;
    }),
  });
};

export const useUpdateMerchantSettingsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { callbackUrl: string; webhookIsActive: boolean }) =>
      merchantRepository.updateSettings(input).then((res) => {
        if (res.error) throw new Error(res.error);
        return res.data;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'me'] });
    },
  });
};

export const useMerchantSettlementProfileQuery = (initialData?: MerchantSettlementProfileResponse | null) => {
  return useQuery({
    queryKey: ['merchant', 'settlement-profile'],
    queryFn: () => merchantRepository.getSettlementProfile().then((res) => {
      if (res.error) throw new Error(res.error);
      return res.data;
    }),
    initialData: initialData ?? undefined,
  });
};
