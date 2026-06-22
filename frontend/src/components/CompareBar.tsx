import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, GitCompare } from 'lucide-react';

export interface CompareItem {
  id: number;
  name: string;
  logoUrl: string;
  locationCity: string;
}

interface CompareBarProps {
  items: CompareItem[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

export const CompareBar: React.FC<CompareBarProps> = ({ items, onRemove, onClear }) => {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const handleCompareClick = () => {
    const ids = items.map(item => item.id).join(',');
    navigate(`/compare?ids=${ids}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] py-3 px-4 md:px-8 transition-transform duration-300 animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Info & Selected Items */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-2.5 py-1.5 rounded-btn border border-primary/10">
            <GitCompare size={16} />
            <span>Compare ({items.length}/3)</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200/60 rounded-full pl-2 pr-1.5 py-1 text-xs font-semibold shadow-sm text-dark-text max-w-[200px]"
              >
                <img
                  src={item.logoUrl}
                  alt=""
                  className="w-4 h-4 rounded-full object-contain bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=60';
                  }}
                />
                <span className="truncate">{item.name}</span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-dark-text transition-colors shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Action buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={onClear}
            className="w-1/2 sm:w-auto px-4 py-2 text-xs font-bold text-secondary-text hover:text-dark-text transition-colors text-center"
          >
            Clear All
          </button>
          
          <button
            onClick={handleCompareClick}
            disabled={items.length < 2}
            className={`w-1/2 sm:w-auto px-5 py-2 text-xs font-bold rounded-btn transition-all duration-200 text-center flex items-center justify-center gap-2 shadow-sm ${
              items.length >= 2
                ? 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/40'
            }`}
          >
            <span>Compare Now</span>
            <GitCompare size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};
