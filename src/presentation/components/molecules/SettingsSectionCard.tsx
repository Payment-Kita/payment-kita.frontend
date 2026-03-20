'use client';

import type { ReactNode } from 'react';
import { Card } from '@/presentation/components/atoms';

interface SettingsSectionCardProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function SettingsSectionCard({
  icon,
  title,
  description,
  action,
  children,
  className = '',
}: SettingsSectionCardProps) {
  return (
    <Card variant="glass" size="md" className={`rounded-3xl overflow-hidden relative ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {icon ? (
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                {icon}
              </div>
            ) : null}
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          </div>
          {description ? (
            <p className="text-sm text-muted mt-2 max-w-3xl">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </Card>
  );
}
