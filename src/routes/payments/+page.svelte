<script lang="ts">
  import { onMount } from 'svelte';
  import { api, type Payment } from '$lib/services/api';

  let payments: Payment[] = [];
  let isLoading = true;
  let page = 1;
  let totalPages = 1;

  async function loadPayments() {
    isLoading = true;
    try {
      const result = await api.listPayments(page, 10);
      if (result.data) {
        payments = result.data.payments || [];
        totalPages = result.data.pagination?.totalPages || 1;
      }
    } catch (e) {
      console.error('Failed to load payments:', e);
    } finally {
      isLoading = false;
    }
  }

  onMount(loadPayments);

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'processing': return 'bg-blue-500/20 text-blue-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'refunded': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }
</script>

<svelte:head>
  <title>Payments - Payment-Kita</title>
</svelte:head>

<div class="bg-gray-950 min-h-screen">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Payments</h1>
        <p class="text-gray-400 mt-1">View and manage your payments</p>
      </div>
      <a href="/payments/new" class="btn-primary">
        + New Payment
      </a>
    </div>

    <!-- Filters -->
    <div class="card bg-gray-900 border-gray-800 mb-6">
      <div class="flex flex-wrap gap-4">
        <select class="input bg-gray-800 border-gray-700 text-white w-auto">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select class="input bg-gray-800 border-gray-700 text-white w-auto">
          <option value="">All Chains</option>
          <option value="eip155:84532">Base Sepolia</option>
          <option value="eip155:97">BSC Sepolia</option>
        </select>
        <input
          type="text"
          placeholder="Search by ID..."
          class="input bg-gray-800 border-gray-700 text-white w-auto"
        />
      </div>
    </div>

    <!-- Payments Table -->
    <div class="card bg-gray-900 border-gray-800">
      {#if isLoading}
        <div class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      {:else if payments.length === 0}
        <div class="text-center py-12">
          <div class="text-4xl mb-4">💳</div>
          <h3 class="text-lg font-medium text-white mb-2">No payments yet</h3>
          <p class="text-gray-400 mb-6">Create your first cross-chain payment</p>
          <a href="/payments/new" class="btn-primary">Create Payment</a>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-sm text-gray-400 border-b border-gray-800">
                <th class="py-3 pr-4">Payment ID</th>
                <th class="py-3 pr-4">Amount</th>
                <th class="py-3 pr-4">Route</th>
                <th class="py-3 pr-4">Bridge</th>
                <th class="py-3 pr-4">Status</th>
                <th class="py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {#each payments as payment}
                <tr class="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                  <td class="py-4 pr-4">
                    <a href="/payments/{payment.paymentId}" class="text-primary-400 hover:text-primary-300 font-mono text-sm">
                      {payment.paymentId.slice(0, 8)}...
                    </a>
                  </td>
                  <td class="py-4 pr-4">
                    <span class="text-white font-medium">{payment.sourceAmount}</span>
                    <span class="text-gray-500 text-sm ml-1">USDT</span>
                  </td>
                  <td class="py-4 pr-4">
                    <div class="flex items-center gap-2 text-sm">
                      <span class="text-gray-400">{payment.sourceChainId}</span>
                      <span class="text-gray-600">→</span>
                      <span class="text-gray-400">{payment.destChainId}</span>
                    </div>
                  </td>
                  <td class="py-4 pr-4">
                    <span class="text-gray-400 text-sm">{payment.bridgeType}</span>
                  </td>
                  <td class="py-4 pr-4">
                    <span class="px-2 py-1 text-xs rounded-full {getStatusColor(payment.status)}">
                      {payment.status}
                    </span>
                  </td>
                  <td class="py-4 text-gray-400 text-sm">
                    {payment.createdAt}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <p class="text-sm text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div class="flex gap-2">
            <button
              class="btn-secondary text-sm"
              disabled={page <= 1}
              on:click={() => { page--; loadPayments(); }}
            >
              Previous
            </button>
            <button
              class="btn-secondary text-sm"
              disabled={page >= totalPages}
              on:click={() => { page++; loadPayments(); }}
            >
              Next
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
