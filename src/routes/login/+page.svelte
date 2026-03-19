<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  export let form: ActionData;
  let isLoading = false;
</script>

<svelte:head>
  <title>Login - Payment-Kita</title>
</svelte:head>

<div
  class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
>
  <!-- Background decoration -->
  <div
    class="absolute top-1/4 left-1/3 w-64 h-64 bg-ink-600/10 rounded-full blur-3xl"
  ></div>
  <div
    class="absolute bottom-1/4 right-1/3 w-48 h-48 bg-ink-500/10 rounded-full blur-3xl"
  ></div>

  <div class="relative w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white">Welcome back</h1>
      <p class="text-white/50 mt-3">Sign in to your account</p>
    </div>

    <div class="card">
      <form
        method="POST"
        use:enhance={() => {
          isLoading = true;
          return async ({ update }) => {
            isLoading = false;
            update();
          };
        }}
        class="space-y-6"
      >
        {#if form?.error}
          <div
            class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm"
          >
            {form.error}
          </div>
        {/if}

        <div>
          <label for="email" class="label"> Email </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form?.email ?? ""}
            required
            class="input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="label"> Password </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            class="input"
            placeholder="••••••••"
          />
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-ink-500 focus:ring-ink-500 focus:ring-offset-0"
            />
            <span class="text-sm text-white/50">Remember me</span>
          </label>
          <a
            href="/forgot-password"
            class="text-sm text-ink-400 hover:text-ink-300 transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          class="btn-primary w-full py-3"
        >
          {#if isLoading}
            <span class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
              Signing in...
            </span>
          {:else}
            Sign in
          {/if}
        </button>
      </form>

      <div class="divider"></div>

      <div class="text-center">
        <p class="text-sm text-white/50">
          Don't have an account?
          <a
            href="/register"
            class="text-ink-400 hover:text-ink-300 font-medium transition-colors"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
