'use client';

import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  MessageSquare,
  Shield,
  Wallet,
  ArrowRight,
  Zap,
  Lock,
  Globe,
  Sparkles,
  Check,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Users,
  DollarSign,
  Clock,
  Star,
  Twitter,
  ArrowUpRight,
  Fingerprint,
  Cpu,
  CircuitBoard,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

// Animated section wrapper
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating orb component
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

// FAQ Item
function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <motion.div
      className="border-b border-zinc-800/50 last:border-0"
      initial={false}
    >
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-medium text-white group-hover:text-indigo-300 transition-colors">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-zinc-500" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-zinc-400 leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { authenticated, ready } = usePrivy();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const faqs = [
    {
      question: "How does the anonymity work?",
      answer: "When you pay to ask a question, your payment goes through ShadowWire - a zero-knowledge proof system on Solana. The creator receives the payment, but the transaction is routed in a way that makes it impossible to trace back to your wallet. Your identity stays completely private."
    },
    {
      question: "What wallets are supported?",
      answer: "Any Solana wallet works - Phantom, Solflare, Backpack, Ledger, and more. Just connect your wallet, pay the creator's fee, and ask your question. No account creation required."
    },
    {
      question: "How do I check if a creator replied?",
      answer: "When you submit a question, you get a unique access code. Save this code! It's your only way to check for replies. Visit the 'Check Reply' page, enter your code, and see if there's a response waiting for you."
    },
    {
      question: "What cut does OnlyAnon take?",
      answer: "Creators keep 95% of every payment. The remaining 5% covers network fees and platform maintenance. No hidden fees, no monthly subscriptions."
    },
    {
      question: "Can creators see my wallet address?",
      answer: "No. That's the whole point. ShadowWire technology ensures your wallet address is never revealed to the creator. They see the payment amount and your question - nothing else."
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingOrb
          className="absolute -top-40 left-1/4 w-[800px] h-[800px] bg-indigo-500/[0.07] rounded-full blur-[150px]"
          delay={0}
        />
        <FloatingOrb
          className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-purple-500/[0.05] rounded-full blur-[120px]"
          delay={2}
        />
        <FloatingOrb
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/[0.04] rounded-full blur-[100px]"
          delay={4}
        />
        <FloatingOrb
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[80px]"
          delay={1}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <motion.div
          className="mx-auto max-w-7xl px-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between h-20 border-b border-white/[0.05]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-xl tracking-tight">OnlyAnon</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: '/creators', label: 'Explore Creators' },
                { href: '#how-it-works', label: 'How it works' },
                { href: '#features', label: 'Features' },
                { href: '/check', label: 'Check Reply' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {ready && authenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-white text-zinc-900 hover:bg-zinc-100 h-10 px-5 text-sm font-medium rounded-xl shadow-lg shadow-white/10 transition-all duration-200 hover:shadow-xl hover:shadow-white/20">
                    Dashboard
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" className="text-zinc-400 hover:text-white h-10 px-4 text-sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-white text-zinc-900 hover:bg-zinc-100 h-10 px-5 text-sm font-medium rounded-xl shadow-lg shadow-white/10 transition-all duration-200 hover:shadow-xl hover:shadow-white/20">
                      Get Started
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
          <motion.div
            className="w-full px-6 py-20 md:py-32"
            style={{ opacity: heroOpacity, y: heroY }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left: Content */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                >
                  {/* Badge */}
                  <motion.div
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-8"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                    </span>
                    <span className="text-sm text-indigo-300 font-medium">Powered by Solana &amp; ShadowWire</span>
                  </motion.div>

                  {/* Headline */}
                  <motion.h1
                    variants={fadeInUp}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1] tracking-tight mb-8"
                  >
                    Get paid for{' '}
                    <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        anonymous
                      </span>
                      <motion.span
                        className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                      />
                    </span>{' '}
                    questions
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p
                    variants={fadeInUp}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-lg"
                  >
                    Creators set their price. Fans pay to ask anything.
                    <span className="text-zinc-300"> Zero wallet tracking through ZK proofs.</span>
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    variants={fadeInUp}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 mb-10"
                  >
                    {ready && authenticated ? (
                      <Link href="/dashboard">
                        <Button className="h-14 px-8 text-base font-medium rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 group">
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/login">
                        <Button className="h-14 px-8 text-base font-medium rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 group">
                          Start as Creator
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
                    <Link href="/creators">
                      <Button variant="outline" className="h-14 px-8 text-base font-medium rounded-2xl border-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-white/5 hover:border-zinc-500 transition-all duration-300">
                        Browse Creators
                      </Button>
                    </Link>
                  </motion.div>

                  {/* Trust Indicators */}
                  <motion.div
                    variants={fadeInUp}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500"
                  >
                    {[
                      'No account to ask',
                      'Instant payments',
                      'Zero tracking',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Right: Interactive Demo */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative hidden lg:block"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-indigo-500/20 rounded-3xl blur-3xl" />

                  {/* Main card */}
                  <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 border border-zinc-700/50 p-8 backdrop-blur-xl">
                    {/* Mock question interface */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
                        <div>
                          <p className="font-semibold text-white">@cryptoexpert</p>
                          <p className="text-sm text-zinc-500">5 SOL per question</p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-zinc-900/80 border border-zinc-700/50 p-4 mb-4">
                        <p className="text-zinc-400 text-sm mb-2">Your question</p>
                        <p className="text-white">What's your take on the next Solana catalyst? Any alpha you can share?</p>
                      </div>

                      <motion.div
                        className="flex items-center gap-2 text-sm"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Lock className="h-4 w-4 text-indigo-400" />
                        <span className="text-indigo-300">Your wallet will be hidden</span>
                      </motion.div>
                    </div>

                    {/* Access code preview */}
                    <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 text-center">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Your Access Code</p>
                      <motion.p
                        className="text-2xl font-mono text-white tracking-[0.15em] font-medium"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        XKCD-M4NK-9P2Q
                      </motion.p>
                    </div>

                    {/* Floating badges */}
                    <motion.div
                      className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="flex items-center gap-1.5">
                        <Shield className="h-3 w-3" />
                        100% Private
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="h-6 w-6 text-zinc-600" />
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 border-t border-zinc-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '10K+', label: 'Questions Asked', icon: MessageSquare },
                { value: '500+', label: 'Active Creators', icon: Users },
                { value: '$50K+', label: 'Creator Earnings', icon: DollarSign },
                { value: '100%', label: 'Anonymous', icon: EyeOff },
              ].map((stat, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <p className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</p>
                    <p className="text-sm text-zinc-500">{stat.label}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 md:py-32 px-6 border-t border-zinc-800/50">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16 md:mb-20">
              <p className="text-sm text-indigo-400 font-medium mb-4 uppercase tracking-wider">Simple Process</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">How it works</h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto">Three simple steps to ask anything, completely anonymously</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 md:gap-6">
              {[
                {
                  step: '01',
                  icon: MessageSquare,
                  title: 'Find & Ask',
                  description: 'Browse creators. Pick a topic. Write your question. No signup, no email, no friction.',
                  gradient: 'from-blue-500 to-indigo-500',
                },
                {
                  step: '02',
                  icon: Wallet,
                  title: 'Pay Anonymously',
                  description: 'Connect your Solana wallet. Pay the fee. ShadowWire hides your wallet automatically.',
                  gradient: 'from-indigo-500 to-purple-500',
                },
                {
                  step: '03',
                  icon: Lock,
                  title: 'Save Your Code',
                  description: 'Get a unique access code. Use it anytime to check if the creator replied to you.',
                  gradient: 'from-purple-500 to-pink-500',
                },
              ].map((item, index) => (
                <AnimatedSection key={item.step} delay={index * 0.15}>
                  <div className="group relative h-full">
                    {/* Connection line */}
                    {index < 2 && (
                      <div className="hidden md:block absolute top-24 left-[calc(100%)] w-full h-px">
                        <div className="w-[calc(100%-48px)] h-px bg-gradient-to-r from-zinc-700 via-zinc-600 to-transparent mx-auto" />
                      </div>
                    )}

                    <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-800/50 p-8 h-full transition-all duration-500 group-hover:border-zinc-700/80 group-hover:bg-zinc-800/30">
                      {/* Step number */}
                      <div className="text-8xl font-bold text-zinc-800/30 absolute top-2 right-4 select-none group-hover:text-zinc-700/30 transition-colors">
                        {item.step}
                      </div>

                      {/* Icon */}
                      <motion.div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <item.icon className="h-7 w-7 text-white" />
                      </motion.div>

                      <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                      <p className="text-zinc-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 md:py-32 px-6 border-t border-zinc-800/50 bg-gradient-to-b from-transparent via-zinc-900/50 to-transparent">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16 md:mb-20">
              <p className="text-sm text-indigo-400 font-medium mb-4 uppercase tracking-wider">Why OnlyAnon</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Built for privacy</h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto">Every feature designed to protect your identity while enabling honest conversations</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Fingerprint,
                  title: 'Zero-Knowledge Proofs',
                  description: 'ShadowWire uses ZK technology to verify payments without revealing the sender.',
                  color: 'indigo',
                },
                {
                  icon: Zap,
                  title: 'Instant Settlement',
                  description: 'Payments settle in seconds on Solana. No waiting, no pending transactions.',
                  color: 'yellow',
                },
                {
                  icon: Globe,
                  title: 'Any Wallet Works',
                  description: 'Phantom, Solflare, Backpack, Ledger - connect whatever Solana wallet you have.',
                  color: 'emerald',
                },
                {
                  icon: Shield,
                  title: 'No Account Required',
                  description: 'Ask questions without signing up. Just connect wallet, pay, and go.',
                  color: 'purple',
                },
                {
                  icon: DollarSign,
                  title: 'SOL & USDC',
                  description: 'Creators choose their currency. Pay with SOL for volatility or USDC for stability.',
                  color: 'blue',
                },
                {
                  icon: Clock,
                  title: 'No Time Limits',
                  description: 'Your access code never expires. Check for replies whenever you want.',
                  color: 'orange',
                },
              ].map((feature, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="group p-6 rounded-2xl bg-gradient-to-b from-zinc-800/30 to-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700/80 transition-all duration-300 h-full">
                    <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-5 w-5 text-${feature.color}-400`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Deep Dive */}
        <section className="py-24 md:py-32 px-6 border-t border-zinc-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <AnimatedSection>
                <p className="text-sm text-indigo-400 font-medium mb-4 uppercase tracking-wider">The Technology</p>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
                  ShadowWire makes you invisible
                </h2>
                <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                  Traditional payments leave a trail. Every transaction links your wallet to the recipient.
                  ShadowWire breaks that chain using zero-knowledge proofs - cryptographic magic that proves
                  you paid without revealing who you are.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: EyeOff, text: 'Wallet address never exposed to creators' },
                    { icon: CircuitBoard, text: 'ZK proofs verify payment authenticity' },
                    { icon: Cpu, text: 'Built on Solana for speed and low fees' },
                    { icon: Lock, text: 'Open source and auditable' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-indigo-400" />
                      </div>
                      <span className="text-zinc-300">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="relative">
                  {/* Animated flow diagram */}
                  <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-8">
                    <div className="space-y-6">
                      {/* You */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <Eye className="h-7 w-7 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Your Wallet</p>
                          <p className="text-sm text-zinc-500">8xK3...mN9q</p>
                        </div>
                      </div>

                      {/* Arrow down */}
                      <div className="flex justify-center">
                        <motion.div
                          animate={{ y: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="h-6 w-6 text-indigo-500 rotate-90" />
                        </motion.div>
                      </div>

                      {/* ShadowWire */}
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                          <Sparkles className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">ShadowWire</p>
                          <p className="text-sm text-indigo-300">ZK Anonymization Layer</p>
                        </div>
                      </div>

                      {/* Arrow down */}
                      <div className="flex justify-center">
                        <motion.div
                          animate={{ y: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        >
                          <ArrowRight className="h-6 w-6 text-indigo-500 rotate-90" />
                        </motion.div>
                      </div>

                      {/* Creator */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <EyeOff className="h-7 w-7 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Creator Sees</p>
                          <p className="text-sm text-emerald-400">??? (Anonymous)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Testimonials / Use Cases */}
        <section className="py-24 md:py-32 px-6 border-t border-zinc-800/50 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16 md:mb-20">
              <p className="text-sm text-indigo-400 font-medium mb-4 uppercase tracking-wider">Use Cases</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Who uses OnlyAnon?</h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto">From crypto traders to therapists - anyone who values honest, private conversations</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Crypto Influencers',
                  description: 'Get honest questions about your calls without revealing who\'s asking. No more awkward public callouts.',
                  gradient: 'from-orange-500/20 to-red-500/20',
                },
                {
                  title: 'Coaches & Mentors',
                  description: 'Offer paid advice sessions. Mentees can ask sensitive questions without judgment.',
                  gradient: 'from-blue-500/20 to-indigo-500/20',
                },
                {
                  title: 'Tech Experts',
                  description: 'Monetize your expertise. Answer technical questions from engineers who don\'t want to look dumb at work.',
                  gradient: 'from-emerald-500/20 to-teal-500/20',
                },
                {
                  title: 'Financial Advisors',
                  description: 'Give financial guidance without knowing client portfolios. True blind advice.',
                  gradient: 'from-purple-500/20 to-pink-500/20',
                },
                {
                  title: 'Relationship Experts',
                  description: 'People ask things they\'d never ask in person. Anonymity enables real honesty.',
                  gradient: 'from-pink-500/20 to-rose-500/20',
                },
                {
                  title: 'Industry Insiders',
                  description: 'Share alpha, give advice, or just chat - without your identity attached.',
                  gradient: 'from-amber-500/20 to-orange-500/20',
                },
              ].map((useCase, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className={`p-6 rounded-2xl bg-gradient-to-br ${useCase.gradient} border border-white/5 h-full hover:border-white/10 transition-colors`}>
                    <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed">{useCase.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 md:py-32 px-6 border-t border-zinc-800/50">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <p className="text-sm text-indigo-400 font-medium mb-4 uppercase tracking-wider">FAQ</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Questions?</h2>
              <p className="text-lg text-zinc-500">Everything you need to know about OnlyAnon</p>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="rounded-2xl bg-gradient-to-b from-zinc-800/30 to-zinc-900/30 border border-zinc-800/50 px-8">
                {faqs.map((faq, i) => (
                  <FAQItem
                    key={i}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === i}
                    onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  />
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Creator CTA */}
        <section className="py-24 md:py-32 px-6 border-t border-zinc-800/50">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="relative overflow-hidden rounded-3xl">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-indigo-600/30" />
                <motion.div
                  className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[150px]"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[120px]"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] }}
                  transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                />

                {/* Border */}
                <div className="absolute inset-0 rounded-3xl border border-indigo-500/30" />

                {/* Content */}
                <div className="relative px-8 md:px-16 py-16 md:py-24 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="text-sm text-indigo-300 font-medium mb-4 uppercase tracking-wider">For Creators</p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                      Turn your expertise<br />into income
                    </h2>
                    <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                      Get paid directly in SOL or USDC. Set your own prices.
                      No middleman, no delays, no fees hidden in the fine print.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                      {ready && authenticated ? (
                        <Link href="/dashboard">
                          <Button className="h-14 px-8 text-lg font-medium rounded-2xl bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 group">
                            Go to Dashboard
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/login">
                          <Button className="h-14 px-8 text-lg font-medium rounded-2xl bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 group">
                            Create Your Page
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-300">
                      {[
                        { icon: Check, text: 'Keep 95% of payments' },
                        { icon: Zap, text: 'Instant payouts' },
                        { icon: Star, text: 'No monthly fees' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-indigo-400" />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              {/* Logo & Description */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-white text-xl">OnlyAnon</span>
                </div>
                <p className="text-zinc-500 leading-relaxed max-w-sm mb-6">
                  The anonymous Q&A platform where privacy isn't optional - it's guaranteed.
                  Built on Solana with ShadowWire technology.
                </p>
                <div className="flex items-center gap-4">
                  <a href="https://twitter.com/onlyanon" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">
                    <Twitter className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-3">
                  {[
                    { href: '/creators', label: 'Explore Creators' },
                    { href: '/check', label: 'Check Reply' },
                    { href: '#how-it-works', label: 'How it Works' },
                    { href: '#features', label: 'Features' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-zinc-500 hover:text-white transition-colors text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Creators</h4>
                <ul className="space-y-3">
                  {[
                    { href: '/login', label: 'Get Started' },
                    { href: '/dashboard', label: 'Dashboard' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-zinc-500 hover:text-white transition-colors text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-zinc-600">
                © 2025 OnlyAnon. Built with ShadowWire on Solana.
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <span>Powered by</span>
                <span className="text-indigo-400 font-medium">ShadowWire</span>
                <span>×</span>
                <span className="text-emerald-400 font-medium">Solana</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
