import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Shield, Wallet, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-white">OnlyAnon</div>
          <Link href="/login">
            <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
              Creator Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4">
        <section className="py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Anonymous Questions.
            <br />
            <span className="text-purple-500">Real Answers.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Ask your favorite creators anything. Pay with crypto.
            Your identity stays completely hidden.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                Start as Creator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 border-t border-gray-800">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ask Anything</h3>
              <p className="text-gray-400">
                Find a creator, pick their offering, and ask your question.
                No account needed.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Stay Anonymous</h3>
              <p className="text-gray-400">
                Pay with ShadowWire. Your wallet address is hidden.
                The creator never knows who you are.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Get Your Answer</h3>
              <p className="text-gray-400">
                Save your access code. Use it to check back and see
                when the creator replies.
              </p>
            </div>
          </div>
        </section>

        {/* For Creators */}
        <section className="py-20 border-t border-gray-800">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">For Creators</h2>
            <p className="text-xl text-gray-400 mb-8">
              Monetize your knowledge. Get paid directly in SOL or USDC.
              Set your own prices. Answer on your schedule.
            </p>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-600/10">
                Create Your Page
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>Powered by ShadowWire on Solana</p>
        </footer>
      </main>
    </div>
  );
}
