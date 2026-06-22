import React from 'react';
import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  reviewCount = 0,
  showCount = true,
  size = 'md',
}) => {
  const getBadgeColor = (r: number) => {
    if (r >= 4.5) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (r >= 4.0) return 'bg-primary/5 text-primary border-primary/20';
    if (r >= 3.0) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getStarColor = (r: number) => {
    if (r >= 4.5) return 'text-emerald-500 fill-emerald-500';
    if (r >= 4.0) return 'text-primary fill-primary';
    if (r >= 3.0) return 'text-amber-500 fill-amber-500';
    return 'text-gray-400 fill-gray-400';
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const starSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`inline-flex items-center font-bold border rounded-btn transition-colors duration-150 ${sizeClasses[size]} ${getBadgeColor(
          rating
        )}`}
      >
        <Star size={starSizes[size]} className={getStarColor(rating)} />
        <span>{rating.toFixed(1)}</span>
      </div>
      {showCount && reviewCount > 0 && (
        <span className="text-xs text-secondary-text font-medium">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};
