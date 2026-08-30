'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Heart } from 'lucide-react';

interface SuccessScreenProps {
  type: 'review' | 'feedback';
  businessName: string;
}

export function SuccessScreen({ type, businessName }: SuccessScreenProps) {
  const isReview = type === 'review';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex flex-col items-center justify-center text-center space-y-5 py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
        className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
          isReview ? 'bg-[#DCFCE7]' : 'bg-[#EEF2FF]'
        }`}
      >
        {isReview ? (
          <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
        ) : (
          <Heart className="w-10 h-10 text-[#4F46E5]" />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-[#111827]">
          {isReview ? 'Thank You!' : 'Thank You'}
        </h2>
        <p className="text-[#4B5563] text-base max-w-xs mx-auto leading-relaxed">
          {isReview
            ? `Your review means a lot to ${businessName}. Thank you for your support!`
            : 'Your feedback has been shared with our management. We appreciate you helping us improve.'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-[#9CA3AF] pt-4"
      >
        Powered by ReviewFlow AI
      </motion.div>
    </motion.div>
  );
}
