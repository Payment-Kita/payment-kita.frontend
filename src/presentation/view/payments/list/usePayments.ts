'use client';

import { useMemo, useState } from 'react';
import { usePaymentStore, useUrlQueryState } from '@/presentation/hooks';
import { QUERY_PARAM_KEYS } from '@/core/constants';
import { usePaymentPrivacyStatusesQuery } from '@/data/usecase';

type PaymentsFilter = 'all' | 'privacy_only' | 'privacy_retrying';

export function usePayments() {
  const { getNumber, setMany } = useUrlQueryState();
  const page = getNumber(QUERY_PARAM_KEYS.page, 1);
  const limit = 10;
  const [filter, setFilter] = useState<PaymentsFilter>('all');
  
  const { payments, loading: isLoading, pagination } = usePaymentStore(page, limit);
  const paymentIds = payments.map((payment) => payment.paymentId);
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
    isLoading,
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
