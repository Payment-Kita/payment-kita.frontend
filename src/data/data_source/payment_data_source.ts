/**
 * Payment Data Source
 * Acts as HTTP connector between PaymentRepository and httpClient
 */
import { httpClient } from '@/core/network';
import { API_ENDPOINTS } from '@/core/constants';
import type { CreatePaymentRequest, PaymentPrivacyRecoveryRequest } from '../model/request';
import type {
  CreatePaymentResponse,
  PaymentResponse,
  PaymentsResponse,
  PaymentEventsResponse,
  PaymentPrivacyStatusResponse,
  PaymentPrivacyRecoveryTxResponse,
} from '../model/response';

class PaymentDataSource {
  async create(request: CreatePaymentRequest) {
    return httpClient.post<CreatePaymentResponse>(API_ENDPOINTS.PAYMENTS, request);
  }

  async getById(id: string) {
    return httpClient.get<PaymentResponse>(API_ENDPOINTS.PAYMENT_BY_ID(id));
  }

  async list(page = 1, limit = 10) {
    return httpClient.get<PaymentsResponse>(
      `${API_ENDPOINTS.PAYMENTS}?page=${page}&limit=${limit}`
    );
  }

  async getEvents(id: string) {
    return httpClient.get<PaymentEventsResponse>(API_ENDPOINTS.PAYMENT_EVENTS(id));
  }

  async getPrivacyStatus(id: string) {
    return httpClient.get<PaymentPrivacyStatusResponse>(API_ENDPOINTS.PAYMENT_PRIVACY_STATUS(id));
  }

  async retryPrivacyForward(id: string, input?: PaymentPrivacyRecoveryRequest) {
    return httpClient.post<PaymentPrivacyRecoveryTxResponse>(API_ENDPOINTS.PAYMENT_PRIVACY_RETRY(id), input ?? {});
  }

  async claimPrivacyEscrow(id: string, input?: PaymentPrivacyRecoveryRequest) {
    return httpClient.post<PaymentPrivacyRecoveryTxResponse>(API_ENDPOINTS.PAYMENT_PRIVACY_CLAIM(id), input ?? {});
  }

  async refundPrivacyEscrow(id: string, input?: PaymentPrivacyRecoveryRequest) {
    return httpClient.post<PaymentPrivacyRecoveryTxResponse>(API_ENDPOINTS.PAYMENT_PRIVACY_REFUND(id), input ?? {});
  }
}

export const paymentDataSource = new PaymentDataSource();
