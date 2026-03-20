'use client';

import { useParams } from 'next/navigation';
import { Button, Card, Badge } from '@/presentation/components/atoms';
import { WalletConnectButton } from '@/presentation/components/molecules';
import { Loader2, Copy, Check, AlertCircle, Clock, ShieldCheck, Zap } from 'lucide-react';
import { QRDisplay } from '@/presentation/components/organisms/checkout/QRDisplay';
import { MethodSelector } from '@/presentation/components/organisms/checkout/MethodSelector';
import { LoadingSpinner } from '@/presentation/components/organisms/loading';
import { usePayment } from './usePayment';
import { cn } from '@/core/utils/cn';

export function PaymentView() {
  const params = useParams();
  const requestId = params.id as string;
  const {
    paymentRequest,
    isLoading,
    error,
    isCompleted,
    isTerminal,
    timeLeft,
    isCopied,
    isPaying,
    activeMethod,
    setActiveMethod,
    isWalletReady,
    needsEvm,
    handlePay,
    copyTxData,
    formatTimeLeft,
    formatAmount,
    getChainName,
    t
  } = usePayment(requestId);

  return (
    <div className="min-h-screen bg-pk-bg flex items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-blue/20 rounded-full blur-[100px]" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {isLoading ? (
          <LoadingSpinner size="xl" text={t('pay_page.loading')} />
        ) : error && !paymentRequest ? (
          <Card variant="glass" className="p-12 text-center rounded-[3rem] border-destructive/20 bg-destructive/5 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-3xl flex items-center justify-center mb-8">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4 tracking-tight">{t('pay_page.error_title')}</h2>
            <p className="text-white/40 font-medium leading-relaxed">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-10 w-full h-14 rounded-2xl border-white/10 font-bold hover:bg-white/5 transition-all">
              Retry Connection
            </Button>
          </Card>
        ) : (
          paymentRequest && (
            <div className="space-y-8 animate-fade-in">
              <Card variant="glass" className="p-0 overflow-hidden rounded-[3.5rem] shadow-2xl border-white/5 bg-white/5 backdrop-blur-3xl group">
                {/* Header Section */}
                <div className="p-10 text-center bg-white/5 border-b border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center justify-center gap-3 text-white/50 text-xs mb-6 bg-white/5 w-fit mx-auto px-5 py-2 rounded-full border border-white/10 backdrop-blur-md relative z-10 group-hover:bg-primary/10 transition-colors">
                    <Clock className={cn("w-4 h-4 transition-colors", timeLeft < 60 ? "text-destructive animate-pulse" : "text-primary")} />
                    <span className="font-black tracking-widest uppercase">{formatTimeLeft(timeLeft)}</span>
                  </div>
                  
                    <div className="relative z-10 space-y-1">
                    <div className="text-5xl font-black text-white tracking-tighter mb-1">
                        {formatAmount(paymentRequest.amount, paymentRequest.amount_decimals)}
                    </div>
                    <div className="text-primary font-black tracking-[0.3em] uppercase text-[10px] flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {getChainName(paymentRequest.dest_chain)} Network
                    </div>
                  </div>
                </div>

                {/* Method Selector */}
                <div className="p-10 space-y-10">
                  <MethodSelector activeMethod={activeMethod} onChange={setActiveMethod} />
                  
                  <div className="transition-all duration-700 transform">
                    {activeMethod === 'dompetku' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                        <QRDisplay value={paymentRequest.payment_code} />
                        <div className="text-center px-4">
                          <p className="text-sm text-white/40 font-medium leading-relaxed">
                            Scan with the <span className="text-white font-bold tracking-tight italic">PaymentKita</span> mobile app for instant confirmation.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeMethod === 'wallet' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                        <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-6 relative overflow-hidden group/wallet">
                           <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                                <Zap className="w-32 h-32 rotate-12" />
                           </div>
                           <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent-blue" />
                                Interactive Wallet Checkout
                           </h3>
                           <ol className="space-y-5 text-sm font-medium text-white/40">
                             <li className="flex gap-4 items-center">
                               <div className="w-8 h-8 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xs font-black">01</div>
                               Connect your hardware or software wallet.
                             </li>
                             <li className="flex gap-4 items-center">
                               <div className="w-8 h-8 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xs font-black">02</div>
                               Verify and sign the intent on-chain.
                             </li>
                           </ol>
                        </div>
                        
                        <div className="space-y-4">
                            <Button
                            onClick={handlePay}
                            disabled={isPaying || timeLeft <= 0 || !isWalletReady || isTerminal}
                            loading={isPaying}
                            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/80 font-black text-xl shadow-glow-purple disabled:opacity-20 transition-all active:scale-[0.98]"
                            >
                            {isCompleted ? 'Payment Completed' : isPaying ? t('pay_page.processing') : t('pay_page.pay_now')}
                            </Button>
                            
                            {!isWalletReady && (
                            <WalletConnectButton 
                                size="lg" 
                                className="w-full h-16 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-lg transition-all" 
                                connectLabel={t('common.connect')} 
                            />
                            )}
                        </div>
                      </div>
                    )}

                    {activeMethod === 'manual' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                        <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block">Destination Contract / Program</label>
                            <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5 group/copy">
                              <code className="text-primary text-xs font-mono flex-1 truncate font-bold">
                                {paymentRequest.payment_instruction.to || paymentRequest.payment_instruction.program_id || paymentRequest.dest_token}
                              </code>
                              <button onClick={() => navigator.clipboard.writeText(paymentRequest.payment_instruction.to || paymentRequest.payment_instruction.program_id || paymentRequest.dest_token)} className="p-2 text-white/30 hover:text-white transition-all transform group-hover/copy:scale-110">
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block">Transaction Interaction Data (Hex)</label>
                            <div className="relative group/hex">
                              <pre className="text-[11px] text-white/60 bg-black/40 rounded-2xl p-6 overflow-x-auto max-h-40 font-mono scrollbar-hide border border-white/5 leading-relaxed">
                                {paymentRequest.payment_instruction.data || paymentRequest.payment_instruction.data_base58 || paymentRequest.payment_instruction.data_base64}
                              </pre>
                              <button
                                onClick={copyTxData}
                                className="absolute top-4 right-4 p-3 bg-primary/20 hover:bg-primary/40 text-primary rounded-xl transition-all shadow-glow-purple/20 opacity-0 group-hover/hex:opacity-100"
                              >
                                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 text-center border-t border-white/5 bg-black/40">
                  <div className="flex items-center justify-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-accent-green opacity-40" />
                    <p className="text-[9px] text-white/20 font-black tracking-[0.4em] uppercase">
                      {isCompleted ? 'Payment confirmed on-chain' : 'Secured by institutional vault architecture'}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex items-center justify-center gap-6 opacity-30">
                 <div className="h-px bg-white/20 flex-1" />
                 <span className="text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">
                   {isCompleted ? 'Order Confirmed' : paymentRequest.status === 'EXPIRED' ? 'Order Expired' : 'Order Confirmation Pending'}
                 </span>
                 <div className="h-px bg-white/20 flex-1" />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
