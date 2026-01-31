import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const replySchema = z.object({
  privy_did: z.string().min(1),
  reply_text: z.string().min(1).max(2000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const body = await request.json();
    const data = replySchema.parse(body);

    const supabase = await createServiceClient();

    // Get creator
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

    // Verify question belongs to creator's offering
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select(`
        id,
        status,
        offerings!inner (
          creator_id
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

    const offering = question.offerings as any;
    if (offering.creator_id !== creator.id) {
      return NextResponse.json(
        { error: 'Not authorized to reply to this question' },
        { status: 403 }
      );
    }

    if (question.status === 'replied') {
      return NextResponse.json(
        { error: 'Question already has a reply' },
        { status: 400 }
      );
    }

    // Create reply
    const { data: reply, error: replyError } = await supabase
      .from('replies')
      .insert({
        question_id: questionId,
        reply_text: data.reply_text,
      })
      .select()
      .single();

    if (replyError) {
      console.error('Supabase error:', replyError);
      return NextResponse.json(
        { error: 'Failed to create reply', details: replyError.message },
        { status: 500 }
      );
    }

    // Update question status
    await supabase
      .from('questions')
      .update({ status: 'replied' })
      .eq('id', questionId);

    return NextResponse.json({ reply });
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
