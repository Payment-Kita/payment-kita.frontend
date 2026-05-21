import { QueryClient } from '@tanstack/react-query'

// Query configuration for better performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: How long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // GC time: How long unused data is kept in cache
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      
      // Retry logic
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).response?.status
          if (status && status >= 400 && status < 500) {
            return false
          }
        }
        // Retry up to 3 times for 5xx errors
        return failureCount < 3
      },
      
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * 2 ** attemptIndex, 30000) // Max 30 seconds
      },
      
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      
      // Refetch when reconnecting to network
      refetchOnReconnect: true,
      
      // Don't refetch when component mounts if data is fresh
      refetchOnMount: (query) => {
        return query.state.data === undefined || 
               Date.now() - query.state.dataUpdatedAt > 1000 * 60 // 1 minute
      },
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      
      // Exponential backoff for mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
})

// Query key factories for better cache management
export const queryKeys = {
  // Payments
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.payments.lists(), filters] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
  },
  
  // Merchants
  merchants: {
    all: ['merchants'] as const,
    me: () => [...queryKeys.merchants.all, 'me'] as const,
  },
  
  // API Keys
  apiKeys: {
    all: ['apiKeys'] as const,
    lists: () => [...queryKeys.apiKeys.all, 'list'] as const,
  },
  
  // Webhooks
  webhooks: {
    all: ['webhooks'] as const,
    logs: () => [...queryKeys.webhooks.all, 'logs'] as const,
    logsList: (filters: Record<string, any>) => [...queryKeys.webhooks.logs(), filters] as const,
  },
  
  // Admin
  admin: {
    all: ['admin'] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    tokens: () => [...queryKeys.admin.all, 'tokens'] as const,
    bridges: () => [...queryKeys.admin.all, 'bridges'] as const,
    merchants: () => [...queryKeys.admin.all, 'merchants'] as const,
    contracts: () => [...queryKeys.admin.all, 'contracts'] as const,
  },
}
