'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingSelectorProps {
  onRatingSelect: (rating: number) => void;
  selectedRating: number;
}

export function RatingSelector({ onRatingSelect, selectedRating }: RatingSelectorProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoveredRating || selectedRating);

        return (
          <motion.button
            key={star}
            type="button"
            onClick={() => onRatingSelect(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            className={cn(
              'relative p-2 rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:ring-offset-2',
              isActive
                ? 'text-amber-400'
                : 'text-gray-300 hover:text-amber-200'
            )}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.15 : 0.9,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 15,
              }}
            >
              <Star
                className="w-12 h-12 sm:w-14 sm:h-14"
                fill={isActive ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </motion.div>
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 rounded-xl bg-amber-50 -z-10"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
