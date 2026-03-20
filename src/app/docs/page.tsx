'use client';

import Link from 'next/link';
import { FileCode2, BookOpen, Cable, ShieldCheck, Zap, Coins, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/presentation/hooks/useTranslation';
import { Button } from '@/presentation/components/atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/molecules/card';

const quickCards = [
  { href: '/docs/partner-api', icon: FileCode2, title: 'Partner API', desc: 'Authoritative additive contract for quote, session, hosted read, resolve-code, and webhook flows.', bullets: ['HMAC partner auth', 'Quote -> session -> hosted read', 'Webhook contract and retry policy'] },
  { href: '/docs/api', icon: Cable, title: 'API Reference', desc: 'Interactive endpoint catalog with examples, request bodies, response shapes, and test actions.', bullets: ['Partner routes', 'Legacy compatibility routes', 'Example payloads and live testing'] },
  { href: '/docs/guides', icon: BookOpen, title: 'Guides', desc: 'Integration paths for hosted checkout, partner migration, webhook handling, and operational rollout.', bullets: ['Hosted checkout migration', 'Partner cutover notes', 'Operational guides'] },
];

const featureCards = [
  { icon: Cable, title: 'Cross-Chain Runtime', desc: 'Bridge routing, destination swap, and partner hosted checkout are documented from the current runtime contract.' },
  { icon: ShieldCheck, title: 'Secure By Default', desc: 'Partner writes use HMAC signing and QR resolution uses encrypted payment_code payloads.' },
  { icon: Zap, title: 'Operator Ready', desc: 'Legacy endpoint deprecation, diagnostics, and migration guidance are exposed for staged cutover.' },
  { icon: Coins, title: 'Token-Native Flows', desc: 'Quote and session examples follow the current cross-token and cross-chain session model.' },
];

export default function DocsPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl space-y-12 pb-16">
      <div className="space-y-4">
        <h1 className="heading-display text-foreground">{t('docs.home.title', 'Payment Kita Documentation')}</h1>
        <p className="body-lg text-muted max-w-3xl">
          {t('docs.home.subtitle', 'Current integration documentation for partner checkout, runtime API contracts, and operator migration workflows.')}
        </p>
      </div>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="heading-2 text-foreground">{t('docs.home.quick_start', 'Quick Start')}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {quickCards.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="block group">
                <Card className="h-full rounded-[2rem] border-white/10 bg-white/5 transition-all hover:border-primary/30 hover:bg-white/10">
                  <CardHeader className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{t(`docs.home.card.${item.title}`, item.title)}</CardTitle>
                      <CardDescription className="leading-relaxed">{t(`docs.home.card_desc.${item.title}`, item.desc)}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm text-muted">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <span>{t('docs.home.explore', 'Explore')}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="heading-2 text-foreground">{t('docs.home.features', 'Key Features')}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="rounded-[2rem] border-white/10 bg-white/5">
                <CardHeader className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{t(`docs.home.feature.${item.title}`, item.title)}</CardTitle>
                  <CardDescription className="leading-relaxed">{t(`docs.home.feature_desc.${item.title}`, item.desc)}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="heading-2 text-foreground">{t('docs.home.example', 'Quick Example')}</h2>
        <Card className="rounded-[2rem] border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>{t('docs.home.example_title', 'Partner two-step flow')}</CardTitle>
            <CardDescription>{t('docs.home.example_desc', 'Create a quote first, then lock that quote into a hosted checkout session.')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-6 text-sm text-primary-100">{`const quote = await client.partner.createQuote({
  invoice_currency: 'IDRX',
  invoice_amount: '50000000000',
  selected_chain: 'eip155:8453',
  selected_token: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  dest_wallet: '0xMerchantDestination',
});

const session = await client.partner.createSession({
  quote_id: quote.quote_id,
  dest_wallet: '0xMerchantDestination',
});

console.log(session.payment_url);
console.log(session.payment_code);`}</pre>
            <div className="flex flex-wrap gap-3">
              <Link href="/docs/api"><Button>{t('docs.home.view_api', 'View API Reference')}</Button></Link>
              <Link href="/docs/partner-api"><Button variant="outline">{t('docs.home.view_partner', 'View Partner API')}</Button></Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
