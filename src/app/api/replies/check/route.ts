import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { normalizeAccessCode, formatAccessCode, validateAccessCode } from '@/lib/utils/access-code';
import { z } from 'zod';

const checkReplySchema = z.object({
  access_code: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkReplySchema.parse(body);

    // Validate and format access code
    if (!validateAccessCode(data.access_code)) {
      return NextResponse.json(
        { error: 'Invalid access code format' },
        { status: 400 }
      );
    }

    const formattedCode = formatAccessCode(data.access_code);

    const supabase = await createServiceClient();

    // Query question and reply by access code
    const { data: question, error } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        status,
        created_at,
        offerings (
          title,
          creators (
            display_name,
            avatar_url,
            twitter_username
          )
        ),
        replies (
          reply_text,
          created_at
        )
      `)
      .eq('access_code', formattedCode)
      .single();

    if (error || !question) {
      return NextResponse.json(
        { error: 'Access code not found' },
        { status: 404 }
      );
    }

    // Return question and reply (if exists) - NO fan data exposed
    const offering = question.offerings as any;
    const creator = offering?.creators as any;
    // Handle both array (standard) and object (unique FK) cases
    const replies = question.replies as any;
    const reply = Array.isArray(replies) ? replies[0] : replies;

    return NextResponse.json({
      question: {
        text: question.question_text,
        status: question.status,
        asked_at: question.created_at,
        offering_title: offering?.title,
        creator_name: creator?.display_name,
        creator_avatar: creator?.avatar_url,
        creator_username: creator?.twitter_username,
      },
      reply: reply
        ? {
            text: reply.reply_text,
            replied_at: reply.created_at,
          }
        : null,
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
