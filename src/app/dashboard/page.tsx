'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, CheckCircle, ChevronRight, ArrowRight, Inbox, DollarSign, Loader2 } from 'lucide-react';
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
  const totalEarnings = questions?.reduce((acc, q) => acc + q.payment_amount, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Questions</h1>
          <p className="text-zinc-500">Manage incoming questions from your audience</p>
        </div>
        <Link href="/dashboard/offerings/new">
          <Button className="h-10 px-4 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            New Offering
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                Action needed
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-white mb-1">{pendingCount}</div>
          <div className="text-sm text-zinc-500">Awaiting reply</div>
        </div>

        <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{repliedCount}</div>
          <div className="text-sm text-zinc-500">Answered</div>
        </div>

        <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalEarnings.toFixed(2)}
          </div>
          <div className="text-sm text-zinc-500">Total earned</div>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">All Questions</h2>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Inbox className="h-4 w-4" />
            <span>{questions?.length || 0} total</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <Link key={question.id} href={`/dashboard/questions/${question.id}`}>
                <div className="group rounded-xl bg-gradient-to-b from-zinc-800/30 to-zinc-900/30 border border-zinc-700/50 p-5 transition-all duration-200 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      question.status === 'pending'
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'bg-emerald-500/10 border border-emerald-500/20'
                    }`}>
                      {question.status === 'pending' ? (
                        <Clock className="h-5 w-5 text-amber-400" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {question.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pending Reply
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Replied
                          </span>
                        )}
                        <span className="text-sm text-white font-medium">
                          {question.payment_amount} {question.payment_token}
                        </span>
                      </div>

                      <p className="text-base text-zinc-300 line-clamp-2 leading-relaxed mb-3">
                        {question.question_text}
                      </p>

                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span className="px-2 py-0.5 rounded bg-zinc-800/50">{question.offering_title}</span>
                        <span>{new Date(question.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors shrink-0">
                      <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl bg-gradient-to-b from-zinc-800/30 to-zinc-900/30 border border-zinc-800/50">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="h-7 w-7 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No questions yet</h3>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
              Create an offering and share your profile to start receiving anonymous questions
            </p>
            <Link href="/dashboard/offerings/new">
              <Button className="h-12 px-6 text-base font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                Create Your First Offering
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
