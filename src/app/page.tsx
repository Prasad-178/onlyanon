'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Shield, Wallet, ArrowRight, Zap, Lock, Globe, Users } from 'lucide-react';

interface Creator {
  id: string;
  twitter_username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  offering_count: number;
}

export default function Home() {
  const { authenticated, ready } = usePrivy();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  useEffect(() => {
    async function fetchCreators() {
      try {
        const res = await fetch('/api/creators?list=true');
        if (res.ok) {
          const data = await res.json();
          setCreators(data.creators || []);
        }
      } catch (error) {
        console.error('Failed to fetch creators:', error);
      } finally {
        setLoadingCreators(false);
      }
    }
    fetchCreators();
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-white">OnlyAnon</Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#creators" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Creators
            </Link>
            <Link href="#how-it-works" className="text-sm text-zinc-500 hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="/check" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Check Reply
            </Link>
          </nav>
          {ready && authenticated ? (
            <Link href="/dashboard">
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 h-8 px-4 text-sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 h-8 px-4 text-sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-2xl">
            <p className="text-sm text-zinc-500 mb-4">Anonymous Q&A on Solana</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight tracking-tight mb-5">
              Ask anything.<br />
              Stay anonymous.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed mb-8">
              Pay creators for answers. Your wallet address stays hidden. No account needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {ready && authenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-white text-black hover:bg-zinc-200 h-10 px-6 text-sm">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="bg-white text-black hover:bg-zinc-200 h-10 px-6 text-sm">
                    Start as Creator
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href="#creators">
                <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-10 px-6 text-sm">
                  Browse Creators
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Creators Discovery */}
        <section id="creators" className="border-t border-zinc-800/50 bg-zinc-900/30">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-white mb-2">Ask a Creator</h2>
              <p className="text-zinc-500">Browse creators and ask them anything anonymously</p>
            </div>

            {loadingCreators ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full bg-zinc-800" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-zinc-800 rounded mb-1" />
                        <div className="h-3 w-16 bg-zinc-800/50 rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-full bg-zinc-800/50 rounded" />
                  </div>
                ))}
              </div>
            ) : creators.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {creators.map((creator) => (
                  <Link key={creator.id} href={`/${creator.twitter_username}`}>
                    <div className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700/50 transition-all group">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-11 w-11">
                          <AvatarImage
                            src={creator.avatar_url?.replace('_normal', '') || undefined}
                            alt={creator.display_name}
                          />
                          <AvatarFallback className="bg-zinc-800 text-zinc-400">
                            {creator.display_name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">{creator.display_name}</h3>
                          <p className="text-xs text-zinc-500">@{creator.twitter_username}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                      </div>
                      {creator.bio && (
                        <p className="text-xs text-zinc-500 line-clamp-2">{creator.bio}</p>
                      )}
                      {!creator.bio && (
                        <p className="text-xs text-zinc-600">{creator.offering_count} offering{creator.offering_count !== 1 ? 's' : ''} available</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500 mb-1">No creators yet</p>
                <p className="text-xs text-zinc-600 mb-4">Be the first to start receiving anonymous questions</p>
                <Link href="/login">
                  <Button className="bg-white text-black hover:bg-zinc-200 h-9 px-4 text-sm">
                    Become a Creator
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-zinc-800/50">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-white mb-2">How it works</h2>
              <p className="text-zinc-500">Three simple steps</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                  <MessageSquare className="h-5 w-5 text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-600 mb-1">Step 1</p>
                <h3 className="text-base font-medium text-white mb-2">Find & Ask</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Browse creator profiles, pick a topic, type your question.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-600 mb-1">Step 2</p>
                <h3 className="text-base font-medium text-white mb-2">Pay Anonymously</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Connect any Solana wallet. ShadowWire hides your identity.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                  <Wallet className="h-5 w-5 text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-600 mb-1">Step 3</p>
                <h3 className="text-base font-medium text-white mb-2">Get Your Code</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Save your access code. Check back anytime for replies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="border-t border-zinc-800/50 bg-zinc-900/30">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  True privacy, powered by crypto
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  ShadowWire external transfers ensure the creator never sees your wallet address. We store zero identifying information.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-zinc-500" />
                    </div>
                    <span className="text-sm text-zinc-400">Wallet address hidden via ZK proofs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-zinc-500" />
                    </div>
                    <span className="text-sm text-zinc-400">Instant payments on Solana</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-zinc-500" />
                    </div>
                    <span className="text-sm text-zinc-400">No account or email required</span>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <p className="text-xs text-zinc-600 mb-3 text-center">Your Access Code</p>
                <p className="text-2xl font-mono text-white text-center tracking-wider mb-3">
                  XKCD-M4NK-9P2Q
                </p>
                <p className="text-xs text-zinc-600 text-center">
                  This is your only link to your question.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Creators */}
        <section className="border-t border-zinc-800/50">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="max-w-xl mx-auto text-center">
              <p className="text-xs text-zinc-500 mb-3">For Creators</p>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Monetize your expertise
              </h2>
              <p className="text-zinc-400 mb-8">
                Get paid directly in SOL or USDC. Set your own prices. Answer on your schedule.
              </p>
              {ready && authenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-white text-black hover:bg-zinc-200 h-10 px-6 text-sm">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="bg-white text-black hover:bg-zinc-200 h-10 px-6 text-sm">
                    Create Your Page
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
              <span>Built with ShadowWire on Solana</span>
              <div className="flex items-center gap-4">
                <Link href="/check" className="hover:text-white transition-colors">Check Reply</Link>
                {ready && authenticated ? (
                  <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                ) : (
                  <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
                )}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
