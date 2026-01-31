'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link href="/" className="font-semibold text-white">OnlyAnon</Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {!result ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-white mb-2">Check Your Reply</h1>
              <p className="text-sm text-zinc-500">
                Enter the access code you received after submitting your question
              </p>
            </div>

            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800/50 mb-6">
              <Input
                value={accessCode}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                placeholder="XXXX-XXXX-XXXX"
                className="bg-zinc-800/50 border-zinc-700 text-white text-center text-xl tracking-widest font-mono h-12 mb-4 placeholder:text-zinc-600"
                maxLength={14}
              />

              <Button
                onClick={handleCheck}
                disabled={isLoading || !accessCode.trim()}
                className="w-full bg-white text-black hover:bg-zinc-200 h-10 text-sm"
              >
                {isLoading ? 'Checking...' : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Check for Reply
                  </>
                )}
              </Button>
            </div>

            {notFound && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-sm text-red-400">Access code not found</p>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-zinc-600">
              Lost your access code? We cannot recover it - your anonymity means we store no link to you.
            </p>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => { setResult(null); setAccessCode(''); }}
              className="text-zinc-500 hover:text-white mb-6 h-8 px-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Check Another
            </Button>

            {/* Creator */}
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl || undefined} alt={result.question.creator_name} />
                <AvatarFallback className="bg-zinc-800 text-zinc-400 text-sm">
                  {result.question.creator_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{result.question.creator_name}</p>
                <p className="text-xs text-zinc-500">@{result.question.creator_username}</p>
              </div>
            </div>

            {/* Question */}
            <div className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 mb-3">
              <p className="text-xs text-zinc-500 mb-2">Your Question</p>
              <p className="text-sm text-white leading-relaxed">{result.question.text}</p>
              <p className="text-xs text-zinc-600 mt-3">
                {new Date(result.question.asked_at).toLocaleDateString()}
              </p>
            </div>

            {/* Reply */}
            {result.reply ? (
              <div className="p-5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-xs text-emerald-500 mb-2">Reply</p>
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{result.reply.text}</p>
                <p className="text-xs text-zinc-600 mt-3">
                  {new Date(result.reply.replied_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-amber-500 font-medium">No reply yet</p>
                    <p className="text-xs text-amber-500/60">Check back later</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
