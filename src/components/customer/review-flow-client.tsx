'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RatingSelector } from '@/components/customer/rating-selector';
import { TagChips } from '@/components/customer/tag-chips';
import { ReviewGenerator } from '@/components/customer/review-generator';
import { FeedbackForm } from '@/components/customer/feedback-form';
import { SuccessScreen } from '@/components/customer/success-screen';
import type { Business, ReviewTag } from '@/types';

type FlowStep = 'rating' | 'positive-tags' | 'negative-feedback' | 'success-review' | 'success-feedback';

interface ReviewFlowClientProps {
  business: Business;
  positiveTags: ReviewTag[];
  negativeTags: ReviewTag[];
}

export function ReviewFlowClient({ business, positiveTags, negativeTags }: ReviewFlowClientProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('rating');
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const handleRatingSelect = useCallback((rating: number) => {
    setSelectedRating(rating);
    setSelectedTagIds([]);

    // Small delay for animation
    setTimeout(() => {
      if (rating >= business.review_threshold) {
        setCurrentStep('positive-tags');
      } else {
        setCurrentStep('negative-feedback');
      }
    }, 300);
  }, [business.review_threshold]);

  const handleToggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const handleFeedbackSuccess = useCallback(() => {
    setCurrentStep('success-feedback');
  }, []);

  const handleReviewSuccess = useCallback(() => {
    setCurrentStep('success-review');
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep('rating');
    setSelectedRating(0);
    setSelectedTagIds([]);
  }, []);

  const selectedTagNames = positiveTags
    .filter((tag) => selectedTagIds.includes(tag.id))
    .map((tag) => tag.name);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FAFAFA]">
      {/* Header */}
      <div className="flex-shrink-0 pt-8 pb-4 px-6 text-center">
        {business.logo_url && (
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            src={business.logo_url}
            alt={business.name}
            className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover shadow-sm border border-[#E5E7EB]"
          />
        )}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-[#111827] tracking-tight"
        >
          {business.name}
        </motion.h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Rating */}
          {currentStep === 'rating' && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md text-center space-y-8"
            >
              <div className="space-y-2">
                <p className="text-lg text-[#4B5563] font-medium">
                  {business.welcome_message || 'How was your shopping experience today?'}
                </p>
              </div>
              <RatingSelector
                onRatingSelect={handleRatingSelect}
                selectedRating={selectedRating}
              />
              <p className="text-sm text-[#9CA3AF]">
                Tap a star to rate your experience
              </p>
            </motion.div>
          )}

          {/* Step 2a: Positive Tags + Review Generator */}
          {currentStep === 'positive-tags' && (
            <motion.div
              key="positive-tags"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md space-y-6"
            >
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="text-4xl mb-2"
                >
                  🎉
                </motion.div>
                <h2 className="text-xl font-bold text-[#111827]">
                  What did you like?
                </h2>
                <p className="text-sm text-[#4B5563]">
                  Select what made your experience great
                </p>
              </div>

              <TagChips
                tags={positiveTags}
                selectedTagIds={selectedTagIds}
                onToggleTag={handleToggleTag}
                type="positive"
              />

              <ReviewGenerator
                businessId={business.id}
                businessName={business.name}
                selectedTags={selectedTagNames}
                selectedTagIds={selectedTagIds}
                rating={selectedRating}
                googleReviewUrl={business.google_review_url}
                aiEnabled={business.ai_review_enabled}
                onSuccess={handleReviewSuccess}
              />

              <button
                onClick={handleReset}
                className="w-full text-sm text-[#9CA3AF] hover:text-[#4B5563] transition-colors py-2"
              >
                ← Change rating
              </button>
            </motion.div>
          )}

          {/* Step 2b: Negative Feedback */}
          {currentStep === 'negative-feedback' && (
            <motion.div
              key="negative-feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <FeedbackForm
                businessId={business.id}
                rating={selectedRating}
                negativeTags={negativeTags}
                onSuccess={handleFeedbackSuccess}
              />

              <button
                onClick={handleReset}
                className="w-full text-sm text-[#9CA3AF] hover:text-[#4B5563] transition-colors py-4 mt-2"
              >
                ← Change rating
              </button>
            </motion.div>
          )}

          {/* Success Screens */}
          {currentStep === 'success-review' && (
            <motion.div
              key="success-review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md"
            >
              <SuccessScreen
                type="review"
                businessName={business.name}
                googleReviewUrl={business.google_review_url}
                onReset={handleReset}
              />
            </motion.div>
          )}

          {currentStep === 'success-feedback' && (
            <motion.div
              key="success-feedback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md"
            >
              <SuccessScreen
                type="feedback"
                businessName={business.name}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
