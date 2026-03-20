'use client';

import Link from 'next/link';
import { useAdminMerchants } from './useAdminMerchants';
import { Card, Button, Tabs } from '@/presentation/components/atoms';
import { CheckCircle, XCircle, Store, AlertCircle, Search, Loader2, LayoutGrid, Settings2, Download } from 'lucide-react';
import { useTranslation } from '@/presentation/hooks';

export function MerchantsView() {
  const { t } = useTranslation();
  const { state, actions } = useAdminMerchants();
  const {
    searchTerm,
    settlementGaps,
    filteredMerchants,
    settlementFilter,
    isLoading,
    isUpdating,
    isSearching
  } = state;

  const getStatusLabel = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'pending') return t('admin.merchants_view.status.pending');
    if (normalized === 'verified') return t('admin.merchants_view.status.verified');
    if (normalized === 'active') return t('admin.merchants_view.status.active');
    if (normalized === 'rejected') return t('admin.merchants_view.status.rejected');
    if (normalized === 'suspended') return t('admin.merchants_view.status.suspended');
    return status;
  };

  const merchantCounts = {
    all: state.merchants?.length ?? 0,
    configured: state.merchants?.filter((merchant: any) => merchant.settlementProfileConfigured).length ?? 0,
    missing: state.merchants?.filter((merchant: any) => !merchant.settlementProfileConfigured).length ?? 0,
  };

  if (isLoading && (!filteredMerchants || filteredMerchants.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted text-sm">{t('admin.merchants_view.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.merchants_view.title')}</h1>
          <p className="text-sm text-muted">{t('admin.merchants_view.subtitle')}</p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder={t('admin.merchants_view.search_placeholder')}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-muted">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={actions.exportSettlementGapCsv}
            disabled={!settlementGaps?.merchants?.length}
          >
            <Download className="w-4 h-4" />
            Export Missing CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/5 border-white/10 rounded-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted font-black">Settlement Profiles Missing</p>
          <p className="mt-2 text-3xl font-black text-foreground">{settlementGaps?.total_missing ?? 0}</p>
          <p className="mt-2 text-sm text-muted">Merchants that still need a dedicated settlement profile row.</p>
        </Card>
      </div>

      <Tabs
        activeTab={settlementFilter}
        onChange={(value) => actions.setSettlementFilter(value as 'all' | 'configured' | 'missing')}
        tabs={[
          { id: 'all', label: 'All', count: merchantCounts.all },
          { id: 'configured', label: 'Configured', count: merchantCounts.configured },
          { id: 'missing', label: 'Missing', count: merchantCounts.missing },
        ]}
      />

      <div className="grid gap-4">
        {filteredMerchants.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md">
            <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-glow-sm">
              <LayoutGrid className="w-8 h-8 text-muted/50" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{t('admin.merchants_view.empty_title')}</h3>
            <p className="text-muted text-sm max-w-xs mx-auto mt-1">{t('admin.merchants_view.empty_desc')}</p>
          </div>
        ) : (
          filteredMerchants.map((merchant: any) => (
            <Card key={merchant.id} className="p-0 bg-white/5 border-white/10 overflow-hidden shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all group backdrop-blur-md rounded-2xl">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Store className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{merchant.businessName}</h3>
                    <div className="text-xs text-muted space-y-1.5 mt-2">
                       <div className="flex items-center gap-2">
                         <span className="w-1 h-1 rounded-full bg-primary/40"></span>
                         <span>{t('admin.merchants_view.email_label')}: <span className="text-foreground/80">{merchant.businessEmail}</span></span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="w-1 h-1 rounded-full bg-primary/40"></span>
                         <span>{t('admin.merchants_view.type_label')}: <span className="text-foreground/80 capitalize">{merchant.merchantType}</span></span>
                       </div>
                       {merchant.taxId && (
                         <div className="flex items-center gap-2 text-[11px] font-mono mt-1 opacity-70">
                            {t('admin.merchants_view.trn_label')}: {merchant.taxId}
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold border flex items-center gap-2 tracking-wider ${
                    merchant.status === 'verified' || merchant.status === 'active' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' :
                    merchant.status === 'rejected' || merchant.status === 'suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {merchant.status === 'verified' || merchant.status === 'active' ? <CheckCircle className="w-3 h-3" /> :
                     merchant.status === 'rejected' || merchant.status === 'suspended' ? <XCircle className="w-3 h-3" /> :
                     <AlertCircle className="w-3 h-3" />}
                    <span className="uppercase">{getStatusLabel(merchant.status)}</span>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold border tracking-wider ${
                    merchant.settlementProfileConfigured
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}>
                    {merchant.settlementProfileConfigured ? 'SETTLEMENT CONFIGURED' : 'SETTLEMENT MISSING'}
                  </div>

                  {merchant.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => actions.handleStatusUpdate(merchant.id, 'verified')}
                        disabled={isUpdating}
                        className="p-2 h-10 w-10 text-accent-green hover:bg-accent-green/10 rounded-xl border border-white/5"
                        title={t('admin.merchants_view.approve')}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => actions.handleStatusUpdate(merchant.id, 'rejected')}
                        disabled={isUpdating}
                        className="p-2 h-10 w-10 text-red-400 hover:bg-red-500/10 rounded-xl border border-white/5"
                        title={t('admin.merchants_view.reject')}
                      >
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                  <Link href={`/admin/merchants/${merchant.id}/settlement-profile`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 h-10 w-10 text-primary hover:bg-primary/10 rounded-xl border border-white/5"
                      title="Settlement Profile"
                    >
                      <Settings2 className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
