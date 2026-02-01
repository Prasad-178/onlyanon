'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy, useLogout } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Home,
} from 'lucide-react';
import { useState, ReactNode, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const navItems = [
  { href: '/dashboard', label: 'Questions', icon: MessageSquare, description: 'Manage incoming questions' },
  { href: '/dashboard/offerings', label: 'Offerings', icon: Package, description: 'Your question topics' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, description: 'Account preferences' },
];

async function syncCreatorToDb(user: any) {
  const twitter = user.twitter;
  const wallet = user.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'solana'
  ) as { address?: string } | undefined;

  if (!twitter) return;

  const walletAddress = wallet?.address || user.wallet?.address;
  if (!walletAddress) return;

  try {
    await fetch('/api/creators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        privy_did: user.id,
        twitter_id: twitter.subject,
        twitter_username: twitter.username,
        display_name: twitter.name || twitter.username,
        avatar_url: twitter.profilePictureUrl?.replace('_normal', ''),
        wallet_address: walletAddress,
      }),
    });
  } catch (error) {
    console.error('Failed to sync creator:', error);
  }
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  const { logout } = useLogout({
    onSuccess: () => router.push('/'),
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (ready && authenticated && user && !hasSynced.current) {
      hasSynced.current = true;
      syncCreatorToDb(user);
    }
  }, [ready, authenticated, user]);

  const copyProfileUrl = () => {
    if (username) {
      navigator.clipboard.writeText(`${window.location.origin}/${username}`);
      setCopied(true);
      toast.success('Profile URL copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  const twitter = user?.twitter;
  const displayName = twitter?.name || twitter?.username || 'Creator';
  const avatarUrl = twitter?.profilePictureUrl?.replace('_normal', '');
  const username = twitter?.username || '';

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between bg-[#09090b]/95 backdrop-blur-sm border-b border-zinc-800/50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-white text-lg">OnlyAnon</span>
        </Link>
        <div className="w-10" />
      </header>

      <div className="flex lg:pt-0 pt-16">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-zinc-900/95 to-[#09090b] border-r border-zinc-800/50
            transform transition-transform duration-300 lg:translate-x-0 lg:static
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/50">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-white text-lg tracking-tight">OnlyAnon</span>
              </Link>
              <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
                <Home className="h-4 w-4" />
              </Link>
            </div>

            {/* User Profile Card */}
            <div className="p-4">
              <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-11 w-11 ring-2 ring-zinc-700">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-300">
                      {displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{displayName}</div>
                    <div className="text-xs text-zinc-500 truncate">@{username}</div>
                  </div>
                </div>

                {username && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-zinc-900/80 rounded-lg border border-zinc-700/50">
                      <code className="text-xs text-zinc-400 truncate block">
                        /{username}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyProfileUrl}
                      className="h-9 w-9 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Link href={`/${username}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2">
              <p className="px-3 mb-2 text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Menu</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 mb-1
                      ${isActive
                        ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/10 text-white border border-indigo-500/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-indigo-500/20' : 'bg-zinc-800/50 group-hover:bg-zinc-700/50'
                    }`}>
                      <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</div>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-zinc-800/50">
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-5xl mx-auto p-6 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
