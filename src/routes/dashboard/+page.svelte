<script lang="ts">
  import { onMount } from "svelte";
  import Button from "$lib/components/atoms/Button.svelte";
  import Icon from "$lib/components/atoms/Icon.svelte";
  import TransactionList from "$lib/components/organisms/TransactionList.svelte";
  import { authStore, isAuthenticated } from "$lib/stores/auth";
  import { paymentStore } from "$lib/stores/payment";
  import { walletStore, primaryWallet } from "$lib/stores/wallet";
  import { api } from "$lib/services/api";
  import { formatCurrency, shortenAddress } from "$lib/utils/format";
  import type { Payment } from "$lib/services/api";
  import { goto } from "$app/navigation";

  let loading = true;
  let payments: Payment[] = [];
  let stats = {
    totalPayments: 0,
    totalVolume: 0,
    activeWallets: 0,
    pendingPayments: 0,
  };

  $: user = $authStore.user;
  $: wallet = $primaryWallet;

  onMount(async () => {
    await loadDashboardData();
  });

  async function loadDashboardData() {
    loading = true;

    try {
      api.setAccessToken($authStore.accessToken);

      const [paymentsRes, walletsRes] = await Promise.all([
        api.listPayments(1, 5),
        api.listWallets(),
      ]);

      if (paymentsRes.data) {
        payments = paymentsRes.data.payments || [];
        paymentStore.setPayments(payments, paymentsRes.data.pagination);

        // Calculate stats
        stats.totalPayments =
          paymentsRes.data.pagination?.total || payments.length;
        stats.totalVolume = payments.reduce(
          (sum, p) => sum + parseFloat(p.sourceAmount || "0"),
          0,
        );
        stats.pendingPayments = payments.filter(
          (p) => p.status === "pending" || p.status === "processing",
        ).length;
      }

      if (walletsRes.data) {
        stats.activeWallets = walletsRes.data.wallets?.length || 0;
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Dashboard | Payment-Kita</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-8 lg:py-12">
  <!-- Header -->
  <div
    class="flex flex-col md:flex-row md:items-center md:justify-between mb-10"
  >
    <div>
      <h1 class="text-3xl font-bold text-white">
        Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
      </h1>
      <p class="text-white/50 mt-2">
        Here's what's happening with your payments
      </p>
    </div>
    <div class="flex items-center gap-3 mt-6 md:mt-0">
      {#if wallet}
        <div
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10"
        >
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="text-white/70 font-mono text-sm"
            >{shortenAddress(wallet.address)}</span
          >
        </div>
      {/if}
      <Button variant="primary" on:click={() => goto("/payments/new")}>
        <Icon name="plus" size={18} />
        New Payment
      </Button>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
    <div class="card card-hover">
      <p class="text-white/40 text-sm mb-2">Total Payments</p>
      <p class="text-3xl font-bold text-white">{stats.totalPayments}</p>
    </div>
    <div class="card card-hover">
      <p class="text-white/40 text-sm mb-2">Total Volume</p>
      <p class="text-3xl font-bold text-white">
        {formatCurrency(stats.totalVolume)}
      </p>
    </div>
    <div class="card card-hover">
      <p class="text-white/40 text-sm mb-2">Connected Wallets</p>
      <p class="text-3xl font-bold text-white">{stats.activeWallets}</p>
    </div>
    <div class="card card-hover">
      <p class="text-white/40 text-sm mb-2">Pending</p>
      <p class="text-3xl font-bold text-amber-400">{stats.pendingPayments}</p>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="mb-10">
    <h2 class="text-lg font-semibold text-white mb-4">Quick Actions</h2>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <a href="/payments/new" class="card card-hover group">
        <div
          class="w-12 h-12 rounded-xl bg-ink-500/20 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        >
          <Icon name="plus" size={24} className="text-ink-400" />
        </div>
        <p class="text-white font-medium mb-1">Create Payment</p>
        <p class="text-white/40 text-sm">Send cross-chain</p>
      </a>
      <a href="/wallets" class="card card-hover group">
        <div
          class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        >
          <Icon name="wallet" size={24} className="text-blue-400" />
        </div>
        <p class="text-white font-medium mb-1">Manage Wallets</p>
        <p class="text-white/40 text-sm">Connect & view</p>
      </a>
      <a href="/payments" class="card card-hover group">
        <div
          class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        >
          <Icon name="refresh" size={24} className="text-emerald-400" />
        </div>
        <p class="text-white font-medium mb-1">Transaction History</p>
        <p class="text-white/40 text-sm">View all payments</p>
      </a>
      <a href="/settings" class="card card-hover group">
        <div
          class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        >
          <Icon name="external-link" size={24} className="text-purple-400" />
        </div>
        <p class="text-white font-medium mb-1">Settings</p>
        <p class="text-white/40 text-sm">Account & preferences</p>
      </a>
    </div>
  </div>

  <!-- Recent Transactions -->
  <div class="card">
    <TransactionList {payments} {loading} title="Recent Transactions" />
  </div>
</div>
