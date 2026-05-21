'use client';

import { useMemo, useState } from 'react';
import { usePaymentStore, useUrlQueryState } from '@/presentation/hooks';
import { QUERY_PARAM_KEYS } from '@/core/constants';
import { usePaymentPrivacyStatusesQuery } from '@/data/usecase';
import type { Payment } from '@/data/model/entity';

type PaymentsFilter = 'all' | 'privacy_only' | 'privacy_retrying';

type PaymentLike = Partial<Payment> & {
  id?: string;
  destAddress?: string;
  sourceDecimals?: number;
};

function normalizeStatus(status?: string): string {
  const normalized = String(status || 'pending').trim().toLowerCase();
  if (normalized === 'processing') return normalized;
  if (normalized === 'completed') return normalized;
  if (normalized === 'pending') return normalized;
  if (normalized === 'failed') return normalized;
  if (normalized === 'expired') return normalized;
  if (normalized === 'cancelled') return normalized;
  if (normalized === 'refunded') return normalized;
  return 'pending';
}

function normalizePaymentRecord(raw: PaymentLike): Payment | null {
  const paymentId = String(raw.paymentId || raw.id || '').trim();
  if (!paymentId) return null;

  const createdAt = String(raw.createdAt || '').trim() || new Date(0).toISOString();
  const updatedAt = String(raw.updatedAt || createdAt).trim() || createdAt;
  const sourceAmount = String(raw.sourceAmount || '0').trim() || '0';
  const destAmount = String(raw.destAmount || sourceAmount).trim() || sourceAmount;

  return {
    paymentId,
    senderId: String(raw.senderId || '').trim(),
    merchantId: raw.merchantId,
    sourceChainId: String(raw.sourceChainId || '').trim(),
    destChainId: String(raw.destChainId || '').trim(),
    sourceTokenAddress: String(raw.sourceTokenAddress || '').trim(),
    destTokenAddress: String(raw.destTokenAddress || '').trim(),
    sourceAmount,
    destAmount,
    feeAmount: String(raw.feeAmount || '0').trim() || '0',
    status: normalizeStatus(raw.status),
    bridgeType: raw.bridgeType,
    sourceTxHash: raw.sourceTxHash,
    destTxHash: raw.destTxHash,
    receiverAddress: String(raw.receiverAddress || raw.destAddress || '').trim(),
    decimals: Number(raw.decimals || raw.sourceDecimals || 0),
    createdAt,
    updatedAt,
  };
}

export function usePayments() {
  const { getNumber, setMany } = useUrlQueryState();
  const page = getNumber(QUERY_PARAM_KEYS.page, 1);
  const limit = 10;
  const [filter, setFilter] = useState<PaymentsFilter>('all');
  
  const { payments: paymentRows, loading: paymentsLoading, pagination } = usePaymentStore(page, limit);

  const payments = useMemo(() => {
    const normalized = paymentRows
      .map((row) => normalizePaymentRecord(row as PaymentLike))
      .filter((row): row is Payment => row !== null);
    return normalized.sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return rightTime - leftTime;
    });
  }, [paymentRows]);

  const paymentIds = payments.map((payment) => payment.paymentId).filter(Boolean);
  const { statusByPaymentId: privacyStatusByPaymentId, isLoading: privacyStatusLoading } = usePaymentPrivacyStatusesQuery(paymentIds);
  const filteredPayments = useMemo(() => {
    if (filter === 'all') return payments;
    return payments.filter((payment) => {
      const privacy = privacyStatusByPaymentId[payment.paymentId];
      if (!privacy) return false;
      if (filter === 'privacy_only') {
        return privacy.isPrivacyCandidate;
      }
      return privacy.stage === 'privacy_forward_failed_retrying';
    });
  }, [filter, payments, privacyStatusByPaymentId]);

  return {
    payments: filteredPayments,
    allPaymentsCount: payments.length,
    filteredPaymentsCount: filteredPayments.length,
    isLoading: paymentsLoading,
    privacyStatusByPaymentId,
    privacyStatusLoading,
    filter,
    setFilter,
    pagination,
    page,
    setPage: (value: number | ((prev: number) => number)) => {
      const next = typeof value === 'function' ? value(page) : value;
      setMany({ [QUERY_PARAM_KEYS.page]: next });
    },
  };
}
