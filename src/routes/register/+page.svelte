<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  export let form: ActionData;
  let step = 1; // 1: Account info, 2: Connect wallet
  let name = "";
  let email = "";
  let password = "";
  let confirmPassword = "";
  let error = "";
  let success = "";
  let isLoading = false;

  // Wallet state
  let walletAddress = "";
  let walletChainId = "";
  let walletSignature = "";
  let isConnectingWallet = false;

  $: if (form?.success) {
    success =
      "Registration successful! Please check your email for verification.";
    step = 1;
    name = "";
    email = "";
    password = "";
    confirmPassword = "";
    walletAddress = "";
    walletSignature = "";
  }

  $: if (form?.error) {
    error = form.error;
  }

  async function handleAccountSubmit() {
    error = "";

    if (password !== confirmPassword) {
      error = "Passwords do not match";
      return;
    }

    if (password.length < 8) {
      error = "Password must be at least 8 characters";
      return;
    }

    // Proceed to wallet connection step
    step = 2;
  }

  async function connectWallet() {
    error = "";
    isConnectingWallet = true;

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        error = "Please install MetaMask to continue";
        isConnectingWallet = false;
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      walletAddress = accounts[0];

      // Get chain ID
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      walletChainId = `eip155:${parseInt(chainId, 16)}`;

      // Create message to sign
      const message = `Sign this message to verify your wallet for Payment-Kita registration.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;

      // Request signature
      walletSignature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });
    } catch (e: any) {
      if (e.code === 4001) {
        error = "Wallet connection cancelled";
      } else {
        error = e.message || "Failed to connect wallet";
      }
    } finally {
      isConnectingWallet = false;
    }
  }

  function goBack() {
    step = 1;
    error = "";
  }

  function truncateAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
</script>

<svelte:head>
  <title>Register - Payment-Kita</title>
</svelte:head>

<div
  class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
>
  <!-- Background decoration -->
  <div
    class="absolute top-1/3 left-1/4 w-72 h-72 bg-ink-600/10 rounded-full blur-3xl"
  ></div>
  <div
    class="absolute bottom-1/3 right-1/4 w-56 h-56 bg-ink-500/10 rounded-full blur-3xl"
  ></div>

  <div class="relative w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white">Create your account</h1>
      <p class="text-white/50 mt-3">Start accepting cross-chain payments</p>

      <!-- Step indicator -->
      <div class="flex items-center justify-center gap-4 mt-8">
        <div class="flex items-center gap-2">
          <div
            class="w-9 h-9 rounded-full {step >= 1
              ? 'bg-ink-500'
              : 'bg-white/10'} flex items-center justify-center text-white text-sm font-semibold transition-colors"
          >
            1
          </div>
          <span
            class="text-sm font-medium {step >= 1
              ? 'text-white'
              : 'text-white/40'}">Account</span
          >
        </div>
        <div
          class="w-10 h-0.5 {step >= 2
            ? 'bg-ink-500'
            : 'bg-white/10'} transition-colors"
        ></div>
        <div class="flex items-center gap-2">
          <div
            class="w-9 h-9 rounded-full {step >= 2
              ? 'bg-ink-500'
              : 'bg-white/10'} flex items-center justify-center text-white text-sm font-semibold transition-colors"
          >
            2
          </div>
          <span
            class="text-sm font-medium {step >= 2
              ? 'text-white'
              : 'text-white/40'}">Wallet</span
          >
        </div>
      </div>
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
        {#if error}
          <div
            class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6"
          >
            {error}
          </div>
        {/if}

        {#if success}
          <div
            class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-400 text-sm mb-6"
          >
            {success}
            <a
              href="/login"
              class="block mt-2 text-emerald-300 hover:underline font-medium"
              >Go to login →</a
            >
          </div>
        {:else if step === 1}
          <!-- Step 1: Account Information -->
          <div class="space-y-5">
            <div>
              <label for="name" class="label">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                bind:value={name}
                required
                class="input"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label for="email" class="label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                bind:value={email}
                required
                class="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label for="password" class="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                bind:value={password}
                required
                minlength="8"
                class="input"
                placeholder="••••••••"
              />
              <p class="mt-2 text-xs text-white/40">At least 8 characters</p>
            </div>

            <div>
              <label for="confirmPassword" class="label">Confirm Password</label
              >
              <input
                id="confirmPassword"
                type="password"
                bind:value={confirmPassword}
                required
                class="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="button"
              on:click={handleAccountSubmit}
              class="btn-primary w-full py-3"
            >
              Continue to Wallet
            </button>
          </div>
        {:else if step === 2}
          <!-- Step 2: Connect Wallet -->
          <div class="space-y-5">
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="password" value={password} />
            <input type="hidden" name="walletAddress" value={walletAddress} />
            <input type="hidden" name="walletChainId" value={walletChainId} />
            <input
              type="hidden"
              name="walletSignature"
              value={walletSignature}
            />

            <button
              type="button"
              on:click={goBack}
              class="text-white/50 hover:text-white flex items-center gap-2 text-sm transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            <div class="text-center py-6">
              <div
                class="w-16 h-16 mx-auto bg-ink-500/20 rounded-2xl flex items-center justify-center mb-5"
              >
                <svg
                  class="w-8 h-8 text-ink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-white mb-2">
                Connect your wallet
              </h2>
              <p class="text-white/50 text-sm">
                A wallet is required to receive payments
              </p>
            </div>

            {#if walletAddress}
              <div
                class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-white font-medium">Wallet Connected</p>
                    <p class="text-emerald-400 text-sm font-mono">
                      {truncateAddress(walletAddress)}
                    </p>
                  </div>
                </div>
              </div>
            {:else}
              <button
                type="button"
                on:click={connectWallet}
                disabled={isConnectingWallet}
                class="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3"
              >
                {#if isConnectingWallet}
                  <svg
                    class="animate-spin h-5 w-5"
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
                  Connecting...
                {:else}
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                    alt="MetaMask"
                    class="w-6 h-6"
                  />
                  Connect MetaMask
                {/if}
              </button>
            {/if}

            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                required
                class="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-ink-500 focus:ring-ink-500 focus:ring-offset-0"
              />
              <span class="text-sm text-white/50">
                I agree to the
                <a
                  href="/terms"
                  class="text-ink-400 hover:text-ink-300 transition-colors"
                  >Terms of Service</a
                >
                and
                <a
                  href="/privacy"
                  class="text-ink-400 hover:text-ink-300 transition-colors"
                  >Privacy Policy</a
                >
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !walletAddress}
              class="btn-primary w-full py-3"
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
                  Creating account...
                </span>
              {:else}
                Create Account
              {/if}
            </button>
          </div>
        {/if}
      </form>

      <div class="divider"></div>

      <div class="text-center">
        <p class="text-sm text-white/50">
          Already have an account?
          <a
            href="/login"
            class="text-ink-400 hover:text-ink-300 font-medium transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
