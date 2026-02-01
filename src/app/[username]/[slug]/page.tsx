'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Shield, Copy, Check, Loader2, Sparkles, Lock, Wallet, ArrowRight, MessageSquare, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useShadowWireTransfer } from '@/lib/shadowwire/transfer';
import { toast } from 'sonner';

interface Creator {
  id: string;
  twitter_username: string;
  display_name: string;
  avatar_url: string | null;
  wallet_address: string;
}

interface Offering {
  id: string;
  title: string;
  description: string | null;
  price: number;
  token: 'SOL' | 'USDC';
  creators: Creator;
}

const steps = [
  { key: 'write', label: 'Write', icon: MessageSquare },
  { key: 'confirm', label: 'Confirm', icon: Eye },
  { key: 'success', label: 'Done', icon: Check },
];

export default function AskQuestionPage() {
  const params = useParams();
  const username = params.username as string;
  const slug = params.slug as string;

  const { connected, publicKey, signMessage } = useWallet();
  const { executeTransfer, calculateFees, isLoading: isTransferring } = useShadowWireTransfer();

  const [question, setQuestion] = useState('');
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'write' | 'confirm' | 'processing' | 'success'>('write');

  const { data: offering, isLoading } = useQuery({
    queryKey: ['offering', username, slug],
    queryFn: async (): Promise<Offering | null> => {
      const res = await fetch(`/api/offerings?username=${username}`);
      if (!res.ok) return null;
      const data = await res.json();
      const found = data.offerings?.find((o: any) => o.slug === slug);
      if (!found) return null;

      const creatorRes = await fetch(`/api/creators?username=${username}`);
      if (!creatorRes.ok) return null;
      const creatorData = await creatorRes.json();

      return {
        ...found,
        creators: creatorData.creator,
      };
    },
  });

  const fees = offering ? calculateFees(offering.price, offering.token) : null;

  const handlePay = async () => {
    if (!connected || !publicKey || !signMessage || !offering) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!question.trim()) {
      toast.error('Please enter your question');
      return;
    }

    setStep('processing');

    try {
      const result = await executeTransfer({
        senderWallet: publicKey.toBase58(),
        recipientWallet: offering.creators.wallet_address,
        amount: offering.price,
        token: offering.token,
        signMessage,
      });

      if (!result.success || !result.signature) {
        throw new Error(result.error || 'Transfer failed');
      }

      const questionRes = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offering_id: offering.id,
          question_text: question.trim(),
          payment_signature: result.signature,
          payment_amount: offering.price,
          payment_token: offering.token,
        }),
      });

      if (!questionRes.ok) {
        throw new Error('Failed to submit question');
      }

      const questionData = await questionRes.json();
      setAccessCode(questionData.access_code);
      setStep('success');
      toast.success('Question submitted successfully!');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      setStep('confirm');
    }
  };

  const copyAccessCode = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStepIndex = () => {
    if (step === 'write') return 0;
    if (step === 'confirm' || step === 'processing') return 1;
    return 2;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/30 rounded-2xl blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
            <span className="text-zinc-500 text-sm">Loading offering...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-6 border border-zinc-700/50">
            <AlertCircle className="h-9 w-9 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Offering not found</h1>
          <p className="text-zinc-500 mb-8">This offering may have been removed or the URL is incorrect.</p>
          <Link href={`/${username}`}>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-12 px-8 rounded-xl text-base">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const creator = offering.creators;
  const avatarUrl = creator.avatar_url?.replace('_normal', '');
  const stepIndex = getStepIndex();

  // Success state
  if (step === 'success' && accessCode) {
    return (
      <div className="min-h-screen bg-[#09090b] overflow-hidden">
        {/* Celebration background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-indigo-500/5 to-transparent rounded-full blur-[120px]"
          />
          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100, x: Math.random() * 100 - 50 }}
              animate={{
                opacity: [0, 1, 0],
                y: [-100, -300],
                x: Math.random() * 200 - 100,
              }}
              transition={{
                duration: 3,
                delay: i * 0.15,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="absolute bottom-0 left-1/2"
              style={{ left: `${20 + i * 5}%` }}
            >
              <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-emerald-400' : i % 3 === 1 ? 'bg-indigo-400' : 'bg-purple-400'}`} />
            </motion.div>
          ))}
        </div>

        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">OnlyAnon</span>
            </Link>
          </div>
        </header>

        <main className="relative z-10 flex items-center justify-center min-h-screen px-6 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg"
          >
            {/* Success card */}
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/20 via-indigo-500/10 to-emerald-500/20 rounded-[28px] blur-xl" />

              <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 border border-zinc-700/50 overflow-hidden backdrop-blur-sm">
                {/* Animated top bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-emerald-400 origin-left"
                />

                <div className="p-8 md:p-10">
                  {/* Success icon with animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="flex justify-center mb-8"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.4, type: "spring" }}
                        >
                          <Check className="h-12 w-12 text-white stroke-[3]" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mb-8"
                  >
                    <h1 className="text-3xl font-bold text-white mb-3">Question Sent!</h1>
                    <p className="text-zinc-400 leading-relaxed text-lg">
                      Your question was sent anonymously to{' '}
                      <span className="text-white font-semibold">{creator.display_name}</span>
                    </p>
                  </motion.div>

                  {/* Access Code Card - The Hero */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative mb-6"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-lg" />
                    <div className="relative rounded-2xl bg-zinc-900/80 border border-zinc-700/50 p-8">
                      <div className="flex items-center justify-center gap-2 mb-5">
                        <EyeOff className="h-4 w-4 text-indigo-400" />
                        <p className="text-xs text-indigo-400 uppercase tracking-[0.2em] font-semibold">Secret Access Code</p>
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <motion.code
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="text-4xl md:text-5xl font-mono text-white tracking-[0.2em] font-bold"
                        >
                          {accessCode}
                        </motion.code>
                        <motion.button
                          onClick={copyAccessCode}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-3 rounded-xl bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
                        >
                          <AnimatePresence mode="wait">
                            {copied ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Check className="h-5 w-5 text-emerald-400" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copy"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                              >
                                <Copy className="h-5 w-5" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Warning */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-5 mb-8"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-300 font-semibold text-sm mb-1">Save this code now!</p>
                        <p className="text-amber-300/70 text-sm leading-relaxed">
                          This is your only way to check for a reply. We don't store any link to your identity.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Link href="/check">
                      <Button className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40">
                        Check Reply
                      </Button>
                    </Link>
                    <Link href={`/${username}`}>
                      <Button variant="outline" className="w-full h-14 text-base font-semibold rounded-xl border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all">
                        Back to Profile
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${username}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </Link>

            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">OnlyAnon</span>
            </Link>

            <WalletMultiButton className="!bg-white !text-zinc-900 hover:!bg-zinc-100 !rounded-xl !h-10 !text-sm !font-semibold !px-5 !shadow-lg !shadow-white/10" />
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-16 px-6">
        <div className="max-w-xl mx-auto">
          {/* Animated Step Progress */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between relative">
              {/* Progress bar background */}
              <div className="absolute top-5 left-[16%] right-[16%] h-0.5 bg-zinc-800 rounded-full" />
              {/* Progress bar fill */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: stepIndex / 2 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute top-5 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full origin-left"
                style={{ transformOrigin: 'left' }}
              />

              {steps.map((s, i) => {
                const isActive = i === stepIndex;
                const isComplete = i < stepIndex;
                const Icon = s.icon;

                return (
                  <div key={s.key} className="flex flex-col items-center gap-3 relative z-10">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isComplete ? 'rgb(99 102 241)' : isActive ? 'rgb(99 102 241 / 0.2)' : 'rgb(39 39 42)',
                      }}
                      transition={{ duration: 0.3 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isComplete ? 'border-indigo-500' :
                        isActive ? 'border-indigo-500' :
                        'border-zinc-700'
                      }`}
                    >
                      {isComplete ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-300' : 'text-zinc-500'}`} />
                      )}
                    </motion.div>
                    <span className={`text-xs font-medium ${isActive || isComplete ? 'text-white' : 'text-zinc-600'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Creator Card with Glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mb-6"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-indigo-500/20 rounded-2xl blur-lg opacity-60" />
            <div className="relative rounded-xl bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 border border-zinc-700/50 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-5">
                {/* Avatar with glow */}
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-xl blur-md" />
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={creator.display_name}
                      className="relative w-16 h-16 rounded-xl object-cover ring-2 ring-zinc-700"
                    />
                  ) : (
                    <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-zinc-700">
                      <span className="text-2xl font-bold text-white">
                        {creator.display_name[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-white mb-1 truncate">{offering.title}</h1>
                  <p className="text-sm text-zinc-500">by @{creator.twitter_username}</p>
                </div>

                {/* Price badge */}
                <div className="shrink-0 text-right">
                  <div className="inline-flex items-baseline gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-2xl font-bold text-white">{offering.price}</span>
                    <span className="text-sm font-medium text-indigo-400">{offering.token}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Privacy Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 border border-indigo-500/20 mb-6"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-indigo-300 font-medium">
                100% Anonymous Question
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Your wallet address is completely hidden from {creator.display_name}
              </p>
            </div>
          </motion.div>

          {/* Question Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-gradient-to-b from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 p-6 mb-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-zinc-400" />
              </div>
              <span className="text-sm text-zinc-300 font-semibold">Your Question</span>
            </div>

            {offering.description && (
              <p className="text-zinc-500 text-sm mb-4 leading-relaxed pl-11">{offering.description}</p>
            )}

            <div className="relative">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here... Be specific for the best answer."
                className="bg-zinc-900/80 border-zinc-700 text-white text-base placeholder:text-zinc-600 min-h-[180px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl resize-none transition-all duration-200"
                maxLength={1000}
                disabled={step === 'processing'}
              />
              <div className="absolute bottom-4 right-4 text-xs text-zinc-600 font-mono">
                {question.length}/1000
              </div>
            </div>

            <AnimatePresence>
              {question.length > 0 && question.length < 30 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 mt-3 text-xs text-amber-400"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Tip: Add more detail to get a better answer</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Payment Summary - Only on confirm step */}
          <AnimatePresence>
            {fees && step !== 'write' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="rounded-xl bg-gradient-to-b from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-zinc-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">Payment Summary</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Question Price</span>
                      <span className="text-white font-medium">{offering.price} {offering.token}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Protocol Fee ({(fees.feePercentage * 100).toFixed(1)}%)</span>
                      <span className="text-zinc-400">{fees.fee.toFixed(6)} {offering.token}</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-3" />
                    <div className="flex justify-between items-baseline">
                      <span className="text-white font-semibold">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">{fees.total.toFixed(4)}</span>
                        <span className="text-sm text-zinc-400 ml-1.5">{offering.token}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <AnimatePresence mode="wait">
            {!connected ? (
              <motion.div
                key="connect"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-10"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                    <Wallet className="h-8 w-8 text-zinc-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                  Connect any Solana wallet to pay. Your address will be hidden through ShadowWire.
                </p>
                <WalletMultiButton className="!bg-gradient-to-r !from-indigo-500 !to-indigo-600 hover:!from-indigo-400 hover:!to-indigo-500 !text-white !rounded-xl !h-14 !text-base !font-semibold !mx-auto !shadow-xl !shadow-indigo-500/25 !transition-all hover:!shadow-indigo-500/40" />
              </motion.div>
            ) : step === 'write' ? (
              <motion.div
                key="write"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Button
                  onClick={() => setStep('confirm')}
                  disabled={!question.trim()}
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all hover:shadow-indigo-500/40"
                >
                  Continue to Payment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            ) : step === 'confirm' ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <Button
                  onClick={handlePay}
                  disabled={isTransferring}
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Pay {offering.price} {offering.token} Anonymously
                </Button>
                <Button
                  onClick={() => setStep('write')}
                  variant="ghost"
                  className="w-full text-zinc-400 hover:text-white h-12 text-base rounded-xl"
                  disabled={isTransferring}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Edit Question
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Processing Payment</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto">
                  Please wait while we securely process your anonymous payment through ShadowWire...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
