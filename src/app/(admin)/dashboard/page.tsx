import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Star,
  MessageSquareText,
  AlertTriangle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelative, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | ReviewFlow AI',
};

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>, businessId: string) {
  const [
    { count: totalReviews },
    { count: fiveStarReviews },
    { count: privateFeedback },
    { count: pendingReviews },
    { data: ratingsData },
  ] = await Promise.all([
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('rating', 5),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('is_private', true),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'pending'),
    supabase.from('reviews').select('rating').eq('business_id', businessId),
  ]);

  const ratings = ratingsData || [];
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length
    : 0;

  return {
    totalReviews: totalReviews || 0,
    fiveStarReviews: fiveStarReviews || 0,
    privateFeedback: privateFeedback || 0,
    pendingReviews: pendingReviews || 0,
    averageRating: Math.round(averageRating * 10) / 10,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-bold text-[#111827]">No business found</h2>
          <p className="text-[#4B5563]">Please set up your business in Settings.</p>
        </div>
      </div>
    );
  }

  const stats = await getStats(supabase, business.id);

  // Recent reviews
  const { data: recentReviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const statCards = [
    {
      label: 'Total Reviews',
      value: stats.totalReviews,
      icon: MessageSquareText,
      iconBg: 'bg-[#EEF2FF]',
      iconColor: 'text-[#4F46E5]',
    },
    {
      label: '5-Star Reviews',
      value: stats.fiveStarReviews,
      icon: Star,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#F59E0B]',
    },
    {
      label: 'Private Feedback',
      value: stats.privateFeedback,
      icon: AlertTriangle,
      iconBg: 'bg-[#FEF2F2]',
      iconColor: 'text-[#DC2626]',
    },
    {
      label: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: Clock,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#F59E0B]',
    },
    {
      label: 'Average Rating',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—',
      icon: TrendingUp,
      iconBg: 'bg-[#DCFCE7]',
      iconColor: 'text-[#16A34A]',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
        <p className="text-[#4B5563] mt-1">Overview of your review performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="border-[#E5E7EB] shadow-sm rounded-2xl hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
                <p className="text-sm text-[#9CA3AF] mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Recent Activity</h2>
        <Card className="border-[#E5E7EB] shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {!recentReviews || recentReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-14 h-14 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquareText className="w-7 h-7 text-[#9CA3AF]" />
                </div>
                <p className="text-[#4B5563] font-medium">No reviews yet</p>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  Share your QR code to start collecting reviews
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111827] truncate">
                        {review.review_text || review.feedback || 'No text provided'}
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {formatRelative(review.created_at)}
                        {review.customer_name && ` · ${review.customer_name}`}
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(review.status)} border-0 rounded-full text-xs font-medium px-2.5 py-0.5`}
                    >
                      {getStatusLabel(review.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
