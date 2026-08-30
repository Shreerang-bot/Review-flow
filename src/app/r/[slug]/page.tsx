import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReviewFlowClient } from '@/components/customer/review-flow-client';
import type { Metadata } from 'next';
import type { Business, ReviewTag } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('slug', slug)
    .single();

  if (!business) {
    return { title: 'Store Not Found' };
  }

  return {
    title: `Rate ${business.name} | ReviewFlow AI`,
    description: `Share your experience at ${business.name}. Leave a Google review in seconds.`,
    openGraph: {
      title: `Rate ${business.name}`,
      description: `Share your shopping experience at ${business.name}`,
    },
  };
}

export default async function ReviewPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch business by slug
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (businessError || !business) {
    notFound();
  }

  // Fetch all tags
  const { data: tags } = await supabase
    .from('review_tags')
    .select('*')
    .order('sort_order', { ascending: true });

  const positiveTags = (tags || []).filter((t: ReviewTag) => t.type === 'positive');
  const negativeTags = (tags || []).filter((t: ReviewTag) => t.type === 'negative');

  return (
    <ReviewFlowClient
      business={business as Business}
      positiveTags={positiveTags}
      negativeTags={negativeTags}
    />
  );
}
