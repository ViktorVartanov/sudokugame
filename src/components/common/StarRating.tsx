import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  stars: number;
  max?: number;
  size?: number;
  className?: string;
}

export function StarRating({ stars, max = 3, size = 16, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < stars
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-slate-300 dark:text-slate-600',
          )}
        />
      ))}
    </div>
  );
}
