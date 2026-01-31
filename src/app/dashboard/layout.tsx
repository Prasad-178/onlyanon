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
        <div className="text-zinc-600 text-sm">Loading...</div>
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
      <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-zinc-800/50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-400">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="font-semibold text-white text-sm">OnlyAnon</span>
        <div className="w-5" />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-[#09090b] border-r border-zinc-800/50
            transform transition-transform lg:translate-x-0 lg:static
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-14 flex items-center px-5 border-b border-zinc-800/50">
              <Link href="/" className="font-semibold text-white">OnlyAnon</Link>
            </div>

            {/* User */}
            <div className="p-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-sm">
                    {displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{displayName}</div>
                  <div className="text-xs text-zinc-500 truncate">@{username}</div>
                </div>
              </div>

              {username && (
                <div className="mt-3 flex items-center gap-1">
                  <code className="flex-1 px-2.5 py-1.5 bg-zinc-900 rounded text-xs text-zinc-500 truncate">
                    /{username}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyProfileUrl}
                    className="h-7 w-7 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Link href={`/${username}`} target="_blank">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3">
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
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1
                      ${isActive
                        ? 'bg-white text-black font-medium'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-zinc-800/50">
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-4xl mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
