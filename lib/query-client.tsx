"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { Toaster } from 'react-hot-toast';

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #e5e5e5',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            style: {
              background: '#f0f9ff',
              color: '#0c4a6e',
              border: '1px solid #0ea5e9',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
