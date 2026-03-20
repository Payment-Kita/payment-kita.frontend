'use client';

import { Check, Copy } from 'lucide-react';
import { Button } from '@/presentation/components/atoms';

interface DocsCodeBlockProps {
  title?: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
  tone?: 'request' | 'response';
}

export function DocsCodeBlock({ title, code, copied, onCopy, tone = 'request' }: DocsCodeBlockProps) {
  const codeClass = tone === 'response' ? 'text-accent-green/90' : 'text-primary-100';

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 w-8 p-0 rounded-lg">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
      <pre className={`overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs ${codeClass}`}>{code}</pre>
    </div>
  );
}
