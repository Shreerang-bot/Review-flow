'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MessageSquareText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatRelative, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Review } from '@/types';

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected', 'resolved'] as const;
const RATING_OPTIONS = ['all', '5', '4', '3', '2', '1'] as const;

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (ratingFilter !== 'all') params.set('rating', ratingFilter);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/reviews?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, ratingFilter, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Reviews</h1>
        <p className="text-[#4B5563] mt-1">Manage all customer reviews and feedback</p>
      </div>

      {/* Filters */}
      <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] w-full sm:w-[180px]"
              id="status-filter"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Rating filter */}
            <select
              value={ratingFilter}
              onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
              className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] w-full sm:w-[180px]"
              id="rating-filter"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <div className="flex-1 text-right text-sm text-[#9CA3AF] self-center hidden sm:block">
              {total} review{total !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="border-[#E5E7EB] shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0 divide-y divide-[#F3F4F6]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-1/3 bg-gray-100 rounded" />
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-4">
                <MessageSquareText className="w-7 h-7 text-[#9CA3AF]" />
              </div>
              <p className="text-[#4B5563] font-medium">No reviews found</p>
              <p className="text-sm text-[#9CA3AF] mt-1">
                {statusFilter !== 'all' || ratingFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Reviews will appear here when customers submit them'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {reviews.map((review) => (
                <button
                  key={review.id}
                  onClick={() => router.push(`/reviews/${review.id}`)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F9FAFB] transition-colors text-left"
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
                      {review.is_private && ' · Private feedback'}
                    </p>
                  </div>
                  <Badge
                    className={`${getStatusColor(review.status)} border-0 rounded-full text-xs font-medium px-2.5 py-0.5 flex-shrink-0`}
                  >
                    {getStatusLabel(review.status)}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#9CA3AF]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border-[#E5E7EB]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border-[#E5E7EB]"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
