import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { ArrowRight, MessageSquare, Shield, Lock, Zap, ExternalLink, Sparkles } from 'lucide-react';

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
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header */}
      <header className="relative z-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">OnlyAnon</span>
            </Link>
            <Link
              href="/check"
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Check Reply
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-8 pb-20 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Hero Profile Section */}
          <div
            className="relative rounded-3xl overflow-hidden mb-8 animate-[fadeIn_0.6s_ease-out]"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(99, 102, 241, 0.1) 100%)',
            }}
          >
            {/* Decorative top border gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Avatar with glow */}
                <div className="relative mx-auto md:mx-0 shrink-0">
                  <div className="absolute -inset-3 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse" style={{ animationDuration: '3s' }} />
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={creator.display_name}
                        className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover ring-2 ring-white/10 shadow-2xl"
                      />
                    ) : (
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10 shadow-2xl">
                        <span className="text-4xl md:text-5xl font-bold text-white">
                          {creator.display_name[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Verified badge */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-[#09090b] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                    {creator.display_name}
                  </h1>
                  <a
                    href={`https://x.com/${creator.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-indigo-400 transition-colors text-sm font-medium"
                  >
                    @{creator.twitter_username}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  {creator.bio && (
                    <p className="text-zinc-400 mt-4 leading-relaxed max-w-md">
                      {creator.bio}
                    </p>
                  )}

                  {/* Privacy badge */}
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-indigo-300 font-medium">100% Anonymous Questions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Offerings Section */}
          <div className="animate-[fadeIn_0.6s_ease-out_0.2s_both]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Ask a Question</h2>
                <p className="text-sm text-zinc-500 mt-1">Choose a topic below</p>
              </div>
            </div>

            {offerings.length > 0 ? (
              <div className="space-y-4">
                {offerings.map((offering: Offering, index: number) => (
                  <Link
                    key={offering.id}
                    href={`/${username}/${offering.slug}`}
                    className="block animate-[fadeIn_0.5s_ease-out_both]"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="group relative rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 transition-all duration-300 hover:border-indigo-500/50 hover:bg-zinc-900 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative flex items-center gap-5">
                        {/* Icon container */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-indigo-500/40 transition-all duration-300">
                          <MessageSquare className="w-6 h-6 text-indigo-400" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {offering.title}
                          </h3>
                          {offering.description && (
                            <p className="text-sm text-zinc-500 mt-1 line-clamp-1">
                              {offering.description}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {offering.price}
                              <span className="text-sm font-medium text-zinc-500 ml-1.5">{offering.token}</span>
                            </div>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all duration-300">
                            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 text-zinc-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No offerings yet</h3>
                <p className="text-sm text-zinc-500">This creator hasn't set up any offerings</p>
              </div>
            )}
          </div>

          {/* Trust Section */}
          <div className="mt-12 animate-[fadeIn_0.6s_ease-out_0.5s_both]">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Wallet Hidden', desc: 'ZK proofs' },
                { icon: Lock, label: 'No Account', desc: 'Just pay & ask' },
                { icon: Zap, label: 'Instant', desc: 'On Solana' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-center hover:border-zinc-700/50 hover:bg-zinc-900/80 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-500/10 transition-colors">
                    <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div className="text-sm font-medium text-zinc-300">{item.label}</div>
                  <div className="text-xs text-zinc-600 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-zinc-600">Powered by ShadowWire on Solana</span>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
