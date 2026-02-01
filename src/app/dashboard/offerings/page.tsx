'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Package, Plus, Edit, ArrowRight, MessageSquare, DollarSign, Loader2, ToggleRight } from 'lucide-react';
import Link from 'next/link';

interface Offering {
  id: string;
  title: string;
  description: string;
  slug: string;
  price: number;
  token: string;
  is_active: boolean;
  question_count: number;
  created_at: string;
}

export default function OfferingsPage() {
  const { user } = usePrivy();
  const privyDid = user?.id;

  const { data: offerings, isLoading } = useQuery({
    queryKey: ['offerings', privyDid],
    queryFn: async (): Promise<Offering[]> => {
      const res = await fetch(`/api/offerings?privy_did=${privyDid}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.offerings || [];
    },
    enabled: !!privyDid,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Offerings</h1>
          <p className="text-zinc-500">Manage what fans can ask you about</p>
        </div>
        <Link href="/dashboard/offerings/new">
          <Button className="h-10 px-4 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <Plus className="mr-2 h-4 w-4" />
            New Offering
          </Button>
        </Link>
      </div>

      {/* Offerings List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
        </div>
      ) : offerings && offerings.length > 0 ? (
        <div className="space-y-4">
          {offerings.map((offering) => (
            <div
              key={offering.id}
              className="group rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-5 transition-all duration-200 hover:border-indigo-500/30"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-indigo-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-white truncate">{offering.title}</h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        offering.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 border border-zinc-600/20'
                      }`}
                    >
                      <ToggleRight className="h-3 w-3" />
                      {offering.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {offering.description && (
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-1">{offering.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-white">
                      <DollarSign className="h-4 w-4 text-indigo-400" />
                      <span className="font-medium">{offering.price} {offering.token}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <MessageSquare className="h-4 w-4" />
                      <span>{offering.question_count} questions</span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <Link href={`/dashboard/offerings/${offering.id}`}>
                  <Button variant="ghost" className="h-10 w-10 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl group-hover:bg-indigo-500/10 group-hover:text-indigo-400">
                    <Edit className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl bg-gradient-to-b from-zinc-800/30 to-zinc-900/30 border border-zinc-800/50">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-5">
            <Package className="h-7 w-7 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No offerings yet</h3>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
            Create an offering to let fans pay for your personalized answers
          </p>
          <Link href="/dashboard/offerings/new">
            <Button className="h-12 px-6 text-base font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Offering
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
