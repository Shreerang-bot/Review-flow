'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, ExternalLink, Loader2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';

interface ReviewGeneratorProps {
  businessName: string;
  selectedTags: string[];
  rating: number;
  googleReviewUrl: string | null;
  aiEnabled: boolean;
}

export function ReviewGenerator({
  businessName,
  selectedTags,
  rating,
  googleReviewUrl,
  aiEnabled,
}: ReviewGeneratorProps) {
  const [generatedReview, setGeneratedReview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [manualReview, setManualReview] = useState('');
  const [showManualInput, setShowManualInput] = useState(!aiEnabled);

  // AI generation handler
  const handleGenerate = async () => {
    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: selectedTags,
          rating,
          businessName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate review');
      }

      const data = await response.json();
      setGeneratedReview(data.review);
      setIsGenerated(true);
    } catch {
      toast.error('Failed to generate review. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy & open Google handler (works for both AI and manual)
  const handleCopyAndOpen = async () => {
    const reviewText = (showManualInput || !aiEnabled) ? manualReview : generatedReview;
    if (!reviewText.trim()) {
      if (googleReviewUrl) {
        toast.info('Opening Google Reviews...');
        window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      toast.error('Please write a review first');
      return;
    }

    const copied = await copyToClipboard(reviewText);
    if (copied) {
      toast.success('Review copied to clipboard!', {
        description: 'Paste it in the Google review form.',
        duration: 4000,
      });
    }

    // Open Google Review URL
    if (googleReviewUrl) {
      setTimeout(() => {
        window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
      }, 500);
    } else {
      toast.info('Google Review URL is not configured. Please contact the store.');
    }
  };

  // ── Manual review mode (AI disabled) ──
  if (!aiEnabled) {
    return (
      <div className="w-full space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <PenLine className="w-4 h-4 text-[#4F46E5]" />
              <label className="text-sm font-medium text-[#4B5563]">
                Write your review:
              </label>
            </div>
            <Textarea
              value={manualReview}
              onChange={(e) => setManualReview(e.target.value)}
              placeholder="Share your experience at our store..."
              className="min-h-[120px] text-base leading-relaxed rounded-xl border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5] resize-none bg-white p-4"
              maxLength={2000}
              id="manual-review-textarea"
            />
            <p className="text-xs text-[#9CA3AF] text-right">
              {manualReview.length}/2000
            </p>
          </div>

          <Button
            onClick={handleCopyAndOpen}
            disabled={!manualReview.trim()}
            className="w-full h-14 text-base font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl shadow-lg shadow-indigo-200 transition-all duration-200 disabled:opacity-50"
            id="copy-and-open-manual-btn"
          >
            <Copy className="w-5 h-5 mr-2" />
            Copy Review & Open Google
            <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── AI review mode (default) ──
  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {!isGenerated ? (
          <motion.div
            key="generate-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {showManualInput ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <PenLine className="w-4 h-4 text-[#4F46E5]" />
                    <label className="text-sm font-medium text-[#4B5563]">
                      Write your review:
                    </label>
                  </div>
                  <Textarea
                    value={manualReview}
                    onChange={(e) => setManualReview(e.target.value)}
                    placeholder="Share your experience at our store..."
                    className="min-h-[120px] text-base leading-relaxed rounded-xl border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5] resize-none bg-white p-4"
                    maxLength={2000}
                    id="manual-review-textarea"
                  />
                  <p className="text-xs text-[#9CA3AF] text-right">
                    {manualReview.length}/2000
                  </p>
                </div>

                <Button
                  onClick={handleCopyAndOpen}
                  disabled={!manualReview.trim()}
                  className="w-full h-14 text-base font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl shadow-lg shadow-indigo-200 transition-all duration-200 disabled:opacity-50"
                  id="copy-and-open-manual-btn"
                >
                  <Copy className="w-5 h-5 mr-2" />
                  Copy Review & Open Google
                  <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className="text-xs text-[#6B7280] hover:text-[#4F46E5] transition-colors"
                  >
                    ✨ Switch back to AI Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || selectedTags.length === 0}
                  className="w-full h-14 text-base font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl shadow-lg shadow-indigo-200 transition-all duration-200 disabled:opacity-50"
                  id="generate-review-btn"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating your review...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Review
                    </>
                  )}
                </Button>

                {selectedTags.length === 0 && (
                  <p className="text-xs text-center text-[#9CA3AF]">
                    Select what you liked above to generate an AI review
                  </p>
                )}

                <div className="flex items-center justify-center gap-3 pt-1 text-xs text-[#6B7280]">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(true)}
                    className="hover:text-[#111827] underline underline-offset-2"
                  >
                    Write review manually
                  </button>
                  {googleReviewUrl && (
                    <>
                      <span>•</span>
                      <a
                        href={googleReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#4F46E5] inline-flex items-center gap-1 underline underline-offset-2"
                      >
                        Open Google directly <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="review-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#4B5563]">
                Your generated review — feel free to edit:
              </label>
              <Textarea
                value={generatedReview}
                onChange={(e) => setGeneratedReview(e.target.value)}
                className="min-h-[120px] text-base leading-relaxed rounded-xl border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5] resize-none bg-white p-4"
                id="generated-review-textarea"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleCopyAndOpen}
                className="w-full h-14 text-base font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl shadow-lg shadow-indigo-200 transition-all duration-200"
                id="copy-and-open-btn"
              >
                <Copy className="w-5 h-5 mr-2" />
                Copy Review & Open Google
                <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
              </Button>

              <Button
                onClick={() => {
                  setIsGenerated(false);
                  setGeneratedReview('');
                }}
                variant="ghost"
                className="text-[#9CA3AF] hover:text-[#4B5563] text-sm"
              >
                Regenerate review
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
