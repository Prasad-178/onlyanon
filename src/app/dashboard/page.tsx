'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  question_text: string;
  status: 'pending' | 'replied' | 'archived';
  payment_amount: number;
  payment_token: string;
  created_at: string;
  offering_title: string;
}

export default function DashboardPage() {
  const { user } = usePrivy();
  const privyDid = user?.id;

  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions', privyDid],
    queryFn: async (): Promise<Question[]> => {
      const res = await fetch(`/api/questions?privy_did=${privyDid}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.questions || [];
    },
    enabled: !!privyDid,
  });

  const pendingCount = questions?.filter((q) => q.status === 'pending').length || 0;
  const repliedCount = questions?.filter((q) => q.status === 'replied').length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Questions</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage incoming questions from your audience</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-white">{pendingCount}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Awaiting reply</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-white">{repliedCount}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Answered</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-400">All Questions</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-zinc-600 text-sm">Loading...</div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-2">
            {questions.map((question) => (
              <Link key={question.id} href={`/dashboard/questions/${question.id}`}>
                <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {question.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">
                            <CheckCircle className="h-3 w-3" />
                            Replied
                          </span>
                        )}
                        <span className="text-xs text-zinc-600">
                          {question.payment_amount} {question.payment_token}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                        {question.question_text}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-zinc-600">
                        <span>{question.offering_title}</span>
                        <span>·</span>
                        <span>{new Date(question.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0 mt-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-400 mb-1">No questions yet</p>
            <p className="text-xs text-zinc-600 mb-6">
              Create an offering and share your profile to start receiving questions
            </p>
            <Link href="/dashboard/offerings/new">
              <Button className="bg-white text-black hover:bg-zinc-200 text-sm h-9 px-4">
                Create Offering
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
