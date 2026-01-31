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
} from 'lucide-react';
import { useState, ReactNode, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const navItems = [
  { href: '/dashboard', label: 'Questions', icon: MessageSquare },
  { href: '/dashboard/offerings', label: 'Offerings', icon: Package },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
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
    onSuccess: () => {
      router.push('/');
    },
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
      toast.success('Profile URL copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const twitter = user?.twitter;
  const displayName = twitter?.name || twitter?.username || 'Creator';
  const avatarUrl = twitter?.profilePictureUrl?.replace('_normal', '');
  const username = twitter?.username || '';

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0f]">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-zinc-400 hover:text-white"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <span className="font-bold text-white">
          Only<span className="text-cyan-400">Anon</span>
        </span>
        <div className="w-6" />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0f] border-r border-white/5 transform transition-transform lg:translate-x-0 lg:static
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
              <Link href="/" className="text-xl font-bold text-white">
                Only<span className="text-cyan-400">Anon</span>
              </Link>
            </div>

            {/* User info */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 ring-2 ring-white/10">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-[#18181f] text-white">
                    {displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{displayName}</div>
                  <div className="text-zinc-500 text-sm truncate">@{username}</div>
                </div>
              </div>
              {username && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-[#18181f] rounded-lg text-sm text-zinc-400 truncate">
                    /{username}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyProfileUrl}
                    className="text-zinc-500 hover:text-white shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Link href={`/${username}`} target="_blank">
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
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
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                      ${isActive
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/5">
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-500 hover:text-white hover:bg-white/5 font-medium"
                onClick={() => logout()}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6 lg:p-8 max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
