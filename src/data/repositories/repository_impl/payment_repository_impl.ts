/**
 * Payment Repository Implementation
 * Uses PaymentDataSource for HTTP operations
 */
import { paymentDataSource } from '../../data_source';
import type { IPaymentRepository } from '../repository/payment_repository';
import type { CreatePaymentRequest, PaymentPrivacyRecoveryRequest } from '../../model/request';

class PaymentRepositoryImpl implements IPaymentRepository {
  async createPayment(input: CreatePaymentRequest) {
    return paymentDataSource.create(input);
  }

  async getPayment(id: string) {
    return paymentDataSource.getById(id);
  }

  async listPayments(page = 1, limit = 10) {
    return paymentDataSource.list(page, limit);
  }

  async getPaymentEvents(id: string) {
    return paymentDataSource.getEvents(id);
  }

  async getPaymentPrivacyStatus(id: string) {
    return paymentDataSource.getPrivacyStatus(id);
  }

  async retryPrivacyForward(id: string, input?: PaymentPrivacyRecoveryRequest) {
    return paymentDataSource.retryPrivacyForward(id, input);
  }

  async claimPrivacyEscrow(id: string, input?: PaymentPrivacyRecoveryRequest) {
    return paymentDataSource.claimPrivacyEscrow(id, input);
  }

  async refundPrivacyEscrow(id: string, input?: PaymentPrivacyRecoveryRequest) {
    return paymentDataSource.refundPrivacyEscrow(id, input);
  }
}

export const paymentRepository = new PaymentRepositoryImpl();
