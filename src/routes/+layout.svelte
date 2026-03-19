<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { auth, isAuthenticated, user } from "$lib/stores/auth";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import SolanaProvider from "$lib/components/web3/SolanaProvider.svelte";
  import AppKitProvider from "$lib/components/web3/AppKitProvider.svelte";
  import AppKitConnect from "$lib/components/web3/AppKitConnect.svelte";
  import SolanaConnect from "$lib/components/web3/SolanaConnect.svelte";

  export let data;

  // Sync store with server-side data
  $: if (data) {
    auth.syncServerData(data.isAuthenticated, data.user, data.accessToken);
  }

  // Navigation items
  const publicNav = [
    { href: "/", label: "Home" },
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
  ];

  const authNav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/payments", label: "Payments" },
    { href: "/wallets", label: "Wallets" },
  ];
</script>

<SolanaProvider>
  <AppKitProvider>
    <div class="min-h-screen flex flex-col">
      <!-- Navigation with glassmorphism -->
      <nav
        class="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-base/80 backdrop-blur-xl"
      >
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex h-16 items-center justify-between">
            <!-- Logo -->
            <div class="flex items-center">
              <a href="/" class="flex items-center gap-3 group">
                <div class="relative">
                  <img
                    src="/logo.png"
                    alt="Payment-Kita Logo"
                    class="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  <div
                    class="absolute inset-0 bg-ink-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                </div>
                <span class="text-white font-bold text-xl tracking-tight"
                  >Payment-Kita</span
                >
              </a>
            </div>

            <!-- Navigation Links -->
            <div class="flex items-center gap-1">
              {#if $isAuthenticated}
                {#each authNav as item}
                  <a
                    href={item.href}
                    class="nav-link rounded-lg {$page.url.pathname === item.href
                      ? 'nav-link-active bg-white/5'
                      : ''}"
                  >
                    {item.label}
                  </a>
                {/each}

                <!-- User menu -->
                <div
                  class="flex items-center gap-3 ml-4 pl-4 border-l border-white/10"
                >
                  <span class="text-white/50 text-sm">{$user?.email}</span>
                  <form method="POST" action="/logout">
                    <button
                      type="submit"
                      class="btn-ghost text-white/70 hover:text-white"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              {:else}
                {#each publicNav as item}
                  <a
                    href={item.href}
                    class="nav-link rounded-lg {$page.url.pathname === item.href
                      ? 'nav-link-active bg-white/5'
                      : ''}"
                  >
                    {item.label}
                  </a>
                {/each}

                <a href="/register" class="btn-secondary ml-2"> Get Started </a>
              {/if}

              <!-- Wallet Connectors -->
              <div
                class="flex items-center gap-2 ml-4 pl-4 border-l border-white/10"
              >
                <AppKitConnect />
                <SolanaConnect />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Spacer for fixed navbar -->
      <div class="h-16"></div>

      <!-- Main content -->
      <main class="flex-1">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="border-t border-white/10 mt-auto">
        <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Brand column -->
            <div class="md:col-span-2">
              <a href="/" class="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Payment-Kita" class="h-8 w-8" />
                <span class="text-white font-bold text-lg">Payment-Kita</span>
              </a>
              <p class="text-white/50 text-sm max-w-md">
                Cross-chain stablecoin payment gateway. Accept payments across
                Ethereum, Solana, and more with instant settlement.
              </p>
            </div>

            <!-- Links -->
            <div>
              <h4 class="text-white font-semibold mb-4">Product</h4>
              <ul class="space-y-2">
                <li>
                  <a
                    href="/docs"
                    class="text-white/50 hover:text-white text-sm transition-colors"
                    >Documentation</a
                  >
                </li>
                <li>
                  <a
                    href="/pricing"
                    class="text-white/50 hover:text-white text-sm transition-colors"
                    >Pricing</a
                  >
                </li>
                <li>
                  <a
                    href="/api"
                    class="text-white/50 hover:text-white text-sm transition-colors"
                    >API</a
                  >
                </li>
              </ul>
            </div>

            <div>
              <h4 class="text-white font-semibold mb-4">Company</h4>
              <ul class="space-y-2">
                <li>
                  <a
                    href="/about"
                    class="text-white/50 hover:text-white text-sm transition-colors"
                    >About</a
                  >
                </li>
                <li>
                  <a
                    href="/support"
                    class="text-white/50 hover:text-white text-sm transition-colors"
                    >Support</a
                  >
                </li>
                <li>
                  <a
                    href="/terms"
                    class="text-white/50 hover:text-white text-sm transition-colors"
                    >Terms</a
                  >
                </li>
              </ul>
            </div>
          </div>

          <div class="divider"></div>

          <div
            class="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p class="text-white/40 text-sm">
              © 2026 Payment-Kita. All rights reserved.
            </p>
            <div class="flex items-center gap-4">
              <a
                href="https://twitter.com"
                class="text-white/40 hover:text-white transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
                  ><path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  /></svg
                >
              </a>
              <a
                href="https://github.com"
                class="text-white/40 hover:text-white transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
                  ><path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  /></svg
                >
              </a>
              <a
                href="https://discord.com"
                class="text-white/40 hover:text-white transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
                  ><path
                    d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"
                  /></svg
                >
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </AppKitProvider>
</SolanaProvider>
