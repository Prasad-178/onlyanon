'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Package, Plus, Edit } from 'lucide-react';
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
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Offerings</h1>
          <p className="text-sm text-zinc-500">Manage what fans can ask you about</p>
        </div>
        <Link href="/dashboard/offerings/new">
          <Button className="bg-white text-black hover:bg-zinc-200 h-9 px-4 text-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Offering
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50 animate-pulse">
              <div className="h-5 w-1/3 bg-zinc-800 rounded mb-2" />
              <div className="h-4 w-2/3 bg-zinc-800/50 rounded mb-3" />
              <div className="h-3 w-1/4 bg-zinc-800/50 rounded" />
            </div>
          ))}
        </div>
      ) : offerings && offerings.length > 0 ? (
        <div className="space-y-3">
          {offerings.map((offering) => (
            <div
              key={offering.id}
              className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-white truncate">{offering.title}</h3>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                        offering.is_active
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-zinc-500/10 text-zinc-500'
                      }`}
                    >
                      {offering.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {offering.description && (
                    <p className="text-xs text-zinc-500 mb-2 line-clamp-1">
                      {offering.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-400 font-medium">
                      {offering.price} {offering.token}
                    </span>
                    <span className="text-zinc-600">
                      {offering.question_count} questions
                    </span>
                  </div>
                </div>
                <Link href={`/dashboard/offerings/${offering.id}`}>
                  <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-lg bg-zinc-900/30 border border-zinc-800/50 text-center">
          <Package className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-white mb-1">No offerings yet</h3>
          <p className="text-xs text-zinc-500 mb-4">
            Create an offering to let fans pay for your answers
          </p>
          <Link href="/dashboard/offerings/new">
            <Button className="bg-white text-black hover:bg-zinc-200 h-9 px-4 text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Offering
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
