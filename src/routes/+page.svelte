<script lang="ts">
  import { goto } from "$app/navigation";
  import { isAuthenticated } from "$lib/stores/auth";

  // Features list
  const features = [
    {
      icon: "⚡",
      title: "Cross-Chain Payments",
      description: "Send stablecoins across Base, BSC, and Solana seamlessly",
    },
    {
      icon: "💰",
      title: "Low Fees",
      description:
        "Hybrid fee model: 0.3% + $0.50 base fee with merchant discounts",
    },
    {
      icon: "🔗",
      title: "Multiple Bridges",
      description:
        "Automatic bridge selection: CCIP, Hyperlane, and Hyperbridge",
    },
    {
      icon: "🛡️",
      title: "Secure",
      description: "Non-custodial smart contracts with multi-layer security",
    },
  ];

  const supportedChains = [
    { name: "Base", logo: "🔵" },
    { name: "BSC", logo: "🟡" },
    { name: "Solana", logo: "🟣" },
  ];

  function handleGetStarted() {
    if ($isAuthenticated) {
      goto("/dashboard");
    } else {
      goto("/register");
    }
  }
</script>

<svelte:head>
  <title>Payment-Kita - Cross-Chain Stablecoin Payments</title>
</svelte:head>

<!-- Hero Section -->
<div class="relative overflow-hidden">
  <!-- Decorative gradient blobs -->
  <div
    class="absolute top-20 left-1/4 w-96 h-96 bg-ink-600/20 rounded-full blur-3xl"
  ></div>
  <div
    class="absolute bottom-10 right-1/4 w-80 h-80 bg-ink-500/15 rounded-full blur-3xl"
  ></div>

  <div class="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
    <div class="text-center">
      <!-- Badge -->
      <div
        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink-600/20 border border-ink-500/30 mb-8"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-sm text-ink-300 font-medium">Live on Mainnet</span>
      </div>

      <h1
        class="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white"
      >
        <span class="block">Cross-Chain</span>
        <span class="block gradient-text"> Stablecoin Payments </span>
      </h1>
      <p
        class="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-white/60 leading-relaxed"
      >
        Send and receive stablecoin payments across multiple blockchains. Low
        fees, fast settlement, automatic bridge selection.
      </p>
      <div
        class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <button
          on:click={handleGetStarted}
          class="btn-primary text-base px-8 py-4 w-full sm:w-auto"
        >
          Start Building
        </button>
        <a
          href="/docs"
          class="btn-secondary text-base px-8 py-4 w-full sm:w-auto"
        >
          View Documentation
        </a>
      </div>

      <!-- Supported chains -->
      <div class="mt-20">
        <p class="text-white/40 text-sm mb-6 uppercase tracking-wider">
          Supported Networks
        </p>
        <div class="flex flex-wrap justify-center gap-8">
          {#each supportedChains as chain}
            <div
              class="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default"
            >
              <span class="text-2xl">{chain.logo}</span>
              <span class="text-white/70 font-medium">{chain.name}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Features Section -->
<div class="py-24 lg:py-32">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-white">Why Payment-Kita?</h2>
      <p class="mt-4 text-white/50 text-lg">Built for the multi-chain future</p>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each features as feature}
        <div class="card card-hover group">
          <div
            class="text-4xl mb-5 transition-transform duration-300 group-hover:scale-110"
          >
            {feature.icon}
          </div>
          <h3 class="text-lg font-semibold text-white mb-3">{feature.title}</h3>
          <p class="text-white/50 text-sm leading-relaxed">
            {feature.description}
          </p>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- CTA Section -->
<div class="relative py-24 overflow-hidden">
  <!-- Background gradient -->
  <div
    class="absolute inset-0 bg-gradient-to-r from-ink-600/20 via-ink-500/10 to-ink-600/20"
  ></div>
  <div class="absolute inset-0 bg-gradient-to-t from-base to-transparent"></div>

  <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="card text-center max-w-3xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">
        Ready to get started?
      </h2>
      <p class="text-white/60 mb-8 text-lg">
        Create your account and start accepting cross-chain payments today.
      </p>
      <button
        on:click={handleGetStarted}
        class="btn-primary text-base px-10 py-4"
      >
        Create Account
      </button>
    </div>
  </div>
</div>
