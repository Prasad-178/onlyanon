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
import { ArrowLeft, Shield, Copy, Check, Loader2 } from 'lucide-react';
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
        <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-sm mb-4">Offering not found</p>
          <Link href={`/${username}`}>
            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900">
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
      <div className="min-h-screen bg-[#09090b]">
        <header className="border-b border-zinc-800/50">
          <div className="max-w-2xl mx-auto px-6 h-14 flex items-center">
            <Link href="/" className="font-semibold text-white">OnlyAnon</Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="p-8 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <Check className="h-7 w-7 text-emerald-500" />
            </div>

            <h1 className="text-xl font-semibold text-white mb-2">Question Submitted</h1>
            <p className="text-sm text-zinc-500 mb-8">
              Your question has been sent anonymously to {creator.display_name}
            </p>

            <div className="p-5 rounded-lg bg-zinc-800/50 mb-5">
              <p className="text-xs text-zinc-500 mb-3">Your Access Code</p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-xl font-mono text-white tracking-wider">
                  {accessCode}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAccessCode}
                  className="text-zinc-500 hover:text-white h-8 w-8 p-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-8 text-left">
              <p className="text-amber-500 text-sm font-medium mb-1">
                Save this code
              </p>
              <p className="text-amber-500/70 text-xs">
                This is your only way to check for a reply. We store no link to your identity.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/check" className="flex-1">
                <Button className="w-full bg-white text-black hover:bg-zinc-200 h-10 text-sm">
                  Check for Reply
                </Button>
              </Link>
              <Link href={`/${username}`} className="flex-1">
                <Button variant="outline" className="w-full border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-10 text-sm">
                  Back to Profile
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href={`/${username}`} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <WalletMultiButton className="!bg-white !text-black hover:!bg-zinc-200 !rounded-lg !h-9 !text-sm !font-medium !px-4" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Creator Info */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl || undefined} alt={creator.display_name} />
            <AvatarFallback className="bg-zinc-800 text-zinc-400">
              {creator.display_name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold text-white">{offering.title}</h1>
            <p className="text-sm text-zinc-500">@{creator.twitter_username}</p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800 mb-6">
          <Shield className="h-4 w-4 text-zinc-400" />
          <p className="text-sm text-zinc-400">
            Your wallet address will be hidden from {creator.display_name}
          </p>
        </div>

        {/* Question Form */}
        <div className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 mb-5">
          {offering.description && (
            <p className="text-zinc-500 text-sm mb-4">{offering.description}</p>
          )}

          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="bg-zinc-800/50 border-zinc-700 text-white text-sm placeholder:text-zinc-600 min-h-[140px] mb-3 focus:border-zinc-600"
            maxLength={1000}
            disabled={step === 'processing'}
          />

          <div className="text-xs text-zinc-600">
            {question.length}/1000
          </div>
        </div>

        {/* Payment Summary */}
        {fees && (
          <div className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 mb-5">
            <h3 className="text-sm font-medium text-white mb-4">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Price</span>
                <span className="text-white">{offering.price} {offering.token}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Network Fee ({(fees.feePercentage * 100).toFixed(1)}%)</span>
                <span className="text-white">{fees.fee.toFixed(6)} {offering.token}</span>
              </div>
              <hr className="border-zinc-800 my-2" />
              <div className="flex justify-between font-medium">
                <span className="text-zinc-300">Total</span>
                <span className="text-white">{fees.total.toFixed(6)} {offering.token}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!connected ? (
          <div className="text-center">
            <p className="text-zinc-500 text-sm mb-4">Connect your wallet to continue</p>
            <WalletMultiButton className="!bg-white !text-black hover:!bg-zinc-200 !rounded-lg !h-10 !text-sm !font-medium !mx-auto" />
          </div>
        ) : step === 'write' ? (
          <Button
            onClick={() => setStep('confirm')}
            disabled={!question.trim()}
            className="w-full bg-white text-black hover:bg-zinc-200 h-10 text-sm font-medium disabled:opacity-50"
          >
            Continue to Payment
          </Button>
        ) : step === 'confirm' ? (
          <div className="space-y-3">
            <Button
              onClick={handlePay}
              disabled={isTransferring}
              className="w-full bg-white text-black hover:bg-zinc-200 h-10 text-sm font-medium"
            >
              {isTransferring ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                `Pay ${offering.price} ${offering.token}`
              )}
            </Button>
            <Button
              onClick={() => setStep('write')}
              variant="ghost"
              className="w-full text-zinc-500 hover:text-white h-10 text-sm"
              disabled={isTransferring}
            >
              Go Back
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Processing your payment...</p>
          </div>
        )}
      </main>
    </div>
  );
}
