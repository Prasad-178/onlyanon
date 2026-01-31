import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const { searchParams } = new URL(request.url);
    const privyDid = searchParams.get('privy_did');

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
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Get question with offering and reply
    const { data: question, error: questionError } = await supabase
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
        ),
        replies (
          reply_text,
          created_at
        )
      `)
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Verify question belongs to creator
    const offering = question.offerings as any;
    if (offering.creator_id !== creator.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const reply = (question.replies as any[])?.[0];

    return NextResponse.json({
      question: {
        id: question.id,
        question_text: question.question_text,
        status: question.status,
        payment_amount: question.payment_amount,
        payment_token: question.payment_token,
        created_at: question.created_at,
        offering_title: offering.title,
        reply_text: reply?.reply_text,
        replied_at: reply?.created_at,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
