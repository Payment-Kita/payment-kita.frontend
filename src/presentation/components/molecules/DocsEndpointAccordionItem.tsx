'use client';

import { Check, ChevronDown, Copy, Play } from 'lucide-react';
import { Badge, Button, Card } from '@/presentation/components/atoms';
import type { ApiEndpointDoc } from '@/presentation/view/docs/api/useAPI';
import { DocsCodeBlock } from './DocsCodeBlock';

interface DocsEndpointAccordionItemProps {
  endpoint: ApiEndpointDoc;
  expanded: boolean;
  copiedEndpoint: string | null;
  bodyValue: string;
  result: string;
  requestState: 'idle' | 'success' | 'error';
  testing: boolean;
  methodVariant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary';
  onToggle: () => void;
  onCopy: (text: string, id: string) => void;
  onBodyChange: (value: string) => void;
  onRun: () => void;
  tryTitle: string;
  pathOverrideHint: string;
  sendLabel: string;
  sendingLabel: string;
  successLabel: string;
  failedLabel: string;
}

export function DocsEndpointAccordionItem({
  endpoint,
  expanded,
  copiedEndpoint,
  bodyValue,
  result,
  requestState,
  testing,
  methodVariant,
  onToggle,
  onCopy,
  onBodyChange,
  onRun,
  tryTitle,
  pathOverrideHint,
  sendLabel,
  sendingLabel,
  successLabel,
  failedLabel,
}: DocsEndpointAccordionItemProps) {
  return (
    <Card
      variant="glass"
      size="sm"
      className={`overflow-hidden rounded-2xl bg-white/5 border-white/10 transition-all duration-300 ${expanded ? 'shadow-[0_0_0_1px_rgba(99,102,241,0.18),0_18px_48px_rgba(15,23,42,0.22)] border-primary/20' : ''}`}
    >
      <div className={`relative px-5 py-4 transition-all duration-300 ${expanded ? 'bg-primary/5' : 'hover:bg-white/5'}`}>
        <div className={`absolute inset-y-3 left-2 w-1 rounded-full transition-all duration-300 ${expanded ? 'bg-primary/70 opacity-100' : 'bg-transparent opacity-0'}`} />
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-start gap-4 text-left"
            onClick={onToggle}
            aria-expanded={expanded}
          >
            <Badge variant={methodVariant} className="mt-0.5 w-16 shrink-0 justify-center py-1">{endpoint.method}</Badge>
            <div className="min-w-0 flex-1 space-y-1.5">
              <code className="block truncate text-sm font-semibold text-primary-100">{endpoint.path}</code>
              <p className="text-sm leading-relaxed text-muted">{endpoint.description}</p>
            </div>
            <ChevronDown className={`mt-1 h-4 w-4 shrink-0 transition-all duration-300 ${expanded ? 'rotate-180 text-primary scale-110' : 'scale-100'}`} />
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg shrink-0"
            onClick={() => onCopy(endpoint.path, `${endpoint.id}-path`)}
            aria-label={`Copy endpoint path ${endpoint.path}`}
          >
            {copiedEndpoint === `${endpoint.id}-path` ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4 text-muted" />}
          </Button>
        </div>
      </div>

      <div className={`grid overflow-hidden transition-all duration-500 ease-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-75'}`}>
        <div className="min-h-0">
          <div className={`border-t border-white/10 px-5 py-5 space-y-5 transition-all duration-500 ${expanded ? 'translate-y-0 scale-100' : '-translate-y-2 scale-[0.99]'}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{endpoint.auth}</Badge>
              <span className="text-sm text-muted">{endpoint.description}</span>
            </div>

            {endpoint.requestExample && (
              <DocsCodeBlock
                title="Request Example"
                code={endpoint.requestExample}
                copied={copiedEndpoint === `${endpoint.id}-request`}
                onCopy={() => onCopy(endpoint.requestExample!, `${endpoint.id}-request`)}
              />
            )}

            <DocsCodeBlock
              title="Response Example"
              code={endpoint.responseExample}
              copied={copiedEndpoint === `${endpoint.id}-response`}
              onCopy={() => onCopy(endpoint.responseExample, `${endpoint.id}-response`)}
              tone="response"
            />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">{tryTitle}</h4>
              {endpoint.testMethod === 'POST' && (
                <textarea
                  value={bodyValue}
                  onChange={(e) => onBodyChange(e.target.value)}
                  className="min-h-[180px] w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-primary-100 outline-none focus:border-primary/40"
                />
              )}
              {endpoint.path.includes(':id') && (
                <p className="text-xs text-muted">{pathOverrideHint}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={onRun}
                  loading={testing}
                  className={
                    requestState === 'success'
                      ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
                      : requestState === 'error'
                        ? 'bg-red-500 hover:bg-red-500 text-white'
                        : undefined
                  }
                >
                  <Play className="h-4 w-4" />
                  {testing ? sendingLabel : requestState === 'success' ? successLabel : requestState === 'error' ? failedLabel : sendLabel}
                </Button>
                {result ? (
                  <Button variant="ghost" onClick={() => onCopy(result, `${endpoint.id}-result`)}>
                    {copiedEndpoint === `${endpoint.id}-result` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy Result
                  </Button>
                ) : null}
              </div>
              {result ? <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-4 text-xs text-primary-100">{result}</pre> : null}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
