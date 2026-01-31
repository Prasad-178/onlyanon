import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createOfferingSchema = z.object({
  privy_did: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  token: z.enum(['SOL', 'USDC']),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOfferingSchema.parse(body);

    const supabase = await createServiceClient();

    // Get creator by privy_did
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .eq('privy_did', data.privy_did)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Generate unique slug
    let slug = slugify(data.title);
    let slugSuffix = 0;
    let finalSlug = slug;

    // Check for existing slug and make unique
    while (true) {
      const { data: existing } = await supabase
        .from('offerings')
        .select('id')
        .eq('creator_id', creator.id)
        .eq('slug', finalSlug)
        .single();

      if (!existing) break;
      slugSuffix++;
      finalSlug = `${slug}-${slugSuffix}`;
    }

    // Create offering
    const { data: offering, error } = await supabase
      .from('offerings')
      .insert({
        creator_id: creator.id,
        title: data.title,
        description: data.description || null,
        slug: finalSlug,
        price: data.price,
        token: data.token,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create offering', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ offering });
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
    const privyDid = searchParams.get('privy_did');
    const creatorUsername = searchParams.get('username');

    const supabase = await createServiceClient();

    let query = supabase
      .from('offerings')
      .select(`
        *,
        creators!inner (
          id,
          privy_did,
          twitter_username
        )
      `)
      .order('created_at', { ascending: false });

    if (privyDid) {
      query = query.eq('creators.privy_did', privyDid);
    } else if (creatorUsername) {
      query = query.eq('creators.twitter_username', creatorUsername.toLowerCase());
      query = query.eq('is_active', true);
    } else {
      return NextResponse.json(
        { error: 'Either privy_did or username is required' },
        { status: 400 }
      );
    }

    const { data: offerings, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch offerings', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ offerings: offerings || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
