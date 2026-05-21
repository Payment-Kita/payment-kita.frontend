/**
 * Payment Repository Interface
 */
import type { ApiResponse } from '@/core/network';
import type {
  CreatePaymentRequest,
  CreatePartnerCreatePaymentRequest,
  PaymentPrivacyRecoveryRequest,
} from '../../model/request';
import type {
  CreatePaymentResponse,
  CreatePartnerCreatePaymentResponse,
  PaymentResponse,
  PaymentsResponse,
  PaymentEventsResponse,
  PaymentPrivacyStatusResponse,
  PaymentPrivacyRecoveryTxResponse,
} from '../../model/response';

export interface IPaymentRepository {
  createPayment(input: CreatePaymentRequest): Promise<ApiResponse<CreatePaymentResponse>>;
  createMerchantPaymentBill(input: CreatePartnerCreatePaymentRequest): Promise<ApiResponse<CreatePartnerCreatePaymentResponse>>;
  getPayment(id: string): Promise<ApiResponse<PaymentResponse>>;
  listPayments(page?: number, limit?: number): Promise<ApiResponse<PaymentsResponse>>;
  getPaymentEvents(id: string): Promise<ApiResponse<PaymentEventsResponse>>;
  getPaymentPrivacyStatus(id: string): Promise<ApiResponse<PaymentPrivacyStatusResponse>>;
  retryPrivacyForward(id: string, input?: PaymentPrivacyRecoveryRequest): Promise<ApiResponse<PaymentPrivacyRecoveryTxResponse>>;
  claimPrivacyEscrow(id: string, input?: PaymentPrivacyRecoveryRequest): Promise<ApiResponse<PaymentPrivacyRecoveryTxResponse>>;
  refundPrivacyEscrow(id: string, input?: PaymentPrivacyRecoveryRequest): Promise<ApiResponse<PaymentPrivacyRecoveryTxResponse>>;
}
