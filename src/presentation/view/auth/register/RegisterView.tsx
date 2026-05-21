'use client';

import Link from 'next/link';
import { Badge, Button, Input, Card, Select } from '@/presentation/components/atoms';
import { WalletConnectButton } from '@/presentation/components/molecules';
import { useRegister, RegisterStep } from './useRegister';
import { useTranslation } from '@/presentation/hooks';
import { Rocket, Wallet, Check, ArrowLeft, Building2, User, Globe, FileText } from 'lucide-react';

export function RegisterView() {
  const {
    step,
    setStep,
    form,
    isPending,
    address,
    isConnected,
    handleAccountSubmit,
    handleMerchantSubmit,
    handleFinalSubmit,
    RegistrationStep
  } = useRegister();
  const { t } = useTranslation();

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const isMerchant = form.watch('isMerchant');

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-mesh">
      {/* Animated background orbs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent-green/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-2/3 left-1/2 w-48 h-48 bg-accent-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-lg animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20 mb-6 font-mono text-xs">
            <Rocket className="w-3.5 h-3.5 text-accent-green" />
            <span className="text-accent-green font-bold tracking-widest uppercase">{t('auth.register_badge')}</span>
          </div>
          <h1 className="heading-1 text-foreground">{t('auth.create_account')}</h1>
          <p className="body-lg mt-3">{t('auth.create_account_subtitle')}</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {/* Step 1: Account */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step >= RegistrationStep.ACCOUNT
                    ? 'bg-gradient-purple-green text-foreground shadow-glow-sm'
                    : 'bg-surface border border-white/10 text-muted'
                  }`}
              >
                {step > RegistrationStep.ACCOUNT ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${step >= RegistrationStep.ACCOUNT ? 'text-foreground' : 'text-muted'}`}>
                {t('auth.steps.account')}
              </span>
            </div>

            <div className={`w-8 h-px mb-6 transition-colors duration-300 ${step >= RegistrationStep.BUSINESS ? 'bg-accent-green' : 'bg-white/10'}`} />

            {/* Step 2: Business */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step >= RegistrationStep.BUSINESS
                    ? 'bg-gradient-purple-green text-foreground shadow-glow-sm'
                    : 'bg-surface border border-white/10 text-muted'
                  }`}
              >
                {step > RegistrationStep.BUSINESS ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${step >= RegistrationStep.BUSINESS ? 'text-foreground' : 'text-muted'}`}>
                {t('auth.steps.business')}
              </span>
            </div>

            <div className={`w-8 h-px mb-6 transition-colors duration-300 ${step >= RegistrationStep.WALLET ? 'bg-accent-green' : 'bg-white/10'}`} />

            {/* Step 3: Wallet */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step >= RegistrationStep.WALLET
                    ? 'bg-gradient-purple-green text-foreground shadow-glow-sm'
                    : 'bg-surface border border-white/10 text-muted'
                  }`}
              >
                <Wallet className="w-5 h-5" />
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${step >= RegistrationStep.WALLET ? 'text-foreground' : 'text-muted'}`}>
                {t('auth.steps.wallet')}
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card variant="glass" size="lg" className="p-8 shadow-glass overflow-visible">
          {form.formState.errors.root && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6 animate-fade-in flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {form.formState.errors.root.message}
            </div>
          )}

          {step === RegistrationStep.ACCOUNT && (
            <form onSubmit={handleAccountSubmit} className="space-y-5 animate-fade-in">
              <Input
                label={t('auth.name')}
                id="name"
                placeholder={t('auth.name_placeholder')}
                {...form.register('name')}
                error={form.formState.errors.name?.message}
              />
              <Input
                label={t('auth.email')}
                id="email"
                type="email"
                placeholder={t('auth.email_placeholder')}
                {...form.register('email')}
                error={form.formState.errors.email?.message}
              />
              <Input
                label={t('auth.password')}
                id="password"
                type="password"
                placeholder={t('auth.password_placeholder')}
                {...form.register('password')}
                error={form.formState.errors.password?.message}
              />
              <Input
                label={t('auth.confirm_password')}
                id="confirmPassword"
                type="password"
                placeholder={t('auth.confirm_password_placeholder')}
                {...form.register('confirmPassword')}
                error={form.formState.errors.confirmPassword?.message}
              />
              <Button type="submit" variant="primary" className="w-full mt-4" glow>
                {t('common.continue')}
              </Button>
            </form>
          )}

          {step === RegistrationStep.BUSINESS && (
            <form onSubmit={handleMerchantSubmit} className="space-y-6 animate-fade-in">
              <button
                onClick={() => setStep(RegistrationStep.ACCOUNT)}
                className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-2"
                type="button"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common.back')}
              </button>

              <div className="p-1.5 rounded-2xl bg-surface/50 border border-white/10 flex">
                <button
                  type="button"
                  onClick={() => form.setValue('isMerchant', false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${!isMerchant ? 'bg-gradient-purple-blue text-white shadow-lg' : 'text-muted hover:text-foreground'
                    }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-semibold">{t('auth.type.individual')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue('isMerchant', true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${isMerchant ? 'bg-gradient-purple-green text-white shadow-lg' : 'text-muted hover:text-foreground'
                    }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-semibold">{t('auth.type.merchant')}</span>
                </button>
              </div>

              {isMerchant ? (
                <div className="space-y-5 animate-fade-in">
                  <Input
                    label={t('auth.business_name')}
                    id="businessName"
                    placeholder={t('auth.business_name_placeholder')}
                    {...form.register('businessName')}
                    error={form.formState.errors.businessName?.message}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">
                      {t('auth.business_type')}
                    </label>
                    <select
                      {...form.register('businessType')}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-accent-purple/50 outline-none transition-all appearance-none"
                    >
                      <option value="INDIVIDUAL">{t('auth.business_types.individual')}</option>
                      <option value="COMPANY">{t('auth.business_types.company')}</option>
                      <option value="NON_PROFIT">{t('auth.business_types.non_profit')}</option>
                      <option value="GOVERNMENT">{t('auth.business_types.government')}</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-accent-blue/5 border border-accent-blue/10 rounded-2xl">
                  <Globe className="w-12 h-12 text-accent-blue/40 mx-auto mb-3" />
                  <p className="text-sm text-muted px-6">
                    {t('auth.individual_benefit_info')}
                  </p>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" glow>
                {t('common.continue')}
              </Button>
            </form>
          )}

          {step === RegistrationStep.WALLET && (
            <div className="space-y-5 animate-fade-in">
              <button
                onClick={() => setStep(RegistrationStep.BUSINESS)}
                className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                type="button"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t('common.back')}
              </button>

              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-purple-blue/10 border border-accent-purple/20 flex items-center justify-center shadow-glow-sm">
                  <Wallet className="w-10 h-10 text-accent-purple" />
                </div>
                <h2 className="heading-3 text-foreground mb-3">{t('wallets.connect')}</h2>
                <p className="body text-muted/70 px-4">{t('auth.wallet_required')}</p>
              </div>

              {isConnected && address ? (
                <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                  <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center shrink-0">
                    <Check className="w-6 h-6 text-accent-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground font-medium truncate">{t('wallets.connected')}</p>
                    <p className="text-accent-green text-sm font-mono truncate">{truncateAddress(address)}</p>
                  </div>
                </div>
              ) : (
                <WalletConnectButton size="lg" className="w-full" connectLabel={t('wallets.connect')} />
              )}

              <Button
                onClick={handleWalletNext}
                disabled={!isConnected || isPending}
                variant="primary"
                className="w-full h-14 rounded-2xl"
                glow
              >
                {t('common.next')}
              </Button>
            </div>
          )}

          {step === RegisterStep.MERCHANT_PROFILE && (
            <form onSubmit={handleFinalSubmit} className="space-y-5 animate-fade-in">
              <button
                onClick={() => setStep(RegisterStep.WALLET)}
                className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors group mb-2"
                type="button"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t('common.back')}
              </button>

              <div className="grid grid-cols-1 gap-5">
                <Input
                  label={t('auth.merchant.business_name')}
                  placeholder={t('auth.merchant.business_name_placeholder')}
                  {...form.register('businessName')}
                  error={form.formState.errors.businessName?.message}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted/80 ml-1">
                    {t('auth.merchant.business_category')}
                  </label>
                  <Select
                    {...form.register('businessCategory')}
                  >
                    <option value="">{t('auth.merchant.business_category_placeholder')}</option>
                    <option value="retail">Retail</option>
                    <option value="services">Services</option>
                    <option value="corporate">Corporate</option>
                    <option value="digital">Digital Product</option>
                    <option value="other">Other</option>
                  </Select>
                  {form.formState.errors.businessCategory && (
                    <p className="text-xs text-red-400 mt-1 ml-1">{form.formState.errors.businessCategory.message}</p>
                  )}
                </div>

                <Input
                  label={t('auth.merchant.business_website')}
                  placeholder={t('auth.merchant.business_website_placeholder')}
                  icon={<Globe className="w-4 h-4 text-muted" />}
                  {...form.register('businessWebsite')}
                  error={form.formState.errors.businessWebsite?.message}
                />

                <Input
                  label={t('auth.merchant.business_description')}
                  placeholder={t('auth.merchant.business_description_placeholder')}
                  icon={<FileText className="w-4 h-4 text-muted" />}
                  {...form.register('businessDescription')}
                  error={form.formState.errors.businessDescription?.message}
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                loading={isPending}
                variant="primary"
                className="w-full mt-4"
                glow
              >
                {t('auth.create_account_action')}
              </Button>
            </form>
          )}

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] uppercase tracking-widest text-muted/50 font-bold">{t('common.or')}</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="text-center">
            <p className="text-sm text-muted/80">
              {t('auth.have_account')}{' '}
              <Link href="/login" className="text-accent-purple hover:text-accent-purple/80 font-bold transition-all hover:tracking-wide">
                {t('auth.sign_in')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
