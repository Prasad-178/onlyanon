import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { generateAccessCode } from '@/lib/utils/access-code';

const createQuestionSchema = z.object({
  offering_id: z.string().uuid(),
  question_text: z.string().min(1).max(1000),
  payment_signature: z.string().min(1),
  payment_amount: z.number().positive(),
  payment_token: z.enum(['SOL', 'USDC']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createQuestionSchema.parse(body);

    const supabase = await createServiceClient();

    // Verify offering exists and is active
    const { data: offering, error: offeringError } = await supabase
      .from('offerings')
      .select('id, price, token, is_active')
      .eq('id', data.offering_id)
      .single();

    if (offeringError || !offering) {
      return NextResponse.json(
        { error: 'Offering not found' },
        { status: 404 }
      );
    }

    if (!offering.is_active) {
      return NextResponse.json(
        { error: 'Offering is not active' },
        { status: 400 }
      );
    }

    // Generate unique access code
    let accessCode = generateAccessCode();
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('questions')
        .select('id')
        .eq('access_code', accessCode)
        .single();

      if (!existing) break;
      accessCode = generateAccessCode();
      attempts++;
    }

    // Create question
    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        offering_id: data.offering_id,
        question_text: data.question_text,
        access_code: accessCode,
        payment_signature: data.payment_signature,
        payment_amount: data.payment_amount,
        payment_token: data.payment_token,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create question', details: error.message },
        { status: 500 }
      );
    }

    // Return only the access code - no other identifying info
    return NextResponse.json({
      success: true,
      access_code: accessCode,
    });
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
    const status = searchParams.get('status');

    if (!privyDid) {
      return NextResponse.json(
        { error: 'privy_did is required' },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Get creator
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .eq('privy_did', privyDid)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({ questions: [] });
    }

    // Get questions for all creator's offerings
    let query = supabase
      .from('questions')
      .select(`
        id,
        question_text,
        status,
        payment_amount,
        payment_token,
        created_at,
        offerings!inner (
          id,
          title,
          creator_id
        )
      `)
      .eq('offerings.creator_id', creator.id)
      .order('created_at', { ascending: false });

    if (status && ['pending', 'replied', 'archived'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questions', details: error.message },
        { status: 500 }
      );
    }

    // Transform response
    const formattedQuestions = questions?.map((q: any) => ({
      id: q.id,
      question_text: q.question_text,
      status: q.status,
      payment_amount: q.payment_amount,
      payment_token: q.payment_token,
      created_at: q.created_at,
      offering_title: q.offerings.title,
    })) || [];

    return NextResponse.json({ questions: formattedQuestions });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
