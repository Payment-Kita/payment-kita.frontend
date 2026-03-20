'use client';

import type { ReactNode } from 'react';
import { Card } from '@/presentation/components/atoms';

interface DataTableCardProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DataTableCard({
  title,
  icon,
  action,
  children,
  className = '',
}: DataTableCardProps) {
  return (
    <Card variant="glass" size="md" className={`rounded-3xl overflow-hidden p-0 ${className}`}>
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <h3 className="text-xl font-bold text-foreground truncate">{title}</h3>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </Card>
  );
}
