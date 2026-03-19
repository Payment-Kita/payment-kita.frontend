<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { api, type PaymentRequestResponse } from "$lib/services/api";
    import {
        sendTransaction,
        sendSolanaTransaction,
        getChainId,
        switchChain,
    } from "$lib/utils/web3";

    let requestId = "";
    let paymentRequest: PaymentRequestResponse | null = null;
    let isLoading = true;
    let error = "";
    let isCopied = false;
    let timeLeft = 0;
    let timerInterval: ReturnType<typeof setInterval>;

    $: requestId = $page.params.id;

    async function loadPaymentRequest() {
        if (!requestId) return;
        isLoading = true;
        const result = await api.getPaymentRequest(requestId);
        if (result.error) {
            error = result.error || "Failed to load payment request";
        } else if (result.data) {
            paymentRequest = result.data;
            startTimer();
        }
        isLoading = false;
    }

    function startTimer() {
        if (!paymentRequest) return;

        const expiresAt = new Date(paymentRequest.expiresAt).getTime();

        function updateTimer() {
            const now = Date.now();
            timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                error = "This payment request has expired";
            }
        }

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function formatTimeLeft(seconds: number) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    function formatAmount(amount: string, decimals: number) {
        const value = parseInt(amount) / Math.pow(10, decimals);
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        });
    }

    function getChainName(chainId: string) {
        const chainMap: Record<string, string> = {
            "eip155:1": "Ethereum",
            "eip155:137": "Polygon",
            "eip155:42161": "Arbitrum",
            "eip155:8453": "Base",
            "eip155:84532": "Base Sepolia",
            "solana:mainnet-beta": "Solana",
            "solana:devnet": "Solana Devnet",
        };
        return chainMap[chainId] || chainId;
    }

    function copyTxData() {
        if (!paymentRequest) return;
        const data =
            paymentRequest.txData.hex || paymentRequest.txData.base64 || "";
        navigator.clipboard.writeText(data);
        isCopied = true;
        setTimeout(() => (isCopied = false), 2000);
    }

    let isPaying = false;
    async function handlePay() {
        if (!paymentRequest) return;
        error = "";
        isPaying = true;

        try {
            if (paymentRequest.chainId.startsWith("eip155:")) {
                const chainId = parseInt(paymentRequest.chainId.split(":")[1]);
                const currentChainId = await getChainId();
                if (parseInt(currentChainId, 16) !== chainId) {
                    await switchChain(chainId);
                }

                if (paymentRequest.txData.hex) {
                    const txHash = await sendTransaction(
                        paymentRequest.contractAddress,
                        paymentRequest.txData.hex,
                    );
                    console.log("Payment sent:", txHash);
                    location.reload(); // Simple way to refresh status
                }
            } else if (paymentRequest.chainId.startsWith("solana:")) {
                if (
                    paymentRequest.txData.base64 &&
                    paymentRequest.txData.programId
                ) {
                    const signature = await sendSolanaTransaction(
                        paymentRequest.txData.programId,
                        paymentRequest.txData.base64,
                    );
                    console.log("Solana payment sent:", signature);
                    location.reload();
                }
            }
        } catch (e: any) {
            error = e.message || "Failed to process payment";
        } finally {
            isPaying = false;
        }
    }

    function copyContractAddress() {
        if (!paymentRequest) return;
        navigator.clipboard.writeText(paymentRequest.contractAddress);
    }

    onMount(() => {
        loadPaymentRequest();
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    });
</script>

<svelte:head>
    <title>Pay - Payment-Kita</title>
</svelte:head>

<div
    class="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-6"
>
    <div class="w-full max-w-md">
        {#if isLoading}
            <div class="flex flex-col items-center justify-center py-12">
                <svg
                    class="animate-spin h-10 w-10 text-primary-500 mb-4"
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
                <p class="text-gray-400">Loading payment details...</p>
            </div>
        {:else if error}
            <div
                class="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center"
            >
                <div
                    class="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4"
                >
                    <svg
                        class="w-8 h-8 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-white mb-2">
                    Payment Request Error
                </h2>
                <p class="text-gray-400">{error}</p>
            </div>
        {:else if paymentRequest}
            <div
                class="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
            >
                <!-- Header -->
                <div
                    class="bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-center"
                >
                    <div
                        class="flex items-center justify-center gap-2 text-white/80 text-sm mb-2"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Expires in {formatTimeLeft(timeLeft)}
                    </div>
                    <h1 class="text-3xl font-bold text-white">
                        {formatAmount(
                            paymentRequest.amount,
                            paymentRequest.decimals,
                        )}
                    </h1>
                    <p class="text-white/80 mt-1">
                        {getChainName(paymentRequest.chainId)}
                    </p>
                </div>

                <!-- Details -->
                <div class="p-6 space-y-4">
                    <div class="bg-gray-800/50 rounded-lg p-4">
                        <h3
                            class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2"
                        >
                            Contract Address
                        </h3>
                        <div class="flex items-center gap-2">
                            <code
                                class="text-primary-400 text-sm flex-1 truncate"
                                >{paymentRequest.contractAddress}</code
                            >
                            <button
                                on:click={copyContractAddress}
                                class="p-1.5 text-gray-400 hover:text-white transition-colors"
                            >
                                <svg
                                    class="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="bg-gray-800/50 rounded-lg p-4">
                        <h3
                            class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2"
                        >
                            Transaction Data ({paymentRequest.txData.hex
                                ? "Hex"
                                : "Base64"})
                        </h3>
                        <div class="relative">
                            <pre
                                class="text-xs text-gray-300 bg-gray-900 rounded p-3 overflow-x-auto max-h-32 font-mono">{paymentRequest
                                    .txData.hex ||
                                    paymentRequest.txData.base64}</pre>
                            <button
                                on:click={copyTxData}
                                class="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded transition-colors"
                            >
                                {isCopied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-gray-800/50 rounded-lg p-4">
                            <h3
                                class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1"
                            >
                                Chain ID
                            </h3>
                            <p class="text-white font-medium">
                                {paymentRequest.chainId}
                            </p>
                        </div>
                        <div class="bg-gray-800/50 rounded-lg p-4">
                            <h3
                                class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1"
                            >
                                Decimals
                            </h3>
                            <p class="text-white font-medium">
                                {paymentRequest.decimals}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Instructions -->
                <div class="border-t border-gray-800 p-6">
                    <h3 class="font-medium text-white mb-3">How to Pay</h3>
                    <ol class="space-y-3 text-sm text-gray-400">
                        <li class="flex gap-3">
                            <span
                                class="flex-shrink-0 w-6 h-6 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center text-xs font-medium"
                                >1</span
                            >
                            <span
                                >Connect your wallet to <strong
                                    class="text-white"
                                    >{getChainName(
                                        paymentRequest.chainId,
                                    )}</strong
                                ></span
                            >
                        </li>
                        <li class="flex gap-3">
                            <span
                                class="flex-shrink-0 w-6 h-6 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center text-xs font-medium"
                                >2</span
                            >
                            <span>Click the "Pay Now" button below </span>
                        </li>
                    </ol>

                    <button
                        on:click={handlePay}
                        disabled={isPaying || timeLeft <= 0}
                        class="w-full mt-6 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-primary-500/20"
                    >
                        {isPaying ? "Processing..." : "Pay Now"}
                    </button>
                </div>

                <!-- Footer -->
                <div class="border-t border-gray-800 p-4 text-center">
                    <p class="text-xs text-gray-500">Powered by Payment-Kita</p>
                </div>
            </div>
        {/if}
    </div>
</div>
