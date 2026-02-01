'use client';

import { useState, useCallback } from 'react';
import { getShadowWireClient, SupportedToken } from './client';

interface TransferParams {
  senderWallet: string;
  recipientWallet: string;
  amount: number;
  token: SupportedToken;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

interface TransferResult {
  success: boolean;
  signature?: string;
  error?: string;
}

// Generate a fake transaction signature for simulation
function generateFakeSignature(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let signature = '';
  for (let i = 0; i < 88; i++) {
    signature += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return signature;
}

export function useShadowWireTransfer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFees = useCallback((amount: number, token: SupportedToken) => {
    const client = getShadowWireClient();
    const feeBreakdown = client.calculateFee(amount, token);
    return {
      amount,
      fee: feeBreakdown.fee,
      feePercentage: feeBreakdown.feePercentage,
      netAmount: feeBreakdown.netAmount,
      total: amount,
    };
  }, []);

  const executeTransfer = useCallback(
    async ({
      senderWallet,
      recipientWallet,
      amount,
      token,
      signMessage,
    }: TransferParams): Promise<TransferResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // ============================================================
        // SIMULATION MODE - No devnet available
        // Comment out the real payment code and simulate instead
        // ============================================================

        // Simulate network delay (1-2 seconds)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // Generate a fake transaction signature
        const fakeSignature = generateFakeSignature();

        console.log('[SIMULATED PAYMENT]', {
          from: senderWallet,
          to: recipientWallet,
          amount,
          token,
          signature: fakeSignature,
        });

        return { success: true, signature: fakeSignature };

        // ============================================================
        // REAL PAYMENT CODE (commented out - no devnet available)
        // ============================================================
        /*
        const client = getShadowWireClient();

        const result = await client.transfer({
          sender: senderWallet,
          recipient: recipientWallet,
          amount,
          token,
          type: 'external', // Always external - hides sender identity
          wallet: { signMessage },
        });

        if (result.success) {
          return { success: true, signature: result.tx_signature };
        } else {
          return { success: false, error: 'Transfer failed' };
        }
        */
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Transfer failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    executeTransfer,
    calculateFees,
    isLoading,
    error,
  };
}
