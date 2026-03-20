'use client';

export function useGuides() {
  const guides = [
    {
      category: 'Getting Started',
      items: [
        { title: 'Introduction to Payment Kita', description: 'Use the documentation overview as the entry point for current runtime contracts and migration context.', href: '/docs', readTime: '5 min', difficulty: 'Beginner', tags: ['overview'] },
        { title: 'Quick Start with Partner Flow', description: 'Start with quote creation, session creation, hosted read, and resolve-code.', href: '/docs/partner-api', readTime: '8 min', difficulty: 'Beginner', tags: ['setup'] },
        { title: 'API Reference Walkthrough', description: 'Inspect request and response examples and test routes interactively.', href: '/docs/api', readTime: '10 min', difficulty: 'Beginner', tags: ['payments'] },
      ],
    },
    {
      category: 'Integration Guides',
      items: [
        { title: 'Hosted Checkout Integration', description: 'Render the partner hosted checkout read model and poll session status safely.', href: '/docs/partner-api', readTime: '15 min', difficulty: 'Intermediate', tags: ['checkout', 'frontend'], featured: true },
        { title: 'Custom Partner Integration', description: 'Build a full partner integration using partner HMAC auth and two-step quote/session flow.', href: '/docs/partner-api', readTime: '20 min', difficulty: 'Intermediate', tags: ['api', 'custom'] },
        { title: 'Handling Webhooks', description: 'Verify runtime webhook signatures and align your retry expectations with current policy.', href: '/docs/partner-api', readTime: '12 min', difficulty: 'Intermediate', tags: ['webhooks', 'backend'] },
      ],
    },
    {
      category: 'Advanced Topics',
      items: [
        { title: 'Cross-Chain Payments', description: 'Understand how partner sessions map to cross-chain runtime execution.', href: '/docs/api', readTime: '18 min', difficulty: 'Advanced', tags: ['cross-chain', 'bridging'] },
        { title: 'Legacy Cutover Planning', description: 'Review staged migration and deprecation expectations before disabling legacy routes.', href: '/docs/api', readTime: '14 min', difficulty: 'Advanced', tags: ['migration', 'ops'] },
        { title: 'SDK Consumption Patterns', description: 'Review SDK direction and how it should wrap the partner flow contract.', href: '/docs/sdks', readTime: '10 min', difficulty: 'Advanced', tags: ['sdk', 'advanced'] },
      ],
    },
  ];

  const getDifficultyVariant = (difficulty: string): 'default' | 'secondary' | 'danger' | 'outline' | 'success' | 'warning' => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'danger';
      case 'Expert': return 'danger';
      default: return 'outline';
    }
  };

  return { guides, getDifficultyVariant };
}
