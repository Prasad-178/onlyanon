'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, ArrowRight, Users, Sparkles, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCreators = creators.filter(
    (creator) =>
      creator.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.twitter_username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] bg-glow-top">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white text-lg tracking-tight">OnlyAnon</span>
          </Link>
          {ready && authenticated ? (
            <Link href="/dashboard">
              <Button className="bg-white text-zinc-900 hover:bg-zinc-100 h-9 px-4 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="bg-white text-zinc-900 hover:bg-zinc-100 h-9 px-4 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">Creator Directory</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Discover Creators
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto">
              Find creators you want to ask questions. Pay anonymously, get personalized answers.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-10 animate-slide-up stagger-1" style={{ opacity: 0 }}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl input-elevated text-sm"
              />
            </div>
          </div>

          {/* Creators Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-elevated p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-zinc-800" />
                    <div className="flex-1">
                      <div className="h-4 w-28 bg-zinc-800 rounded mb-2" />
                      <div className="h-3 w-20 bg-zinc-800/50 rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-zinc-800/50 rounded mb-2" />
                  <div className="h-3 w-2/3 bg-zinc-800/50 rounded" />
                </div>
              ))}
            </div>
          ) : filteredCreators.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCreators.map((creator, index) => (
                <Link
                  key={creator.id}
                  href={`/${creator.twitter_username}`}
                  className="animate-slide-up"
                  style={{ opacity: 0, animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  <div className="card-elevated p-6 group">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-14 w-14 ring-2 ring-zinc-800 group-hover:ring-indigo-500/30 transition-all duration-300">
                        <AvatarImage
                          src={creator.avatar_url?.replace('_normal', '') || undefined}
                          alt={creator.display_name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-300 text-lg font-medium">
                          {creator.display_name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white truncate group-hover:text-indigo-300 transition-colors duration-200">
                          {creator.display_name}
                        </h3>
                        <p className="text-sm text-zinc-500">@{creator.twitter_username}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors duration-200">
                        <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-indigo-400 transition-colors duration-200" />
                      </div>
                    </div>
                    {creator.bio ? (
                      <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{creator.bio}</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500/50" />
                        <p className="text-sm text-zinc-500">
                          {creator.offering_count} offering{creator.offering_count !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-20 card-elevated">
              <Search className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-lg text-zinc-400 mb-2">No creators found</p>
              <p className="text-sm text-zinc-600">Try a different search term</p>
            </div>
          ) : (
            <div className="text-center py-20 card-elevated">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No creators yet</h3>
              <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
                Be the first to start receiving anonymous questions and get paid for your answers.
              </p>
              <Link href="/login">
                <Button className="btn-primary-indigo h-11 px-6 rounded-xl">
                  Become a Creator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
