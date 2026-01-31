'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Wallet, Copy, Check } from 'lucide-react';
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

      // Get creator data
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

      // Submit question to backend
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!offering) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Offering not found</p>
          <Link href={`/${username}`}>
            <Button variant="outline" className="border-gray-700">
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const creator = offering.creators;
  const avatarUrl = creator.avatar_url?.replace('_normal', '');

  // Success state - show access code
  if (step === 'success' && accessCode) {
    return (
      <div className="min-h-screen bg-black">
        <header className="border-b border-gray-800">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Link href="/" className="text-xl font-bold text-white">
              OnlyAnon
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-500" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">Question Submitted!</h1>
              <p className="text-gray-400 mb-8">
                Your question has been sent anonymously to {creator.display_name}
              </p>

              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-400 mb-3">Your Access Code</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-2xl font-mono text-purple-400 tracking-wider">
                    {accessCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAccessCode}
                    className="text-gray-400 hover:text-white"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8 text-left">
                <p className="text-yellow-500 text-sm font-medium mb-1">
                  Save this code!
                </p>
                <p className="text-yellow-500/80 text-sm">
                  This is the ONLY way to check for your reply. We dont store any link to your identity.
                </p>
              </div>

              <div className="flex gap-4">
                <Link href="/check" className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Check for Reply
                  </Button>
                </Link>
                <Link href={`/${username}`} className="flex-1">
                  <Button variant="outline" className="w-full border-gray-700 text-gray-400">
                    Back to Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${username}`} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Creator Info */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar>
            <AvatarImage src={avatarUrl || undefined} alt={creator.display_name} />
            <AvatarFallback className="bg-gray-800 text-white">
              {creator.display_name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-white">{offering.title}</h1>
            <p className="text-gray-400">@{creator.twitter_username}</p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-purple-600/10 border border-purple-600/20 mb-6">
          <Shield className="h-4 w-4 text-purple-400" />
          <p className="text-sm text-purple-300">
            Your wallet address will be hidden from {creator.display_name}
          </p>
        </div>

        {/* Question Form */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="p-6">
            {offering.description && (
              <p className="text-gray-400 text-sm mb-4">{offering.description}</p>
            )}

            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="bg-gray-800 border-gray-700 text-white min-h-[150px] mb-4"
              maxLength={1000}
              disabled={step === 'processing'}
            />

            <div className="flex justify-between text-sm text-gray-500">
              <span>{question.length}/1000</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        {fees && (
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardContent className="p-6">
              <h3 className="text-white font-medium mb-4">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Price</span>
                  <span className="text-white">{offering.price} {offering.token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network Fee ({(fees.feePercentage * 100).toFixed(1)}%)</span>
                  <span className="text-white">{fees.fee.toFixed(6)} {offering.token}</span>
                </div>
                <hr className="border-gray-700 my-2" />
                <div className="flex justify-between font-medium">
                  <span className="text-gray-300">Total</span>
                  <span className="text-purple-400">{fees.total.toFixed(6)} {offering.token}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        {!connected ? (
          <div className="text-center">
            <p className="text-gray-400 mb-4">Connect your wallet to continue</p>
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
          </div>
        ) : step === 'write' ? (
          <Button
            onClick={() => setStep('confirm')}
            disabled={!question.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 h-12"
          >
            Continue to Payment
          </Button>
        ) : step === 'confirm' ? (
          <div className="space-y-4">
            <Button
              onClick={handlePay}
              disabled={isTransferring}
              className="w-full bg-purple-600 hover:bg-purple-700 h-12"
            >
              {isTransferring ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </span>
              ) : (
                `Pay ${offering.price} ${offering.token}`
              )}
            </Button>
            <Button
              onClick={() => setStep('write')}
              variant="ghost"
              className="w-full text-gray-400"
              disabled={isTransferring}
            >
              Go Back
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Processing your payment...</p>
          </div>
        )}
      </main>
    </div>
  );
}
