'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      toast.success('Offering created successfully!');
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/offerings">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Offering</h1>
          <p className="text-gray-400">Set up a new Q&A product for your fans</p>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Offering Details</CardTitle>
          <CardDescription className="text-gray-400">
            Define what fans will pay you for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ask Me Anything"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
              <p className="text-xs text-gray-500">
                A short, catchy name for your offering
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What kind of questions will you answer?"
                className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="token" className="text-white">
                  Token
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={token === 'SOL' ? 'default' : 'outline'}
                    className={
                      token === 'SOL'
                        ? 'bg-purple-600 hover:bg-purple-700 flex-1'
                        : 'border-gray-700 text-gray-400 hover:bg-gray-800 flex-1'
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
                        ? 'bg-purple-600 hover:bg-purple-700 flex-1'
                        : 'border-gray-700 text-gray-400 hover:bg-gray-800 flex-1'
                    }
                    onClick={() => setToken('USDC')}
                  >
                    USDC
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/offerings" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-700 text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Offering'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
