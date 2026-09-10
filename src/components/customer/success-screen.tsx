'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Heart, ExternalLink, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessScreenProps {
  type: 'review' | 'feedback';
  businessName: string;
  googleReviewUrl?: string | null;
  onReset?: () => void;
}

export function SuccessScreen({ type, businessName, googleReviewUrl, onReset }: SuccessScreenProps) {
  const isReview = type === 'review';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex flex-col items-center justify-center text-center space-y-6 py-6 w-full max-w-sm mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.15 }}
        className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
          isReview
            ? 'bg-emerald-100 text-emerald-600 shadow-emerald-100'
            : 'bg-indigo-100 text-indigo-600 shadow-indigo-100'
        }`}
      >
        {isReview ? (
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        ) : (
          <Heart className="w-10 h-10 text-[#4F46E5]" />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-[#111827]">
          {isReview ? 'Thank You!' : 'Thank You'}
        </h2>
        <p className="text-[#4B5563] text-sm leading-relaxed">
          {isReview
            ? `Your review means the world to ${businessName}. Thank you for supporting our business!`
            : 'Your feedback has been shared with our management team. We appreciate you helping us improve.'}
        </p>
      </motion.div>

      {isReview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm space-y-3 text-left"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">📋</span>
            <div className="text-xs text-[#4B5563] space-y-1">
              <p className="font-semibold text-[#111827]">Review copied to clipboard</p>
              <p>Google Reviews opened in a new tab. Just paste and tap <strong>Post</strong>!</p>
            </div>
          </div>

          {googleReviewUrl && (
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(googleReviewUrl, '_blank', 'noopener,noreferrer')}
                className="w-full text-xs text-[#4F46E5] border-indigo-200 hover:bg-indigo-50 flex items-center justify-center gap-1.5"
              >
                Re-open Google Reviews <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {onReset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="pt-2"
        >
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[#9CA3AF] hover:text-[#4B5563] inline-flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Rate another experience
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="text-[11px] text-[#9CA3AF]"
      >
        Powered by ReviewFlow AI
      </motion.div>
    </motion.div>
  );
}
