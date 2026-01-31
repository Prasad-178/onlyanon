'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';

interface Offering {
  id: string;
  title: string;
  description: string;
  slug: string;
  price: number;
  token: string;
  is_active: boolean;
  question_count: number;
  created_at: string;
}

export default function OfferingsPage() {
  const { user } = usePrivy();
  const privyDid = user?.id;

  const { data: offerings, isLoading } = useQuery({
    queryKey: ['offerings', privyDid],
    queryFn: async (): Promise<Offering[]> => {
      const res = await fetch(`/api/offerings?privy_did=${privyDid}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.offerings || [];
    },
    enabled: !!privyDid,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Offerings</h1>
          <p className="text-gray-400">Manage what fans can ask you about</p>
        </div>
        <Link href="/dashboard/offerings/new">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Offering
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-3 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : offerings && offerings.length > 0 ? (
        <div className="grid gap-4">
          {offerings.map((offering) => (
            <Card
              key={offering.id}
              className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{offering.title}</h3>
                      <Badge
                        variant={offering.is_active ? 'default' : 'secondary'}
                        className={
                          offering.is_active
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }
                      >
                        {offering.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {offering.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {offering.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-purple-400 font-medium">
                        {offering.price} {offering.token}
                      </span>
                      <span className="text-gray-500">
                        {offering.question_count} questions received
                      </span>
                    </div>
                  </div>
                  <Link href={`/dashboard/offerings/${offering.id}`}>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No offerings yet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Create an offering to let fans pay for your answers
            </p>
            <Link href="/dashboard/offerings/new">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Offering
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
