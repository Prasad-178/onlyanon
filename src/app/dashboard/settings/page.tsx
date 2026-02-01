'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, Check, ExternalLink } from 'lucide-react';
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
    <div className="max-w-lg space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your account</p>
      </div>

      {/* Profile */}
      <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Profile</div>
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-lg">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-base font-medium text-white">{displayName}</div>
            <div className="text-sm text-zinc-500">@{username}</div>
          </div>
        </div>

        {profileUrl && (
          <div className="mt-5 pt-5 border-t border-zinc-800">
            <div className="text-xs text-zinc-500 mb-2">Public profile</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-zinc-800/50 rounded-lg text-xs text-zinc-400 truncate">
                {profileUrl}
              </code>
              <button
                onClick={() => copyToClipboard(profileUrl, 'profile')}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                {copied === 'profile' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <button className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Wallet */}
      <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Wallet</div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-zinc-500">Connected</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
            Solana
          </span>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-zinc-800/50 rounded-lg text-xs text-white font-mono truncate">
            {walletAddress}
          </code>
          <button
            onClick={() => copyToClipboard(walletAddress, 'wallet')}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {copied === 'wallet' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-4 text-xs text-zinc-600">
          All payments from fans go directly to this wallet.
        </p>
      </div>

      {/* Info */}
      <div className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">How it works</div>
        <ul className="space-y-2 text-xs text-zinc-400">
          <li>• Fans pay via ShadowWire anonymous transfers</li>
          <li>• Payments go directly to your wallet</li>
          <li>• You never see the fan's wallet address</li>
          <li>• Network fees are 0.3-1% depending on token</li>
        </ul>
      </div>
    </div>
  );
}
