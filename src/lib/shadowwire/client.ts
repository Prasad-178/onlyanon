import { ShadowWireClient } from '@radr/shadowwire';

let clientInstance: ShadowWireClient | null = null;

export function getShadowWireClient(): ShadowWireClient {
  if (!clientInstance) {
    clientInstance = new ShadowWireClient({
      debug: process.env.NODE_ENV === 'development',
    });
  }
  return clientInstance;
}

export type SupportedToken = 'SOL' | 'USDC';

export const TOKEN_CONFIG: Record<SupportedToken, { decimals: number; mint: string }> = {
  SOL: {
    decimals: 9,
    mint: 'So11111111111111111111111111111111111111112',
  },
  USDC: {
    decimals: 6,
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
};

export function formatTokenAmount(amount: number, token: SupportedToken): string {
  const { decimals } = TOKEN_CONFIG[token];
  return amount.toFixed(decimals > 4 ? 4 : decimals);
}

export function getTokenSymbol(token: SupportedToken): string {
  return token;
}
