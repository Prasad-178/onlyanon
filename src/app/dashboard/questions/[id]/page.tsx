'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, CheckCircle, Send, MessageSquare, Loader2, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  question_text: string;
  status: 'pending' | 'replied' | 'archived';
  payment_amount: number;
  payment_token: string;
  created_at: string;
  offering_title: string;
  reply_text?: string;
  replied_at?: string;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const { user } = usePrivy();
  const queryClient = useQueryClient();

  const questionId = params.id as string;
  const [replyText, setReplyText] = useState('');

  const { data: question, isLoading } = useQuery({
    queryKey: ['question', questionId],
    queryFn: async (): Promise<Question | null> => {
      const res = await fetch(`/api/questions/${questionId}?privy_did=${user?.id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.question;
    },
    enabled: !!user?.id,
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/questions/${questionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privy_did: user?.id,
          reply_text: replyText.trim(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to submit reply');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Reply sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="h-7 w-7 text-zinc-600" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Question not found</h3>
        <p className="text-zinc-500 mb-6">This question may have been deleted or doesn't exist.</p>
        <Link href="/dashboard">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-11 px-6 rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const isReplied = question.status === 'replied';

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">Question Details</h1>
          <p className="text-sm text-zinc-500">{question.offering_title}</p>
        </div>
        {isReplied ? (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-4 w-4" />
            Replied
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-4 w-4" />
            Pending
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <DollarSign className="h-4 w-4 text-indigo-400" />
          <span className="text-sm text-indigo-300 font-medium">{question.payment_amount} {question.payment_token}</span>
        </div>
        <span className="text-sm text-zinc-500">
          {new Date(question.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* Question Card */}
      <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-zinc-400" />
          </div>
          <span className="text-sm text-zinc-400 font-medium">Question</span>
        </div>
        <p className="text-base text-white leading-relaxed whitespace-pre-wrap">{question.question_text}</p>
      </div>

      {/* Reply Section */}
      {isReplied ? (
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm text-emerald-400 font-medium">Your Reply</span>
            </div>
            {question.replied_at && (
              <span className="text-xs text-emerald-400/60">
                {new Date(question.replied_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
          <p className="text-base text-white leading-relaxed whitespace-pre-wrap">{question.reply_text}</p>
        </div>
      ) : (
        <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Send className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-sm text-zinc-400 font-medium">Write Your Reply</span>
          </div>

          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a thoughtful response to this question..."
            className="bg-zinc-900/80 border-zinc-700 text-white text-base placeholder:text-zinc-600 min-h-[180px] mb-4 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl resize-none"
            maxLength={2000}
            disabled={replyMutation.isPending}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-600">{replyText.length}/2000 characters</span>
            <Button
              onClick={() => replyMutation.mutate()}
              disabled={replyMutation.isPending || !replyText.trim()}
              className="h-11 px-6 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {replyMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Reply
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
