'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, Loader2 } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Offerings</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your question topics</p>
        </div>
        <Link href="/dashboard/offerings/new">
          <Button className="h-9 px-4 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
            <Plus className="h-4 w-4 mr-1.5" />
            New Offering
          </Button>
        </Link>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 text-zinc-500 animate-spin" />
        </div>
      ) : offerings && offerings.length > 0 ? (
        <div className="space-y-2">
          {offerings.map((offering) => (
            <Link key={offering.id} href={`/dashboard/offerings/${offering.id}`}>
              <div className="group p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{offering.title}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        offering.is_active
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-zinc-700/50 text-zinc-500'
                      }`}>
                        {offering.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {offering.description && (
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{offering.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span className="text-white font-medium">{offering.price} {offering.token}</span>
                      <span className="text-zinc-700">·</span>
                      <span>{offering.question_count} questions</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-zinc-500 text-sm mb-4">No offerings yet</div>
          <Link href="/dashboard/offerings/new">
            <Button className="h-9 px-4 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg">
              Create Your First Offering
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
