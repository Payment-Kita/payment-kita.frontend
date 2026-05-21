'use client';

import { AlertTriangle } from 'lucide-react';

interface CreatePaymentErrorCardProps {
  title: string;
  message: string;
}

export function CreatePaymentErrorCard({ title, message }: CreatePaymentErrorCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>
      <div>
        <p className="text-red-400 font-medium">{title}</p>
        <p className="text-red-400/80 text-sm mt-1">{message}</p>
      </div>
    </div>
  );
}
