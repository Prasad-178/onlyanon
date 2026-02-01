'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
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
  const router = useRouter();
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
        body: JSON.stringify({ privy_did: user?.id, reply_text: replyText.trim() }),
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
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 text-sm mb-4">Question not found</p>
        <Link href="/dashboard">
          <Button variant="outline" className="h-9 text-sm border-zinc-800 text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>
    );
  }

  const isReplied = question.status === 'replied';

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-white">Question</h1>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
            <span>{question.offering_title}</span>
            <span>·</span>
            <span>{question.payment_amount} {question.payment_token}</span>
            <span>·</span>
            <span>{formatDate(question.created_at)}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          isReplied ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
        }`}>
          {isReplied ? 'Replied' : 'Pending'}
        </div>
      </div>

      {/* Question */}
      <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800">
        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{question.question_text}</p>
      </div>

      {/* Reply Section */}
      {isReplied ? (
        <div className="p-5 rounded-lg bg-zinc-900 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-emerald-400 font-medium">Your Reply</span>
            {question.replied_at && (
              <span className="text-xs text-zinc-600">{formatDate(question.replied_at)}</span>
            )}
          </div>
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{question.reply_text}</p>
        </div>
      ) : (
        <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="mb-3">
            <span className="text-xs text-zinc-500 font-medium">Write your reply</span>
          </div>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your response..."
            className="bg-zinc-800/50 border-zinc-700 text-white text-sm placeholder:text-zinc-600 min-h-[150px] focus:border-zinc-600 focus:ring-0 resize-none rounded-lg"
            maxLength={2000}
            disabled={replyMutation.isPending}
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-zinc-600">{replyText.length}/2000</span>
            <Button
              onClick={() => replyMutation.mutate()}
              disabled={replyMutation.isPending || !replyText.trim()}
              className="h-9 px-4 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50"
            >
              {replyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1.5" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
