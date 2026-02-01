import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Shield, ArrowLeft, Sparkles, Lock, ExternalLink, DollarSign } from 'lucide-react';

interface Creator {
  id: string;
  twitter_username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

interface Offering {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  price: number;
  token: string;
}

async function getCreatorWithOfferings(username: string) {
  const supabase = await createServiceClient();

  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .select('*')
    .eq('twitter_username', username.toLowerCase())
    .eq('is_active', true)
    .single();

  if (creatorError || !creator) {
    return null;
  }

  const { data: offerings } = await supabase
    .from('offerings')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return { creator, offerings: offerings || [] };
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getCreatorWithOfferings(username);

  if (!data) {
    notFound();
  }

  const { creator, offerings } = data;
  const avatarUrl = creator.avatar_url?.replace('_normal', '');

  return (
    <div className="min-h-screen bg-[#09090b] overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/creators" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Creators</span>
            </Link>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white text-lg tracking-tight">OnlyAnon</span>
            </Link>
            <Link href="/check">
              <Button variant="ghost" className="text-zinc-400 hover:text-white h-9 text-sm">
                Check Reply
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Hero */}
          <div className="text-center mb-12">
            {/* Avatar with ring */}
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-lg" />
              <Avatar className="relative h-28 w-28 ring-4 ring-zinc-800/80">
                <AvatarImage src={avatarUrl || undefined} alt={creator.display_name} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-300">
                  {creator.display_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name & Handle */}
            <h1 className="text-3xl font-bold text-white mb-2">{creator.display_name}</h1>
            <a
              href={`https://x.com/${creator.twitter_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-indigo-400 transition-colors"
            >
              <span>@{creator.twitter_username}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {/* Bio */}
            {creator.bio && (
              <p className="text-lg text-zinc-400 mt-5 max-w-lg mx-auto leading-relaxed">{creator.bio}</p>
            )}

            {/* Privacy Badge */}
            <div className="flex justify-center mt-8">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <Shield className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-indigo-300 font-medium">Your identity stays completely anonymous</span>
              </div>
            </div>
          </div>

          {/* Offerings Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Ask me about</h2>
                <p className="text-sm text-zinc-500">Select a topic to get started</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <Lock className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-500">Pay anonymously with Solana</span>
              </div>
            </div>

            {offerings.length > 0 ? (
              <div className="space-y-3">
                {offerings.map((offering: Offering, index: number) => (
                  <Link key={offering.id} href={`/${username}/${offering.slug}`}>
                    <div className="group relative rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-5 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-colors">
                          <MessageSquare className="h-5 w-5 text-indigo-400" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                            {offering.title}
                          </h3>
                          {offering.description && (
                            <p className="text-sm text-zinc-400 line-clamp-2">{offering.description}</p>
                          )}
                        </div>

                        {/* Price & Arrow */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="text-lg font-semibold text-white">{offering.price}</span>
                              <span className="text-sm text-zinc-500">{offering.token}</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl bg-gradient-to-b from-zinc-800/30 to-zinc-900/30 border border-zinc-800/50">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-zinc-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No offerings yet</h3>
                <p className="text-sm text-zinc-500">This creator hasn't set up any offerings</p>
              </div>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-zinc-800/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Wallet Hidden', icon: Shield },
                { label: 'No Account Needed', icon: Lock },
                { label: 'Instant Payment', icon: DollarSign },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-zinc-900/30">
                  <item.icon className="h-5 w-5 text-zinc-600 mx-auto mb-2" />
                  <span className="text-xs text-zinc-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="h-2.5 w-2.5 text-white" />
          </div>
          <span className="text-xs text-zinc-600">Powered by ShadowWire on Solana</span>
        </div>
      </footer>
    </div>
  );
}
