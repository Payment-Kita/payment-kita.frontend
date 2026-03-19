import { writable, derived, get } from 'svelte/store';

export interface Wallet {
    id: string;
    address: string;
    chainId: string;
    isPrimary: boolean;
}

interface WalletState {
    wallets: Wallet[];
    isConnecting: boolean;
}

const STORAGE_KEY = 'payment-kita-wallets';

function createWalletStore() {
    // Load from localStorage
    const stored = typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY)
        : null;

    const initialState: WalletState = stored
        ? JSON.parse(stored)
        : { wallets: [], isConnecting: false };

    const { subscribe, set, update } = writable<WalletState>(initialState);

    // Persist to localStorage
    subscribe((state) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    });

    return {
        subscribe,

        addWallet: (wallet: Wallet) => {
            update((state) => {
                // Check if already exists
                if (state.wallets.find(w => w.address.toLowerCase() === wallet.address.toLowerCase())) {
                    return state;
                }
                return {
                    ...state,
                    wallets: [...state.wallets, wallet],
                };
            });
        },

        removeWallet: (id: string) => {
            update((state) => ({
                ...state,
                wallets: state.wallets.filter(w => w.id !== id),
            }));
        },

        setPrimary: (id: string) => {
            update((state) => ({
                ...state,
                wallets: state.wallets.map(w => ({
                    ...w,
                    isPrimary: w.id === id,
                })),
            }));
        },

        setConnecting: (connecting: boolean) => {
            update((state) => ({ ...state, isConnecting: connecting }));
        },

        clear: () => {
            set({ wallets: [], isConnecting: false });
        },
    };
}

export const walletStore = createWalletStore();

// Derived stores
export const isConnected = derived(walletStore, ($store) => $store.wallets.length > 0);
export const primaryWallet = derived(walletStore, ($store) =>
    $store.wallets.find(w => w.isPrimary) || $store.wallets[0] || null
);
