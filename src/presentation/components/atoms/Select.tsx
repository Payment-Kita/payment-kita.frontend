'use client';

import * as React from 'react';
import { cn } from '@/core/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'block w-full rounded-full border border-white/10 bg-background',
          'text-foreground placeholder-muted',
          'transition-all duration-300',
          'focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple/50 focus:shadow-glow-sm',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'h-11 px-5 py-3 text-sm',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export { Select };
