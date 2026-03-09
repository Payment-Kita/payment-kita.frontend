'use client';

import { wagmiAdapter, projectId } from '@/core/config/appkit';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, arbitrum, base, optimism, polygon, sepolia } from '@reown/appkit/networks';
import React, { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

// Validation
if (!projectId) {
  console.warn('WalletConnect Project ID is not defined');
}

// Create the modal
const metadata = {
  name: 'Payment-Kita',
  description: 'Cross-chain Stablecoin Payment Gateway',
  url: 'https://payment-kita.com',
  icons: ['https://payment-kita.com/logo.png'],
};

if (projectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [mainnet, arbitrum, base, optimism, polygon, sepolia],
    metadata,
    features: {
      analytics: true,
    },
  });
}

export default function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      {children}
    </WagmiProvider>
  );
}
