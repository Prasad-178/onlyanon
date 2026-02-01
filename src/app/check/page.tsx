'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Search, Clock, CheckCircle, AlertCircle, Sparkles, Lock, MessageSquare } from 'lucide-react';
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
      toast.error('Failed to check reply');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    const formatted = formatAccessCode(value.replace(/[^A-Z0-9]/g, ''));
    setAccessCode(formatted);
  };

  const avatarUrl = result?.question.creator_avatar?.replace('_normal', '');

  return (
    <div className="min-h-screen bg-[#09090b] bg-glow-top">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white text-lg tracking-tight">OnlyAnon</span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-screen px-6 pt-16">
        <div className="w-full max-w-lg">
          {!result ? (
            <div className="animate-slide-up">
              {/* Page Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                  <Lock className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-sm text-indigo-300 font-medium">Private Access</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                  Check Your Reply
                </h1>
                <p className="text-lg text-zinc-400">
                  Enter the access code you received after submitting your question
                </p>
              </div>

              {/* Input Card */}
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 rounded-3xl blur-xl opacity-50" />
                <div className="relative card-elevated p-8">
                  <div className="mb-6">
                    <label className="text-sm text-zinc-400 mb-3 block">Access Code</label>
                    <Input
                      value={accessCode}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                      placeholder="XXXX-XXXX-XXXX"
                      className="bg-zinc-900/80 border-zinc-700 text-white text-center text-2xl tracking-[0.25em] font-mono h-14 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-indigo-500/20"
                      maxLength={14}
                    />
                  </div>

                  <Button
                    onClick={handleCheck}
                    disabled={isLoading || !accessCode.trim()}
                    className="w-full btn-primary-indigo h-12 text-base rounded-xl font-medium"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              </div>

              {/* Not Found Error */}
              {notFound && (
                <div className="mt-6 p-4 rounded-xl status-error animate-fade-in">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Access code not found</p>
                      <p className="text-xs opacity-70 mt-0.5">Please check the code and try again</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Note */}
              <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                <Lock className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Lost your access code? We cannot recover it. Your anonymity means we store no link between you and your questions.
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-slide-up">
              {/* Back Button */}
              <button
                onClick={() => { setResult(null); setAccessCode(''); }}
                className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Check Another</span>
              </button>

              {/* Creator Header */}
              <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-14 w-14 ring-2 ring-zinc-800">
                  <AvatarImage src={avatarUrl || undefined} alt={result.question.creator_name} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-300 text-lg font-medium">
                    {result.question.creator_name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-white">{result.question.creator_name}</p>
                  <p className="text-sm text-zinc-500">@{result.question.creator_username}</p>
                </div>
              </div>

              {/* Question Card */}
              <div className="card-elevated p-6 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center">
                    <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Your Question</span>
                </div>
                <p className="text-base text-white leading-relaxed">{result.question.text}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                  <p className="text-xs text-zinc-600">
                    Asked on {new Date(result.question.asked_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Reply Card */}
              {result.reply ? (
                <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <span className="text-xs text-emerald-400 uppercase tracking-wider font-medium">Reply</span>
                  </div>
                  <p className="text-base text-white leading-relaxed whitespace-pre-wrap">{result.reply.text}</p>
                  <div className="mt-4 pt-4 border-t border-emerald-500/10">
                    <p className="text-xs text-emerald-400/60">
                      Replied on {new Date(result.reply.replied_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl status-pending">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-amber-400">Awaiting Reply</p>
                      <p className="text-sm text-amber-400/60 mt-0.5">The creator hasn't responded yet. Check back later.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
