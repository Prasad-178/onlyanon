'use client';

import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  MessageSquare,
  Shield,
  Wallet,
  ArrowRight,
  Zap,
  Lock,
  Globe,
  Check,
  ChevronRight,
  ChevronDown,
  EyeOff,
  DollarSign,
  Clock,
  Fingerprint,
} from 'lucide-react';

// Custom Logo Component
function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="innerGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logoGradient)" />
      <path
        d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 4c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z"
        fill="url(#innerGradient)"
        opacity="0.9"
      />
      <circle cx="20" cy="20" r="4" fill="white" />
      <path
        d="M20 16v-4M20 28v-4M16 20h-4M28 20h-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
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


// Animated Flow Diagram with real question example
function AnimatedFlowDiagram() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-4 rounded-3xl"
        animate={{
          background: [
            'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 70%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative rounded-2xl bg-zinc-900/80 border border-zinc-700/50 p-6 backdrop-blur-sm overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-indigo-400/30 rounded-full"
              initial={{ x: `${Math.random() * 100}%`, y: '100%' }}
              animate={{
                y: ['-10%'],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 4,
                delay: i * 0.6,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <div className="relative space-y-4">
          {/* Question being sent */}
          <div className="mb-4 p-3 rounded-lg bg-zinc-800/60 border border-zinc-700/40">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Question</p>
            <p className="text-sm text-zinc-300">"What's your honest opinion on ETH vs SOL long term?"</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
              <span className="text-indigo-400 font-medium">5 SOL</span>
              <span>•</span>
              <span>to @aeyakovenko</span>
            </div>
          </div>

          {/* Step 1: Your Wallet */}
          <motion.div
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30"
            animate={{
              opacity: activeStep === 0 ? 1 : 0.5,
              borderColor: activeStep === 0 ? '#6366f1' : 'rgba(63, 63, 70, 0.3)'
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-700/50 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Your Wallet</p>
              <p className="text-xs font-mono text-zinc-500 truncate">8xK3nPq...mN9qW2</p>
            </div>
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-2 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-medium"
                >
                  Sending...
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Arrow with data ball */}
          <div className="flex justify-center">
            <div className="relative h-8 w-px bg-gradient-to-b from-zinc-700 to-zinc-700">
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"
                animate={{
                  y: activeStep === 0 ? [0, 32] : -4,
                  opacity: activeStep === 0 ? [1, 0] : 0
                }}
                transition={{ duration: 0.6, ease: "easeIn" }}
              />
            </div>
          </div>

          {/* Step 2: ShadowWire */}
          <motion.div
            className="p-4 rounded-xl border relative overflow-hidden"
            animate={{
              borderColor: activeStep === 1 ? '#6366f1' : 'rgba(99, 102, 241, 0.2)',
              background: activeStep === 1
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Scanning lines animation */}
            {activeStep === 1 && (
              <motion.div className="absolute inset-0 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-full w-px bg-gradient-to-b from-transparent via-indigo-400/40 to-transparent"
                    style={{ left: `${20 + i * 30}%` }}
                    animate={{ y: ['-100%', '200%'] }}
                    transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            )}
            <div className="relative flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0"
                animate={activeStep === 1 ? {
                  boxShadow: ['0 8px 30px -8px rgba(99, 102, 241, 0.3)', '0 8px 30px -8px rgba(99, 102, 241, 0.6)', '0 8px 30px -8px rgba(99, 102, 241, 0.3)']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Fingerprint className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-white">ShadowWire Protocol</p>
                <motion.p
                  className="text-xs"
                  animate={{ color: activeStep === 1 ? '#a5b4fc' : '#6366f1' }}
                >
                  {activeStep === 1 ? 'Anonymizing transaction...' : 'Zero-knowledge proof layer'}
                </motion.p>
              </div>
            </div>
            {/* Processing indicator */}
            <AnimatePresence>
              {activeStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-indigo-500/20"
                >
                  <div className="flex items-center gap-2 text-xs text-indigo-300">
                    <motion.div
                      className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Generating ZK proof • Mixing transaction</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Arrow with data ball */}
          <div className="flex justify-center">
            <div className="relative h-8 w-px bg-gradient-to-b from-zinc-700 to-zinc-700">
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                animate={{
                  y: activeStep === 2 ? [0, 32] : -4,
                  opacity: activeStep === 2 ? [1, 0] : 0
                }}
                transition={{ duration: 0.6, ease: "easeIn" }}
              />
            </div>
          </div>

          {/* Step 3: Creator Receives */}
          <motion.div
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30"
            animate={{
              opacity: activeStep === 2 ? 1 : 0.5,
              borderColor: activeStep === 2 ? '#10b981' : 'rgba(63, 63, 70, 0.3)'
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              T
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">toly receives</p>
              <p className="text-xs text-zinc-500">Sender: <span className="text-emerald-400 font-mono">Anonymous</span></p>
            </div>
            <AnimatePresence mode="wait">
              {activeStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-medium flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Delivered
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { authenticated, ready } = usePrivy();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <div className="min-h-screen bg-[#09090b] overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Floating gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingOrb className="absolute -top-40 left-1/4 w-[800px] h-[800px] bg-indigo-500/[0.07] rounded-full blur-[150px]" delay={0} />
        <FloatingOrb className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-purple-500/[0.05] rounded-full blur-[120px]" delay={2} />
        <FloatingOrb className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/[0.04] rounded-full blur-[100px]" delay={4} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl">
        <motion.div
          className="mx-auto max-w-7xl px-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Logo className="w-9 h-9" />
              <span className="font-bold text-white text-lg tracking-tight">OnlyAnon</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: '/creators', label: 'Explore' },
                { href: '#how-it-works', label: 'How it works' },
                { href: '/check', label: 'Check Reply' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {ready && authenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-white text-zinc-900 hover:bg-zinc-100 h-9 px-4 text-sm font-medium rounded-lg">
                    Dashboard <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" className="text-zinc-400 hover:text-white h-9 px-4 text-sm">Sign In</Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-white text-zinc-900 hover:bg-zinc-100 h-9 px-4 text-sm font-medium rounded-lg">
                      Get Started <ArrowRight className="ml-1 h-4 w-4" />
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
        <section ref={heroRef} className="relative pt-24 pb-20 md:pt-32 md:pb-32">
          <motion.div className="px-6" style={{ opacity: heroOpacity, y: heroY }}>
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left: Content */}
                <motion.div initial="hidden" animate="visible" variants={stagger}>
                  <motion.div variants={fadeInUp} transition={{ duration: 0.6 }} className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                    </span>
                    <span className="text-sm text-indigo-300 font-medium">Powered by ShadowWire</span>
                  </motion.div>

                  <motion.h1 variants={fadeInUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                    Get paid for{' '}
                    <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">anonymous</span>
                      <motion.span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.8 }} />
                    </span>{' '}
                    questions
                  </motion.h1>

                  <motion.p variants={fadeInUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg sm:text-xl text-zinc-400 leading-relaxed mb-8 max-w-lg">
                    Creators set their price. Fans pay to ask anything. <span className="text-zinc-300">Wallet addresses hidden through ZK proofs.</span>
                  </motion.p>

                  <motion.div variants={fadeInUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 mb-8">
                    {ready && authenticated ? (
                      <Link href="/dashboard">
                        <Button className="h-12 px-6 text-base font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 group">
                          Go to Dashboard <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/login">
                        <Button className="h-12 px-6 text-base font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 group">
                          Start as Creator <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    )}
                    <Link href="/creators">
                      <Button variant="outline" className="h-12 px-6 text-base font-medium rounded-xl border-zinc-700 text-zinc-300 hover:text-white hover:bg-white/5 hover:border-zinc-600">
                        Browse Creators
                      </Button>
                    </Link>
                  </motion.div>

                  <motion.div variants={fadeInUp} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500">
                    {['No account to ask', 'Instant payments', 'Zero tracking'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Right: Demo Card - Creator Profile */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-indigo-500/20 rounded-3xl blur-2xl" />
                  <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-700/50 overflow-hidden backdrop-blur-xl p-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                        T
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-lg flex items-center gap-2">
                          toly
                          <svg className="h-4 w-4 text-[#1D9BF0]" viewBox="0 0 22 22" fill="currentColor"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>
                        </p>
                        <p className="text-sm text-zinc-500">@aeyakovenko</p>
                        <p className="text-zinc-400 text-xs mt-1">Co-founder of Solana</p>
                      </div>
                    </div>

                    {/* Offering Card */}
                    <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Ask Me Anything</span>
                        <span className="text-sm font-bold text-white">5 SOL</span>
                      </div>
                      <p className="text-zinc-300 text-sm">Questions about Solana, crypto, building, life advice...</p>
                    </div>

                    <motion.div className="flex items-center gap-2 text-xs" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                      <Lock className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-indigo-300">Your wallet will be hidden from toly</span>
                    </motion.div>

                    <motion.div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Anonymous
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator at bottom of hero */}
          <motion.div className="flex justify-center mt-16 md:mt-24" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="h-6 w-6 text-zinc-600" />
          </motion.div>
        </section>

        {/* How It Works - Horizontal Timeline */}
        <section id="how-it-works" className="py-24 md:py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">How it works</h2>
              <p className="text-zinc-500 max-w-lg mx-auto">Three steps to complete anonymity</p>
            </AnimatedSection>

            {/* Timeline */}
            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

              <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                {[
                  { step: '1', icon: MessageSquare, title: 'Find & Ask', desc: 'Browse creators, pick a topic, write your question. No signup needed.' },
                  { step: '2', icon: Wallet, title: 'Pay Anonymously', desc: 'Connect any Solana wallet. ShadowWire hides your identity automatically.' },
                  { step: '3', icon: Lock, title: 'Save Your Code', desc: 'Get a unique access code to check for replies anytime.' },
                ].map((item, i) => (
                  <AnimatedSection key={i} delay={i * 0.15}>
                    <div className="text-center">
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20 relative"
                        whileHover={{ scale: 1.05, rotate: 3 }}
                      >
                        <item.icon className="h-7 w-7 text-white" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-900 border-2 border-indigo-500 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {item.step}
                        </div>
                      </motion.div>
                      <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* The Technology - Two column with animated diagram */}
        <section className="py-24 md:py-32 px-6 border-t border-zinc-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <AnimatedSection>
                <p className="text-sm text-indigo-400 font-medium mb-3 uppercase tracking-wider">The Technology</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-5">
                  ShadowWire makes you invisible
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-8">
                  Traditional payments leave a trail. Every transaction links your wallet to the recipient.
                  ShadowWire breaks that chain using zero-knowledge proofs - cryptographic magic that proves
                  you paid without revealing who you are.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: EyeOff, text: 'Wallet address never exposed to creators' },
                    { icon: Fingerprint, text: 'ZK proofs verify payment authenticity' },
                    { icon: Zap, text: 'Built on Solana for speed and low fees' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-indigo-400" />
                      </div>
                      <span className="text-zinc-300 text-sm">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <AnimatedFlowDiagram />
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Features - Stunning Bento Grid */}
        <section className="py-24 md:py-32 px-6 border-t border-zinc-800/50 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/[0.03] rounded-full blur-[120px]" />
          </div>

          <div className="max-w-6xl mx-auto relative">
            <AnimatedSection className="text-center mb-16">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs text-indigo-300 font-medium tracking-wide">PRIVACY FIRST</span>
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                Built for <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">privacy</span>
              </h2>
              <p className="text-zinc-500 max-w-md mx-auto">Every feature designed to protect your identity</p>
            </AnimatedSection>

            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-4 md:gap-5">
              {/* Hero Card - Zero Knowledge Proofs */}
              <AnimatedSection className="col-span-12 md:col-span-7 row-span-2" delay={0.1}>
                <motion.div
                  className="relative h-full min-h-[320px] md:min-h-[400px] rounded-2xl overflow-hidden group cursor-default"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-br from-indigo-500/50 via-purple-500/30 to-indigo-500/50">
                    <div className="absolute inset-0 rounded-2xl bg-[#0c0c0f]" />
                  </div>

                  {/* Animated gradient overlay on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                    }}
                  />

                  <div className="relative h-full p-6 md:p-8 flex flex-col">
                    {/* Floating orbs */}
                    <div className="absolute top-8 right-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-12 right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />

                    {/* Icon with animated ring */}
                    <div className="relative mb-6">
                      <motion.div
                        className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25"
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Fingerprint className="h-7 w-7 text-white" />
                      </motion.div>
                      <motion.div
                        className="absolute -inset-2 rounded-2xl border border-indigo-500/30"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>

                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">Zero-Knowledge Proofs</h3>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6 max-w-md">
                      Cryptographic verification that proves you paid without revealing who you are. Your wallet stays completely invisible.
                    </p>

                    {/* Animated visualization */}
                    <div className="mt-auto">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-zinc-400" />
                          </div>
                          <div className="text-xs">
                            <div className="text-zinc-500">Your wallet</div>
                            <div className="text-zinc-300 font-mono">8xK3...mN9q</div>
                          </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                          <motion.div className="flex items-center gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                              />
                            ))}
                          </motion.div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs text-right">
                            <div className="text-zinc-500">They see</div>
                            <div className="text-emerald-400 font-medium">Anonymous</div>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <EyeOff className="h-4 w-4 text-emerald-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>

              {/* Instant Settlement */}
              <AnimatedSection className="col-span-6 md:col-span-5" delay={0.2}>
                <motion.div
                  className="relative h-full min-h-[180px] rounded-2xl p-px overflow-hidden group cursor-default"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/50 to-zinc-800/30 group-hover:from-indigo-500/30 group-hover:to-purple-500/20 transition-all duration-500" />
                  <div className="absolute inset-px rounded-2xl bg-[#0c0c0f]" />

                  <div className="relative h-full p-5 flex flex-col">
                    <motion.div
                      className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mb-4 group-hover:border-indigo-500/50 transition-colors"
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Zap className="h-5 w-5 text-amber-400" />
                    </motion.div>
                    <h3 className="text-base font-semibold text-white mb-1">Instant Settlement</h3>
                    <p className="text-zinc-500 text-sm">Seconds on Solana. No waiting.</p>

                    <div className="mt-auto pt-4">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="h-1 flex-1 rounded-full bg-zinc-800 overflow-hidden"
                        >
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                            initial={{ width: '0%' }}
                            whileInView={{ width: '100%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                          />
                        </motion.div>
                        <span className="text-xs text-amber-400 font-medium">~400ms</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>

              {/* Any Wallet */}
              <AnimatedSection className="col-span-6 md:col-span-5" delay={0.3}>
                <motion.div
                  className="relative h-full min-h-[180px] rounded-2xl p-px overflow-hidden group cursor-default"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/50 to-zinc-800/30 group-hover:from-indigo-500/30 group-hover:to-purple-500/20 transition-all duration-500" />
                  <div className="absolute inset-px rounded-2xl bg-[#0c0c0f]" />

                  <div className="relative h-full p-5 flex flex-col">
                    <motion.div
                      className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mb-4 group-hover:border-indigo-500/50 transition-colors"
                    >
                      <Globe className="h-5 w-5 text-indigo-400" />
                    </motion.div>
                    <h3 className="text-base font-semibold text-white mb-1">Any Wallet</h3>
                    <p className="text-zinc-500 text-sm">Phantom, Solflare, Backpack...</p>

                    <div className="mt-auto pt-4 flex gap-2">
                      {['P', 'S', 'B'].map((letter, i) => (
                        <motion.div
                          key={i}
                          className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-xs font-medium text-zinc-400"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          whileHover={{ y: -2 }}
                        >
                          {letter}
                        </motion.div>
                      ))}
                      <motion.div
                        className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-xs text-zinc-500"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9 }}
                      >
                        +
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>

              {/* Bottom row - 3 smaller cards */}
              {[
                { icon: Shield, title: 'No Account', desc: 'Just connect & pay', color: 'text-emerald-400' },
                { icon: DollarSign, title: 'SOL & USDC', desc: 'Your choice of token', color: 'text-green-400' },
                { icon: Clock, title: 'No Expiry', desc: 'Codes last forever', color: 'text-blue-400' },
              ].map((feature, i) => (
                <AnimatedSection key={i} className="col-span-4" delay={0.4 + i * 0.1}>
                  <motion.div
                    className="relative h-full min-h-[140px] rounded-xl p-px overflow-hidden group cursor-default"
                    whileHover={{ scale: 1.03, y: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 group-hover:from-indigo-500/20 group-hover:to-purple-500/10 transition-all duration-500" />
                    <div className="absolute inset-px rounded-xl bg-[#0c0c0f]" />

                    <div className="relative h-full p-4 flex flex-col items-center text-center">
                      <motion.div
                        className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-3 group-hover:border-indigo-500/30 transition-colors"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        <feature.icon className={`h-5 w-5 ${feature.color}`} />
                      </motion.div>
                      <h3 className="text-sm font-semibold text-white mb-0.5">{feature.title}</h3>
                      <p className="text-zinc-500 text-xs">{feature.desc}</p>
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>


        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <Logo className="w-8 h-8" />
                <span className="font-bold text-white">OnlyAnon</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-zinc-500">
                <Link href="/creators" className="hover:text-white transition-colors">Explore</Link>
                <Link href="/check" className="hover:text-white transition-colors">Check Reply</Link>
                <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center text-xs text-zinc-600">
              Built on Solana with ShadowWire
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
