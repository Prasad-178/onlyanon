'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Clock, CheckCircle, Archive, ArrowRight } from 'lucide-react';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Question Inbox</h1>
        <p className="text-gray-400">View and respond to anonymous questions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{pendingCount}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{repliedCount}</div>
                <div className="text-sm text-gray-400">Replied</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Recent Questions</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((question) => (
              <Card
                key={question.id}
                className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={question.status === 'pending' ? 'default' : 'secondary'}
                          className={
                            question.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-green-500/20 text-green-500'
                          }
                        >
                          {question.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {question.payment_amount} {question.payment_token}
                        </span>
                      </div>
                      <p className="text-white line-clamp-2 mb-2">{question.question_text}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{question.offering_title}</span>
                        <span>•</span>
                        <span>{new Date(question.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/questions/${question.id}`}>
                      <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No questions yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Create an offering and share your profile link to start receiving questions
              </p>
              <Link href="/dashboard/offerings/new">
                <Button className="bg-purple-600 hover:bg-purple-700">
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
