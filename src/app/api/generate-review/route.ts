import { NextRequest, NextResponse } from 'next/server';
import { generateReview } from '@/lib/ai/generate-review';
import { generateReviewSchema } from '@/lib/validators/schemas';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = generateReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { tags, rating, businessName } = result.data;
    const review = await generateReview(tags, rating, businessName);

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Generate review error:', error);
    return NextResponse.json(
      { error: 'Failed to generate review. Please try again.' },
      { status: 500 }
    );
  }
}
