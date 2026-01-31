'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
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
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/offerings">
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-white">Create Offering</h1>
          <p className="text-sm text-zinc-500">Set up a new Q&A product for your fans</p>
        </div>
      </div>

      <div className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm text-zinc-300">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Ask Me Anything"
              className="bg-zinc-800/50 border-zinc-700 text-white text-sm placeholder:text-zinc-600 h-10"
              required
            />
            <p className="text-xs text-zinc-600">
              A short, catchy name for your offering
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm text-zinc-300">
              Description <span className="text-zinc-600">(optional)</span>
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of questions will you answer?"
              className="bg-zinc-800/50 border-zinc-700 text-white text-sm placeholder:text-zinc-600 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm text-zinc-300">
                Price
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="bg-zinc-800/50 border-zinc-700 text-white text-sm h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">
                Token
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={token === 'SOL' ? 'default' : 'outline'}
                  className={
                    token === 'SOL'
                      ? 'bg-white text-black hover:bg-zinc-200 flex-1 h-10 text-sm'
                      : 'border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 flex-1 h-10 text-sm'
                  }
                  onClick={() => setToken('SOL')}
                >
                  SOL
                </Button>
                <Button
                  type="button"
                  variant={token === 'USDC' ? 'default' : 'outline'}
                  className={
                    token === 'USDC'
                      ? 'bg-white text-black hover:bg-zinc-200 flex-1 h-10 text-sm'
                      : 'border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 flex-1 h-10 text-sm'
                  }
                  onClick={() => setToken('USDC')}
                >
                  USDC
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/dashboard/offerings" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 h-10 text-sm"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 bg-white text-black hover:bg-zinc-200 h-10 text-sm"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Offering'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
