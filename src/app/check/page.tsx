'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Clock, CheckCircle, MessageSquare } from 'lucide-react';
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
    // Auto-format as user types
    const formatted = formatAccessCode(value.replace(/[^A-Z0-9]/g, ''));
    setAccessCode(formatted);
  };

  const avatarUrl = result?.question.creator_avatar?.replace('_normal', '');

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <span className="text-xl font-bold text-white">OnlyAnon</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {!result ? (
          <>
            {/* Search Form */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Check Your Reply</h1>
              <p className="text-gray-400">
                Enter the access code you received after submitting your question
              </p>
            </div>

            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      value={accessCode}
                      onChange={handleInputChange}
                      placeholder="XXXX-XXXX-XXXX"
                      className="bg-gray-800 border-gray-700 text-white text-center text-xl tracking-wider font-mono h-14"
                      maxLength={14}
                    />
                  </div>

                  <Button
                    onClick={handleCheck}
                    disabled={isLoading || !accessCode.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
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
              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="p-6 text-center">
                  <p className="text-red-400">
                    Access code not found. Please check and try again.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Help Text */}
            <div className="text-center text-gray-500 text-sm">
              <p>Lost your access code? Unfortunately, we cannot help recover it.</p>
              <p>Your anonymity means we dont store any link between you and your questions.</p>
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
              className="text-gray-400 hover:text-white mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Check Another
            </Button>

            {/* Creator Info */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar>
                <AvatarImage src={avatarUrl || undefined} alt={result.question.creator_name} />
                <AvatarFallback className="bg-gray-800 text-white">
                  {result.question.creator_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {result.question.creator_name}
                </h2>
                <p className="text-gray-400 text-sm">@{result.question.creator_username}</p>
              </div>
            </div>

            {/* Question */}
            <Card className="bg-gray-900 border-gray-800 mb-4">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <MessageSquare className="h-5 w-5 text-purple-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-400">Your Question</span>
                      <span className="text-xs text-gray-500">
                        {new Date(result.question.asked_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white">{result.question.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reply */}
            {result.reply ? (
              <Card className="bg-purple-600/10 border-purple-600/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-green-400">Reply from {result.question.creator_name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(result.reply.replied_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white whitespace-pre-wrap">{result.reply.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-yellow-500/10 border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-yellow-400 font-medium">No reply yet</p>
                      <p className="text-yellow-400/70 text-sm">
                        {result.question.creator_name} hasnt responded to your question yet. Check back later!
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
