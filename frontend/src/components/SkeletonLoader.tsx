import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'detail' | 'text' | 'table';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = 'card', count = 1 }) => {
  const renderItems = () => {
    const items = [];
    for (let i = 0; i < count; i++) {
      if (variant === 'card') {
        items.push(
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-card p-5 animate-pulse flex flex-col gap-4 shadow-card"
          >
            {/* Header placeholder */}
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            {/* Stats placeholder */}
            <div className="flex gap-4 justify-between mt-2 border-y border-gray-100 py-3">
              <div className="flex flex-col gap-1 w-1/3">
                <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex flex-col gap-1 w-1/3">
                <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex flex-col gap-1 w-1/3">
                <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            {/* Course tags placeholder */}
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-14"></div>
            </div>
            {/* Action buttons placeholder */}
            <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100">
              <div className="h-9 bg-gray-200 rounded-btn flex-1"></div>
              <div className="h-9 bg-gray-200 rounded-btn w-20"></div>
            </div>
          </div>
        );
      } else if (variant === 'detail') {
        items.push(
          <div key={i} className="animate-pulse flex flex-col gap-6">
            <div className="h-64 bg-gray-200 rounded-card w-full"></div>
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="h-20 bg-gray-200 rounded-btn"></div>
              <div className="h-20 bg-gray-200 rounded-btn"></div>
              <div className="h-20 bg-gray-200 rounded-btn"></div>
              <div className="h-20 bg-gray-200 rounded-btn"></div>
            </div>
          </div>
        );
      } else if (variant === 'list') {
        items.push(
          <div
            key={i}
            className="flex gap-4 items-center p-4 border border-gray-200 rounded-card bg-white animate-pulse"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-btn"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/5"></div>
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded-btn"></div>
          </div>
        );
      } else if (variant === 'table') {
        items.push(
          <div key={i} className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        );
      } else {
        items.push(
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        );
      }
    }
    return items;
  };

  return <>{renderItems()}</>;
};
