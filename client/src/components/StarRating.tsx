import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 0 to 5
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (score: number) => void;
}

export function StarRating({
  value,
  readOnly = false,
  size = 'md',
  onChange,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  const activeValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= activeValue;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            className={`transition-transform ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } focus:outline-hidden`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`${starSizes[size]} transition-colors ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-neutral-100 text-neutral-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
