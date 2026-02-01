'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Info, Wallet, User, Shield, Zap, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = usePrivy();
  const [copied, setCopied] = useState<string | null>(null);

  const twitter = user?.twitter;
  const wallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet' && 'chainType' in account && account.chainType === 'solana'
  ) as { address?: string } | undefined;

  const displayName = twitter?.name || twitter?.username || 'Creator';
  const avatarUrl = twitter?.profilePictureUrl?.replace('_normal', '');
  const username = twitter?.username || '';
  const walletAddress = wallet?.address || user?.wallet?.address || '';
  const profileUrl = username ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}` : '';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-zinc-500">Manage your profile and account</p>
      </div>

      {/* Profile Section */}
      <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <User className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-zinc-300">Profile</span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 ring-2 ring-zinc-700">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 text-indigo-300">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-white">{displayName}</h3>
            <p className="text-sm text-zinc-500">@{username}</p>
          </div>
        </div>

        {profileUrl && (
          <div className="rounded-xl bg-zinc-900/80 border border-zinc-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="h-4 w-4 text-zinc-500" />
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Your public profile</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-zinc-300 truncate bg-zinc-800/50 px-3 py-2 rounded-lg">
                {profileUrl}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(profileUrl, 'profile')}
                className="h-10 w-10 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
              >
                {copied === 'profile' ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Section */}
      <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-zinc-300">Wallet</span>
        </div>

        <div className="rounded-xl bg-zinc-900/80 border border-zinc-700/50 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Connected</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="h-3 w-3" />
              Solana
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm text-white font-mono truncate bg-zinc-800/50 px-3 py-2 rounded-lg">
              {walletAddress}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(walletAddress, 'wallet')}
              className="h-10 w-10 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
            >
              {copied === 'wallet' ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <p className="text-sm text-zinc-500">
          This wallet was automatically created when you signed up. All payments from fans go directly to this address.
        </p>
      </div>

      {/* Info Section */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-3">How payments work</h3>
            <ul className="space-y-3">
              {[
                { icon: Shield, text: 'Fans pay via ShadowWire anonymous transfers' },
                { icon: Zap, text: 'Payments go directly to your wallet (no middleman)' },
                { icon: User, text: 'You never see the fan\'s wallet address' },
                { icon: Wallet, text: 'Network fees are 0.3-1% depending on token' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                  <item.icon className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
