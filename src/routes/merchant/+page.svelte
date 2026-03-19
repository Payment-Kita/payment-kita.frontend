<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Button from "$lib/components/atoms/Button.svelte";
  import Input from "$lib/components/atoms/Input.svelte";
  import Badge from "$lib/components/atoms/Badge.svelte";
  import { authStore, isAuthenticated } from "$lib/stores/auth";
  import { api } from "$lib/services/api";
  import type { MerchantStatus } from "$lib/services/api";

  let loading = true;
  let submitting = false;
  let merchantStatus: MerchantStatus | null = null;
  let error = "";
  let success = "";

  // Form fields
  let businessName = "";
  let businessEmail = "";
  let merchantType = "retail";
  let taxId = "";
  let businessAddress = "";

  const merchantTypes = [
    { value: "retail", label: "Retail" },
    { value: "umkm", label: "UMKM (Small Business)" },
    { value: "corporate", label: "Corporate" },
    { value: "partner", label: "Partner" },
  ];

  const statusVariant: Record<
    string,
    "default" | "success" | "warning" | "error" | "info"
  > = {
    pending: "warning",
    active: "success",
    suspended: "error",
    rejected: "error",
    not_applied: "default",
  };

  onMount(async () => {
    await loadStatus();
  });

  async function loadStatus() {
    loading = true;
    try {
      api.setAccessToken($authStore.accessToken);
      const res = await api.getMerchantStatus();
      if (res.data) {
        merchantStatus = res.data;
      }
    } catch (err) {
      console.error("Failed to load merchant status:", err);
    } finally {
      loading = false;
    }
  }

  async function handleApply() {
    if (!businessName || !businessEmail) {
      error = "Please fill in all required fields";
      return;
    }

    submitting = true;
    error = "";
    success = "";

    try {
      api.setAccessToken($authStore.accessToken);

      const res = await api.applyMerchant({
        businessName,
        businessEmail,
        merchantType,
        taxId: taxId || undefined,
        businessAddress: businessAddress || undefined,
      });

      if (res.error) {
        error = res.error;
      } else if (res.data) {
        success = res.data.message || "Application submitted successfully";
        merchantStatus = res.data;
      }
    } catch (err: any) {
      error = err.message || "Failed to submit application";
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Become a Merchant | Payment-Kita</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold text-white mb-2">Become a Merchant</h1>
  <p class="text-gray-400 mb-8">
    Accept cross-chain payments for your business
  </p>

  {#if loading}
    <div class="space-y-4">
      {#each [1, 2, 3] as _}
        <div class="h-12 bg-gray-800 rounded animate-pulse"></div>
      {/each}
    </div>
  {:else if merchantStatus && merchantStatus.status !== "not_applied"}
    <!-- Existing Application Status -->
    <div class="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-lg font-semibold text-white">Application Status</h2>
          <p class="text-gray-400 text-sm mt-1">{merchantStatus.message}</p>
        </div>
        <Badge variant={statusVariant[merchantStatus.status]} size="md">
          {merchantStatus.status.toUpperCase()}
        </Badge>
      </div>

      {#if merchantStatus.businessName}
        <div class="space-y-4 pt-4 border-t border-gray-800">
          <div>
            <p class="text-gray-500 text-sm">Business Name</p>
            <p class="text-white">{merchantStatus.businessName}</p>
          </div>
          {#if merchantStatus.merchantType}
            <div>
              <p class="text-gray-500 text-sm">Merchant Type</p>
              <p class="text-white capitalize">{merchantStatus.merchantType}</p>
            </div>
          {/if}
        </div>
      {/if}

      {#if merchantStatus.status === "active"}
        <div
          class="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20"
        >
          <p class="text-green-400">
            🎉 Congratulations! Your merchant account is active. You can now
            accept payments.
          </p>
        </div>
      {:else if merchantStatus.status === "pending"}
        <div
          class="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
        >
          <p class="text-yellow-400">
            ⏳ Your application is being reviewed. This usually takes 1-3
            business days.
          </p>
        </div>
      {:else if merchantStatus.status === "rejected"}
        <div class="mt-6">
          <p class="text-gray-400 mb-4">
            Your application was rejected. Please contact support for more
            information.
          </p>
          <Button variant="secondary">Contact Support</Button>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Application Form -->
    <div class="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
      <h2 class="text-lg font-semibold text-white mb-6">Application Form</h2>

      <form on:submit|preventDefault={handleApply} class="space-y-6">
        <Input
          label="Business Name"
          bind:value={businessName}
          placeholder="Your business name"
          required
        />

        <Input
          type="email"
          label="Business Email"
          bind:value={businessEmail}
          placeholder="business@example.com"
          required
        />

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Merchant Type <span class="text-red-400">*</span>
          </label>
          <select
            bind:value={merchantType}
            class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-gray-800 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {#each merchantTypes as type}
              <option value={type.value}>{type.label}</option>
            {/each}
          </select>
        </div>

        <Input
          label="Tax ID (Optional)"
          bind:value={taxId}
          placeholder="Tax identification number"
        />

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Business Address (Optional)
          </label>
          <textarea
            bind:value={businessAddress}
            placeholder="Enter your business address"
            rows="3"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          ></textarea>
        </div>

        {#if error}
          <div
            class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </div>
        {/if}

        {#if success}
          <div
            class="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
          >
            {success}
          </div>
        {/if}

        <Button type="submit" variant="primary" fullWidth loading={submitting}>
          Submit Application
        </Button>
      </form>
    </div>

    <!-- Benefits -->
    <div class="mt-8 grid md:grid-cols-3 gap-4">
      <div class="p-4 rounded-lg border border-gray-800 bg-gray-900/50">
        <div class="text-2xl mb-2">💰</div>
        <h3 class="text-white font-medium">Lower Fees</h3>
        <p class="text-gray-500 text-sm">
          Get discounted transaction fees as a verified merchant
        </p>
      </div>
      <div class="p-4 rounded-lg border border-gray-800 bg-gray-900/50">
        <div class="text-2xl mb-2">🌐</div>
        <h3 class="text-white font-medium">Multi-Chain</h3>
        <p class="text-gray-500 text-sm">
          Accept payments from any supported blockchain
        </p>
      </div>
      <div class="p-4 rounded-lg border border-gray-800 bg-gray-900/50">
        <div class="text-2xl mb-2">📊</div>
        <h3 class="text-white font-medium">Analytics</h3>
        <p class="text-gray-500 text-sm">
          Access detailed transaction analytics and reports
        </p>
      </div>
    </div>
  {/if}
</div>
