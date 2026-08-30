import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminNoteSchema } from '@/lib/validators/schemas';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = adminNoteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { review_id, note } = result.data;

    // Verify the review belongs to the user's business
    const { data: review } = await supabase
      .from('reviews')
      .select('business_id')
      .eq('id', review_id)
      .single();

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', review.business_id)
      .eq('owner_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: adminNote, error: noteError } = await supabase
      .from('admin_notes')
      .insert({
        review_id,
        author_id: user.id,
        note,
      })
      .select()
      .single();

    if (noteError) {
      console.error('Admin note insert error:', noteError);
      return NextResponse.json(
        { error: 'Failed to add note' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, note: adminNote }, { status: 201 });
  } catch (error) {
    console.error('Admin note error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
