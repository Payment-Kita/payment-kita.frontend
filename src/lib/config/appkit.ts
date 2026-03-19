import { createAppKit } from '@reown/appkit/svelte';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from '@reown/appkit/networks';

// Get your projectId at https://cloud.reown.com
export const projectId = 'YOUR_PROJECT_ID';

const metadata = {
    name: 'Payment-Kita',
    description: 'Cross-chain stablecoin payment gateway',
    url: 'https://payment-kita.com', // origin must match your domain & subdomain
    icons: ['https://payment-kita.com/logo.png']
};

export const networks = [mainnet, polygon, optimism, arbitrum, base, sepolia];

export const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    ssr: true
});

// Initialize AppKit
export const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    features: {
        analytics: true
    }
});
