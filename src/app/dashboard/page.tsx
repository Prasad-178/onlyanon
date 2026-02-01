'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, ChevronRight, Plus, Loader2 } from 'lucide-react';
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

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Questions</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage incoming questions</p>
        </div>
        <Link href="/dashboard/offerings/new">
          <Button className="h-9 px-4 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
            <Plus className="h-4 w-4 mr-1.5" />
            New Offering
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="text-2xl font-semibold text-white">{pendingCount}</div>
          <div className="text-xs text-zinc-500 mt-1">Pending</div>
        </div>
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="text-2xl font-semibold text-white">{repliedCount}</div>
          <div className="text-xs text-zinc-500 mt-1">Answered</div>
        </div>
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="text-2xl font-semibold text-white">{totalEarnings.toFixed(1)}</div>
          <div className="text-xs text-zinc-500 mt-1">Earned</div>
        </div>
      </div>

      {/* Questions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-400">All Questions</h2>
          <span className="text-xs text-zinc-600">{questions?.length || 0} total</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 text-zinc-500 animate-spin" />
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-2">
            {questions.map((question) => (
              <Link key={question.id} href={`/dashboard/questions/${question.id}`}>
                <div className="group p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      question.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white line-clamp-2 leading-relaxed">
                        {question.question_text}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span>{question.payment_amount} {question.payment_token}</span>
                        <span className="text-zinc-700">·</span>
                        <span>{question.offering_title}</span>
                        <span className="text-zinc-700">·</span>
                        <span>{formatDate(question.created_at)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-zinc-500 text-sm mb-4">No questions yet</div>
            <Link href="/dashboard/offerings/new">
              <Button className="h-9 px-4 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg">
                Create an Offering
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
