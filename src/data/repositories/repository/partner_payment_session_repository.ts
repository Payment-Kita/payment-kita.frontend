import type { ApiResponse } from '@/core/network';
import type { ResolvePartnerPaymentCodeRequest } from '../../model/request';
import type { PartnerPaymentSessionResponse, ResolvePartnerPaymentCodeResponse } from '../../model/response';

export interface IPartnerPaymentSessionRepository {
  getPartnerPaymentSession(id: string): Promise<ApiResponse<PartnerPaymentSessionResponse>>;
  resolvePartnerPaymentCode(request: ResolvePartnerPaymentCodeRequest): Promise<ApiResponse<ResolvePartnerPaymentCodeResponse>>;
}
