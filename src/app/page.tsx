'use client';

import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { MessageSquare, Shield, Wallet, ArrowRight, Zap, Lock, Globe, Sparkles } from 'lucide-react';

export default function Home() {
  const { authenticated, ready } = usePrivy();

  return (
    <div className="min-h-screen bg-[#09090b] bg-glow-top">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white text-lg tracking-tight">OnlyAnon</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/creators" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">
              Creators
            </Link>
            <Link href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">
              How it works
            </Link>
            <Link href="/check" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">
              Check Reply
            </Link>
          </nav>

          {ready && authenticated ? (
            <Link href="/dashboard">
              <Button className="bg-white text-zinc-900 hover:bg-zinc-100 h-9 px-4 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="bg-white text-zinc-900 hover:bg-zinc-100 h-9 px-4 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="pt-40 pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-fade-in">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse-soft" />
                <span className="text-sm text-indigo-300 font-medium">Anonymous Q&A on Solana</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6 animate-slide-up">
                Ask anything.
                <br />
                <span className="text-gradient">Stay anonymous.</span>
              </h1>

              <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-xl animate-slide-up stagger-1" style={{ opacity: 0 }}>
                Pay creators for personalized answers. Your wallet address stays completely hidden. No account required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up stagger-2" style={{ opacity: 0 }}>
                {ready && authenticated ? (
                  <Link href="/dashboard">
                    <Button className="btn-primary-indigo h-12 px-8 text-base rounded-xl">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button className="btn-primary-indigo h-12 px-8 text-base rounded-xl">
                      Start as Creator
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link href="/creators">
                  <Button variant="outline" className="h-12 px-8 text-base rounded-xl border-zinc-800 text-zinc-300 hover:text-white hover:bg-white/5 hover:border-zinc-700 transition-all duration-200">
                    Browse Creators
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm text-indigo-400 font-medium mb-3 tracking-wide uppercase">Simple Process</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">How it works</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: MessageSquare,
                  step: '01',
                  title: 'Find & Ask',
                  description: 'Browse creator profiles, pick a topic that interests you, and type your question.',
                },
                {
                  icon: Lock,
                  step: '02',
                  title: 'Pay Anonymously',
                  description: 'Connect any Solana wallet. ShadowWire technology keeps your identity completely hidden.',
                },
                {
                  icon: Wallet,
                  step: '03',
                  title: 'Get Your Code',
                  description: 'Save your unique access code. Check back anytime for the creator\'s response.',
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="group card-elevated p-8 animate-slide-up"
                  style={{ opacity: 0, animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/20 flex items-center justify-center group-hover:from-indigo-500/30 group-hover:to-indigo-600/20 transition-all duration-300">
                      <item.icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <span className="text-4xl font-bold text-zinc-800 group-hover:text-zinc-700 transition-colors">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="py-24 px-6 border-t border-zinc-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm text-indigo-400 font-medium mb-3 tracking-wide uppercase">Privacy First</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
                  True privacy, powered by crypto
                </h2>
                <p className="text-lg text-zinc-400 leading-relaxed mb-10">
                  ShadowWire external transfers ensure creators never see your wallet address. We store zero identifying information about you.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: Shield, text: 'Wallet address hidden via ZK proofs' },
                    { icon: Zap, text: 'Instant payments on Solana blockchain' },
                    { icon: Globe, text: 'No account or email ever required' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors duration-200"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-indigo-400" />
                      </div>
                      <span className="text-zinc-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-3xl" />
                <div className="relative card-elevated p-10">
                  <div className="text-center">
                    <p className="text-sm text-zinc-500 mb-4 uppercase tracking-wider">Your Access Code</p>
                    <div className="py-6 px-8 bg-zinc-900/80 rounded-xl border border-zinc-700/50 mb-4">
                      <p className="text-3xl md:text-4xl font-mono text-white tracking-[0.2em] font-medium">
                        XKCD-M4NK-9P2Q
                      </p>
                    </div>
                    <p className="text-sm text-zinc-500">
                      This is your <span className="text-indigo-400">only link</span> to your question
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Creators */}
        <section className="py-24 px-6 border-t border-zinc-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/20 via-indigo-900/20 to-zinc-900 border border-indigo-500/20 p-12 md:p-16">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

              <div className="relative max-w-2xl mx-auto text-center">
                <p className="text-sm text-indigo-300 font-medium mb-4 tracking-wide uppercase">For Creators</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
                  Monetize your expertise
                </h2>
                <p className="text-lg text-zinc-300 mb-10 leading-relaxed">
                  Get paid directly in SOL or USDC. Set your own prices. Answer on your schedule. Build your audience while respecting their privacy.
                </p>

                {ready && authenticated ? (
                  <Link href="/dashboard">
                    <Button className="btn-white h-12 px-8 text-base rounded-xl shadow-lg">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button className="btn-white h-12 px-8 text-base rounded-xl shadow-lg">
                      Create Your Page
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-zinc-500 text-sm">Built with ShadowWire on Solana</span>
              </div>

              <div className="flex items-center gap-8">
                <Link href="/creators" className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                  Creators
                </Link>
                <Link href="/check" className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                  Check Reply
                </Link>
                {ready && authenticated ? (
                  <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/login" className="text-sm text-zinc-500 hover:text-white transition-colors duration-200">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
