'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
      toast.success('Offering created');
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
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/offerings">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-white">New Offering</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Create a new question topic</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Ask Me Anything"
            className="bg-zinc-900 border-zinc-800 text-white text-sm placeholder:text-zinc-600 h-10 focus:border-zinc-700 focus:ring-0 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Description <span className="text-zinc-600">(optional)</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What kind of questions will you answer?"
            className="bg-zinc-900 border-zinc-800 text-white text-sm placeholder:text-zinc-600 min-h-[80px] focus:border-zinc-700 focus:ring-0 resize-none rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Price</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="bg-zinc-900 border-zinc-800 text-white text-sm h-10 focus:border-zinc-700 focus:ring-0 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Token</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 h-10 text-sm font-medium rounded-lg transition-colors ${
                  token === 'SOL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                onClick={() => setToken('SOL')}
              >
                SOL
              </button>
              <button
                type="button"
                className={`flex-1 h-10 text-sm font-medium rounded-lg transition-colors ${
                  token === 'USDC'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                onClick={() => setToken('USDC')}
              >
                USDC
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/offerings" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 text-sm border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1 h-10 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
