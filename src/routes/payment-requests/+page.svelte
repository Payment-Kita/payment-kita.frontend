<script lang="ts">
  import { onMount } from 'svelte';
  import { api, type PaymentRequest } from '$lib/services/api';

  let paymentRequests: PaymentRequest[] = [];
  let isLoading = true;
  let error = '';
  let page = 1;
  let totalPages = 1;

  async function loadPaymentRequests() {
    isLoading = true;
    const result = await api.listPaymentRequests(page, 10);
    if (result.error) {
      error = result.error;
    } else if (result.data) {
      paymentRequests = result.data.paymentRequests || [];
      totalPages = result.data.pagination?.totalPages || 1;
    }
    isLoading = false;
  }

  async function cancelRequest(id: string) {
    if (!confirm('Are you sure you want to cancel this payment request?')) return;
    const result = await api.cancelPaymentRequest(id);
    if (result.error) {
      alert(result.error);
    } else {
      loadPaymentRequests();
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  function formatAmount(amount: string, decimals: number) {
    const value = parseInt(amount) / Math.pow(10, decimals);
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'expired': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  }

  function copyPayLink(id: string) {
    const url = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(url);
    alert('Payment link copied to clipboard!');
  }

  onMount(loadPaymentRequests);
</script>

<svelte:head>
  <title>Payment Requests - Payment-Kita</title>
</svelte:head>

<div class="min-h-screen bg-gray-950 p-6">
  <div class="max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Payment Requests</h1>
        <p class="text-gray-400 mt-1">Manage your payment requests and generate pay links</p>
      </div>
      <a href="/payment-requests/new" class="btn-primary px-4 py-2 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Request
      </a>
    </div>

    {#if error}
      <div class="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 mb-6">
        {error}
      </div>
    {/if}

    {#if isLoading}
      <div class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    {:else if paymentRequests.length === 0}
      <div class="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
        <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-lg font-medium text-white mb-2">No payment requests yet</h3>
        <p class="text-gray-400 mb-4">Create your first payment request to get started</p>
        <a href="/payment-requests/new" class="btn-primary px-4 py-2 inline-block">
          Create Payment Request
        </a>
      </div>
    {:else}
      <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="text-left p-4 text-gray-400 font-medium">Amount</th>
              <th class="text-left p-4 text-gray-400 font-medium">Chain</th>
              <th class="text-left p-4 text-gray-400 font-medium">Description</th>
              <th class="text-left p-4 text-gray-400 font-medium">Status</th>
              <th class="text-left p-4 text-gray-400 font-medium">Expires</th>
              <th class="text-right p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each paymentRequests as request}
              <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td class="p-4">
                  <span class="text-white font-medium">{formatAmount(request.amount, request.decimals)}</span>
                </td>
                <td class="p-4">
                  <span class="text-gray-300">{request.chainId}</span>
                </td>
                <td class="p-4">
                  <span class="text-gray-400">{request.description || '-'}</span>
                </td>
                <td class="p-4">
                  <span class="px-2 py-1 text-xs font-medium rounded border {getStatusBadge(request.status)}">
                    {request.status}
                  </span>
                </td>
                <td class="p-4">
                  <span class="text-gray-400 text-sm">{formatDate(request.expiresAt)}</span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    {#if request.status === 'pending'}
                      <button on:click={() => copyPayLink(request.id)} class="p-2 text-gray-400 hover:text-white transition-colors" title="Copy pay link">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <a href="/pay/{request.id}" target="_blank" class="p-2 text-gray-400 hover:text-white transition-colors" title="View pay page">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <button on:click={() => cancelRequest(request.id)} class="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Cancel">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if totalPages > 1}
        <div class="flex justify-center gap-2 mt-6">
          <button 
            on:click={() => { page--; loadPaymentRequests(); }} 
            disabled={page <= 1}
            class="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span class="px-4 py-2 text-gray-400">Page {page} of {totalPages}</span>
          <button 
            on:click={() => { page++; loadPaymentRequests(); }} 
            disabled={page >= totalPages}
            class="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>
