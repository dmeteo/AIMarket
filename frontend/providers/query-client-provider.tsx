'use client';

import { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';

// Create a new QueryClient instance for the client side
const queryClient = new QueryClient();

export function QueryClientProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}