'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Search, Clock, CheckCircle, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { formatAccessCode, validateAccessCode } from '@/lib/utils/access-code';
import { toast } from 'sonner';

interface QuestionData {
  text: string;
  status: string;
  asked_at: string;
  offering_title: string;
  creator_name: string;
  creator_avatar: string | null;
  creator_username: string;
}

interface ReplyData {
  text: string;
  replied_at: string;
}

interface CheckResult {
  question: QuestionData;
  reply: ReplyData | null;
}

export default function CheckReplyPage() {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleCheck = async () => {
    if (!accessCode.trim()) {
      toast.error('Please enter your access code');
      return;
    }

    if (!validateAccessCode(accessCode)) {
      toast.error('Invalid access code format');
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const res = await fetch('/api/replies/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_code: accessCode }),
      });

      if (res.status === 404) {
        setNotFound(true);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to check reply');
      }

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Check error:', error);
      toast.error('Failed to check reply. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    const formatted = formatAccessCode(value.replace(/[^A-Z0-9]/g, ''));
    setAccessCode(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  const avatarUrl = result?.question.creator_avatar?.replace('_normal', '');

  return (
    <div className="min-h-screen bg-[#050508] relative">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link href="/" className="text-lg font-bold text-white">
            Only<span className="text-cyan-400">Anon</span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {!result ? (
          <>
            {/* Search Form */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-3">Check Your Reply</h1>
              <p className="text-zinc-500">
                Enter the access code you received after submitting your question
              </p>
            </div>

            <Card className="bg-[#0c0c12] border-white/5 mb-6">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Input
                    value={accessCode}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="XXXX-XXXX-XXXX"
                    className="bg-[#18181f] border-white/10 text-white text-center text-2xl tracking-[0.2em] font-mono h-16 placeholder:text-zinc-700 focus:border-cyan-500/50"
                    maxLength={14}
                  />

                  <Button
                    onClick={handleCheck}
                    disabled={isLoading || !accessCode.trim()}
                    className="w-full gradient-primary text-white hover:opacity-90 h-12 text-base font-medium"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Check for Reply
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Not Found */}
            {notFound && (
              <Card className="bg-red-500/10 border-red-500/20 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="text-red-400">
                      Access code not found. Please check and try again.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Text */}
            <div className="text-center text-zinc-600 text-sm space-y-1">
              <p>Lost your access code? Unfortunately, we cannot help recover it.</p>
              <p>Your anonymity means we store no link between you and your questions.</p>
            </div>
          </>
        ) : (
          <>
            {/* Result View */}
            <Button
              variant="ghost"
              onClick={() => {
                setResult(null);
                setAccessCode('');
              }}
              className="text-zinc-400 hover:text-white mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Check Another
            </Button>

            {/* Creator Info */}
            <div className="flex items-center gap-4 mb-8">
              <Avatar className="h-14 w-14 ring-2 ring-white/10">
                <AvatarImage src={avatarUrl || undefined} alt={result.question.creator_name} />
                <AvatarFallback className="bg-[#18181f] text-white">
                  {result.question.creator_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {result.question.creator_name}
                </h2>
                <p className="text-zinc-500 text-sm">@{result.question.creator_username}</p>
              </div>
            </div>

            {/* Question */}
            <Card className="bg-[#0c0c12] border-white/5 mb-4">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-zinc-400">Your Question</span>
                      <span className="text-xs text-zinc-600">
                        {new Date(result.question.asked_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white leading-relaxed">{result.question.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reply */}
            {result.reply ? (
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-emerald-400">
                          Reply from {result.question.creator_name}
                        </span>
                        <span className="text-xs text-zinc-600">
                          {new Date(result.reply.replied_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white whitespace-pre-wrap leading-relaxed">{result.reply.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-amber-400 font-medium">No reply yet</p>
                      <p className="text-amber-400/60 text-sm">
                        {result.question.creator_name} hasnt responded yet. Check back later!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
