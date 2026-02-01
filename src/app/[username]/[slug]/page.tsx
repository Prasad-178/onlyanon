'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Shield, Copy, Check, Loader2, Sparkles, Lock, Wallet, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
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

  if (isLoading) {
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

  if (!offering) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-zinc-600" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Offering not found</h1>
          <p className="text-zinc-500 text-sm mb-6">This offering may have been removed or the URL is incorrect.</p>
          <Link href={`/${username}`}>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-11 px-6 rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const creator = offering.creators;
  const avatarUrl = creator.avatar_url?.replace('_normal', '');

  // Success state
  if (step === 'success' && accessCode) {
    return (
      <div className="min-h-screen bg-[#09090b] overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/[0.05] rounded-full blur-[100px]" />
        </div>

        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white text-lg tracking-tight">OnlyAnon</span>
            </Link>
          </div>
        </header>

        <main className="relative z-10 flex items-center justify-center min-h-screen px-6 py-24">
          <div className="w-full max-w-lg">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-indigo-500/10 to-emerald-500/20 rounded-3xl blur-xl opacity-60" />

              <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 border border-zinc-700/50 overflow-hidden">
                {/* Top gradient bar */}
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500" />

                <div className="p-8 md:p-10">
                  {/* Success Icon */}
                  <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20 flex items-center justify-center">
                      <Check className="h-10 w-10 text-emerald-400" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-3">Question Submitted!</h1>
                    <p className="text-zinc-400 leading-relaxed">
                      Your question has been sent anonymously to <span className="text-white font-medium">{creator.display_name}</span>. They'll never know it was you.
                    </p>
                  </div>

                  {/* Access Code Card */}
                  <div className="rounded-xl bg-zinc-900/80 border border-zinc-700/50 p-6 mb-6">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider text-center mb-4">Your Access Code</p>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <code className="text-3xl font-mono text-white tracking-[0.15em] font-medium">
                        {accessCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyAccessCode}
                        className="text-zinc-400 hover:text-white h-10 w-10 p-0 rounded-lg hover:bg-zinc-800"
                      >
                        {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-5 mb-8">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-300 font-medium text-sm mb-1">Save this code now</p>
                        <p className="text-amber-300/70 text-sm">
                          This is your only way to check for a reply. We don't store any link to your identity.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/check">
                      <Button className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                        Check Reply
                      </Button>
                    </Link>
                    <Link href={`/${username}`}>
                      <Button variant="outline" className="w-full h-12 text-base font-medium rounded-xl border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                        Back to Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${username}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>

            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white text-lg tracking-tight">OnlyAnon</span>
            </Link>

            <WalletMultiButton className="!bg-white !text-zinc-900 hover:!bg-zinc-100 !rounded-xl !h-10 !text-sm !font-medium !px-5 !shadow-lg !shadow-white/10" />
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {['Write', 'Confirm', 'Done'].map((label, i) => {
              const stepIndex = step === 'write' ? 0 : step === 'confirm' ? 1 : step === 'processing' ? 1 : 2;
              const isActive = i === stepIndex;
              const isComplete = i < stepIndex;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isComplete ? 'bg-indigo-500 text-white' :
                    isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' :
                    'bg-zinc-800/50 text-zinc-600 border border-zinc-700/50'
                  }`}>
                    {isComplete ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${isActive || isComplete ? 'text-white' : 'text-zinc-600'}`}>
                    {label}
                  </span>
                  {i < 2 && (
                    <div className={`w-12 h-px mx-2 ${isComplete ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Creator Card */}
          <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-5 mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-zinc-700">
                <AvatarImage src={avatarUrl || undefined} alt={creator.display_name} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-300 text-lg">
                  {creator.display_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-white mb-0.5">{offering.title}</h1>
                <p className="text-sm text-zinc-500">@{creator.twitter_username}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-white">{offering.price}</div>
                <div className="text-sm text-zinc-500">{offering.token}</div>
              </div>
            </div>
          </div>

          {/* Privacy Badge */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-6">
            <Shield className="h-5 w-5 text-indigo-400" />
            <p className="text-sm text-indigo-300">
              Your wallet address will be <span className="font-medium">completely hidden</span> from {creator.display_name}
            </p>
          </div>

          {/* Question Form */}
          <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-400 font-medium">Your Question</span>
            </div>

            {offering.description && (
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{offering.description}</p>
            )}

            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here... Be specific to get the best answer."
              className="bg-zinc-900/80 border-zinc-700 text-white text-base placeholder:text-zinc-600 min-h-[160px] mb-3 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl resize-none"
              maxLength={1000}
              disabled={step === 'processing'}
            />

            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-600">
                {question.length}/1000 characters
              </div>
              {question.length > 0 && question.length < 20 && (
                <div className="text-xs text-amber-400">Tip: More detail = better answer</div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          {fees && step !== 'write' && (
            <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-6 mb-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-zinc-400" />
                Payment Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Question Price</span>
                  <span className="text-white font-medium">{offering.price} {offering.token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Network Fee ({(fees.feePercentage * 100).toFixed(1)}%)</span>
                  <span className="text-zinc-400">{fees.fee.toFixed(6)} {offering.token}</span>
                </div>
                <hr className="border-zinc-700/50" />
                <div className="flex justify-between text-base">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white font-semibold">{fees.total.toFixed(6)} {offering.token}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!connected ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-5">
                <Wallet className="h-7 w-7 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">
                Connect any Solana wallet to pay. Your address will be hidden through ShadowWire.
              </p>
              <WalletMultiButton className="!bg-gradient-to-r !from-indigo-500 !to-indigo-600 hover:!from-indigo-400 hover:!to-indigo-500 !text-white !rounded-xl !h-12 !text-base !font-medium !mx-auto !shadow-lg !shadow-indigo-500/20" />
            </div>
          ) : step === 'write' ? (
            <Button
              onClick={() => setStep('confirm')}
              disabled={!question.trim()}
              className="w-full h-14 text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Payment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : step === 'confirm' ? (
            <div className="space-y-3">
              <Button
                onClick={handlePay}
                disabled={isTransferring}
                className="w-full h-14 text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
              >
                {isTransferring ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing Payment...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Pay {offering.price} {offering.token} Anonymously
                  </span>
                )}
              </Button>
              <Button
                onClick={() => setStep('write')}
                variant="ghost"
                className="w-full text-zinc-400 hover:text-white h-12 text-base"
                disabled={isTransferring}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Edit Question
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-5">
                <Loader2 className="h-7 w-7 text-indigo-400 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Processing Payment</h3>
              <p className="text-zinc-500 text-sm">Please wait while we securely process your anonymous payment...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
