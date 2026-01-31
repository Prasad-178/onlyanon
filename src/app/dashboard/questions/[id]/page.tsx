'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';
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
      toast.success('Reply sent successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyText.trim()) {
      toast.error('Please enter your reply');
      return;
    }

    replyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-gray-400 mb-4">Question not found</p>
        <Link href="/dashboard">
          <Button variant="outline" className="border-gray-700">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const isReplied = question.status === 'replied';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Question Detail</h1>
          <p className="text-gray-400 text-sm">{question.offering_title}</p>
        </div>
      </div>

      {/* Status & Payment */}
      <div className="flex items-center gap-4">
        <Badge
          className={
            isReplied
              ? 'bg-green-500/20 text-green-500'
              : 'bg-yellow-500/20 text-yellow-500'
          }
        >
          {isReplied ? (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Replied
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Pending
            </span>
          )}
        </Badge>
        <span className="text-sm text-gray-500">
          {question.payment_amount} {question.payment_token}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(question.created_at).toLocaleString()}
        </span>
      </div>

      {/* Question */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-600/20">
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Anonymous Question</p>
              <p className="text-white whitespace-pre-wrap">{question.question_text}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Section */}
      {isReplied ? (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-green-400 mb-2">
                  Your Reply • {question.replied_at && new Date(question.replied_at).toLocaleString()}
                </p>
                <p className="text-white whitespace-pre-wrap">{question.reply_text}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <form onSubmit={handleSubmitReply}>
              <p className="text-sm text-gray-400 mb-3">Write your reply</p>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your answer here..."
                className="bg-gray-800 border-gray-700 text-white min-h-[150px] mb-4"
                maxLength={2000}
                disabled={replyMutation.isPending}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{replyText.length}/2000</span>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={replyMutation.isPending || !replyText.trim()}
                >
                  {replyMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
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
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
