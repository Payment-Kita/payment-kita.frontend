'use client';

import React from 'react';
import { useAdminTokens } from './useAdminTokens';
import { Card, Button, Input, Tabs } from '@/presentation/components/atoms';
import { BaseModal, DeleteConfirmationModal, Pagination } from '@/presentation/components/molecules';
import { ChainSelector, TokenSelector } from '@/presentation/components/organisms';
import { useTranslation } from '@/presentation/hooks';
import { Coins, Search, LayoutGrid, CheckCircle2, Plus, Edit2, Trash2, ArrowRight, HelpCircle, AlertCircle } from 'lucide-react';

export const AdminTokensView = () => {
  const { t } = useTranslation();
  const { state, actions } = useAdminTokens();
  const {
    searchTerm,
    filterChainId,
    tokenData,
    isTokensLoading,
    chains,
    isModalOpen,
    editingId,
    deleteId,
    formData,
    isMutationPending,
    pairCheckChainId,
    verificationTokensData,
    tokenInId,
    tokenOutId,
    pairCheckResult,
    isPairChecking,
    activeTab,
  } = state;

  const checkPairTokens = verificationTokensData?.items || [];

  const tabOptions = [
    { id: 'tokens', label: t('admin.tokens_view.tabs.tokens', 'Tokens'), icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'verification', label: t('admin.tokens_view.tabs.verification', 'Verification'), icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            {t('admin.tokens_view.title')}
          </h1>
          <p className="text-sm text-muted">{t('admin.tokens_view.subtitle')}</p>
        </div>

        <Tabs 
          tabs={tabOptions} 
          activeTab={activeTab} 
          onChange={actions.setActiveTab} 
        />
      </div>

      {activeTab === 'tokens' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 border border-white/10 rounded-2xl backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('admin.tokens_view.search_placeholder')}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64 transition-all"
                  value={searchTerm}
                  onChange={(e) => actions.setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
              </div>

              <div className="w-[180px]">
                <ChainSelector
                    chains={chains?.items || []}
                    selectedChainId={filterChainId}
                    onSelect={(chain) => actions.setFilterChainId(chain?.id || '')}
                    placeholder={t('admin.tokens_view.all_chains')}
                />
              </div>
            </div>

            <Button onClick={actions.handleOpenAdd} size="sm" glow className="rounded-full px-5">
              <Plus className="w-4 h-4 mr-1" />
              {t('admin.tokens_view.add_token')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isTokensLoading ? (
              <div className="col-span-full p-12 text-center text-muted text-sm flex flex-col items-center justify-center gap-4 border border-white/5 rounded-2xl bg-white/5">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                  <Coins className="w-8 h-8 text-primary relative z-10" />
                </div>
                {t('admin.tokens_view.loading')}
              </div>
            ) : (!tokenData || !tokenData.items || tokenData.items.length === 0) ? (
              <div className="col-span-full text-center py-20 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md">
                <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-glow-sm">
                  <LayoutGrid className="w-8 h-8 text-muted/50" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t('admin.tokens_view.empty_title')}</h3>
                <p className="text-muted text-sm max-w-xs mx-auto mt-1">{t('admin.tokens_view.empty_desc')}</p>
                <Button variant="ghost" size="sm" onClick={actions.clearFilters} className="mt-4 text-primary">
                  {t('admin.tokens_view.clear_filters')}
                </Button>
              </div>
            ) : (
              <>
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tokenData.items.map((token) => (
                    <Card key={token.id} className="p-0 bg-white/5 border-white/10 overflow-hidden shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all group backdrop-blur-md rounded-2xl flex flex-col">
                      <div className="p-5 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                            {token.logoUrl ? (
                              <img src={token.logoUrl} alt={token.symbol} className="w-full h-full object-cover" />
                            ) : (
                              <Coins className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">{token.name || t('admin.tokens_view.unknown_token')}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                                {token.symbol || '???'}
                              </span>
                              <span className="text-[10px] text-muted uppercase font-bold tracking-wider">
                                {token.chain?.name || chains?.items?.find(c => c.id === token.chainId)?.name || t('admin.tokens_view.unknown_chain')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => actions.handleOpenEdit(token)}
                            className="p-2 h-auto hover:bg-primary/20 text-primary rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => actions.setDeleteId(token.id)}
                            className="p-2 h-auto hover:bg-red-500/20 text-red-400 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="px-5 pb-5 mt-auto space-y-3">
                        <div className="flex items-center justify-between py-2 border-y border-white/5 text-[10px]">
                          <div className="space-y-1">
                            <span className="text-muted uppercase block">{t('admin.tokens_view.contract_address')}</span>
                            <span className="font-mono text-foreground truncate max-w-[120px] block select-all" title={token.contractAddress}>
                              {token.contractAddress || t('admin.tokens_view.native')}
                            </span>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="text-muted uppercase block">{t('admin.tokens_view.min_amount')}</span>
                            <span className="font-bold text-foreground">{token.minAmount || '0'}</span>
                          </div>
                        </div>

                        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${token.isActive ? 'text-accent-green bg-accent-green/10 border-accent-green/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {token.isActive ? t('admin.tokens_view.active') : t('admin.tokens_view.inactive')}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="col-span-full">
                  {tokenData.meta && (
                    <Pagination
                      currentPage={tokenData.meta.page}
                      totalPages={tokenData.meta.totalPages}
                      onPageChange={actions.setPage}
                      isLoading={isTokensLoading}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-md rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Coins className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{t('admin.tokens_view.pair_check.title', 'Verify Token Pair Support')}</h2>
                <p className="text-sm text-muted">{t('admin.tokens_view.pair_check.subtitle', 'Check if a swap route exists between two tokens on a specific chain.')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end bg-white/5 p-6 rounded-2xl border border-white/5">
              <div className="md:col-span-7">
                <span className="text-xs font-semibold text-muted ml-1 uppercase tracking-wider">{t('admin.tokens_view.pair_check.select_chain', 'Select Chain')}</span>
                <ChainSelector
                  chains={chains?.items || []}
                  selectedChainId={pairCheckChainId}
                  onSelect={(chain) => {
                    actions.setPairCheckChainId(chain?.id || '');
                    actions.resetPairCheck();
                  }}
                  placeholder={t('admin.tokens_view.pair_check.chain_placeholder', 'Select Chain')}
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <span className="text-xs font-semibold text-muted ml-1 uppercase tracking-wider">{t('admin.tokens_view.pair_check.token_in', 'Token In')}</span>
                <TokenSelector
                  tokens={checkPairTokens}
                  selectedTokenId={tokenInId}
                  onSelect={(token) => {
                    actions.setTokenInId(token?.id || '');
                    actions.resetPairCheck();
                  }}
                  placeholder={t('admin.tokens_view.pair_check.token_placeholder', 'Select Token')}
                />
              </div>

              <div className="flex justify-center items-center py-4 md:py-0">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <ArrowRight className="w-5 h-5 text-muted/50" />
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <span className="text-xs font-semibold text-muted ml-1 uppercase tracking-wider">{t('admin.tokens_view.pair_check.token_out', 'Token Out')}</span>
                <TokenSelector
                  tokens={checkPairTokens}
                  selectedTokenId={tokenOutId}
                  onSelect={(token) => {
                    actions.setTokenOutId(token?.id || '');
                    actions.resetPairCheck();
                  }}
                  placeholder={t('admin.tokens_view.pair_check.token_placeholder', 'Select Token')}
                />
              </div>

              <div className="md:col-span-7 mt-4">
                <Button
                  onClick={actions.handleCheckPair}
                  className="w-full h-[48px] rounded-xl text-base font-bold"
                  disabled={!pairCheckChainId || !tokenInId || !tokenOutId || isPairChecking}
                  loading={isPairChecking}
                  glow
                >
                  {t('admin.tokens_view.pair_check.check_button', 'Verify Support')}
                </Button>
              </div>
            </div>

            {pairCheckResult && (
              <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in zoom-in-95 duration-300">
                {pairCheckResult.exists ? (
                  <div className={`rounded-2xl p-6 border ${pairCheckResult.executable ? "bg-accent-green/5 border-accent-green/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${pairCheckResult.executable ? "bg-accent-green/20" : "bg-amber-500/20"}`}>
                        <CheckCircle2 className={`w-6 h-6 ${pairCheckResult.executable ? "text-accent-green" : "text-amber-400"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`text-lg font-bold ${pairCheckResult.executable ? "text-accent-green" : "text-amber-400"}`}>
                              {pairCheckResult.executable
                                ? t('admin.tokens_view.pair_check.result_supported', 'Route Ready')
                                : t('admin.tokens_view.pair_check.result_registered_only', 'Route Registered (Not Ready)')}
                            </h3>
                            <p className={`text-sm ${pairCheckResult.executable ? "text-accent-green/70" : "text-amber-300/80"}`}>
                              {pairCheckResult.executable
                                ? t('admin.tokens_view.pair_check.supported_desc', 'Swap route is available and executable on-chain.')
                                : t('admin.tokens_view.pair_check.not_executable_desc', 'Route mapping exists, but swap executor configuration is incomplete.')}
                            </p>
                          </div>
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${pairCheckResult.isDirect ? 'bg-accent-green/20 text-accent-green' : 'bg-primary/20 text-primary'}`}>
                            {pairCheckResult.isDirect ? t('admin.tokens_view.pair_check.direct', 'Direct') : t('admin.tokens_view.pair_check.multi_hop', 'Multi-hop')}
                          </span>
                        </div>
                        
                        <div className="mt-6">
                          <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">{t('admin.tokens_view.pair_check.swap_path', 'Swap Path')}</span>
                          <div className="mt-2 flex items-center gap-3 p-4 bg-black/20 rounded-xl border border-white/5 overflow-x-auto">
                            {pairCheckResult.path.map((address, index) => {
                              const token = verificationTokensData?.items.find(t => t.contractAddress?.toLowerCase() === address.toLowerCase());
                              return (
                                <React.Fragment key={index}>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                      {token?.logoUrl ? (
                                        <img src={token.logoUrl} className="w-full h-full object-cover" alt="" />
                                      ) : (
                                        <Coins className="w-4 h-4 text-muted" />
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-foreground">
                                        {token?.symbol || '???'}
                                      </span>
                                      <span className="text-[9px] font-mono text-muted select-all">
                                        {address.slice(0, 6)}...{address.slice(-4)}
                                      </span>
                                    </div>
                                  </div>
                                  {index < pairCheckResult.path.length - 1 && (
                                    <ArrowRight className="w-4 h-4 text-primary/50 mx-1 shrink-0" />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>

                        {!pairCheckResult.executable && (
                          <div className="mt-4 p-4 rounded-xl border border-amber-400/20 bg-amber-500/5">
                            <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">Runtime Readiness</div>
                            <div className="text-xs text-amber-200/90 space-y-1">
                              {(pairCheckResult.reasons || []).map((reason, idx) => (
                                <div key={idx}>• {reason}</div>
                              ))}
                              {pairCheckResult.swapRouterV3 && (
                                <div>swapRouterV3: {pairCheckResult.swapRouterV3}</div>
                              )}
                              {pairCheckResult.universalRouter && (
                                <div>universalRouter: {pairCheckResult.universalRouter}</div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-accent-green/10 flex flex-wrap gap-3">
                          <div className="w-full mb-1">
                            <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">{t('admin.tokens_view.pair_check.admin_actions', 'Admin Actions')}</span>
                          </div>
                          
                          {pairCheckResult.isDirect ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                                onClick={actions.handleResetDirectPool}
                              >
                                {t('admin.tokens_view.pair_check.reset_v4', 'Reset Direct V4')}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                                onClick={actions.handleResetV3Pool}
                              >
                                {t('admin.tokens_view.pair_check.reset_v3', 'Reset V3 Fallback')}
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                              onClick={actions.handleResetMultiHopPath}
                            >
                              {t('admin.tokens_view.pair_check.reset_multihop', 'Reset Multi-hop')}
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[10px] text-muted hover:text-foreground"
                            onClick={() => {
                              actions.handleResetDirectPool();
                              actions.handleResetV3Pool();
                              actions.handleResetMultiHopPath();
                            }}
                          >
                            {t('admin.tokens_view.pair_check.reset_all', 'Clear All Routes')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-4">
                      <div className="p-3 bg-red-500/20 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-500">{t('admin.tokens_view.pair_check.result_not_supported', 'No Route Found')}</h3>
                        <p className="text-sm text-red-400/70 mt-1">
                          {t('admin.tokens_view.pair_check.not_supported_desc', 'This token pair is currently not supported for swaps on this chain. You can register a new route below.')}
                        </p>
                      </div>
                      {!state.isConnected && (
                        <div className="w-full md:w-auto mt-4 md:mt-0">
                           <appkit-button />
                        </div>
                      )}
                    </div>

                    {state.isConnected && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                        {/* Direct Pair Registration */}
                        <Card className="p-6 bg-white/5 border-white/10 rounded-2xl">
                          <h3 className="text-base font-bold text-foreground mb-1">{t('admin.tokens_view.register.direct_title', 'Register Direct V3 Pool')}</h3>
                          <p className="text-xs text-muted mb-6">{t('admin.tokens_view.register.direct_desc', 'Register a direct Uniswap V3 pool with a specific fee tier.')}</p>
                          
                          <div className="space-y-4">
                            <div>
                               <span className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">{t('admin.tokens_view.register.fee_tier', 'Fee Tier (bps)')}</span>
                               <div className="grid grid-cols-4 gap-2 mt-2">
                                 {[100, 500, 3000, 10000].map((fee) => (
                                   <button
                                     key={fee}
                                     onClick={() => actions.setDirectFee(fee)}
                                     className={`py-2 text-xs font-bold rounded-lg border transition-all ${state.directFee === fee ? 'bg-primary/20 border-primary text-primary shadow-glow-sm' : 'bg-white/5 border-white/10 text-muted hover:border-white/20'}`}
                                   >
                                     {fee / 10000 * 100}%
                                   </button>
                                 ))}
                               </div>
                            </div>

                            <Button 
                              onClick={actions.handleRegisterDirectPair} 
                              className="w-full rounded-xl" 
                              disabled={!state.swapperAddress || state.isRegistrationPending}
                              loading={state.isRegistrationPending}
                              glow
                            >
                              {t('admin.tokens_view.register.register_button', 'Register Direct Route')}
                            </Button>
                          </div>
                        </Card>

                        {/* Multi-hop Registration */}
                        <Card className="p-6 bg-white/5 border-white/10 rounded-2xl">
                          <h3 className="text-base font-bold text-foreground mb-1">{t('admin.tokens_view.register.multihop_title', 'Register Multi-hop Path')}</h3>
                          <p className="text-xs text-muted mb-6">{t('admin.tokens_view.register.multihop_desc', 'Register a route using one or more intermediate tokens (e.g. Token A -> USDC -> WETH -> Token B).')}</p>
                          
                          <div className="space-y-4">
                            <div className="space-y-3">
                               <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">{t('admin.tokens_view.register.hops', 'Hops')}</span>
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="h-6 px-2 text-[10px] text-primary" 
                                   onClick={actions.addHop}
                                 >
                                   + {t('admin.tokens_view.register.add_hop', 'Add Hop')}
                                 </Button>
                               </div>

                               {state.intermediateTokenIds.length === 0 ? (
                                 <div className="py-4 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2">
                                   <p className="text-[10px] text-muted">{t('admin.tokens_view.register.no_hops_desc', 'No intermediate tokens added yet.')}</p>
                                   <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={actions.addHop}>
                                     {t('admin.tokens_view.register.start_with_hop', 'Click to add first hop')}
                                   </Button>
                                 </div>
                               ) : (
                                 <div className="space-y-3">
                                   {state.intermediateTokenIds.map((id, index) => (
                                     <div key={index} className="relative group">
                                       <div className="flex items-center gap-2">
                                         <div className="flex-1">
                                           <TokenSelector
                                              tokens={checkPairTokens.filter(t => t.id !== tokenInId && t.id !== tokenOutId)}
                                              selectedTokenId={id}
                                              onSelect={(token) => actions.updateHop(index, token?.id || '')}
                                              placeholder={t('admin.tokens_view.register.intermediate_placeholder', 'Select token...')}
                                            />
                                         </div>
                                         <Button 
                                           variant="ghost" 
                                           size="icon" 
                                           className="h-9 w-9 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                           onClick={() => actions.removeHop(index)}
                                         >
                                           <Trash2 className="w-4 h-4" />
                                         </Button>
                                       </div>
                                       {index < state.intermediateTokenIds.length - 1 && (
                                         <div className="absolute left-[18px] -bottom-3 w-px h-3 bg-white/10" />
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               )}
                            </div>

                            <Button 
                              onClick={actions.handleRegisterMultiHopPath} 
                              className="w-full rounded-xl"
                              variant="outline"
                              disabled={!state.swapperAddress || state.intermediateTokenIds.length === 0 || state.intermediateTokenIds.some(id => !id) || state.isRegistrationPending}
                              loading={state.isRegistrationPending}
                            >
                              {t('admin.tokens_view.register.register_multihop', 'Register Multi-hop Path')}
                            </Button>
                          </div>
                        </Card>

                        {!state.swapperAddress && (
                           <div className="col-span-full bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
                             <AlertCircle className="w-5 h-5 text-orange-500" />
                             <span className="text-sm text-orange-200/70">
                               {t('admin.tokens_view.register.no_swapper', 'No TokenSwapper contract found for this chain in the database. Please register the contract first.')}
                             </span>
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}


      <BaseModal
        isOpen={isModalOpen}
        onClose={actions.handleCloseModal}
        title={editingId ? t('admin.tokens_view.modal.edit_title') : t('admin.tokens_view.modal.add_title')}
        description={editingId ? t('admin.tokens_view.modal.edit_desc') : t('admin.tokens_view.modal.add_desc')}
        onConfirm={actions.handleSubmit}
        isConfirmLoading={isMutationPending}
        isConfirmDisabled={!formData.chainId || !formData.symbol || !formData.name}
      >
        <form onSubmit={actions.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <ChainSelector
                label={t('admin.tokens_view.modal.target_blockchain')}
                chains={chains?.items || []}
                selectedChainId={formData.chainId}
                onSelect={(chain) => actions.setFormData({ ...formData, chainId: chain?.id || '' })}
                placeholder={t('admin.tokens_view.modal.target_blockchain_placeholder')}
              />
            </div>

            <Input
              label={t('admin.tokens_view.modal.token_name')}
              placeholder={t('admin.tokens_view.modal.token_name_placeholder')}
              value={formData.name}
              onChange={(e) => actions.setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label={t('admin.tokens_view.modal.symbol')}
              placeholder={t('admin.tokens_view.modal.symbol_placeholder')}
              value={formData.symbol}
              onChange={(e) => actions.setFormData({ ...formData, symbol: e.target.value })}
              required
            />
            <Input
              label={t('admin.tokens_view.modal.decimals')}
              type="number"
              value={formData.decimals}
              onChange={(e) => actions.setFormData({ ...formData, decimals: Number(e.target.value) })}
              required
            />
            <Input
              label={t('admin.tokens_view.modal.token_type')}
              placeholder={t('admin.tokens_view.modal.token_type_placeholder')}
              value={formData.type}
              onChange={(e) => actions.setFormData({ ...formData, type: e.target.value })}
              required
            />
            <Input
              label={t('admin.tokens_view.modal.min_amount')}
              placeholder={t('admin.tokens_view.modal.amount_placeholder')}
              type="number"
              value={formData.minAmount}
              onChange={(e) => actions.setFormData({ ...formData, minAmount: e.target.value })}
            />
            <Input
              label={t('admin.tokens_view.modal.max_amount')}
              placeholder={t('admin.tokens_view.modal.amount_placeholder')}
              type="number"
              value={formData.maxAmount}
              onChange={(e) => actions.setFormData({ ...formData, maxAmount: e.target.value })}
            />
            <div className="col-span-2">
              <Input
                label={t('admin.tokens_view.modal.contract_address')}
                placeholder={t('admin.tokens_view.modal.contract_address_placeholder')}
                value={formData.contractAddress}
                onChange={(e) => actions.setFormData({ ...formData, contractAddress: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Input
                label={t('admin.tokens_view.modal.logo_url')}
                placeholder={t('admin.tokens_view.modal.logo_url_placeholder')}
                value={formData.logoUrl}
                onChange={(e) => actions.setFormData({ ...formData, logoUrl: e.target.value })}
              />
            </div>
          </div>
        </form>
      </BaseModal>

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => actions.setDeleteId(null)}
        onConfirm={actions.handleDelete}
        title={t('admin.tokens_view.delete_modal.title')}
        description={t('admin.tokens_view.delete_modal.description')}
        isLoading={isMutationPending}
      />
    </div>
  );
};
