'use client';

import { useLogin, usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Shield, Loader2, Wallet, Zap, Check } from 'lucide-react';

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <Link href="/" className="flex items-center gap-3">
            <img src="/onlyanon_logo.png" alt="OnlyAnon" className="w-9 h-9" />
            <span className="font-semibold text-white text-xl tracking-tight">OnlyAnon</span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-screen px-6 py-24">
        <div className="w-full max-w-lg">
          {/* Card with glow */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-70" />

            <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 border border-zinc-700/50 backdrop-blur-sm overflow-hidden">
              {/* Top gradient bar */}
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

              <div className="p-8 md:p-10">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                  <img src="/onlyanon_full.png" alt="OnlyAnon" className="h-24" />
                </div>

                {/* Text */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-3">Welcome to OnlyAnon</h1>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    Sign in with X to start receiving anonymous questions and get paid for your answers.
                  </p>
                </div>

                {/* Login Button */}
                <Button
                  onClick={() => login()}
                  disabled={isLoggingIn}
                  className="w-full h-14 text-lg font-medium bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl shadow-lg shadow-white/10 transition-all duration-200 hover:shadow-xl hover:shadow-white/20 disabled:opacity-70"
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Continue with X
                    </span>
                  )}
                </Button>

                {/* Divider */}
                <div className="my-8 flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-zinc-700" />
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">What you get</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-zinc-700" />
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {[
                    { icon: Wallet, title: 'Auto Wallet', description: 'Solana wallet created automatically' },
                    { icon: Shield, title: 'Privacy First', description: 'Your fans stay completely anonymous' },
                    { icon: Zap, title: 'Instant Payouts', description: 'Get paid in SOL or USDC directly' },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <feature.icon className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{feature.title}</p>
                        <p className="text-xs text-zinc-500">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-zinc-600 mt-8 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            <br />
            We only use your X account to verify your identity.
          </p>
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
