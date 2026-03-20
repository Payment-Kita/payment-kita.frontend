import { useState, useEffect } from 'react';
import { 
  useMerchantMeQuery, 
  useUpdateMerchantSettingsMutation,
  useWebhookLogsQuery,
  useTestWebhookPingMutation,
  useApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation
} from '@/data/usecase';
import { toast } from 'sonner';

export const useDeveloperSettings = () => {
  const { data: merchant, isLoading: isMerchantLoading } = useMerchantMeQuery();
  const { data: apiKeys, isLoading: isApiKeysLoading } = useApiKeysQuery();
  const { data: webhookLogs, isLoading: isLogsLoading, refetch: refetchLogs } = useWebhookLogsQuery(1, 10);
  
  const updateSettingsMutation = useUpdateMerchantSettingsMutation();
  const testPingMutation = useTestWebhookPingMutation();
  const createApiKeyMutation = useCreateApiKeyMutation();
  const revokeApiKeyMutation = useRevokeApiKeyMutation();

  const [callbackUrl, setCallbackUrl] = useState('');
  const [webhookActive, setWebhookActive] = useState(false);

  useEffect(() => {
    if (merchant) {
      console.log(merchant);
      setCallbackUrl(merchant.callbackUrl || '');
      setWebhookActive(merchant.webhookIsActive || false);
    }
  }, [merchant]);

  const handleUpdateWebhook = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        callbackUrl,
        webhookIsActive: webhookActive,
      });
      toast.success('Webhook settings updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update webhook settings');
    }
  };

  const handleTestPing = async () => {
    if (!callbackUrl) {
      toast.error('Please enter a callback URL first');
      return;
    }
    try {
      await testPingMutation.mutateAsync(callbackUrl);
      toast.success('Test ping sent successfully');
      refetchLogs();
    } catch (error: any) {
      toast.error(error.message || 'Test ping failed');
    }
  };

  const handleCreateApiKey = async (name: string) => {
    try {
      const result = await createApiKeyMutation.mutateAsync({ name, permissions: [] });
      toast.success('API Key created');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create API key');
      throw error;
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    try {
      await revokeApiKeyMutation.mutateAsync(id);
      toast.success('API Key revoked');
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke API key');
    }
  };

  return {
    merchant,
    apiKeys,
    webhookLogs,
    isLoading: isMerchantLoading || isApiKeysLoading || isLogsLoading,
    callbackUrl,
    setCallbackUrl,
    webhookActive,
    setWebhookActive,
    isUpdating: updateSettingsMutation.isPending,
    isTesting: testPingMutation.isPending,
    handleUpdateWebhook,
    handleTestPing,
    handleCreateApiKey,
    handleRevokeApiKey,
  };
};
