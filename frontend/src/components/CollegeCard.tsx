import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Calendar, Award } from 'lucide-react';
import { RatingBadge } from './RatingBadge';
import { useAuth } from '../context/AuthContext';

export interface College {
  id: number;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  locationCity: string;
  locationState: string;
  feesMin: number;
  feesMax: number;
  rating: number;
  established: number;
  naacGrade?: string | null;
  nirfRank?: number | null;
  ownership: string;
  type: string;
  reviewCount: number;
  courses?: { name: string }[];
}

interface CollegeCardProps {
  college: College;
  isSaved: boolean;
  onToggleSave: (collegeId: number) => Promise<void>;
  isCompared: boolean;
  onToggleCompare: (collegeId: number) => void;
  compareCount: number;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({
  college,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  compareCount,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login', () => onToggleSave(college.id));
    } else {
      onToggleSave(college.id);
    }
  };

  const handleCompareChange = (_e: React.ChangeEvent<HTMLInputElement>) => {
    onToggleCompare(college.id);
  };

  // Format fees to readable Indian Rupee format (e.g. 2.5L or 45K)
  const formatFees = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const isCompareDisabled = !isCompared && compareCount >= 3;

  return (
    <div className="group relative bg-white border border-gray-200/80 rounded-card shadow-card hover-lift overflow-hidden flex flex-col h-full">
      {/* Banner / Card Header Accent */}
      <div className="h-2 bg-gradient-to-r from-primary/80 to-primary-dark"></div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Top Header: Logo & Title & Bookmark */}
        <div className="flex gap-4 items-start mb-3">
          <img
            src={college.logoUrl || '/assets/react.svg'}
            alt={`${college.name} Logo`}
            className="w-12 h-12 rounded-lg object-contain border border-gray-100 p-1 shrink-0 bg-white"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=60';
            }}
          />
          <div className="flex-grow min-w-0">
            <Link
              to={`/college/${college.id}`}
              className="font-bold text-base text-dark-text hover:text-primary transition-colors duration-150 line-clamp-2 block leading-snug"
            >
              {college.name}
            </Link>
            <div className="flex items-center gap-1 text-xs text-secondary-text mt-1 font-medium">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{college.locationCity}, {college.locationState}</span>
            </div>
          </div>
          <button
            onClick={handleSaveClick}
            className={`p-2 rounded-full border transition-all shrink-0 ${
              isSaved
                ? 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10'
                : 'text-gray-400 border-gray-200 hover:text-dark-text hover:bg-gray-50'
            }`}
            title={isSaved ? 'Remove Bookmark' : 'Bookmark College'}
          >
            <Bookmark size={16} className={isSaved ? 'fill-primary' : ''} />
          </button>
        </div>

        {/* Badges row: NAAC & NIRF */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {college.nirfRank && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              <Award size={10} />
              NIRF Rank: #{college.nirfRank}
            </span>
          )}
          {college.naacGrade && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              NAAC {college.naacGrade}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
            {college.ownership}
          </span>
        </div>

        {/* Rating Section */}
        <div className="mb-4">
          <RatingBadge rating={college.rating} reviewCount={college.reviewCount} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 justify-between my-2 border-y border-gray-100 py-3.5 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-0.5">
              Annual Fees
            </div>
            <div className="text-sm font-bold text-dark-text">
              {formatFees(college.feesMin)} - {formatFees(college.feesMax)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-0.5">
              Established
            </div>
            <div className="text-sm font-bold text-dark-text flex items-center justify-center gap-1">
              <Calendar size={12} className="text-primary" />
              {college.established}
            </div>
          </div>
        </div>

        {/* Top course tags */}
        {college.courses && college.courses.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">
              Popular Courses
            </div>
            <div className="flex flex-wrap gap-1">
              {college.courses.map((course, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs border border-gray-100 font-medium max-w-full truncate"
                  title={course.name}
                >
                  {course.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Bottom Section */}
        <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-gray-100">
          <label
            className={`inline-flex items-center gap-2 cursor-pointer text-xs font-semibold select-none ${
              isCompareDisabled ? 'opacity-40 cursor-not-allowed text-gray-400' : 'text-secondary-text hover:text-dark-text'
            }`}
          >
            <input
              type="checkbox"
              checked={isCompared}
              disabled={isCompareDisabled}
              onChange={handleCompareChange}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer disabled:cursor-not-allowed"
            />
            Compare
          </label>

          <Link
            to={`/college/${college.id}`}
            className="px-3.5 py-1.5 bg-primary/5 text-primary text-xs font-bold rounded-btn hover:bg-primary hover:text-white transition-all duration-200 border border-primary/10 hover:border-primary shadow-sm"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};
