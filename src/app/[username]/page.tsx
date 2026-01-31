import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Shield, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-[#050508] relative">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link href="/" className="text-lg font-bold text-white">
            Only<span className="text-cyan-400">Anon</span>
          </Link>
          <Link href="/check">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              Check Reply
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="text-center mb-10">
          <Avatar className="h-28 w-28 mx-auto mb-5 ring-4 ring-white/10">
            <AvatarImage src={avatarUrl || undefined} alt={creator.display_name} />
            <AvatarFallback className="text-3xl bg-[#18181f] text-white">
              {creator.display_name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-white mb-1">{creator.display_name}</h1>
          <p className="text-zinc-500">@{creator.twitter_username}</p>
          {creator.bio && (
            <p className="text-zinc-400 mt-4 max-w-md mx-auto leading-relaxed">{creator.bio}</p>
          )}
        </div>

        {/* Privacy Badge */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
            <Shield className="h-4 w-4" />
            Your identity stays completely anonymous
          </div>
        </div>

        {/* Offerings */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-center mb-6">
            Ask me about...
          </h2>

          {offerings.length > 0 ? (
            <div className="space-y-3">
              {offerings.map((offering: Offering) => (
                <Link key={offering.id} href={`/${username}/${offering.slug}`}>
                  <Card className="bg-[#0c0c12] border-white/5 hover:border-cyan-500/30 transition-all hover-glow group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <MessageSquare className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-medium text-white truncate">
                              {offering.title}
                            </h3>
                            {offering.description && (
                              <p className="text-zinc-500 text-sm truncate">
                                {offering.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/10 border-0 font-medium">
                            {offering.price} {offering.token}
                          </Badge>
                          <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-[#0c0c12] border-white/5">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No offerings available yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-20">
        <div className="max-w-3xl mx-auto px-6 py-6 text-center">
          <p className="text-zinc-600 text-sm">
            Powered by <span className="text-zinc-500">ShadowWire</span> on Solana
          </p>
        </div>
      </footer>
    </div>
  );
}
