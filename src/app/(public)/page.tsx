import Link from 'next/link';
import Image from 'next/image';
import { Button, Card } from '@/presentation/components/atoms';
import Navbar from '@/presentation/components/organisms/Navbar';
import { getServerDictionary } from '@/core/i18n/server';
import { translate } from '@/core/i18n/translate';
import { HomeCtaActions } from '@/presentation/view/public/home/HomeCtaActions';
import {
  ArrowRight,
  Zap,
  Coins,
  Link as LinkIcon,
  Shield,
  Sparkles,
  Globe,
  RefreshCw,
  Wallet,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';

export default async function LandingPage() {
  const dictionary = await getServerDictionary();
  const t = (key: string) => translate(dictionary, key);

  const paymentRequestExample = t('public_home.payment_request_example');
  const feeFormulaExample = t('public_home.fee_formula_example');

  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: t('public_home.features.multi_chain.title'),
      description: t('public_home.features.multi_chain.description'),
      color: 'blue',
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: t('public_home.features.auto_swap.title'),
      description: t('public_home.features.auto_swap.description'),
      color: 'green',
    },
    {
      icon: <LinkIcon className="w-8 h-8" />,
      title: t('public_home.features.payment_requests.title'),
      description: t('public_home.features.payment_requests.description'),
      color: 'purple',
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: t('public_home.features.realtime_tracking.title'),
      description: t('public_home.features.realtime_tracking.description'),
      color: 'blue',
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: t('public_home.features.rpc_failover.title'),
      description: t('public_home.features.rpc_failover.description'),
      color: 'amber',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t('public_home.features.refund_guarantee.title'),
      description: t('public_home.features.refund_guarantee.description'),
      color: 'amber',
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: t('public_home.features.verified_merchants.title'),
      description: t('public_home.features.verified_merchants.description'),
      color: 'purple',
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: t('public_home.features.wallet_security.title'),
      description: t('public_home.features.wallet_security.description'),
      color: 'green',
    },
  ];

  const steps = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: t('public_home.steps.connect_wallet.title'),
      description: t('public_home.steps.connect_wallet.description'),
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: t('public_home.steps.create_request.title'),
      description: t('public_home.steps.create_request.description'),
    },
    {
      icon: <ArrowRight className="w-6 h-6" />,
      title: t('public_home.steps.sign_pay.title'),
      description: t('public_home.steps.sign_pay.description'),
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: t('public_home.steps.track_settle.title'),
      description: t('public_home.steps.track_settle.description'),
    },
  ];

  const getFeatureColors = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; border: string }> = {
      purple: { bg: 'bg-accent-purple/10', icon: 'text-accent-purple', border: 'group-hover:border-accent-purple/30' },
      green: { bg: 'bg-accent-green/10', icon: 'text-accent-green', border: 'group-hover:border-accent-green/30' },
      blue: { bg: 'bg-accent-blue/10', icon: 'text-accent-blue', border: 'group-hover:border-accent-blue/30' },
      amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'group-hover:border-amber-500/30' },
    };
    return colors[color] || colors.purple;
  };

  const supportedChains = [
    { name: t('public_home.supported_chains.base'), logo: '/chain/base-icon.svg', width: 28, height: 28 },
    { name: t('public_home.supported_chains.arbitrum'), logo: '/chain/arbitrum-icon.svg', width: 28, height: 28 },
    { name: t('public_home.supported_chains.solana'), logo: '/chain/solana-icon.svg', width: 24, height: 24 },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-accent-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-accent-blue/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
        </div>

        <div className="section-padding">
          <div className="container-app text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/30 mb-8 animate-fade-in backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-sm text-accent-green font-medium">{t('public_home.hero.mainnet_badge')}</span>
              <Sparkles className="w-4 h-4 text-accent-green" />
            </div>

            {/* Headline */}
            <h1 className="heading-display animate-fade-in-up mx-auto max-w-4xl">
              <img
                src="/logo.png"
                alt="Payment-Kita Logo"
                className="block mx-auto h-50 w-50 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <span className="block text-foreground mb-2 text-6xl">{t('common.brand')}</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl body-lg text-muted animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              {t('public_home.hero.subtitle')}
            </p>

            {/* Quick Highlights */}
            <div className="mx-auto mt-10 max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <Card variant="glass" size="sm" className="text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{t('public_home.quick_cards.payment_requests.title')}</p>
                    <p className="text-sm text-muted mt-1">
                      {t('public_home.quick_cards.payment_requests.description')}
                    </p>
                  </div>
                </div>
              </Card>
              <Card variant="glass" size="sm" className="text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{t('public_home.quick_cards.bridge_swap.title')}</p>
                    <p className="text-sm text-muted mt-1">
                      {t('public_home.quick_cards.bridge_swap.description')}
                    </p>
                  </div>
                </div>
              </Card>
              <Card variant="glass" size="sm" className="text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{t('public_home.quick_cards.refund_policy.title')}</p>
                    <p className="text-sm text-muted mt-1">
                      {t('public_home.quick_cards.refund_policy.description')}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Supported chains */}
            <div className="mt-20 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <p className="label mb-6 uppercase tracking-wider text-muted/60">{t('public_home.supported_networks.label')}</p>
              <div className="flex flex-wrap justify-center gap-6">
                {supportedChains.map((chain, index) => (
                  <div
                    key={chain.name}
                    className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-default animate-fade-in hover:scale-105 duration-300"
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <Image
                      src={chain.logo}
                      alt={chain.name}
                      width={chain.width}
                      height={chain.height}
                      className="object-contain"
                    />
                    <span className="text-foreground font-medium">{chain.name}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-muted/70 max-w-2xl mx-auto">
                {t('public_home.supported_networks.caption')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative z-10 bg-black/20 backdrop-blur-sm">
        <div className="container-app">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-4">
              <Zap className="w-4 h-4 text-accent-purple" />
              <span className="text-xs text-accent-purple font-medium uppercase tracking-wider">{t('public_home.features_section.badge')}</span>
            </div>
            <h2 className="heading-1 text-foreground">{t('public_home.features_section.title')}</h2>
            <p className="mt-4 body-lg text-muted">{t('public_home.features_section.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const colorStyles = getFeatureColors(feature.color);
              return (
                <div key={feature.title} className="animate-fade-in-up h-full" style={{ animationDelay: `${index * 100}ms` }}>
                  <Card
                    variant="glass"
                    size="md"
                    hoverable
                    className={`h-full flex flex-col ${colorStyles.border}`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${colorStyles.bg} ${colorStyles.icon} flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted leading-relaxed flex-1">{feature.description}</p>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-app">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 mb-4">
              <RefreshCw className="w-4 h-4 text-accent-blue" />
              <span className="text-xs text-accent-blue font-medium uppercase tracking-wider">{t('public_home.how_it_works.badge')}</span>
            </div>
            <h2 className="heading-1 text-foreground">{t('public_home.how_it_works.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-linear-to-r from-accent-purple/20 via-accent-blue/20 to-accent-green/20 -z-10" />

            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-glass backdrop-blur-md z-10 group hover:scale-110 transition-transform duration-300">
                  <div className="text-accent-blue group-hover:text-accent-purple transition-colors">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted text-sm max-w-[200px]">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-3xl mx-auto text-center animate-fade-in-up" style={{ animationDelay: '700ms' }}>
            <p className="text-muted leading-relaxed">
              {t('public_home.how_it_works.footer')}
            </p>
          </div>
        </div>
      </section>

      {/* Payment Requests Section */}
      <section className="py-24 relative z-10 bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="container-app">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-4">
              <LinkIcon className="w-4 h-4 text-accent-purple" />
              <span className="text-xs text-accent-purple font-medium uppercase tracking-wider">{t('public_home.requests_section.badge')}</span>
            </div>
            <h2 className="heading-1 text-foreground">{t('public_home.requests_section.title')}</h2>
            <p className="mt-4 body-lg text-muted max-w-3xl mx-auto">
              {t('public_home.requests_section.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="card-glass p-8">
                <h3 className="heading-3 mb-4">{t('public_home.requests_section.what_you_get_title')}</h3>
                <ul className="space-y-4">
                  {[
                    t('public_home.requests_section.items.item_1'),
                    t('public_home.requests_section.items.item_2'),
                    t('public_home.requests_section.items.item_3'),
                    t('public_home.requests_section.items.item_4'),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-purple" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-glass p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-accent-green" />
                  <h3 className="heading-3">{t('public_home.requests_section.expiration_title')}</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  {t('public_home.requests_section.expiration_description')}
                </p>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="card-glass p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="bg-black/40 rounded-xl p-6 border border-white/5 font-mono text-sm leading-relaxed overflow-x-auto custom-scrollbar">
                  <div className="text-accent-purple mb-2">{t('public_home.requests_section.response_title')}</div>
                  <pre className="text-muted/90 whitespace-pre-wrap">{paymentRequestExample}</pre>
                </div>
                <p className="mt-4 text-xs text-muted/70">
                  {t('public_home.requests_section.tip')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fees & Refund Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-app">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium uppercase tracking-wider">{t('public_home.fees_section.badge')}</span>
            </div>
            <h2 className="heading-1 text-foreground">{t('public_home.fees_section.title')}</h2>
            <p className="mt-4 body-lg text-muted max-w-3xl mx-auto">
              {t('public_home.fees_section.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="card-glass p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h3 className="heading-3 mb-4">{t('public_home.fees_section.formula_title')}</h3>
              <div className="bg-black/40 rounded-xl p-6 border border-white/5 font-mono text-sm leading-relaxed overflow-x-auto custom-scrollbar">
                <pre className="text-muted/90 whitespace-pre-wrap">{feeFormulaExample}</pre>
              </div>
              <p className="mt-4 text-sm text-muted leading-relaxed">
                {t('public_home.fees_section.formula_note')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Card variant="glass" size="md" className="h-full">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{t('public_home.fees_section.cards.request_ttl_title')}</p>
                    <p className="text-sm text-muted mt-1">{t('public_home.fees_section.cards.request_ttl_description')}</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" size="md" className="h-full">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{t('public_home.fees_section.cards.settlement_title')}</p>
                    <p className="text-sm text-muted mt-1">{t('public_home.fees_section.cards.settlement_description')}</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" size="md" className="h-full">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{t('public_home.fees_section.cards.success_title')}</p>
                    <p className="text-sm text-muted mt-1">{t('public_home.fees_section.cards.success_description')}</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" size="md" className="h-full">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{t('public_home.fees_section.cards.refund_title')}</p>
                    <p className="text-sm text-muted mt-1">{t('public_home.fees_section.cards.refund_description')}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-app">
          <div className="text-center max-w-3xl mx-auto card-glass px-8 py-16 shadow-glass relative group animate-fade-in-up">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-linear-to-r from-accent-purple/10 to-accent-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 mb-6">
                  <Sparkles className="w-4 h-4 text-accent-green" />
                <span className="text-xs text-accent-green font-medium">{t('public_home.cta.badge')}</span>
              </div>
              <h2 className="heading-2 text-foreground mb-6">{t('public_home.cta.title')}</h2>
              <p className="body-lg text-muted mb-10 max-w-xl mx-auto">
                {t('public_home.cta.subtitle')}
              </p>
              <HomeCtaActions
                primaryLabel={t('public_home.cta.start_accepting')}
                secondaryLabel={t('public_home.cta.contact_sales')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black/40">
        <div className="container-app">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted text-sm">
              © {new Date().getFullYear()} {t('common.brand')}. {t('public_home.footer.rights')}
            </p>
            <div className="flex gap-8 text-sm text-muted">
              <Link href="/about" className="hover:text-white transition-colors">{t('public_home.footer.about_protocol')}</Link>
              <Link href="/team" className="hover:text-white transition-colors">{t('public_home.footer.team')}</Link>
              <Link href="/docs" className="hover:text-white transition-colors">{t('public_home.footer.documentation')}</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">{t('public_home.footer.privacy_policy')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
