'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReviewTag } from '@/types';

interface TagChipsProps {
  tags: ReviewTag[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  type: 'positive' | 'negative';
}

export function TagChips({ tags, selectedTagIds, onToggleTag, type }: TagChipsProps) {
  const isPositive = type === 'positive';

  return (
    <div className="flex flex-wrap gap-2.5 justify-center">
      {tags.map((tag, index) => {
        const isSelected = selectedTagIds.includes(tag.id);

        return (
          <motion.button
            key={tag.id}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleTag(tag.id)}
            className={cn(
              'relative inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium',
              'transition-all duration-200 ease-out',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'min-h-[44px] select-none',
              isSelected
                ? isPositive
                  ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-200 focus-visible:ring-indigo'
                  : 'bg-[#DC2626] text-white shadow-md shadow-red-200 focus-visible:ring-red-500'
                : isPositive
                  ? 'bg-[#EEF2FF] text-[#3730A3] hover:bg-indigo-100 focus-visible:ring-indigo'
                  : 'bg-[#FEF2F2] text-[#B91C1C] hover:bg-red-100 focus-visible:ring-red-500'
            )}
          >
            {isSelected && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              </motion.span>
            )}
            {tag.name}
          </motion.button>
        );
      })}
    </div>
  );
}
