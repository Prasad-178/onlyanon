import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Shield, Wallet, ArrowRight, Zap, Lock, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-xl font-bold text-white tracking-tight">
            Only<span className="text-cyan-400">Anon</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="#creators" className="text-sm text-zinc-400 hover:text-white transition-colors">
              For Creators
            </Link>
            <Link href="/check" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Check Reply
            </Link>
          </nav>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-zinc-200 font-medium px-5">
              Creator Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-8">
              <Shield className="h-4 w-4" />
              Powered by ShadowWire on Solana
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Ask anything.
              <br />
              <span className="text-gradient">Stay anonymous.</span>
            </h1>

            <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-xl">
              Pay your favorite creators for answers. Your wallet address stays completely hidden. No account needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="gradient-primary text-white hover:opacity-90 font-medium px-8 h-12 text-base">
                  Start as Creator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/check">
                <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 font-medium px-8 h-12 text-base">
                  Check Your Reply
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-white/5 bg-[#0a0a0f]">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
              <p className="text-zinc-400 text-lg">Three simple steps to ask anything anonymously</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="group p-8 rounded-2xl bg-[#0c0c12] border border-white/5 hover:border-cyan-500/20 transition-all hover-glow">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="text-sm text-cyan-400 font-medium mb-2">Step 1</div>
                <h3 className="text-xl font-semibold text-white mb-3">Find & Ask</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Browse creator profiles, pick a topic, and type your question. No sign up required.
                </p>
              </div>

              <div className="group p-8 rounded-2xl bg-[#0c0c12] border border-white/5 hover:border-cyan-500/20 transition-all hover-glow">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="text-sm text-cyan-400 font-medium mb-2">Step 2</div>
                <h3 className="text-xl font-semibold text-white mb-3">Pay Anonymously</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Connect any Solana wallet and pay. ShadowWire hides your identity completely.
                </p>
              </div>

              <div className="group p-8 rounded-2xl bg-[#0c0c12] border border-white/5 hover:border-cyan-500/20 transition-all hover-glow">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wallet className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="text-sm text-cyan-400 font-medium mb-2">Step 3</div>
                <h3 className="text-xl font-semibold text-white mb-3">Get Your Code</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Save your access code. Use it anytime to check if the creator has replied.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  True privacy,
                  <br />
                  powered by crypto
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                  Unlike other Q&A platforms, we dont track you. ShadowWire external transfers ensure the creator never sees your wallet address.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span className="text-zinc-300">Wallet address hidden via ZK proofs</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span className="text-zinc-300">Instant payments on Solana</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span className="text-zinc-300">No account or email required</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-emerald-500/20 rounded-3xl blur-3xl" />
                <div className="relative p-8 rounded-2xl bg-[#0c0c12] border border-white/10">
                  <div className="text-center mb-6">
                    <div className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-4">
                      Access Code
                    </div>
                    <div className="text-3xl font-mono text-white tracking-wider">
                      XKCD-M4NK-9P2Q
                    </div>
                  </div>
                  <div className="text-center text-zinc-500 text-sm">
                    This is your only link to your question.
                    <br />
                    We store zero identifying information.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Creators */}
        <section id="creators" className="border-t border-white/5 bg-[#0a0a0f]">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
                <Zap className="h-4 w-4" />
                For Creators
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Monetize your expertise
              </h2>
              <p className="text-xl text-zinc-400 mb-10">
                Get paid directly in SOL or USDC. Set your own prices.
                No middleman fees beyond network costs. Answer on your schedule.
              </p>
              <Link href="/login">
                <Button size="lg" className="gradient-primary text-white hover:opacity-90 font-medium px-8 h-12 text-base">
                  Create Your Page
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-zinc-500 text-sm">
                Built with ShadowWire on Solana
              </div>
              <div className="flex items-center gap-6">
                <Link href="/check" className="text-zinc-500 text-sm hover:text-white transition-colors">
                  Check Reply
                </Link>
                <Link href="/login" className="text-zinc-500 text-sm hover:text-white transition-colors">
                  Creator Login
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
