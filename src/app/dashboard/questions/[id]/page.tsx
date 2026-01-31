'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, CheckCircle, Send } from 'lucide-react';
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
      toast.success('Reply sent');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div className="text-center py-20 text-zinc-600 text-sm">Loading...</div>;
  }

  if (!question) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 text-sm mb-4">Question not found</p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="text-zinc-400 border-zinc-700">
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
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-500 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-medium text-white">Question</h1>
          <p className="text-xs text-zinc-500">{question.offering_title}</p>
        </div>
        {isReplied ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">
            <CheckCircle className="h-3 w-3" />
            Replied
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-500">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span>{question.payment_amount} {question.payment_token}</span>
        <span>·</span>
        <span>{new Date(question.created_at).toLocaleString()}</span>
      </div>

      {/* Question */}
      <div className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
        <p className="text-xs text-zinc-500 mb-2">Question</p>
        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{question.question_text}</p>
      </div>

      {/* Reply */}
      {isReplied ? (
        <div className="p-5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-emerald-500">Your reply</p>
            {question.replied_at && (
              <span className="text-xs text-zinc-600">
                · {new Date(question.replied_at).toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{question.reply_text}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Your reply</label>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your response..."
              className="bg-zinc-900/50 border-zinc-800 text-white text-sm placeholder:text-zinc-600 min-h-[140px] focus:border-zinc-700"
              maxLength={2000}
              disabled={replyMutation.isPending}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-zinc-600">{replyText.length}/2000</span>
            </div>
          </div>

          <Button
            onClick={() => replyMutation.mutate()}
            disabled={replyMutation.isPending || !replyText.trim()}
            className="bg-white text-black hover:bg-zinc-200 h-9 px-4 text-sm"
          >
            {replyMutation.isPending ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-2" />
                Send Reply
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
