<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/services/api';

  let wallets: any[] = [];
  let isLoading = true;
  let isConnecting = false;
  let error = '';
  let showModal = false;

  onMount(async () => {
    await loadWallets();
  });

  async function loadWallets() {
    isLoading = true;
    try {
      const result = await api.listWallets();
      if (result.data) {
        wallets = result.data.wallets || [];
      }
    } catch (e) {
      console.error('Failed to load wallets:', e);
    } finally {
      isLoading = false;
    }
  }

  async function connectWallet() {
    error = '';
    isConnecting = true;

    try {
      // Check if wallet extension is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      // Get chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      // Create message to sign
      const message = `Connect wallet to Payment-Kita\nAddress: ${address}\nTimestamp: ${Date.now()}`;

      // Sign message
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Send to backend
      const result = await api.connectWallet({
        chainId: `eip155:${parseInt(chainId, 16)}`,
        address,
        signature,
        message,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      showModal = false;
      await loadWallets();
    } catch (e: any) {
      error = e.message || 'Failed to connect wallet';
    } finally {
      isConnecting = false;
    }
  }

  function shortenAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
</script>

<svelte:head>
  <title>Wallets - Payment-Kita</title>
</svelte:head>

<div class="bg-gray-950 min-h-screen">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Wallets</h1>
        <p class="text-gray-400 mt-1">Manage your connected wallets</p>
      </div>
      <button on:click={() => showModal = true} class="btn-primary">
        + Connect Wallet
      </button>
    </div>

    {#if isLoading}
      <div class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    {:else if wallets.length === 0}
      <div class="card bg-gray-900 border-gray-800 text-center py-12">
        <div class="text-4xl mb-4">🔗</div>
        <h3 class="text-lg font-medium text-white mb-2">No wallets connected</h3>
        <p class="text-gray-400 mb-6">Connect your Web3 wallet to start making payments</p>
        <button on:click={() => showModal = true} class="btn-primary">
          Connect Wallet
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each wallets as wallet}
          <div class="card bg-gray-900 border-gray-800">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🔵</span>
                  <span class="text-white font-medium">{wallet.chainId}</span>
                  {#if wallet.isPrimary}
                    <span class="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                      Primary
                    </span>
                  {/if}
                </div>
                <p class="font-mono text-sm text-gray-400">
                  {shortenAddress(wallet.address)}
                </p>
              </div>
              <button class="text-gray-400 hover:text-white">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </button>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-800 flex gap-2">
              {#if !wallet.isPrimary}
                <button class="text-sm text-primary-400 hover:text-primary-300">
                  Set as Primary
                </button>
              {/if}
              <button class="text-sm text-gray-400 hover:text-red-400">
                Disconnect
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Connect Modal -->
{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div class="card bg-gray-900 border-gray-700 w-full max-w-md">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-white">Connect Wallet</h2>
        <button on:click={() => showModal = false} class="text-gray-400 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {#if error}
        <div class="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      {/if}

      <div class="space-y-3">
        <button
          on:click={connectWallet}
          disabled={isConnecting}
          class="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-700 hover:border-primary-500 bg-gray-800 transition-colors"
        >
          <span class="text-2xl">🦊</span>
          <div class="text-left">
            <p class="text-white font-medium">MetaMask</p>
            <p class="text-gray-400 text-sm">Connect using MetaMask</p>
          </div>
          {#if isConnecting}
            <svg class="ml-auto animate-spin h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          {/if}
        </button>

        <button
          class="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-700 hover:border-primary-500 bg-gray-800 transition-colors opacity-50"
          disabled
        >
          <span class="text-2xl">💜</span>
          <div class="text-left">
            <p class="text-white font-medium">Phantom</p>
            <p class="text-gray-400 text-sm">Coming soon</p>
          </div>
        </button>

        <button
          class="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-700 hover:border-primary-500 bg-gray-800 transition-colors opacity-50"
          disabled
        >
          <span class="text-2xl">🔵</span>
          <div class="text-left">
            <p class="text-white font-medium">WalletConnect</p>
            <p class="text-gray-400 text-sm">Coming soon</p>
          </div>
        </button>
      </div>
    </div>
  </div>
{/if}
