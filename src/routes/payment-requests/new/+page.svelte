<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { api, type Chain, type SupportedToken } from "$lib/services/api";

    let chains: Chain[] = [];
    let tokens: SupportedToken[] = [];
    let selectedChain: Chain | null = null;
    let selectedToken: SupportedToken | null = null;
    let amount = "";
    let description = "";
    let isLoading = false;
    let isLoadingChains = true;
    let error = "";

    async function loadChains() {
        isLoadingChains = true;
        const result = await api.listChains();
        if (result.data) {
            chains = result.data.chains.filter((c) => c.isActive);
        }
        isLoadingChains = false;
    }

    async function onChainSelect(e: Event) {
        const chainId = (e.target as HTMLSelectElement).value;
        selectedChain = chains.find((c) => c.caip2 === chainId) || null;
        selectedToken = null;

        if (selectedChain) {
            const result = await api.listTokens(selectedChain.id);
            if (result.data) {
                tokens = (result.data.tokens as SupportedToken[]).filter(
                    (t: SupportedToken) => t.chainId === selectedChain!.id,
                );
            }
        }
    }

    function onTokenSelect(e: Event) {
        const tokenId = (e.target as HTMLSelectElement).value;
        selectedToken = tokens.find((t) => t.id === tokenId) || null;
    }

    async function handleSubmit() {
        if (!selectedChain || !selectedToken || !amount) {
            error = "Please fill in all required fields";
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            error = "Please enter a valid amount";
            return;
        }

        isLoading = true;
        error = "";

        // Convert to smallest unit
        const amountInSmallestUnit = BigInt(
            Math.floor(numAmount * Math.pow(10, selectedToken.decimals)),
        ).toString();

        const result = await api.createPaymentRequest({
            chainId: selectedChain.caip2,
            tokenAddress: selectedToken.contractAddress,
            amount: amountInSmallestUnit,
            decimals: selectedToken.decimals,
            description: description || undefined,
        });

        if (result.error) {
            error = result.error;
            isLoading = false;
        } else if (result.data) {
            // Redirect to the pay page to show details
            goto(`/pay/${result.data.requestId}`);
        }
    }

    onMount(loadChains);
</script>

<svelte:head>
    <title>New Payment Request - Payment-Kita</title>
</svelte:head>

<div class="min-h-screen bg-gray-950 p-6">
    <div class="max-w-xl mx-auto">
        <div class="mb-8">
            <a
                href="/payment-requests"
                class="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4"
            >
                <svg
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Back to Payment Requests
            </a>
            <h1 class="text-2xl font-bold text-white">
                Create Payment Request
            </h1>
            <p class="text-gray-400 mt-1">
                Generate a payment link for your customers
            </p>
        </div>

        <div class="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <form on:submit|preventDefault={handleSubmit} class="space-y-6">
                {#if error}
                    <div
                        class="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm"
                    >
                        {error}
                    </div>
                {/if}

                <div>
                    <label
                        for="chain"
                        class="block text-sm font-medium text-gray-300 mb-2"
                    >
                        Blockchain Network
                    </label>
                    {#if isLoadingChains}
                        <div
                            class="h-10 bg-gray-800 rounded-lg animate-pulse"
                        ></div>
                    {:else}
                        <select
                            id="chain"
                            on:change={onChainSelect}
                            required
                            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                        >
                            <option value="">Select a chain</option>
                            {#each chains as chain}
                                <option value={chain.caip2}>{chain.name}</option
                                >
                            {/each}
                        </select>
                    {/if}
                </div>

                {#if selectedChain}
                    <div>
                        <label
                            for="token"
                            class="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Token
                        </label>
                        <select
                            id="token"
                            on:change={onTokenSelect}
                            required
                            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                        >
                            <option value="">Select a token</option>
                            {#each tokens as token}
                                <option value={token.id}
                                    >{token.symbol} - {token.name}</option
                                >
                            {/each}
                        </select>
                    </div>
                {/if}

                {#if selectedToken}
                    <div>
                        <label
                            for="amount"
                            class="block text-sm font-medium text-gray-300 mb-2"
                        >
                            Amount ({selectedToken.symbol})
                        </label>
                        <div class="relative">
                            <input
                                id="amount"
                                type="number"
                                step="any"
                                min="0"
                                bind:value={amount}
                                required
                                class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500 pr-16"
                                placeholder="0.00"
                            />
                            <span
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {selectedToken.symbol}
                            </span>
                        </div>
                    </div>
                {/if}

                <div>
                    <label
                        for="description"
                        class="block text-sm font-medium text-gray-300 mb-2"
                    >
                        Description <span class="text-gray-500">(optional)</span
                        >
                    </label>
                    <textarea
                        id="description"
                        bind:value={description}
                        rows="3"
                        class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500 resize-none"
                        placeholder="Invoice #123, Product name, etc."
                    ></textarea>
                </div>

                <div class="bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm">
                    <div class="flex justify-between text-gray-400">
                        <span>Expires in</span>
                        <span class="text-white">15 minutes</span>
                    </div>
                    <div class="flex justify-between text-gray-400">
                        <span>Payment link</span>
                        <span class="text-primary-400">Auto-generated</span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading ||
                        !selectedChain ||
                        !selectedToken ||
                        !amount}
                    class="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if isLoading}
                        <span class="flex items-center justify-center gap-2">
                            <svg
                                class="animate-spin h-4 w-4"
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
                            Creating Request...
                        </span>
                    {:else}
                        Create Payment Request
                    {/if}
                </button>
            </form>
        </div>
    </div>
</div>
