'use client';

import { useLogin, usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Twitter } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { authenticated, ready, user } = usePrivy();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { login } = useLogin({
    onComplete: async (user) => {
      setIsLoggingIn(true);
      try {
        // Sync creator to database
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to OnlyAnon</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in with Twitter to start receiving anonymous questions and get paid
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            size="lg"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Twitter className="h-5 w-5" />
                Continue with Twitter / X
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            A Solana wallet will be automatically created for you.
          </p>
        </CardContent>
      </Card>
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
