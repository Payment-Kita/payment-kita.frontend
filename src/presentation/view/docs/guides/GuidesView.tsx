'use client';

import { Card, Badge, Button } from '@/presentation/components/atoms';
import { Book, Clock, ArrowRight, Sparkles, Layout, Code, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useGuides } from './useGuides';
import { cn } from '@/core/utils/cn';
import { useTranslation } from '@/presentation/hooks/useTranslation';

export function GuidesView() {
  const { guides, getDifficultyVariant } = useGuides();
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl space-y-16 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
        <div className="space-y-2">
            <h1 className="heading-display text-foreground">{t('docs.guides.title', 'Integration Guides')}</h1>
            <p className="body-lg text-muted max-w-2xl leading-relaxed">
                {t('docs.guides.subtitle', 'Master the Payment Kita ecosystem with our deep-dive tutorials and architectural patterns.')}
            </p>
        </div>
        <div className="px-5 py-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3 backdrop-blur-sm shadow-glow-purple/5">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary italic">{t('docs.guides.updates_badge', 'Updates every week')}</span>
        </div>
      </div>

      {/* Featured Guide */}
      <Card variant="glass" size="lg" hoverable className="border-2 border-primary/20 bg-primary/5 shadow-glow-purple/10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <div className="flex items-center gap-3 text-primary">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Book className="h-6 w-6" />
                </div>
                <span className="font-bold uppercase tracking-[0.3em] text-[10px]">{t('docs.guides.featured_badge', 'Featured Masterclass')}</span>
              </div>
              <div className="space-y-6">
                <h3 className="heading-display text-foreground leading-[1.1]">{t('docs.guides.featured_title', 'Hosted Checkout Integration')}</h3>
                <p className="body-lg text-muted leading-relaxed">
                  {t('docs.guides.featured_desc', 'The most seamless way to accept crypto. Deploy a world-class checkout experience in under 10 minutes with just a few lines of code.')}
                </p>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2.5 text-sm font-medium text-muted">
                    <Clock className="h-5 w-5 opacity-60" />
                    {t('docs.guides.featured_read_time', '15 min intense read')}
                </div>
                <Badge variant="warning" className="px-4 py-1.5 rounded-xl border-warning/20 text-xs shadow-glow-orange/5">{t('docs.guides.featured_level', 'Intermediate')}</Badge>
              </div>
              <Link href="/docs/partner-api" className="inline-flex">
                <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-glow-purple hover:scale-105 transition-transform">
                  {t('docs.guides.featured_cta', 'Start Learning')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="hidden lg:block w-[40%] shrink-0">
              <div className="relative group/code">
                <div className="absolute -inset-4 bg-linear-to-r from-primary/30 via-accent-blue/30 to-accent-green/30 rounded-4xl blur-2xl opacity-20 group-hover/code:opacity-40 transition-opacity" />
                <div className="relative rounded-3xl border border-white/10 bg-black/60 p-8 font-mono text-[13px] shadow-2xl backdrop-blur-md">
                    <div className="flex gap-2 mb-6">
                        <div className="h-3 w-3 rounded-full bg-red-400/40" />
                        <div className="h-3 w-3 rounded-full bg-yellow-400/40" />
                        <div className="h-3 w-3 rounded-full bg-green-400/40" />
                    </div>
                    <pre className="text-primary-100 leading-[1.8] overflow-x-auto">
{`// 1. Initialize session
const session = await pk.create({
  amount: "100.00",
  currency: "USDC",
  redirect: "https://yoursite.com"
});

// 2. Launch Checkout
window.location.href = session.url;`}
                    </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Guide Categories */}
      <div className="space-y-16">
        {guides.map((section) => (
          <div key={section.category} className="space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4">
                <div className="h-px bg-linear-to-r from-primary to-transparent flex-1 opacity-20" />
                <h2 className="heading-2 text-foreground/80 uppercase tracking-widest">{section.category}</h2>
                <div className="h-px bg-linear-to-l from-primary to-transparent flex-1 opacity-20" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {section.items.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group block"
                >
                  <Card className="h-full p-0 bg-white/5 border-white/10 overflow-hidden hover:border-primary/40 hover:bg-white/8 transition-all duration-500 rounded-4xl group-hover:shadow-glow-purple/5">
                    <div className="p-7 space-y-6 h-full flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{guide.title}</h3>
                        {guide.featured && (
                          <Badge variant="success" className="bg-primary/10 text-primary border-primary/20 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Top Pick</Badge>
                        )}
                      </div>
                      <p className="text-[13px] text-muted leading-relaxed flex-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {guide.description}
                      </p>
                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                                "text-[9px] uppercase font-black tracking-tighter rounded-lg border-2",
                                getDifficultyVariant(guide.difficulty) === 'success' ? 'border-accent-green/30 text-accent-green bg-accent-green/5' :
                                getDifficultyVariant(guide.difficulty) === 'warning' ? 'border-warning/30 text-warning bg-warning/5' :
                                'border-destructive/30 text-destructive bg-destructive/5'
                            )}
                          >
                            {guide.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-[9px] text-muted uppercase font-black tracking-widest bg-white/5 px-2.5 py-1 rounded-lg">
                            <Clock className="h-3 w-3 opacity-50" />
                            {guide.readTime}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                            <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Resources */}
      <section className="space-y-8 pt-12 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="text-center space-y-2">
            <h2 className="heading-2 text-foreground">{t('docs.guides.next_steps_title', 'Next Steps')}</h2>
            <p className="body-lg text-muted">{t('docs.guides.next_steps_desc', 'Explore more ways to build with Payment Kita.')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
            { title: t('docs.guides.resource_api_title', 'API Docs'), desc: t('docs.guides.resource_api_desc', 'Full reference'), href: '/docs/api', icon: Code, color: 'text-primary' },
            { title: t('docs.guides.resource_community_title', 'Community'), desc: t('docs.guides.resource_community_desc', 'Join Discord'), href: 'https://discord.gg/payment-kita', icon: Layout, color: 'text-accent-blue' },
            { title: t('docs.guides.resource_support_title', 'Support'), desc: t('docs.guides.resource_support_desc', 'Get help'), href: 'mailto:support@payment-kita.com', icon: HelpCircle, color: 'text-accent-green' },
            { title: t('docs.guides.resource_partner_title', 'Partner API'), desc: t('docs.guides.resource_partner_desc', 'Quote and session flow'), href: '/docs/partner-api', icon: Sparkles, color: 'text-warning' }
            ].map((res) => (
            <Link key={res.title} href={res.href} target={res.href.startsWith('http') ? "_blank" : "_self"}>
                <div className="p-6 rounded-4xl border border-white/10 bg-white/2 hover:bg-primary/5 hover:border-primary/20 transition-all group text-center space-y-4">
                    <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-inner", res.color)}>
                        <res.icon className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{res.title}</h3>
                        <p className="text-xs text-muted mt-1">{res.desc}</p>
                    </div>
                </div>
            </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
