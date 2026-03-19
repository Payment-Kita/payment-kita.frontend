<script lang="ts">
  import { onMount } from "svelte";
  import { api, type Chain, type Token } from "$lib/services/api";
  import { goto } from "$app/navigation";
  import { sendTransaction, getChainId, switchChain } from "$lib/utils/web3";

  let chains: Chain[] = [];
  let tokens: Token[] = [];
  let isLoading = true;
  let isSubmitting = false;
  let error = "";

  // Form data
  let sourceChainId = "";
  let destChainId = "";
  let sourceToken = "";
  let destToken = "";
  let amount = "";
  let receiverAddress = "";

  // Fee preview
  let feePreview = {
    platformFee: "0",
    bridgeFee: "0",
    totalFee: "0",
    estimatedReceived: "0",
  };

  onMount(async () => {
    try {
      const [chainsResult, tokensResult] = await Promise.all([
        api.listChains(),
        api.listTokens(),
      ]);

      if (chainsResult.data) chains = chainsResult.data.chains || [];
      if (tokensResult.data) tokens = tokensResult.data.tokens || [];
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      isLoading = false;
    }
  });

  function calculateFees() {
    if (!amount) {
      feePreview = {
        platformFee: "0",
        bridgeFee: "0",
        totalFee: "0",
        estimatedReceived: "0",
      };
      return;
    }

    const amountNum = parseFloat(amount);
    const platformFee = amountNum * 0.003 + 0.5; // 0.3% + $0.50
    const bridgeFee = sourceChainId !== destChainId ? 0.1 : 0;
    const totalFee = platformFee + bridgeFee;
    const estimated = amountNum - totalFee;

    feePreview = {
      platformFee: platformFee.toFixed(2),
      bridgeFee: bridgeFee.toFixed(2),
      totalFee: totalFee.toFixed(2),
      estimatedReceived: estimated.toFixed(2),
    };
  }

  $: amount, sourceChainId, destChainId, calculateFees();

  async function handleSubmit() {
    error = "";
    isSubmitting = true;

    try {
      const result = await api.createPayment({
        sourceChainId,
        destChainId,
        sourceTokenAddress: sourceToken,
        destTokenAddress: destToken,
        amount,
        decimals: 6,
        receiverAddress,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      const payment = result.data;
      if (!payment) throw new Error("Failed to create payment");

      // If EVM, trigger transaction
      if (sourceChainId.startsWith("eip155:")) {
        const chainId = parseInt(sourceChainId.split(":")[1]);
        const currentChainId = await getChainId();

        if (parseInt(currentChainId, 16) !== chainId) {
          await switchChain(chainId);
        }

        if (payment.signatureData?.to && payment.signatureData?.data) {
          const txHash = await sendTransaction(
            payment.signatureData.to,
            payment.signatureData.data,
          );
          console.log("Transaction sent:", txHash);
          // In a real app we might want to update the payment with the hash
        }
      }

      goto(`/payments/${payment.paymentId}`);
    } catch (e: any) {
      error = e.message || "Failed to create payment";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>New Payment - Payment-Kita</title>
</svelte:head>

<div class="bg-gray-950 min-h-screen">
  <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <a
        href="/payments"
        class="text-gray-400 hover:text-white text-sm mb-2 inline-block"
      >
        ← Back to Payments
      </a>
      <h1 class="text-2xl font-bold text-white">Create Payment</h1>
      <p class="text-gray-400 mt-1">Send stablecoins across chains</p>
    </div>

    {#if isLoading}
      <div class="flex justify-center py-12">
        <svg
          class="animate-spin h-8 w-8 text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      </div>
    {:else}
      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        {#if error}
          <div
            class="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm"
          >
            {error}
          </div>
        {/if}

        <!-- Source -->
        <div class="card bg-gray-900 border-gray-800">
          <h3 class="text-sm font-medium text-gray-400 mb-4">From</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-300 mb-2">Chain</label>
              <select
                bind:value={sourceChainId}
                required
                class="input bg-gray-800 border-gray-700 text-white w-full"
              >
                <option value="">Select chain</option>
                {#each chains as chain}
                  <option value={chain.caip2}>{chain.name}</option>
                {/each}
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-2">Token</label>
              <select
                bind:value={sourceToken}
                required
                class="input bg-gray-800 border-gray-700 text-white w-full"
              >
                <option value="">Select token</option>
                {#each tokens as token}
                  <option value={token.contractAddress}>{token.symbol}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              bind:value={amount}
              required
              min="1"
              step="0.01"
              class="input bg-gray-800 border-gray-700 text-white w-full text-lg"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Arrow -->
        <div class="flex justify-center">
          <div
            class="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center"
          >
            <span class="text-gray-400">↓</span>
          </div>
        </div>

        <!-- Destination -->
        <div class="card bg-gray-900 border-gray-800">
          <h3 class="text-sm font-medium text-gray-400 mb-4">To</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-300 mb-2">Chain</label>
              <select
                bind:value={destChainId}
                required
                class="input bg-gray-800 border-gray-700 text-white w-full"
              >
                <option value="">Select chain</option>
                {#each chains as chain}
                  <option value={chain.caip2}>{chain.name}</option>
                {/each}
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-2">Token</label>
              <select
                bind:value={destToken}
                required
                class="input bg-gray-800 border-gray-700 text-white w-full"
              >
                <option value="">Select token</option>
                {#each tokens as token}
                  <option value={token.contractAddress}>{token.symbol}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm text-gray-300 mb-2"
              >Receiver Address</label
            >
            <input
              type="text"
              bind:value={receiverAddress}
              required
              class="input bg-gray-800 border-gray-700 text-white w-full font-mono text-sm"
              placeholder="0x..."
            />
          </div>
        </div>

        <!-- Fee Summary -->
        <div class="card bg-gray-900 border-gray-800">
          <h3 class="text-sm font-medium text-gray-400 mb-4">Fee Summary</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Platform Fee (0.3% + $0.50)</span>
              <span class="text-white">${feePreview.platformFee}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Bridge Fee</span>
              <span class="text-white">${feePreview.bridgeFee}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-800">
              <span class="text-gray-300 font-medium">Total Fees</span>
              <span class="text-white font-medium">${feePreview.totalFee}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-300 font-medium">Estimated Received</span>
              <span class="text-green-400 font-medium"
                >${feePreview.estimatedReceived}</span
              >
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          class="btn-primary w-full py-3 text-base"
        >
          {#if isSubmitting}
            Creating Payment...
          {:else}
            Create Payment
          {/if}
        </button>
      </form>
    {/if}
  </div>
</div>
