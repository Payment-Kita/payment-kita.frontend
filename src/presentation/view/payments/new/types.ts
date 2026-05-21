import type { ChainsResponse, MerchantSettlementProfileResponse, TokensResponse } from '@/data/model/response';

export interface NewPaymentPageInit {
  chains?: ChainsResponse;
  tokens?: TokensResponse;
  settlementProfile?: MerchantSettlementProfileResponse | null;
}
