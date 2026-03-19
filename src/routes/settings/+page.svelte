<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Button from "$lib/components/atoms/Button.svelte";
  import Input from "$lib/components/atoms/Input.svelte";
  import Icon from "$lib/components/atoms/Icon.svelte";
  import { authStore, isAuthenticated } from "$lib/stores/auth";
  import { walletStore } from "$lib/stores/wallet";

  let user = $authStore.user;
  let saving = false;
  let message = "";

  // Form fields
  let name = user?.name || "";
  let email = user?.email || "";

  onMount(() => {
    // Authentication is handled by hooks.server.ts
  });

  async function handleSave() {
    saving = true;
    message = "";

    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message = "Settings saved successfully";
    } catch (error) {
      message = "Failed to save settings";
    } finally {
      saving = false;
    }
  }

  async function handleLogout() {
    walletStore.clear();
    // The actual auth clearing happens via /logout form action
  }
</script>

<svelte:head>
  <title>Settings | Payment-Kita</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold text-white mb-8">Settings</h1>

  <!-- Profile Section -->
  <div class="p-6 rounded-xl border border-gray-800 bg-gray-900/50 mb-6">
    <h2 class="text-lg font-semibold text-white mb-4">Profile</h2>

    <div class="space-y-4">
      <Input label="Full Name" bind:value={name} placeholder="Your name" />

      <Input
        type="email"
        label="Email Address"
        bind:value={email}
        placeholder="you@example.com"
        disabled
      />

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2"
          >Account Status</label
        >
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
          <span class="text-white">{user?.kycStatus || "Verified"}</span>
        </div>
      </div>
    </div>

    {#if message}
      <div
        class="mt-4 p-3 rounded-lg {message.includes('success')
          ? 'bg-green-500/10 text-green-400'
          : 'bg-red-500/10 text-red-400'}"
      >
        {message}
      </div>
    {/if}

    <div class="mt-6">
      <Button variant="primary" on:click={handleSave} loading={saving}>
        Save Changes
      </Button>
    </div>
  </div>

  <!-- Security Section -->
  <div class="p-6 rounded-xl border border-gray-800 bg-gray-900/50 mb-6">
    <h2 class="text-lg font-semibold text-white mb-4">Security</h2>

    <div class="space-y-4">
      <div
        class="flex items-center justify-between py-3 border-b border-gray-800"
      >
        <div>
          <p class="text-white font-medium">Change Password</p>
          <p class="text-gray-500 text-sm">Update your account password</p>
        </div>
        <Button variant="ghost" size="sm">
          <Icon name="chevron-right" size={18} />
        </Button>
      </div>

      <div
        class="flex items-center justify-between py-3 border-b border-gray-800"
      >
        <div>
          <p class="text-white font-medium">Two-Factor Authentication</p>
          <p class="text-gray-500 text-sm">Add an extra layer of security</p>
        </div>
        <Button variant="ghost" size="sm">
          <Icon name="chevron-right" size={18} />
        </Button>
      </div>

      <div class="flex items-center justify-between py-3">
        <div>
          <p class="text-white font-medium">Active Sessions</p>
          <p class="text-gray-500 text-sm">Manage your active sessions</p>
        </div>
        <Button variant="ghost" size="sm">
          <Icon name="chevron-right" size={18} />
        </Button>
      </div>
    </div>
  </div>

  <!-- Notifications Section -->
  <div class="p-6 rounded-xl border border-gray-800 bg-gray-900/50 mb-6">
    <h2 class="text-lg font-semibold text-white mb-4">Notifications</h2>

    <div class="space-y-4">
      <label class="flex items-center justify-between cursor-pointer">
        <div>
          <p class="text-white">Email Notifications</p>
          <p class="text-gray-500 text-sm">Receive payment updates via email</p>
        </div>
        <input
          type="checkbox"
          checked
          class="w-5 h-5 rounded bg-gray-800 border-gray-700 text-primary-500 focus:ring-primary-500"
        />
      </label>

      <label class="flex items-center justify-between cursor-pointer">
        <div>
          <p class="text-white">Transaction Alerts</p>
          <p class="text-gray-500 text-sm">
            Get notified when payments complete
          </p>
        </div>
        <input
          type="checkbox"
          checked
          class="w-5 h-5 rounded bg-gray-800 border-gray-700 text-primary-500 focus:ring-primary-500"
        />
      </label>
    </div>
  </div>

  <!-- Danger Zone -->
  <div class="p-6 rounded-xl border border-red-900/50 bg-red-900/10">
    <h2 class="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>

    <div class="flex items-center justify-between">
      <div>
        <p class="text-white font-medium">Sign Out</p>
        <p class="text-gray-500 text-sm">Sign out from your account</p>
      </div>
      <form action="/logout" method="POST" on:submit={handleLogout}>
        <Button type="submit" variant="danger">Sign Out</Button>
      </form>
    </div>
  </div>
</div>
