'use client';

import { ReactNode, useMemo, useState, useEffect } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

/**
 * Get the Solana RPC endpoint with fallback support.
 * Priority: Helius (primary) -> QuickNode (fallback) -> Public RPC (last resort)
 */
function getRpcEndpoint(): string {
  // Primary: Helius RPC
  const heliusRpc = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
  if (heliusRpc) {
    return heliusRpc;
  }

  // Fallback: QuickNode RPC (optional)
  const quickNodeRpc = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL;
  if (quickNodeRpc) {
    return quickNodeRpc;
  }

  // Last resort: Public Solana RPC
  return clusterApiUrl('mainnet-beta');
}

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const endpoint = useMemo(() => getRpcEndpoint(), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Don't render wallet providers during SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
