import { partnerPaymentSessionDataSource } from '../../data_source/partner_payment_session_data_source';
import type { IPartnerPaymentSessionRepository } from '../repository/partner_payment_session_repository';
import type { ApiResponse } from '@/core/network';
import type { ResolvePartnerPaymentCodeRequest } from '../../model/request';
import type { PartnerPaymentSessionResponse, ResolvePartnerPaymentCodeResponse } from '../../model/response';

class PartnerPaymentSessionRepositoryImpl implements IPartnerPaymentSessionRepository {
  async getPartnerPaymentSession(id: string): Promise<ApiResponse<PartnerPaymentSessionResponse>> {
    return partnerPaymentSessionDataSource.getById(id);
  }

  async resolvePartnerPaymentCode(request: ResolvePartnerPaymentCodeRequest): Promise<ApiResponse<ResolvePartnerPaymentCodeResponse>> {
    return partnerPaymentSessionDataSource.resolveCode(request);
  }
}

export const partnerPaymentSessionRepository = new PartnerPaymentSessionRepositoryImpl();
