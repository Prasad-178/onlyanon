import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            OnlyAnon
          </Link>
          <Link href="/check">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:bg-gray-800">
              Check Reply
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={avatarUrl || undefined} alt={creator.display_name} />
            <AvatarFallback className="text-2xl bg-gray-800 text-white">
              {creator.display_name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-white mb-1">{creator.display_name}</h1>
          <p className="text-gray-400">@{creator.twitter_username}</p>
          {creator.bio && (
            <p className="text-gray-300 mt-3 max-w-md mx-auto">{creator.bio}</p>
          )}
        </div>

        {/* Privacy Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 text-purple-400 text-sm">
            <Shield className="h-4 w-4" />
            Your identity stays anonymous
          </div>
        </div>

        {/* Offerings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white text-center">Ask me about...</h2>

          {offerings.length > 0 ? (
            <div className="grid gap-4">
              {offerings.map((offering: Offering) => (
                <Link key={offering.id} href={`/${username}/${offering.slug}`}>
                  <Card className="bg-gray-900 border-gray-800 hover:border-purple-600/50 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            <h3 className="text-lg font-semibold text-white">
                              {offering.title}
                            </h3>
                          </div>
                          {offering.description && (
                            <p className="text-gray-400 text-sm mb-3">
                              {offering.description}
                            </p>
                          )}
                          <Badge className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/20">
                            {offering.price} {offering.token}
                          </Badge>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">No offerings available yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>Powered by ShadowWire on Solana</p>
        </div>
      </footer>
    </div>
  );
}
