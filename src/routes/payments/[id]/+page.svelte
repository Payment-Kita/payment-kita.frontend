<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import Button from "$lib/components/atoms/Button.svelte";
  import Badge from "$lib/components/atoms/Badge.svelte";
  import Icon from "$lib/components/atoms/Icon.svelte";
  import { authStore, isAuthenticated } from "$lib/stores/auth";
  import { api } from "$lib/services/api";
  import {
    formatDateTime,
    formatCurrency,
    shortenAddress,
    copyToClipboard,
  } from "$lib/utils/format";
  import type { Payment, PaymentEvent } from "$lib/services/api";

  let loading = true;
  let payment: Payment | null = null;
  let events: PaymentEvent[] = [];
  let copied = false;

  $: paymentId = $page.params.id;

  const statusVariant: Record<
    string,
    "default" | "success" | "warning" | "error" | "info"
  > = {
    pending: "warning",
    processing: "info",
    completed: "success",
    failed: "error",
    refunded: "default",
  };

  onMount(async () => {
    await loadPayment();
  });

  async function loadPayment() {
    loading = true;
    try {
      api.setAccessToken($authStore.accessToken);

      const [paymentRes, eventsRes] = await Promise.all([
        api.getPayment(paymentId),
        api.getPaymentEvents(paymentId),
      ]);

      if (paymentRes.data) {
        payment = paymentRes.data.payment;
      }
      if (eventsRes.data) {
        events = eventsRes.data.events || [];
      }
    } catch (error) {
      console.error("Failed to load payment:", error);
    } finally {
      loading = false;
    }
  }

  async function handleCopy(text: string) {
    await copyToClipboard(text);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<svelte:head>
  <title>Payment Details | Payment-Kita</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
  <!-- Back Button -->
  <a
    href="/payments"
    class="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
  >
    <Icon name="chevron-left" size={20} />
    Back to Payments
  </a>

  {#if loading}
    <div class="space-y-6">
      <div class="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
      <div class="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
        <div class="space-y-4">
          {#each [1, 2, 3, 4] as _}
            <div class="h-6 w-full bg-gray-800 rounded animate-pulse"></div>
          {/each}
        </div>
      </div>
    </div>
  {:else if payment}
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Payment Details</h1>
        <p class="text-gray-500 font-mono text-sm mt-1">{payment.paymentId}</p>
      </div>
      <Badge variant={statusVariant[payment.status]} size="md">
        {payment.status.toUpperCase()}
      </Badge>
    </div>

    <!-- Payment Info -->
    <div class="p-6 rounded-xl border border-gray-800 bg-gray-900/50 mb-6">
      <h2 class="text-lg font-semibold text-white mb-4">Transfer Details</h2>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- From -->
        <div class="space-y-3">
          <p class="text-gray-400 text-sm font-medium">From</p>
          <div class="p-4 rounded-lg bg-gray-800">
            <p class="text-white font-medium">{payment.sourceChainId}</p>
            <p class="text-2xl font-bold text-white mt-2">
              {payment.sourceAmount}
              <span class="text-gray-400 text-base">USDT</span>
            </p>
          </div>
        </div>

        <!-- To -->
        <div class="space-y-3">
          <p class="text-gray-400 text-sm font-medium">To</p>
          <div class="p-4 rounded-lg bg-gray-800">
            <p class="text-white font-medium">{payment.destChainId}</p>
            <p class="text-2xl font-bold text-primary-400 mt-2">
              {payment.destAmount}
              <span class="text-gray-400 text-base">USDT</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-800">
        <div>
          <p class="text-gray-500 text-sm">Fee</p>
          <p class="text-white">{payment.feeAmount} USDT</p>
        </div>
        <div>
          <p class="text-gray-500 text-sm">Bridge</p>
          <p class="text-white">{payment.bridgeType || "Direct"}</p>
        </div>
        <div>
          <p class="text-gray-500 text-sm">Receiver</p>
          <button
            on:click={() => handleCopy(payment.receiverAddress)}
            class="flex items-center gap-2 text-white font-mono text-sm hover:text-primary-400"
          >
            {shortenAddress(payment.receiverAddress)}
            <Icon name={copied ? "check" : "copy"} size={14} />
          </button>
        </div>
        <div>
          <p class="text-gray-500 text-sm">Created</p>
          <p class="text-white">{formatDateTime(payment.createdAt)}</p>
        </div>
      </div>

      <!-- Transaction Hashes -->
      {#if payment.sourceTxHash || payment.destTxHash}
        <div class="mt-6 pt-6 border-t border-gray-800 space-y-3">
          {#if payment.sourceTxHash}
            <div class="flex items-center justify-between">
              <p class="text-gray-500 text-sm">Source Transaction</p>
              <a
                href="#"
                class="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-mono text-sm"
              >
                {shortenAddress(payment.sourceTxHash)}
                <Icon name="external-link" size={14} />
              </a>
            </div>
          {/if}
          {#if payment.destTxHash}
            <div class="flex items-center justify-between">
              <p class="text-gray-500 text-sm">Destination Transaction</p>
              <a
                href="#"
                class="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-mono text-sm"
              >
                {shortenAddress(payment.destTxHash)}
                <Icon name="external-link" size={14} />
              </a>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Event Timeline -->
    <div class="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
      <h2 class="text-lg font-semibold text-white mb-4">Event Timeline</h2>

      {#if events.length === 0}
        <p class="text-gray-500">No events recorded yet</p>
      {:else}
        <div class="space-y-4">
          {#each events as event, idx}
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-3 h-3 rounded-full bg-primary-500"></div>
                {#if idx < events.length - 1}
                  <div class="w-0.5 h-full bg-gray-700 mt-1"></div>
                {/if}
              </div>
              <div class="flex-1 pb-4">
                <div class="flex items-center justify-between">
                  <p class="text-white font-medium">{event.eventType}</p>
                  <p class="text-gray-500 text-sm">
                    {formatDateTime(event.createdAt)}
                  </p>
                </div>
                {#if event.txHash}
                  <p class="text-gray-400 font-mono text-sm mt-1">
                    {shortenAddress(event.txHash)}
                  </p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-gray-500">Payment not found</p>
      <Button variant="primary" on:click={() => goto("/payments")}>
        Back to Payments
      </Button>
    </div>
  {/if}
</div>
