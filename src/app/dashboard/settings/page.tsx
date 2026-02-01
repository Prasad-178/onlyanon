'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ExternalLink, Wallet, Link2, Info, Shield, Zap } from 'lucide-react';

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

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-900/50 border border-zinc-800/80"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-purple-500/[0.03]" />

          <div className="relative p-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-zinc-800"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-zinc-800">
                    <span className="text-2xl font-bold text-white">
                      {displayName[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 pt-1">
                <h2 className="text-xl font-semibold text-white">{displayName}</h2>
                <p className="text-zinc-500 text-sm mt-0.5">@{username}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Public Profile URL */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Public Profile</h3>
              <p className="text-xs text-zinc-500">Share this link with your fans</p>
            </div>
          </div>

          {profileUrl && (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 font-mono text-sm text-zinc-300 truncate">
                {profileUrl}
              </div>
              <motion.button
                onClick={() => copyToClipboard(profileUrl, 'profile')}
                className="relative h-11 w-11 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {copied === 'profile' ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 w-11 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </motion.div>

        {/* Wallet */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Wallet</h3>
                <p className="text-xs text-zinc-500">Receives all payments</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 border border-[#9945FF]/20 text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195]">
              Solana
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <div className="font-mono text-sm text-white">{truncateAddress(walletAddress)}</div>
              <div className="text-xs text-zinc-500 mt-0.5 font-mono truncate">{walletAddress}</div>
            </div>
            <motion.button
              onClick={() => copyToClipboard(walletAddress, 'wallet')}
              className="relative h-11 w-11 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {copied === 'wallet' ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-5"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center">
              <Info className="w-4 h-4 text-zinc-400" />
            </div>
            <h3 className="text-sm font-medium text-white">How payments work</h3>
          </div>

          <div className="grid gap-4">
            {[
              { icon: Shield, text: 'Fans pay anonymously via ShadowWire', color: 'text-indigo-400' },
              { icon: Zap, text: 'Payments go directly to your wallet', color: 'text-amber-400' },
              { icon: Wallet, text: 'You keep 95% of every payment', color: 'text-emerald-400' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-zinc-300">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
