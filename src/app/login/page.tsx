'use client';

import { useLogin, usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <Link href="/" className="font-semibold text-white">OnlyAnon</Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-57px)] p-6">
        <div className="w-full max-w-sm">
          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-white mb-2">Welcome to OnlyAnon</h1>
              <p className="text-sm text-zinc-500">
                Sign in with X to start receiving anonymous questions
              </p>
            </div>

            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full h-10 text-sm font-medium bg-white text-black hover:bg-zinc-200"
            >
              {isLoggingIn ? (
                'Connecting...'
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Continue with X
                </span>
              )}
            </Button>

            <p className="text-xs text-center text-zinc-600 mt-4">
              A Solana wallet will be created for you automatically
            </p>
          </div>
        </div>
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
