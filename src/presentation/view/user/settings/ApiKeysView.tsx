'use client';

import React from 'react';
import { useApiKeys } from './useApiKeys';
import { BaseModal } from '@/presentation/components/molecules';
import { Button, Card, Input } from '@/presentation/components/atoms';
import { Check, Copy, KeyRound, ShieldAlert } from 'lucide-react';
import { useTranslation } from '@/presentation/hooks';

export default function ApiKeysView() {
  const { t } = useTranslation();
  const {
    apiKeys,
    isLoading,
    error,
    createMutation,
    isModalOpen,
    setIsModalOpen,
    newKeyName,
    setNewKeyName,
    createdApiKey,
    createdSecret,
    handleCreate,
    handleRevoke,
    closeModal
  } = useApiKeys();

  const [copiedField, setCopiedField] = React.useState<'api' | 'secret' | null>(null);

  const handleCopyValue = async (field: 'api' | 'secret', value?: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{t('settings.api_keys.title')}</h1>
        <Card className="p-10 text-center text-muted">{t('settings.api_keys.loading')}</Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{t('settings.api_keys.title')}</h1>
        <Card className="p-6 border border-red-500/30 bg-red-500/10 text-red-300">
          {t('settings.api_keys.error_loading')}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('settings.api_keys.title')}</h1>
          <p className="text-sm text-muted">{t('settings.api_keys.subtitle')}</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          size="sm"
          glow
          className="gap-2"
        >
          <KeyRound className="w-4 h-4" />
          {t('settings.api_keys.create_new_key')}
        </Button>
      </div>

      <Card className="p-0 overflow-hidden bg-white/5 border border-white/10 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t('settings.api_keys.table.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t('settings.api_keys.table.key_id')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t('settings.api_keys.table.created')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{t('settings.api_keys.table.status')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">{t('settings.api_keys.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {apiKeys?.map((key: any) => (
              <tr key={key.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{key.name || t('settings.api_keys.table.untitled')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted font-mono">{key.keyHash?.substring(0, 12)}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">{new Date(key.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${key.isActive ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-red-500/15 text-red-300 border-red-500/30'}`}>
                    {key.isActive ? t('settings.api_keys.status.active') : t('settings.api_keys.status.revoked')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {key.isActive && (
                      <Button
                        onClick={() => handleRevoke(key.id)}
                        variant="danger"
                        size="sm"
                        className="ml-4"
                      >
                        {t('settings.api_keys.revoke')}
                      </Button>
                  )}
                </td>
              </tr>
            ))}
            {(!apiKeys || apiKeys.length === 0) && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted">{t('settings.api_keys.no_keys_found')}</td>
                </tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>

      <BaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={createdSecret ? t('settings.api_keys.modal.created_title') : t('settings.api_keys.modal.create_title')}
        description={createdSecret ? t('settings.api_keys.modal.created_description') : t('settings.api_keys.modal.create_description')}
        onConfirm={createdSecret ? closeModal : handleCreate}
        confirmLabel={createdSecret ? t('settings.api_keys.modal.copied_confirm') : t('settings.api_keys.modal.create_confirm')}
        isConfirmLoading={createMutation.isPending}
        isConfirmDisabled={!createdSecret && !newKeyName}
      >
            {createdSecret ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{t('settings.api_keys.modal.warning_copy_credentials')}</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      {t('settings.api_keys.modal.api_key_label')}
                    </p>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 break-all font-mono text-sm text-foreground">
                      {createdApiKey}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleCopyValue('api', createdApiKey)}
                      className="gap-2"
                    >
                      {copiedField === 'api' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedField === 'api' ? t('settings.api_keys.modal.copied') : t('settings.api_keys.modal.copy_api_key')}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      {t('settings.api_keys.modal.secret_key_label')}
                    </p>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 break-all font-mono text-sm text-foreground">
                      {createdSecret}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleCopyValue('secret', createdSecret)}
                      className="gap-2"
                    >
                      {copiedField === 'secret' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedField === 'secret' ? t('settings.api_keys.modal.copied') : t('settings.api_keys.modal.copy_secret')}
                    </Button>
                  </div>
                </div>
            ) : (
                <div className="space-y-4">
                  <Input
                    label={t('settings.api_keys.modal.key_name_label')}
                    placeholder={t('settings.api_keys.modal.key_name_placeholder')}
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
            )}
      </BaseModal>
    </div>
  );
}
