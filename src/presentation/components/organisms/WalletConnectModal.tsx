'use client';

import { BaseModal } from '@/presentation/components/molecules';
import { PaymentKitaLogo } from '@/presentation/components/atoms';
import { WalletConnectActions } from '@/presentation/components/molecules';
import { useWalletConnectModal } from '@/presentation/hooks';
import { useTranslation } from '@/presentation/hooks';
import { useUnifiedWallet } from '@/presentation/providers/UnifiedWalletProvider';
import { shortenAddress } from '@/core/utils/format';
import { useState } from 'react';
import { toast } from 'sonner';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { t } = useTranslation();
  const {
    connectEvm,
    connectSvm,
    disconnectActiveWallet,
    isEvmConnected,
    isSvmConnected,
    activeWallet,
    address,
  } = useUnifiedWallet();
  const [pendingNetwork, setPendingNetwork] = useState<'evm' | 'svm' | null>(null);

  const handleConnectEvm = async () => {
    try {
      setPendingNetwork('evm');
      if (isSvmConnected && !isEvmConnected) {
        await disconnectActiveWallet();
      }
      await connectEvm();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('wallets.errors.connect_evm_failed');
      toast.error(message);
    } finally {
      setPendingNetwork(null);
    }
  };

  const handleConnectSvm = async () => {
    try {
      setPendingNetwork('svm');
      if (isEvmConnected && !isSvmConnected) {
        await disconnectActiveWallet();
      }
      const connected = await connectSvm();
      if (!connected) {
        toast.error(t('wallets.errors.connect_svm_failed'));
        return;
      }
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('wallets.errors.connect_svm_failed');
      toast.error(message);
    } finally {
      setPendingNetwork(null);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('wallets.modal.title')}
      description={t('wallets.modal.description')}
      className="max-w-md"
      footer={null}
    >
      <div className="flex flex-col items-center gap-6">
        <PaymentKitaLogo width={120} height={120} priority />
        {address && (
          <div className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-muted">
            {t('wallets.active_label')}: <span className="font-semibold text-foreground">{activeWallet?.toUpperCase()}</span>{' '}
            <span className="font-mono">{shortenAddress(address)}</span>
          </div>
        )}
        <WalletConnectActions
          onConnectEvm={handleConnectEvm}
          onConnectSvm={handleConnectSvm}
          isEvmLoading={pendingNetwork === 'evm'}
          isSvmLoading={pendingNetwork === 'svm'}
          isEvmDisabled={pendingNetwork === 'svm'}
          isSvmDisabled={pendingNetwork === 'evm'}
          isEvmConnected={isEvmConnected}
          isSvmConnected={isSvmConnected}
        />
      </div>
    </BaseModal>
  );
}

export function WalletConnectModalHost() {
  const isOpen = useWalletConnectModal((state) => state.isOpen);
  const close = useWalletConnectModal((state) => state.close);

  return <WalletConnectModal isOpen={isOpen} onClose={close} />;
}
