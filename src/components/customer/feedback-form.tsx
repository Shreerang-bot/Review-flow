'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TagChips } from './tag-chips';
import { toast } from 'sonner';
import type { ReviewTag } from '@/types';

interface FeedbackFormProps {
  businessId: string;
  rating: number;
  negativeTags: ReviewTag[];
  onSuccess: () => void;
}

export function FeedbackForm({ businessId, rating, negativeTags, onSuccess }: FeedbackFormProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          rating,
          feedback: feedback || undefined,
          tag_ids: selectedTagIds,
          is_private: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success('Feedback submitted successfully');
      onSuccess();
    } catch {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6"
    >
      {/* Empathetic message */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className="w-14 h-14 bg-[#FEF2F2] rounded-2xl flex items-center justify-center mx-auto mb-3"
        >
          <MessageSquare className="w-7 h-7 text-[#DC2626]" />
        </motion.div>
        <h2 className="text-xl font-bold text-[#111827]">
          We&apos;re sorry your experience wasn&apos;t perfect
        </h2>
        <p className="text-[#4B5563] text-sm">
          Help us improve. Your feedback stays private and goes directly to our management.
        </p>
      </div>

      {/* Negative tags */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-[#4B5563] text-center">
          What can we do better?
        </p>
        <TagChips
          tags={negativeTags}
          selectedTagIds={selectedTagIds}
          onToggleTag={handleToggleTag}
          type="negative"
        />
      </div>

      {/* Optional feedback textarea */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#4B5563]">
          Tell us more <span className="text-[#9CA3AF]">(optional)</span>
        </label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share any additional details..."
          className="min-h-[100px] text-base rounded-xl border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5] resize-none bg-white p-4"
          maxLength={2000}
          id="feedback-textarea"
        />
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full h-14 text-base font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl shadow-lg shadow-indigo-200 transition-all duration-200 disabled:opacity-50"
        id="submit-feedback-btn"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Submit Feedback
          </>
        )}
      </Button>
    </motion.div>
  );
}
