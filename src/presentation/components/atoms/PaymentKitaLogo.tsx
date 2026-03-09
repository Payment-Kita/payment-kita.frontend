'use client';

import Image from 'next/image';
import { cn } from '@/core/utils';

interface PaymentKitaLogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function PaymentKitaLogo({
  className,
  width = 120,
  height = 120,
  priority = false,
}: PaymentKitaLogoProps) {
  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <Image
        src="/logo.png"
        alt="Payment-Kita Logo"
        width={width}
        height={height}
        priority={priority}
        className="object-contain"
      />
    </div>
  );
}

