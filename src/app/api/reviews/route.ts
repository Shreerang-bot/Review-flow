import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reviewSubmissionSchema, reviewStatusSchema } from '@/lib/validators/schemas';
import { sendFeedbackNotification } from '@/lib/notifications/email';
import { formatDateTime } from '@/lib/utils';

// Simple in-memory rate limiter for public submissions
const submitRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const SUBMIT_RATE_LIMIT = 5;
const SUBMIT_RATE_WINDOW = 5 * 60 * 1000; // 5 minutes

function checkSubmitRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = submitRateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    submitRateLimitMap.set(ip, { count: 1, resetAt: now + SUBMIT_RATE_WINDOW });
    return true;
  }

  if (entry.count >= SUBMIT_RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// POST - Create a new review (public)
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkSubmitRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = reviewSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { business_id, rating, review_text, feedback, customer_name, tag_ids, is_private } = result.data;

    // Insert the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        business_id,
        rating,
        review_text: review_text || null,
        feedback: feedback || null,
        customer_name: customer_name || null,
        status: is_private ? 'pending' : 'approved',
        is_private,
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Review insert error:', reviewError);
      return NextResponse.json(
        { error: 'Failed to submit review' },
        { status: 500 }
      );
    }

    // Insert tag mappings
    if (tag_ids.length > 0) {
      const tagMappings = tag_ids.map(tag_id => ({
        review_id: review.id,
        tag_id,
      }));

      const { error: tagError } = await supabase
        .from('review_tag_mapping')
        .insert(tagMappings);

      if (tagError) {
        console.error('Tag mapping error:', tagError);
      }
    }

    // Send email notification for private feedback
    if (is_private) {
      try {
        const { data: business } = await supabase
          .from('businesses')
          .select('name, notification_email')
          .eq('id', business_id)
          .single();

        if (business?.notification_email) {
          // Get tag names
          let tagNames: string[] = [];
          if (tag_ids.length > 0) {
            const { data: tags } = await supabase
              .from('review_tags')
              .select('name')
              .in('id', tag_ids);
            tagNames = tags?.map(t => t.name) || [];
          }

          await sendFeedbackNotification({
            businessName: business.name,
            toEmail: business.notification_email,
            rating,
            tags: tagNames,
            feedback: feedback || undefined,
            submittedAt: formatDateTime(new Date()),
          });
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List reviews (authenticated - admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const rating = searchParams.get('rating');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Reviews fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // Get tags for all reviews
    const reviewIds = reviews?.map(r => r.id) || [];
    let reviewsWithTags = reviews || [];

    if (reviewIds.length > 0) {
      const { data: tagMappings } = await supabase
        .from('review_tag_mapping')
        .select('review_id, tag_id, review_tags(id, name, type)')
        .in('review_id', reviewIds);

      const tagsByReview = new Map<string, Array<{ id: string; name: string; type: string }>>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tagMappings as any[])?.forEach((mapping) => {
        const tags = tagsByReview.get(mapping.review_id) || [];
        if (mapping.review_tags) {
          tags.push(mapping.review_tags);
        }
        tagsByReview.set(mapping.review_id, tags);
      });

      reviewsWithTags = reviews?.map(review => ({
        ...review,
        tags: tagsByReview.get(review.id) || [],
      })) || [];
    }

    return NextResponse.json({
      data: reviewsWithTags,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update review status (authenticated - admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, ...statusData } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const result = reviewStatusSchema.safeParse(statusData);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid status', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: review } = await supabase
      .from('reviews')
      .select('business_id')
      .eq('id', reviewId)
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

    const { data: updated, error: updateError } = await supabase
      .from('reviews')
      .update({ status: result.data.status })
      .eq('id', reviewId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error('Review PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
