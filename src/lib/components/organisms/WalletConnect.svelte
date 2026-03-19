<script lang="ts">
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import Icon from '../atoms/Icon.svelte';
  import { walletStore, type Wallet } from '$lib/stores/wallet';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let connecting = false;
  let error = '';

  $: wallets = $walletStore.wallets;
  $: isConnected = $walletStore.isConnected;

  async function connectMetaMask() {
    connecting = true;
    error = '';

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Sign message for verification
      const message = `Welcome to Payment-Kita!\n\nSign this message to verify wallet ownership.\n\nTimestamp: ${Date.now()}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Add wallet to store
      walletStore.addWallet({
        id: crypto.randomUUID(),
        address,
        chainId: `eip155:${parseInt(chainId, 16)}`,
        isPrimary: wallets.length === 0,
      });

      dispatch('connected', { address, chainId });
    } catch (err: any) {
      error = err.message || 'Failed to connect wallet';
    } finally {
      connecting = false;
    }
  }

  function disconnectWallet(wallet: Wallet) {
    walletStore.removeWallet(wallet.id);
    dispatch('disconnected', { address: wallet.address });
  }

  function setPrimary(wallet: Wallet) {
    walletStore.setPrimary(wallet.id);
  }

  function shortenAddress(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }
</script>

<div class="space-y-4">
  {#if wallets.length > 0}
    <div class="space-y-2">
      {#each wallets as wallet}
        <div class="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Icon name="wallet" size={20} className="text-white" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="text-white font-mono">{shortenAddress(wallet.address)}</p>
                {#if wallet.isPrimary}
                  <Badge variant="success" size="sm">Primary</Badge>
                {/if}
              </div>
              <p class="text-gray-500 text-xs">{wallet.chainId}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            {#if !wallet.isPrimary}
              <Button variant="ghost" size="sm" on:click={() => setPrimary(wallet)}>
                Set Primary
              </Button>
            {/if}
            <Button variant="ghost" size="sm" on:click={() => disconnectWallet(wallet)}>
              <Icon name="x" size={16} />
            </Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if error}
    <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      {error}
    </div>
  {/if}

  <Button 
    variant="secondary" 
    fullWidth 
    on:click={connectMetaMask} 
    loading={connecting}
  >
    <Icon name="wallet" size={20} />
    {wallets.length > 0 ? 'Connect Another Wallet' : 'Connect MetaMask'}
  </Button>
</div>
