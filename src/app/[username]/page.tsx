import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link href="/" className="font-semibold text-white">OnlyAnon</Link>
          <Link href="/check">
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white h-8 text-sm">
              Check Reply
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Profile */}
        <div className="text-center mb-8">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarImage src={avatarUrl || undefined} alt={creator.display_name} />
            <AvatarFallback className="text-2xl bg-zinc-800 text-zinc-400">
              {creator.display_name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-semibold text-white mb-0.5">{creator.display_name}</h1>
          <p className="text-sm text-zinc-500">@{creator.twitter_username}</p>
          {creator.bio && (
            <p className="text-sm text-zinc-400 mt-3 max-w-md mx-auto">{creator.bio}</p>
          )}
        </div>

        {/* Privacy */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 text-zinc-400 text-xs">
            <Shield className="h-3.5 w-3.5" />
            Your identity stays anonymous
          </div>
        </div>

        {/* Offerings */}
        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-wider text-center mb-4">
            Ask me about
          </p>

          {offerings.length > 0 ? (
            <div className="space-y-2">
              {offerings.map((offering: Offering) => (
                <Link key={offering.id} href={`/${username}/${offering.slug}`}>
                  <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-5 w-5 text-zinc-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{offering.title}</h3>
                        {offering.description && (
                          <p className="text-xs text-zinc-500 truncate">{offering.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-zinc-400 font-medium">
                          {offering.price} {offering.token}
                        </span>
                        <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
              <MessageSquare className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No offerings available yet</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-16">
        <div className="max-w-2xl mx-auto px-6 py-4 text-center">
          <p className="text-xs text-zinc-600">Powered by ShadowWire on Solana</p>
        </div>
      </footer>
    </div>
  );
}
