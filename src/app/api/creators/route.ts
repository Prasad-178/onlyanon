import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createCreatorSchema = z.object({
  privy_did: z.string().min(1),
  twitter_id: z.string().min(1),
  twitter_username: z.string().min(1),
  display_name: z.string().min(1),
  avatar_url: z.string().url().optional().nullable(),
  wallet_address: z.string().min(32),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createCreatorSchema.parse(body);

    const supabase = await createServiceClient();

    // Upsert creator - create if new, update if exists
    const { data: creator, error } = await supabase
      .from('creators')
      .upsert(
        {
          privy_did: data.privy_did,
          twitter_id: data.twitter_id,
          twitter_username: data.twitter_username.toLowerCase(),
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          wallet_address: data.wallet_address,
        },
        {
          onConflict: 'privy_did',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create/update creator', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ creator });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const list = searchParams.get('list');

    const supabase = await createServiceClient();

    // If list=true, return all active creators with at least one offering
    if (list === 'true') {
      const { data: creators, error } = await supabase
        .from('creators')
        .select(`
          id,
          twitter_username,
          display_name,
          avatar_url,
          bio,
          offerings!inner (id)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch creators' },
          { status: 500 }
        );
      }

      // Transform to remove the offerings array (we just needed it for the inner join)
      const creatorsWithOfferings = creators?.map(({ offerings, ...creator }) => ({
        ...creator,
        offering_count: offerings?.length || 0,
      })) || [];

      return NextResponse.json({ creators: creatorsWithOfferings });
    }

    // Otherwise, get a specific creator by username
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const { data: creator, error } = await supabase
      .from('creators')
      .select('*')
      .eq('twitter_username', username.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ creator });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
