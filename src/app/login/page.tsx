'use client';

import { useLogin, usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { authenticated, ready, user } = usePrivy();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { login } = useLogin({
    onComplete: async (user) => {
      setIsLoggingIn(true);
      try {
        await syncCreator(user);
        router.push('/dashboard');
      } catch (error) {
        console.error('Failed to sync creator:', error);
        setIsLoggingIn(false);
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      setIsLoggingIn(false);
    },
  });

  useEffect(() => {
    if (ready && authenticated && user) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, user, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] relative">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <Link href="/" className="text-lg font-bold text-white">
            Only<span className="text-cyan-400">Anon</span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-65px)] p-6">
        <Card className="w-full max-w-md bg-[#0c0c12] border-white/5">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to OnlyAnon</h1>
              <p className="text-zinc-500">
                Sign in with Twitter to start receiving anonymous questions and get paid
              </p>
            </div>

            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-medium bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Continue with X
                </span>
              )}
            </Button>

            <p className="text-xs text-center text-zinc-600 mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              A Solana wallet will be automatically created for you.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

async function syncCreator(user: any) {
  const twitter = user.twitter;
  const wallet = user.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'solana'
  );

  if (!twitter) {
    throw new Error('Twitter account required');
  }

  const walletAddress = wallet?.address || user.wallet?.address;
  if (!walletAddress) {
    throw new Error('Solana wallet required');
  }

  const response = await fetch('/api/creators', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      privy_did: user.id,
      twitter_id: twitter.subject,
      twitter_username: twitter.username,
      display_name: twitter.name || twitter.username,
      avatar_url: twitter.profilePictureUrl?.replace('_normal', ''),
      wallet_address: walletAddress,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sync creator');
  }

  return response.json();
}
