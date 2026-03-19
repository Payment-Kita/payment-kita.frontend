/**
 * Web3 utility functions
 */

export interface EthereumProvider {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    removeListener: (event: string, handler: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
}

export interface SolanaProvider {
    publicKey: { toBase58: () => string } | null;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
    connect: () => Promise<{ publicKey: any }>;
    disconnect: () => Promise<void>;
    on: (event: string, handler: (args: any) => void) => void;
    isPhantom?: boolean;
}

declare global {
    interface Window {
        ethereum?: EthereumProvider;
        solana?: SolanaProvider;
    }
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' &&
        typeof window.ethereum !== 'undefined' &&
        window.ethereum.isMetaMask === true;
}

/**
 * Get current connected accounts
 */
export async function getAccounts(): Promise<string[]> {
    if (!window.ethereum) return [];
    try {
        return await window.ethereum.request({ method: 'eth_accounts' });
    } catch {
        return [];
    }
}

/**
 * Request accounts (triggers MetaMask popup)
 */
export async function requestAccounts(): Promise<string[]> {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    return await window.ethereum.request({ method: 'eth_requestAccounts' });
}

/**
 * Get current chain ID
 */
export async function getChainId(): Promise<string> {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    return await window.ethereum.request({ method: 'eth_chainId' });
}

/**
 * Switch to a specific chain
 */
export async function switchChain(chainId: number): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not installed');

    const hexChainId = `0x${chainId.toString(16)}`;

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hexChainId }],
        });
    } catch (error: any) {
        // Chain not added, try to add it
        if (error.code === 4902) {
            throw new Error('Chain not added to MetaMask');
        }
        throw error;
    }
}

/**
 * Sign a message
 */
export async function signMessage(message: string, address: string): Promise<string> {
    if (!window.ethereum) throw new Error('MetaMask not installed');

    return await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
    });
}

/**
 * Send an EVM transaction
 */
export async function sendTransaction(to: string, data: string): Promise<string> {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    const accounts = await getAccounts();
    if (accounts.length === 0) throw new Error('Please connect your wallet first');

    return await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
            from: accounts[0],
            to,
            data,
        }],
    });
}

/**
 * Send an SVM transaction (Solana)
 */
export async function sendSolanaTransaction(programId: string, base64Data: string): Promise<string> {
    if (!window.solana) throw new Error('Solana wallet (Phantom) not installed');

    // We'll need @solana/web3.js for full implementation, but for now we'll assume 
    // the wallet handles the instruction data if we passed it correctly.
    // In a real implementation: 
    // 1. Decode base64Data
    // 2. Create TransactionInstruction
    // 3. Create Transaction
    // 4. Sign and send

    // For now, let's just trigger a connect if not connected
    if (!window.solana.publicKey) {
        await window.solana.connect();
    }

    throw new Error('Solana transaction sending requires @solana/web3.js integration (Coming soon)');
}

/**
 * Create a standard verification message
 */
export function createVerificationMessage(nonce?: string): string {
    const timestamp = Date.now();
    const nonceStr = nonce || Math.random().toString(36).substring(2);

    return `Welcome to Payment-Kita!

Sign this message to verify wallet ownership.

This request will not trigger a blockchain transaction or cost any gas fees.

Nonce: ${nonceStr}
Timestamp: ${timestamp}`;
}

/**
 * Watch for account changes
 */
export function watchAccountChanges(callback: (accounts: string[]) => void): () => void {
    if (!window.ethereum) return () => { };

    const handler = (accounts: string[]) => callback(accounts);
    window.ethereum.on('accountsChanged', handler);

    return () => window.ethereum?.removeListener('accountsChanged', handler);
}

/**
 * Watch for chain changes
 */
export function watchChainChanges(callback: (chainId: string) => void): () => void {
    if (!window.ethereum) return () => { };

    const handler = (chainId: string) => callback(chainId);
    window.ethereum.on('chainChanged', handler);

    return () => window.ethereum?.removeListener('chainChanged', handler);
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Detect address type
 */
export function detectAddressType(address: string): 'evm' | 'solana' | 'unknown' {
    if (isValidAddress(address)) return 'evm';
    if (isValidSolanaAddress(address)) return 'solana';
    return 'unknown';
}
