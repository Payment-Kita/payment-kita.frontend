import { httpClient } from '@/core/network';
import { API_ENDPOINTS } from '@/core/constants/api_endpoints';
import type { ApiResponse } from '@/core/network';
import type { ResolvePartnerPaymentCodeRequest } from '../model/request';
import type { PartnerPaymentSessionResponse, ResolvePartnerPaymentCodeResponse } from '../model/response';

export class PartnerPaymentSessionDataSource {
  async getById(id: string): Promise<ApiResponse<PartnerPaymentSessionResponse>> {
    return httpClient.get<PartnerPaymentSessionResponse>(API_ENDPOINTS.PARTNER_PAYMENT_SESSION_BY_ID(id));
  }

  async resolveCode(request: ResolvePartnerPaymentCodeRequest): Promise<ApiResponse<ResolvePartnerPaymentCodeResponse>> {
    return httpClient.post<ResolvePartnerPaymentCodeResponse>(API_ENDPOINTS.PARTNER_PAYMENT_SESSION_RESOLVE_CODE, request);
  }
}

export const partnerPaymentSessionDataSource = new PartnerPaymentSessionDataSource();
