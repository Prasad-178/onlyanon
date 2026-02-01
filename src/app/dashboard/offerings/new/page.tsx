'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Package, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewOfferingPage() {
  const router = useRouter();
  const { user } = usePrivy();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [token, setToken] = useState<'SOL' | 'USDC'>('SOL');

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/offerings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privy_did: user?.id,
          title,
          description,
          price: parseFloat(price),
          token,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create offering');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offerings'] });
      toast.success('Offering created successfully');
      router.push('/dashboard/offerings');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    createMutation.mutate();
  };

  return (
    <div className="max-w-xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/offerings">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Offering</h1>
          <p className="text-zinc-500">Set up a new Q&A product for your fans</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-zinc-300">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Ask Me Anything"
              className="bg-zinc-900/80 border-zinc-700 text-white text-base placeholder:text-zinc-600 h-12 rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20"
              required
            />
            <p className="text-xs text-zinc-600">
              A short, catchy name for your offering
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-zinc-300">
              Description <span className="text-zinc-600">(optional)</span>
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of questions will you answer?"
              className="bg-zinc-900/80 border-zinc-700 text-white text-base placeholder:text-zinc-600 min-h-[100px] rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          {/* Price & Token */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-zinc-300">
                Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="bg-zinc-900/80 border-zinc-700 text-white text-base h-12 pl-10 rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Token
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className={`flex-1 h-12 text-base font-medium rounded-xl transition-all ${
                    token === 'SOL'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  onClick={() => setToken('SOL')}
                >
                  SOL
                </Button>
                <Button
                  type="button"
                  className={`flex-1 h-12 text-base font-medium rounded-xl transition-all ${
                    token === 'USDC'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  onClick={() => setToken('USDC')}
                >
                  USDC
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/offerings" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-medium rounded-xl border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 h-12 text-base font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Create Offering
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
