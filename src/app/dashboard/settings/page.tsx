'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Manage your profile and account</p>
      </div>

      {/* Profile Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Profile</CardTitle>
          <CardDescription className="text-gray-400">
            Your public information from Twitter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="text-xl bg-gray-800 text-white">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-white">{displayName}</h3>
              <p className="text-gray-400">@{username}</p>
            </div>
          </div>

          {profileUrl && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Your public profile</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-purple-400 text-sm truncate">
                  {profileUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(profileUrl, 'profile')}
                  className="text-gray-400 hover:text-white"
                >
                  {copied === 'profile' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Wallet</CardTitle>
          <CardDescription className="text-gray-400">
            Your Solana wallet for receiving payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Wallet Address</p>
              <Badge className="bg-green-500/20 text-green-500">Connected</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-white text-sm font-mono truncate">
                {walletAddress}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(walletAddress, 'wallet')}
                className="text-gray-400 hover:text-white"
              >
                {copied === 'wallet' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            This wallet was automatically created when you signed up. All payments from fans go directly to this address.
          </p>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-purple-600/10 border-purple-600/20">
        <CardContent className="p-6">
          <h3 className="text-purple-400 font-medium mb-2">How payments work</h3>
          <ul className="text-purple-300/80 text-sm space-y-2">
            <li>• Fans pay via ShadowWire anonymous transfers</li>
            <li>• Payments go directly to your wallet (no middleman)</li>
            <li>• You never see the fans wallet address</li>
            <li>• Network fees are 0.3-1% depending on token</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
