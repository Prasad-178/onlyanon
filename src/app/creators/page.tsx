'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, ArrowRight, Users } from 'lucide-react';

interface Creator {
  id: string;
  twitter_username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  offering_count: number;
}

export default function CreatorsPage() {
  const { authenticated, ready } = usePrivy();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreators() {
      try {
        const res = await fetch('/api/creators?list=true');
        if (res.ok) {
          const data = await res.json();
          setCreators(data.creators || []);
        }
      } catch (error) {
        console.error('Failed to fetch creators:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCreators();
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link href="/" className="font-semibold text-white">OnlyAnon</Link>
          {ready && authenticated ? (
            <Link href="/dashboard">
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 h-8 px-4 text-sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 h-8 px-4 text-sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-white mb-2">Browse Creators</h1>
          <p className="text-sm text-zinc-500">Find creators and ask them anything anonymously</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-zinc-800" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-zinc-800 rounded mb-1" />
                    <div className="h-3 w-16 bg-zinc-800/50 rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-zinc-800/50 rounded" />
              </div>
            ))}
          </div>
        ) : creators.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creators.map((creator) => (
              <Link key={creator.id} href={`/${creator.twitter_username}`}>
                <div className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700/50 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage
                        src={creator.avatar_url?.replace('_normal', '') || undefined}
                        alt={creator.display_name}
                      />
                      <AvatarFallback className="bg-zinc-800 text-zinc-400">
                        {creator.display_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{creator.display_name}</h3>
                      <p className="text-xs text-zinc-500">@{creator.twitter_username}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  {creator.bio ? (
                    <p className="text-xs text-zinc-500 line-clamp-2">{creator.bio}</p>
                  ) : (
                    <p className="text-xs text-zinc-600">{creator.offering_count} offering{creator.offering_count !== 1 ? 's' : ''} available</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
            <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-1">No creators yet</p>
            <p className="text-xs text-zinc-600 mb-4">Be the first to start receiving anonymous questions</p>
            <Link href="/login">
              <Button className="bg-white text-black hover:bg-zinc-200 h-9 px-4 text-sm">
                Become a Creator
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
