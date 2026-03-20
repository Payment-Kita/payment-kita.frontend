import { useState } from 'react';
import { useAdminMerchants as useAdminMerchantsQuery, useAdminSettlementProfileGaps, useUpdateMerchantStatus } from '@/data/usecase/useAdmin';
import { useDebounce } from '@/presentation/hooks/useDebounce';
import { toast } from 'sonner';
import { useTranslation, useUrlQueryState } from '@/presentation/hooks';
import { QUERY_PARAM_KEYS } from '@/core/constants';

export const useAdminMerchants = () => {
  const { t } = useTranslation();
  const { getNumber, getSearch, setMany } = useUrlQueryState();
  const searchTerm = getSearch();
  const page = getNumber(QUERY_PARAM_KEYS.page, 1);
  const [limit] = useState(10);
  const [settlementFilter, setSettlementFilter] = useState<'all' | 'configured' | 'missing'>('all');

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch Merchants
  const { data: merchants, isLoading, refetch } = useAdminMerchantsQuery();
  const { data: settlementGaps } = useAdminSettlementProfileGaps();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateMerchantStatus();

  const filteredMerchants = merchants?.filter((m: any) => {
    const matchesSearch =
      m.businessName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.businessEmail.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesSettlement =
      settlementFilter === 'all' ||
      (settlementFilter === 'configured' && m.settlementProfileConfigured) ||
      (settlementFilter === 'missing' && !m.settlementProfileConfigured);
    return matchesSearch && matchesSettlement;
  }) || [];

  const handleStatusUpdate = (id: string, status: string) => {
    if (confirm(t('admin.merchants_view.toasts.confirm_status_change'))) {
      updateStatus({ id, status }, {
        onSuccess: () => {
          toast.success(t('admin.merchants_view.toasts.update_success'));
          refetch();
        },
        onError: (err: any) => toast.error(err.message || t('admin.merchants_view.toasts.update_failed')),
      });
    }
  };

  const exportSettlementGapCsv = () => {
    const merchants = settlementGaps?.merchants || [];
    const rows = [
      ['merchant_id', 'business_name', 'business_email', 'merchant_type', 'status', 'created_at'],
      ...merchants.map((merchant) => [
        merchant.id,
        merchant.businessName,
        merchant.businessEmail,
        merchant.merchantType,
        merchant.status,
        merchant.createdAt,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'merchant-settlement-profile-gaps.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return {
    state: {
      searchTerm,
      page,
      limit,
      settlementFilter,
      merchants,
      settlementGaps,
      filteredMerchants,
      isLoading,
      isUpdating,
      isSearching: searchTerm !== debouncedSearch,
    },
    actions: {
      setSearchTerm: (term: string) =>
        setMany({
          [QUERY_PARAM_KEYS.q]: term,
          [QUERY_PARAM_KEYS.legacySearch]: null,
          [QUERY_PARAM_KEYS.page]: 1,
        }),
      setPage: (value: number | ((prev: number) => number)) => {
        const next = typeof value === 'function' ? value(page) : value;
        setMany({ [QUERY_PARAM_KEYS.page]: next });
      },
      setSettlementFilter,
      handleStatusUpdate,
      exportSettlementGapCsv,
    }
  };
};
