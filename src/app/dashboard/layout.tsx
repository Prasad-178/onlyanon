'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePrivy, useLogout } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Package, Settings, LogOut, Menu, X, Copy, Check, Loader2 } from 'lucide-react';
import { useState, ReactNode, useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Logo component
function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img src="/onlyanon_logo.png" alt="OnlyAnon" className={className} />
  );
}

const navItems = [
  { href: '/dashboard', label: 'Questions', icon: MessageSquare },
  { href: '/dashboard/offerings', label: 'Offerings', icon: Package },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

async function syncCreatorToDb(user: any): Promise<boolean> {
  const twitter = user.twitter;
  const wallet = user.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'solana'
  ) as { address?: string } | undefined;

  if (!twitter) return false;
  const walletAddress = wallet?.address || user.wallet?.address;
  if (!walletAddress) return false;

  try {
    const response = await fetch('/api/creators', {
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
    return response.ok;
  } catch (error) {
    console.error('Failed to sync creator:', error);
    return false;
  }
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  const { logout } = useLogout({ onSuccess: () => router.push('/') });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (ready && !authenticated) router.push('/login');
  }, [ready, authenticated, router]);

  useEffect(() => {
    async function doSync() {
      if (ready && authenticated && user && !hasSynced.current) {
        hasSynced.current = true;
        setIsSyncing(true);
        const success = await syncCreatorToDb(user);
        if (!success) {
          // Retry once after a short delay
          await new Promise(resolve => setTimeout(resolve, 500));
          await syncCreatorToDb(user);
        }
        setIsSyncing(false);
      } else if (ready && authenticated) {
        setIsSyncing(false);
      }
    }
    doSync();
  }, [ready, authenticated, user]);

  const copyProfileUrl = () => {
    if (username) {
      navigator.clipboard.writeText(`${window.location.origin}/${username}`);
      setCopied(true);
      toast.success('Copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!ready || isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <Loader2 className="h-5 w-5 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!authenticated) return null;

  const twitter = user?.twitter;
  const displayName = twitter?.name || twitter?.username || 'Creator';
  const avatarUrl = twitter?.profilePictureUrl?.replace('_normal', '');
  const username = twitter?.username || '';

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 px-4 flex items-center justify-between bg-[#0a0a0b] border-b border-zinc-800/80">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-7 h-7" />
          <span className="font-semibold text-white">OnlyAnon</span>
        </Link>
        <div className="w-9" />
      </header>

      <div className="flex lg:pt-0 pt-14">
        {/* Sidebar */}
        <aside className={`
          fixed left-0 z-50 w-64 bg-[#0a0a0b] border-r border-zinc-800/80
          transform transition-transform duration-200 lg:translate-x-0 lg:static
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:top-0 lg:bottom-0 lg:h-screen
          top-14 bottom-0 h-[calc(100dvh-3.5rem)]
        `}>
          <div className="flex flex-col h-full max-h-full overflow-y-auto overscroll-contain">
            {/* Logo - hidden on mobile since we have the header */}
            <div className="h-14 hidden lg:flex items-center px-5 border-b border-zinc-800/80">
              <Link href="/" className="flex items-center gap-2">
                <Logo className="w-7 h-7" />
                <span className="font-semibold text-white">OnlyAnon</span>
              </Link>
            </div>

            {/* User */}
            <div className="p-4 border-b border-zinc-800/80">
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
                <button
                  onClick={copyProfileUrl}
                  className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                >
                  <code className="text-xs text-zinc-500 group-hover:text-zinc-400">/{username}</code>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400" />
                  )}
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1
                      ${isActive
                        ? 'bg-zinc-800/80 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-zinc-800/80">
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen min-w-0 overflow-x-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
