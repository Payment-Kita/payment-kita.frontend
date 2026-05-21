'use client';

import { Card } from '@/presentation/components/atoms';

export function BillInvoiceSkeleton() {
  return (
    <Card variant="glass" size="lg" className="p-8 shadow-glass space-y-5">
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-40 rounded bg-white/10" />
        <div className="h-4 w-72 rounded bg-white/10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
        <div className="h-20 rounded-xl bg-white/10" />
        <div className="h-20 rounded-xl bg-white/10" />
        <div className="h-20 rounded-xl bg-white/10" />
        <div className="h-20 rounded-xl bg-white/10" />
      </div>
      <div className="space-y-2 animate-pulse">
        <div className="h-11 rounded-full bg-white/10" />
        <div className="h-10 w-40 rounded-xl bg-white/10" />
      </div>
    </Card>
  );
}
