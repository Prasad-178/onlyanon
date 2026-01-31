'use client';

import { ReactNode } from 'react';
import { OnlyAnonPrivyProvider } from './privy-provider';
import { QueryProvider } from './query-provider';
import { SolanaWalletProvider } from './wallet-provider';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <OnlyAnonPrivyProvider>
        <SolanaWalletProvider>
          {children}
          <Toaster position="bottom-right" />
        </SolanaWalletProvider>
      </OnlyAnonPrivyProvider>
    </QueryProvider>
  );
}
