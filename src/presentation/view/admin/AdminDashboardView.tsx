'use client';

import Link from 'next/link';
import { useAdminStats } from '@/data/usecase/useAdmin';
import { Card, Badge, Button } from '@/presentation/components/atoms';
import { StatCard } from '@/presentation/components/molecules';
import { useTranslation } from '@/presentation/hooks';
import { Users, Store, Activity, DollarSign, TrendingUp, ArrowUpRight, Zap, Target } from 'lucide-react';
import { cn } from '@/core/utils/cn';

export function AdminDashboardView() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary animate-bounce" />
        </div>
        <div className="space-y-2">
            <p className="text-xl font-black italic tracking-tighter text-foreground opacity-50">Syncing Intelligence...</p>
            <p className="text-sm text-muted">Fetching latest institutional metrics.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: t('admin_dashboard_view.cards.total_users'),
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-accent-blue',
      glow: 'shadow-glow-blue/10',
      trend: '+12% this month',
      bg: 'bg-accent-blue/5'
    },
    {
      label: t('admin_dashboard_view.cards.total_merchants'),
      value: stats?.totalMerchants || 0,
      icon: Store,
      color: 'text-primary',
      glow: 'shadow-glow-purple/10',
      trend: '+5 new today',
      bg: 'bg-primary/5'
    },
    {
      label: t('admin_dashboard_view.cards.total_volume'),
      value: stats?.totalVolume || '$0',
      icon: DollarSign,
      color: 'text-accent-green',
      glow: 'shadow-glow-green/10',
      trend: 'ATH reached',
      bg: 'bg-accent-green/5'
    },
    {
      label: t('admin_dashboard_view.cards.active_chains'),
      value: stats?.activeChains || 0,
      icon: Activity,
      color: 'text-warning',
      glow: 'shadow-glow-orange/10',
      trend: 'All systems green',
      bg: 'bg-warning/5'
    },
  ];
  const legacySummary = stats?.legacyEndpointObservability;

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-foreground">{t('admin_dashboard_view.title')}</h1>
            <p className="text-xl text-muted max-w-2xl">{t('admin_dashboard_view.subtitle')}</p>
        </div>
        <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white/5 border-white/10 font-bold hover:bg-white/10 transition-all flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            Live Analytics Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bg={stat.bg}
            glow={stat.glow}
            trend={stat.trend}
          />
        ))}
      </div>

      {!!legacySummary && (
        <Card className="p-6 rounded-[2rem] bg-warning/5 border-warning/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-warning">Legacy Runtime</p>
              <h3 className="text-2xl font-black tracking-tight">Deprecation Observability</h3>
              <p className="text-sm text-muted">
                {legacySummary.total_hits} legacy hits across {legacySummary.tracked_endpoints} tracked endpoint families.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="warning">{legacySummary.tracked_endpoints} tracked</Badge>
              <Badge variant="outline">{legacySummary.total_hits} hits</Badge>
              <Link href="/admin/diagnostics/legacy-endpoints">
                <Button variant="outline" className="rounded-xl h-9 px-4">Open Diagnostics</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Featured Insights Section */}
      <div className="grid lg:grid-cols-3 gap-8 pt-8">
        <Card className="lg:col-span-2 p-10 bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] opacity-20" />
            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-2xl">
                        <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight italic">System Resilience</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { label: 'Uptime', val: '99.99%', sub: 'Global Cluster' },
                        { label: 'Latency', val: '12ms', sub: 'Average Edge' },
                        { label: 'Success', val: '100%', sub: 'Transactions' }
                    ].map((m) => (
                        <div key={m.label} className="space-y-1">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{m.label}</p>
                            <p className="text-3xl font-black">{m.val}</p>
                            <p className="text-[10px] text-muted font-bold">{m.sub}</p>
                        </div>
                    ))}
                </div>
                <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/80 font-black shadow-glow-purple text-lg">
                    Infrastructure Status
                </Button>
            </div>
        </Card>

        <Card className="p-10 bg-white/5 border-white/10 rounded-[3rem] flex flex-col justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-accent-blue/10 rounded-4xl flex items-center justify-center mx-auto">
                <Activity className="w-10 h-10 text-accent-blue" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black">Live Traffic</h3>
                <p className="text-sm text-muted px-4 leading-relaxed">Processing 1,240 requests/sec across 14 global regions.</p>
            </div>
            <div className="h-px bg-white/10 w-1/2 mx-auto" />
            <span className="text-[10px] font-black text-accent-green uppercase tracking-[0.3em]">Operational</span>
        </Card>
      </div>
    </div>
  );
}
