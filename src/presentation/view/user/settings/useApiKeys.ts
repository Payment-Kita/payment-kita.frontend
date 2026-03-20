import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiKeysQuery, useCreateApiKeyMutation, useRevokeApiKeyMutation } from '@/data/usecase/api_key_usecase';
import type { CreateApiKeyRequest } from '@/data/model/request';
import { useTranslation } from '@/presentation/hooks';
import { toast } from 'sonner';

export function useApiKeys() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: apiKeys, isLoading, error } = useApiKeysQuery();
  const createMutation = useCreateApiKeyMutation();
  const revokeMutation = useRevokeApiKeyMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      const request: CreateApiKeyRequest = {
        name: newKeyName,
        permissions: ['read', 'write'], // Default permissions for now
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };
      const result = await createMutation.mutateAsync(request);
      if (result) {
        setCreatedApiKey(result.apiKey);
        setCreatedSecret(result.secretKey);
      }
      setNewKeyName('');
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    } catch (e) {
      console.error(e);
      toast.error(t('settings.api_keys.create_failed'));
    }
  };

  const handleRevoke = async (id: string) => {
    if (confirm(t('settings.api_keys.confirm_revoke'))) {
        try {
            await revokeMutation.mutateAsync(id);
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        } catch (e) {
            console.error(e);
            toast.error(t('settings.api_keys.revoke_failed'));
        }
    }
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setCreatedApiKey(null);
      setCreatedSecret(null);
  };

  return {
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
  };
}
