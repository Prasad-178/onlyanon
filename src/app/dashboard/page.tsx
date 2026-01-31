'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
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
        <h1 className="text-2xl font-bold text-white mb-1">Question Inbox</h1>
        <p className="text-zinc-500">View and respond to anonymous questions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#0c0c12] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{pendingCount}</div>
                <div className="text-sm text-zinc-500">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0c0c12] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{repliedCount}</div>
                <div className="text-sm text-zinc-500">Replied</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Recent Questions</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((question) => (
              <Link key={question.id} href={`/dashboard/questions/${question.id}`}>
                <Card className="bg-[#0c0c12] border-white/5 hover:border-cyan-500/30 transition-all hover-glow group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge
                            className={
                              question.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/10 border-0'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border-0'
                            }
                          >
                            {question.status === 'pending' ? (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Replied
                              </span>
                            )}
                          </Badge>
                          <span className="text-xs text-zinc-600">
                            {question.payment_amount} {question.payment_token}
                          </span>
                        </div>
                        <p className="text-white line-clamp-2 mb-2 leading-relaxed">
                          {question.question_text}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                          <span>{question.offering_title}</span>
                          <span>•</span>
                          <span>{new Date(question.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-zinc-700 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-[#0c0c12] border-white/5">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#18181f] flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-zinc-700" />
              </div>
              <h3 className="text-white font-medium mb-2">No questions yet</h3>
              <p className="text-zinc-500 text-sm mb-6">
                Create an offering and share your profile link to start receiving questions
              </p>
              <Link href="/dashboard/offerings/new">
                <Button className="gradient-primary text-white hover:opacity-90">
                  Create Your First Offering
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
