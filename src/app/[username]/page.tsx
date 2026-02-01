import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { ArrowUpRight, Eye, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-[#07070a] text-white overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Main gradient orb */}
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)',
          }}
        />
        {/* Secondary accent */}
        <div
          className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 60%)',
          }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2.5">
              <img
                src="/onlyanon_logo.png"
                alt="OnlyAnon"
                className="h-8 w-8 group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-semibold text-lg tracking-tight">OnlyAnon</span>
            </Link>
            <Link
              href="/check"
              className="text-sm text-zinc-500 hover:text-white transition-colors duration-200"
            >
              Check Reply
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        {/* Hero Section */}
        <section className="max-w-2xl mx-auto pt-8 pb-16">
          {/* Avatar with glow */}
          <div className="flex justify-center mb-8 animate-[fadeIn_0.6s_ease-out]">
            <div className="relative">
              {/* Glow rings */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl animate-[pulse_4s_ease-in-out_infinite]" />
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/10 blur-md" />

              {/* Avatar */}
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={creator.display_name}
                    className="w-32 h-32 rounded-full object-cover ring-2 ring-white/10 shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10 shadow-2xl">
                    <span className="text-5xl font-bold text-white/90">
                      {creator.display_name[0]?.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Verified badge */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#07070a] flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Name & Handle */}
          <div className="text-center mb-6 animate-[fadeIn_0.6s_ease-out_0.1s_both]">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
              {creator.display_name}
            </h1>
            <a
              href={`https://x.com/${creator.twitter_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-indigo-400 transition-colors duration-200"
            >
              <span className="text-base">@{creator.twitter_username}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Bio */}
          {creator.bio && (
            <p className="text-center text-zinc-400 text-lg leading-relaxed max-w-lg mx-auto mb-8 animate-[fadeIn_0.6s_ease-out_0.15s_both]">
              {creator.bio}
            </p>
          )}

          {/* Anonymous indicator - subtle and elegant */}
          <div className="flex justify-center animate-[fadeIn_0.6s_ease-out_0.2s_both]">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Eye className="w-4 h-4" />
              <span>Your identity stays hidden</span>
            </div>
          </div>
        </section>

        {/* Offerings Section */}
        <section className="max-w-xl mx-auto">
          <div className="mb-8 animate-[fadeIn_0.6s_ease-out_0.25s_both]">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-center">
              Ask a Question
            </h2>
          </div>

          {offerings.length > 0 ? (
            <div className="space-y-4">
              {offerings.map((offering: Offering, index: number) => (
                <Link
                  key={offering.id}
                  href={`/${username}/${offering.slug}`}
                  className="block animate-[fadeIn_0.5s_ease-out_both]"
                  style={{ animationDelay: `${0.3 + index * 0.08}s` }}
                >
                  <div className="group relative">
                    {/* Hover glow */}
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/20 group-hover:via-indigo-500/10 group-hover:to-purple-500/20 blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />

                    {/* Card */}
                    <div className="relative rounded-2xl bg-zinc-900/50 border border-zinc-800/80 group-hover:border-zinc-700/80 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-[-2px]">
                      <div className="p-6">
                        {/* Top row: Title + Price */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white group-hover:text-indigo-100 transition-colors duration-200">
                              {offering.title}
                            </h3>
                          </div>

                          {/* Price - The Hero */}
                          <div className="flex items-baseline gap-1.5 shrink-0">
                            <span className="text-3xl font-bold text-white tabular-nums">
                              {offering.price}
                            </span>
                            <span className="text-base font-medium text-zinc-500">
                              {offering.token}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {offering.description && (
                          <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                            {offering.description}
                          </p>
                        )}

                        {/* Bottom row: CTA */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-600 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                            Anonymous payment
                          </span>

                          <div className="flex items-center gap-2 text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors duration-200">
                            <span>Ask now</span>
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-[fadeIn_0.6s_ease-out_0.3s_both]">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center mx-auto mb-5">
                <img src="/onlyanon_logo.png" alt="" className="w-7 h-7 opacity-40" />
              </div>
              <p className="text-zinc-600 text-sm">No offerings available yet</p>
            </div>
          )}
        </section>

        {/* Trust indicators - elegant and minimal */}
        <section className="max-w-xl mx-auto mt-20 animate-[fadeIn_0.6s_ease-out_0.5s_both]">
          <div className="flex items-center justify-center gap-8 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-zinc-900/80 border border-zinc-800/50 flex items-center justify-center">
                <Eye className="w-3 h-3 text-zinc-500" />
              </div>
              <span>Wallet hidden</span>
            </div>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-zinc-900/80 border border-zinc-800/50 flex items-center justify-center">
                <Zap className="w-3 h-3 text-zinc-500" />
              </div>
              <span>Instant on Solana</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col items-center gap-3">
            <img
              src="/onlyanon_full.png"
              alt="OnlyAnon"
              className="h-12 opacity-30 hover:opacity-50 transition-opacity duration-300"
            />
            <span className="text-[11px] text-zinc-700">Powered by ShadowWire on Solana</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
