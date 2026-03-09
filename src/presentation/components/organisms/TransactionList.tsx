'use client';

import { formatCurrency, formatDate } from '@/core/utils';
import type { Payment, PaymentPrivacyStatus } from '@/data/model/entity';
import { useTranslation } from '@/presentation/hooks';
import { ArrowRight, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TransactionListProps {
  payments: Payment[];
  privacyStatusByPaymentId?: Record<string, PaymentPrivacyStatus>;
  privacyStatusLoading?: boolean;
  showAll?: boolean;
  title?: string;
}

export default function TransactionList({ 
  payments, 
  privacyStatusByPaymentId,
  privacyStatusLoading = false,
  showAll = false,
  title
}: TransactionListProps) {
  const { t } = useTranslation();
  const displayPayments = showAll ? payments : payments.slice(0, 5);
  const resolvedTitle = title ?? t('transaction_list.default_title');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-accent-green" />;
      case 'pending':
      case 'processing':
        return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getPrivacyStageStyles = (stage: string) => {
    switch (stage) {
      case 'privacy_forwarded_final':
      case 'privacy_resolved':
        return 'bg-accent-green/10 text-accent-green border-accent-green/20';
      case 'privacy_forward_failed_retrying':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'privacy_claimable':
        return 'bg-blue-500/10 text-blue-300 border-blue-400/20';
      case 'privacy_refundable':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'privacy_settled_to_stealth':
        return 'bg-blue-500/10 text-blue-300 border-blue-400/20';
      case 'privacy_pending_on_source':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-surface/60 text-muted border-white/10';
    }
  };

  const getPrivacyStageLabel = (stage: string) => {
    switch (stage) {
      case 'privacy_forwarded_final':
        return t('transaction_list.privacy_forwarded_final');
      case 'privacy_resolved':
        return t('transaction_list.privacy_resolved');
      case 'privacy_forward_failed_retrying':
        return t('transaction_list.privacy_forward_failed_retrying');
      case 'privacy_claimable':
        return t('transaction_list.privacy_claimable');
      case 'privacy_refundable':
        return t('transaction_list.privacy_refundable');
      case 'privacy_settled_to_stealth':
        return t('transaction_list.privacy_settled_to_stealth');
      case 'privacy_pending_on_source':
        return t('transaction_list.privacy_pending_on_source');
      default:
        return '';
    }
  };

  const buildPrivacyTooltip = (privacy: PaymentPrivacyStatus) => {
    const lines: string[] = [`${t('transaction_list.privacy_stage_label')}: ${privacy.stage}`];
    if (privacy.reason && privacy.reason.trim().length > 0) {
      lines.push(`${t('transaction_list.privacy_reason_label')}: ${privacy.reason.trim()}`);
    }
    if (privacy.signals && privacy.signals.length > 0) {
      lines.push(`${t('transaction_list.privacy_signals_label')}: ${privacy.signals.join(', ')}`);
    }
    if (lines.length === 0) {
      return undefined;
    }
    return lines.join('\n');
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent-green/10 text-accent-green border-accent-green/20';
      case 'pending':
      case 'processing':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  if (payments.length === 0) {
    return (
      <div className="card p-12 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface border border-white/10 flex items-center justify-center">
          <Clock className="w-8 h-8 text-muted" />
        </div>
        <p className="text-muted text-lg">{t('transaction_list.empty_title')}</p>
        <p className="text-muted/60 text-sm mt-1">{t('transaction_list.empty_description')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="heading-3 text-foreground">{resolvedTitle}</h2>
      <div className="space-y-3">
        {displayPayments.map((payment, index) => (
          <div
            key={payment.paymentId}
            className="card-hover p-4 flex items-center justify-between group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-purple-blue/10 border border-accent-purple/20 flex items-center justify-center group-hover:shadow-glow-sm transition-all duration-300">
                <span className="text-accent-purple text-sm font-bold uppercase">
                  {payment.sourceChainId?.slice(0, 2) ?? 'TX'}
                </span>
              </div>
              
              {/* Transaction Details */}
              <div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <span>{payment.sourceAmount}</span>
                  <ArrowRight className="w-4 h-4 text-muted" />
                  <span>{payment.destAmount}</span>
                </div>
                <p className="text-muted text-sm mt-0.5">
                  {formatDate(payment.createdAt)}
                </p>
              </div>
            </div>
            
            {/* Amount & Status */}
            <div className="text-right flex flex-col items-end gap-2">
              <p className="text-foreground font-semibold">
                {formatCurrency(parseFloat(payment.sourceAmount ?? '0'))}
              </p>
              {privacyStatusLoading ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border bg-surface/50 text-muted border-white/10">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t('transaction_list.privacy_loading')}
                </span>
              ) : null}
              {(() => {
                const privacy = privacyStatusByPaymentId?.[payment.paymentId];
                if (!privacy || !privacy.isPrivacyCandidate) return null;
                if (privacy.stage === 'privacy_unknown' || privacy.stage === 'not_privacy') return null;
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${getPrivacyStageStyles(privacy.stage)}`}
                    title={buildPrivacyTooltip(privacy)}
                  >
                    <span>{getPrivacyStageLabel(privacy.stage)}</span>
                  </span>
                );
              })()}
              <span
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${getStatusStyles(payment.status)}`}
              >
                {getStatusIcon(payment.status)}
                <span className="capitalize">{payment.status}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
