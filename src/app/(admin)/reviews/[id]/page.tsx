'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Star,
  ArrowLeft,
  Check,
  X,
  CheckCircle2,
  Clock,
  MessageSquare,
  Tag,
  Loader2,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import {
  formatDateTime,
  formatRelative,
  getStatusColor,
  getStatusLabel,
} from '@/lib/utils';
import { toast } from 'sonner';

interface ReviewDetailData {
  id: string;
  business_id: string;
  rating: number;
  review_text: string | null;
  feedback: string | null;
  customer_name: string | null;
  status: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface TagData {
  name: string;
  type: string;
}

interface NoteData {
  id: string;
  note: string;
  created_at: string;
}

export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [review, setReview] = useState<ReviewDetailData | null>(null);
  const [tags, setTags] = useState<TagData[]>([]);
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchReview() {
      const supabase = createClient();

      const { data: reviewData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !reviewData) {
        toast.error('Review not found');
        router.push('/reviews');
        return;
      }

      setReview(reviewData);

      // Fetch tags
      const { data: tagMappings } = await supabase
        .from('review_tag_mapping')
        .select('tag_id, review_tags(name, type)')
        .eq('review_id', id);

      if (tagMappings) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tagData = (tagMappings as any[])
          .filter((m) => m.review_tags)
          .map((m) => ({ name: m.review_tags.name, type: m.review_tags.type } as TagData));
        setTags(tagData);
      }

      // Fetch notes
      const { data: notesData } = await supabase
        .from('admin_notes')
        .select('id, note, created_at')
        .eq('review_id', id)
        .order('created_at', { ascending: true });

      if (notesData) {
        setNotes(notesData);
      }

      setIsLoading(false);
    }

    fetchReview();
  }, [id, router]);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: id, status: newStatus }),
      });

      if (response.ok) {
        setReview((prev) => prev ? { ...prev, status: newStatus } : null);
        toast.success(`Review ${getStatusLabel(newStatus).toLowerCase()}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setIsAddingNote(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: id, note: noteText }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes((prev) => [...prev, data.note]);
        setNoteText('');
        toast.success('Note added');
      } else {
        toast.error('Failed to add note');
      }
    } catch {
      toast.error('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  if (!review) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back button */}
      <button
        onClick={() => router.push('/reviews')}
        className="flex items-center gap-2 text-sm text-[#4B5563] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reviews
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= review.rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <Badge
              className={`${getStatusColor(review.status)} border-0 rounded-full text-xs font-medium px-2.5 py-0.5`}
            >
              {getStatusLabel(review.status)}
            </Badge>
            {review.is_private && (
              <Badge className="bg-[#FEF2F2] text-[#DC2626] border-0 rounded-full text-xs">
                Private
              </Badge>
            )}
          </div>
          <p className="text-sm text-[#9CA3AF]">
            {formatDateTime(review.created_at)}
            {review.customer_name && ` · ${review.customer_name}`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {review.status !== 'approved' && (
            <Button
              onClick={() => handleStatusUpdate('approved')}
              disabled={isUpdatingStatus}
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10"
              id="approve-btn"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Approve
            </Button>
          )}
          {review.status !== 'rejected' && (
            <Button
              onClick={() => handleStatusUpdate('rejected')}
              disabled={isUpdatingStatus}
              variant="outline"
              className="border-[#E5E7EB] text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl h-10"
              id="reject-btn"
            >
              <X className="w-4 h-4 mr-1.5" />
              Reject
            </Button>
          )}
          {review.status !== 'resolved' && (
            <Button
              onClick={() => handleStatusUpdate('resolved')}
              disabled={isUpdatingStatus}
              variant="outline"
              className="border-[#E5E7EB] text-[#4F46E5] hover:bg-[#EEF2FF] rounded-xl h-10"
              id="resolve-btn"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Text */}
          {review.review_text && (
            <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#4F46E5]" />
                  Generated Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#4B5563] leading-relaxed">{review.review_text}</p>
              </CardContent>
            </Card>
          )}

          {/* Private Feedback */}
          {review.feedback && (
            <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#DC2626]" />
                  Private Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#4B5563] leading-relaxed">{review.feedback}</p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#4F46E5]" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <Badge
                      key={i}
                      className={`border-0 rounded-full px-3 py-1 text-sm ${
                        tag.type === 'positive'
                          ? 'bg-[#EEF2FF] text-[#3730A3]'
                          : 'bg-[#FEF2F2] text-[#B91C1C]'
                      }`}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Notes & Timeline */}
        <div className="space-y-6">
          {/* Add Note */}
          <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="min-h-[80px] text-sm rounded-xl border-[#E5E7EB] resize-none"
                id="internal-note-textarea"
              />
              <Button
                onClick={handleAddNote}
                disabled={isAddingNote || !noteText.trim()}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl h-10 text-sm"
                id="add-note-btn"
              >
                {isAddingNote ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-1.5" />
                )}
                Add Note
              </Button>

              {notes.length > 0 && (
                <>
                  <Separator className="bg-[#E5E7EB]" />
                  <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 bg-[#F9FAFB] rounded-xl text-sm"
                      >
                        <p className="text-[#4B5563]">{note.note}</p>
                        <p className="text-xs text-[#9CA3AF] mt-1.5">
                          {formatRelative(note.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="w-4 h-4 text-[#4F46E5]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Review submitted</p>
                    <p className="text-xs text-[#9CA3AF]">{formatDateTime(review.created_at)}</p>
                  </div>
                </div>

                {review.status !== 'pending' && (
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      review.status === 'approved' ? 'bg-[#DCFCE7]' :
                      review.status === 'rejected' ? 'bg-[#FEF2F2]' : 'bg-[#EEF2FF]'
                    }`}>
                      {review.status === 'approved' ? (
                        <Check className="w-4 h-4 text-[#16A34A]" />
                      ) : review.status === 'rejected' ? (
                        <X className="w-4 h-4 text-[#DC2626]" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">
                        Status changed to {getStatusLabel(review.status)}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">{formatDateTime(review.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
