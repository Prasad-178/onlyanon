'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Info } from 'lucide-react';
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
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your profile and account</p>
      </div>

      {/* Profile */}
      <div className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
        <p className="text-xs text-zinc-500 mb-4">Profile</p>

        <div className="flex items-center gap-4 mb-5">
          <Avatar className="h-14 w-14">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="text-lg bg-zinc-800 text-zinc-400">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base font-medium text-white">{displayName}</h3>
            <p className="text-sm text-zinc-500">@{username}</p>
          </div>
        </div>

        {profileUrl && (
          <div className="p-4 rounded-lg bg-zinc-800/50">
            <p className="text-xs text-zinc-500 mb-2">Your public profile</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-zinc-300 truncate">
                {profileUrl}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(profileUrl, 'profile')}
                className="text-zinc-500 hover:text-white h-8 w-8 p-0"
              >
                {copied === 'profile' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white h-8 w-8 p-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Wallet */}
      <div className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
        <p className="text-xs text-zinc-500 mb-4">Wallet</p>

        <div className="p-4 rounded-lg bg-zinc-800/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-zinc-500">Wallet Address</p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">
              Connected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm text-white font-mono truncate">
              {walletAddress}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(walletAddress, 'wallet')}
              className="text-zinc-500 hover:text-white h-8 w-8 p-0"
            >
              {copied === 'wallet' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          This wallet was automatically created when you signed up. All payments from fans go directly to this address.
        </p>
      </div>

      {/* Info */}
      <div className="p-5 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-zinc-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">How payments work</h3>
            <ul className="text-xs text-zinc-500 space-y-1.5">
              <li>Fans pay via ShadowWire anonymous transfers</li>
              <li>Payments go directly to your wallet (no middleman)</li>
              <li>You never see the fans wallet address</li>
              <li>Network fees are 0.3-1% depending on token</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
