import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { GitCompare, Building2, Calendar, Award, X, Plus, Search, Check, Save, Share2, Info } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface CompareCollegeData {
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
  about: string;
  campusSize?: number | null;
  studentCount?: number | null;
  facultyCount?: number | null;
  affiliatedUniversity?: string | null;
  regulatoryBody?: string | null;
  courses: { id: number; name: string; fees: number }[];
  placements: { avgPackage: number; highestPackage: number; medianPackage: number; placementPercentage: number }[];
  facilities: { library: boolean; hostel: boolean; sports: boolean; labs: boolean; wifi: boolean; cafeteria: boolean; gym: boolean; medical: boolean } | null;
  ratingsBreakdown: {
    overall: number;
    academics: number;
    faculty: number;
    placements: number;
    infrastructure: number;
    socialLife: number;
  };
  reviewCount: number;
}

export const Compare: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [colleges, setColleges] = useState<CompareCollegeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add College Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: number; name: string; locationCity: string; logoUrl: string }[]>([]);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Save Shortlist State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [shortlistName, setShortlistName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Get IDs from URL
  const idsString = searchParams.get('ids') || '';
  const collegeIds = idsString
    .split(',')
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id));

  const fetchComparison = async () => {
    if (collegeIds.length === 0) {
      setColleges([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiFetch(`/compare?ids=${collegeIds.join(',')}`);
      if (res.success && res.data) {
        setColleges(res.data);
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to load comparison data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [idsString]);

  // Autocomplete debounced search to add college
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await apiFetch(`/colleges/suggest?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.success && res.data) {
          // Filter out colleges that are already added
          const filtered = res.data.filter((item: any) => !collegeIds.includes(item.id));
          setSuggestions(filtered);
        }
      } catch (e) {
        console.error(e);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, idsString]);

  // Click outside close for search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchBox(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveCollege = (id: number) => {
    const updatedIds = collegeIds.filter(cid => cid !== id);
    if (updatedIds.length === 0) {
      navigate('/');
    } else {
      setSearchParams({ ids: updatedIds.join(',') });
    }
  };

  const handleAddCollege = (id: number) => {
    if (collegeIds.length >= 3) {
      showToast('You can compare a maximum of 3 colleges', 'warning');
      return;
    }
    const updatedIds = [...collegeIds, id];
    setSearchParams({ ids: updatedIds.join(',') });
    setSearchQuery('');
    setShowSearchBox(false);
  };

  const handleSaveComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login', () => setShowSaveModal(true));
      return;
    }
    if (shortlistName.trim().length < 2) {
      showToast('Shortlist name must be at least 2 characters.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiFetch('/saved-comparisons', {
        method: 'POST',
        body: JSON.stringify({
          name: shortlistName.trim(),
          collegeIds,
        }),
      });

      if (res.success) {
        showToast('Comparison shortlist saved to dashboard!', 'success');
        setShowSaveModal(false);
        setShortlistName('');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save comparison', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Comparison link copied to clipboard!', 'success');
  };

  // HIGHLIGHT WINNERS UTILITY
  // Returns index of the winning college for a key, or -1 if no clear winner.
  const getWinnerIndex = (
    key: 'feesMin' | 'rating' | 'avgPackage' | 'highestPackage' | 'placementPercentage' | 'campusSize' | 'facultyCount' | 'studentCount',
    mode: 'min' | 'max' = 'max'
  ): number => {
    if (colleges.length < 2) return -1;
    
    const values = colleges.map(col => {
      if (key === 'feesMin') return col.feesMin;
      if (key === 'rating') return col.rating;
      if (key === 'avgPackage') return col.placements[0]?.avgPackage || 0;
      if (key === 'highestPackage') return col.placements[0]?.highestPackage || 0;
      if (key === 'placementPercentage') return col.placements[0]?.placementPercentage || 0;
      if (key === 'campusSize') return col.campusSize || 0;
      if (key === 'facultyCount') return col.facultyCount || 0;
      if (key === 'studentCount') return col.studentCount || 0;
      return 0;
    });

    // Check if all values are zero/missing
    if (values.every(v => v === 0 || v === null)) return -1;

    let targetVal = mode === 'max' ? Math.max(...values) : Math.min(...values);
    
    // Check if there is a tie
    const occurrences = values.filter(v => v === targetVal).length;
    if (occurrences === values.length) return -1; // Tie across all

    return values.indexOf(targetVal);
  };

  const winners = {
    feesMin: getWinnerIndex('feesMin', 'min'),
    rating: getWinnerIndex('rating', 'max'),
    avgPackage: getWinnerIndex('avgPackage', 'max'),
    highestPackage: getWinnerIndex('highestPackage', 'max'),
    placementPercentage: getWinnerIndex('placementPercentage', 'max'),
    campusSize: getWinnerIndex('campusSize', 'max'),
    facultyCount: getWinnerIndex('facultyCount', 'max'),
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <SkeletonLoader variant="table" />
      </div>
    );
  }

  if (collegeIds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <GitCompare size={48} className="text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-dark-text mb-2">No colleges selected for comparison</h2>
        <p className="text-sm text-secondary-text mb-6">Go back to the search dashboard and toggle "Compare" on your shortlisted colleges.</p>
        <Link to="/" className="px-5 py-2.5 bg-primary text-white rounded-btn font-bold text-sm shadow-sm inline-block">
          Search Colleges
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow flex flex-col">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 pb-5 mb-8">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary text-white rounded-lg">
            <GitCompare size={22} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-dark-text tracking-tight">College Comparison Table</h1>
            <p className="text-xs text-secondary-text font-semibold">Side-by-side assessment across key metrics. Best values are highlighted in green.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={handleShare}
            className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold border border-gray-200 rounded-btn hover:bg-gray-50 text-secondary-text hover:text-dark-text transition-all shadow-sm"
          >
            <Share2 size={14} />
            <span>Share Link</span>
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('login', () => setShowSaveModal(true));
              } else {
                setShowSaveModal(true);
              }
            }}
            className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-dark rounded-btn transition-all shadow-sm"
          >
            <Save size={14} />
            <span>Save Shortlist</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid Table Container */}
      <div className="w-full border border-gray-200 rounded-card bg-white shadow-sm overflow-hidden flex flex-col flex-grow">
        
        {/* Sticky Headers Row */}
        <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50/50 sticky top-16 z-20">
          {/* Label Header */}
          <div className="col-span-3 p-4 flex flex-col justify-center border-r border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-text">Comparison Parameters</span>
          </div>

          {/* Colleges Columns */}
          {colleges.map((col, _idx) => (
            <div
              key={col.id}
              className={`p-4 border-r border-gray-100 flex flex-col gap-2 relative ${
                colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
              }`}
            >
              <button
                onClick={() => handleRemoveCollege(col.id)}
                className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Remove from comparison"
              >
                <X size={14} />
              </button>

              <div className="flex gap-2.5 items-center pr-4">
                <img
                  src={col.logoUrl}
                  alt=""
                  className="w-10 h-10 rounded object-contain border border-gray-200 bg-white shrink-0 p-0.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="min-w-0">
                  <Link
                    to={`/college/${col.id}`}
                    className="font-bold text-xs md:text-sm text-dark-text hover:text-primary transition-colors line-clamp-2 block leading-tight"
                  >
                    {col.name}
                  </Link>
                  <span className="text-[10px] text-secondary-text font-semibold block mt-0.5">{col.locationCity}, {col.locationState}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Empty Slot if less than 3 colleges */}
          {colleges.length < 3 && (
            <div
              ref={searchContainerRef}
              className={`p-4 flex flex-col justify-center items-center border-r border-gray-100 relative ${
                colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-5' : 'col-span-3'
              }`}
            >
              {!showSearchBox ? (
                <button
                  onClick={() => setShowSearchBox(true)}
                  className="flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-gray-300 hover:border-primary text-gray-400 hover:text-primary rounded-btn font-bold text-xs transition-all cursor-pointer bg-white"
                >
                  <Plus size={14} />
                  <span>Add College</span>
                </button>
              ) : (
                <div className="w-full max-w-xs relative">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type college name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 border border-gray-200 rounded text-xs bg-white focus:outline-none focus:border-primary text-dark-text"
                    />
                    <button
                      onClick={() => {
                        setShowSearchBox(false);
                        setSearchQuery('');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-text"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded shadow-xl max-h-48 overflow-y-auto z-30 divide-y divide-gray-50 text-left">
                      {suggestions.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleAddCollege(s.id)}
                          className="w-full p-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 text-left"
                        >
                          <img
                            src={s.logoUrl}
                            alt=""
                            className="w-6 h-6 rounded object-contain border border-gray-100 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=60';
                            }}
                          />
                          <div className="min-w-0 flex-grow">
                            <div className="text-xs font-bold text-dark-text truncate">{s.name}</div>
                            <div className="text-[10px] text-gray-400 truncate">{s.locationCity}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison Body Rows */}
        <div className="flex-grow divide-y divide-gray-100 overflow-y-auto max-h-[calc(100vh-280px)] no-scrollbar">
          
          {/* SECTION: GENERAL INFO */}
          <div className="bg-gray-50/30 font-bold text-xs text-primary px-4 py-2">General Information</div>
          
          {/* Row: NIRF Rank */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Award size={14} className="text-primary shrink-0" />
              <span>NIRF Ranking</span>
            </div>
            {colleges.map((col, _idx) => (
              <div
                key={col.id}
                className={`p-3.5 border-r border-gray-100 text-xs font-bold text-dark-text ${
                  colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                }`}
              >
                {col.nirfRank ? (
                  <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 text-blue-700">#{col.nirfRank}</span>
                ) : (
                  <span className="text-gray-400 font-medium">Unranked</span>
                )}
              </div>
            ))}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* Row: NAAC Grade */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Award size={14} className="text-primary shrink-0" />
              <span>NAAC Grade</span>
            </div>
            {colleges.map((col, _idx) => (
              <div
                key={col.id}
                className={`p-3.5 border-r border-gray-100 text-xs font-bold text-dark-text ${
                  colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                }`}
              >
                {col.naacGrade ? (
                  <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">{col.naacGrade}</span>
                ) : (
                  <span className="text-gray-400 font-medium">N/A</span>
                )}
              </div>
            ))}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* Row: Established */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Calendar size={14} className="text-primary shrink-0" />
              <span>Established Year</span>
            </div>
            {colleges.map((col, _idx) => (
              <div
                key={col.id}
                className={`p-3.5 border-r border-gray-100 text-xs font-bold text-dark-text ${
                  colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                }`}
              >
                {col.established}
              </div>
            ))}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* Row: Ownership */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Building2 size={14} className="text-primary shrink-0" />
              <span>Ownership</span>
            </div>
            {colleges.map((col, _idx) => (
              <div
                key={col.id}
                className={`p-3.5 border-r border-gray-100 text-xs font-bold text-dark-text ${
                  colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                }`}
              >
                {col.ownership}
              </div>
            ))}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* SECTION: ACADEMICS & FEES */}
          <div className="bg-gray-50/30 font-bold text-xs text-primary px-4 py-2">Fees & Structure</div>

          {/* Row: Fees Minimum */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Info size={14} className="text-primary shrink-0" />
              <span>Annual Minimum Fees</span>
            </div>
            {colleges.map((col, idx) => {
              const isWinner = winners.feesMin === idx;
              return (
                <div
                  key={col.id}
                  className={`p-3.5 border-r border-gray-100 text-xs font-extrabold text-dark-text transition-colors duration-150 ${
                    colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                  } ${isWinner ? 'bg-emerald-50/65 text-emerald-800' : ''}`}
                >
                  ₹{(col.feesMin / 100000).toFixed(1)} Lakhs
                  {isWinner && <span className="block text-[9px] uppercase tracking-wider text-emerald-600 font-extrabold mt-0.5">Best Value</span>}
                </div>
              );
            })}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* Row: Fees Maximum */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Info size={14} className="text-primary shrink-0" />
              <span>Annual Maximum Fees</span>
            </div>
            {colleges.map((col, _idx) => (
              <div
                key={col.id}
                className={`p-3.5 border-r border-gray-100 text-xs font-bold text-dark-text ${
                  colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                }`}
              >
                ₹{(col.feesMax / 100000).toFixed(1)} Lakhs
              </div>
            ))}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* SECTION: PLACEMENTS */}
          <div className="bg-gray-50/30 font-bold text-xs text-primary px-4 py-2">Placement Highlights</div>

          {/* Row: Average Package */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Info size={14} className="text-primary shrink-0" />
              <span>Average Package</span>
            </div>
            {colleges.map((col, idx) => {
              const isWinner = winners.avgPackage === idx;
              const pkg = col.placements[0]?.avgPackage;
              return (
                <div
                  key={col.id}
                  className={`p-3.5 border-r border-gray-100 text-xs font-extrabold text-dark-text transition-colors duration-150 ${
                    colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                  } ${isWinner ? 'bg-emerald-50/65 text-emerald-800' : ''}`}
                >
                  {pkg ? `₹${pkg.toFixed(1)} LPA` : <span className="text-gray-400 font-medium">N/A</span>}
                  {isWinner && <span className="block text-[9px] uppercase tracking-wider text-emerald-600 font-extrabold mt-0.5">Highest</span>}
                </div>
              );
            })}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* Row: Highest Package */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Info size={14} className="text-primary shrink-0" />
              <span>Highest Package</span>
            </div>
            {colleges.map((col, idx) => {
              const isWinner = winners.highestPackage === idx;
              const pkg = col.placements[0]?.highestPackage;
              return (
                <div
                  key={col.id}
                  className={`p-3.5 border-r border-gray-100 text-xs font-extrabold text-dark-text transition-colors duration-150 ${
                    colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                  } ${isWinner ? 'bg-emerald-50/65 text-emerald-800' : ''}`}
                >
                  {pkg ? `₹${pkg.toFixed(1)} LPA` : <span className="text-gray-400 font-medium">N/A</span>}
                  {isWinner && <span className="block text-[9px] uppercase tracking-wider text-emerald-600 font-extrabold mt-0.5">Highest</span>}
                </div>
              );
            })}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* Row: Placement Percentage */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Info size={14} className="text-primary shrink-0" />
              <span>Placement Percentage</span>
            </div>
            {colleges.map((col, idx) => {
              const isWinner = winners.placementPercentage === idx;
              const pct = col.placements[0]?.placementPercentage;
              return (
                <div
                  key={col.id}
                  className={`p-3.5 border-r border-gray-100 text-xs font-extrabold text-dark-text transition-colors duration-150 ${
                    colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                  } ${isWinner ? 'bg-emerald-50/65 text-emerald-800' : ''}`}
                >
                  {pct ? `${pct}%` : <span className="text-gray-400 font-medium">N/A</span>}
                  {isWinner && <span className="block text-[9px] uppercase tracking-wider text-emerald-600 font-extrabold mt-0.5">Highest</span>}
                </div>
              );
            })}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* SECTION: RATINGS */}
          <div className="bg-gray-50/30 font-bold text-xs text-primary px-4 py-2">Reviews & Ratings</div>

          {/* Row: Overall Rating */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Info size={14} className="text-primary shrink-0" />
              <span>Overall Rating</span>
            </div>
            {colleges.map((col, idx) => {
              const isWinner = winners.rating === idx;
              return (
                <div
                  key={col.id}
                  className={`p-3.5 border-r border-gray-100 text-xs font-extrabold text-dark-text transition-colors duration-150 ${
                    colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                  } ${isWinner ? 'bg-emerald-50/65 text-emerald-800' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.rating.toFixed(1)}★</span>
                    <span className="text-[10px] text-secondary-text">({col.reviewCount})</span>
                  </div>
                  {isWinner && <span className="block text-[9px] uppercase tracking-wider text-emerald-600 font-extrabold mt-0.5">Highest</span>}
                </div>
              );
            })}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* Row: Academics rating */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Info size={14} className="text-primary shrink-0" />
              <span>Academics rating</span>
            </div>
            {colleges.map((col, _idx) => (
              <div
                key={col.id}
                className={`p-3.5 border-r border-gray-100 text-xs font-bold text-dark-text ${
                  colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                }`}
              >
                {col.ratingsBreakdown.academics.toFixed(1)}★
              </div>
            ))}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* Row: Infrastructure rating */}
          <div className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
            <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
              <Info size={14} className="text-primary shrink-0" />
              <span>Infrastructure rating</span>
            </div>
            {colleges.map((col, _idx) => (
              <div
                key={col.id}
                className={`p-3.5 border-r border-gray-100 text-xs font-bold text-dark-text ${
                  colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                }`}
              >
                {col.ratingsBreakdown.infrastructure.toFixed(1)}★
              </div>
            ))}
            {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
          </div>

          {/* SECTION: FACILITIES */}
          <div className="bg-gray-50/30 font-bold text-xs text-primary px-4 py-2">Facilities Available</div>

          {/* Rows dynamically built based on facilities keys */}
          {(['hostel', 'library', 'sports', 'labs', 'wifi'] as const).map(facKey => (
            <div key={facKey} className="grid grid-cols-12 hover:bg-gray-50/20 transition-colors">
              <div className="col-span-3 p-3.5 border-r border-gray-100 font-bold text-xs text-dark-text flex items-center gap-1.5">
                <Check size={14} className="text-primary shrink-0" />
                <span className="capitalize">{facKey}</span>
              </div>
              {colleges.map((col, _idx) => {
                const hasFacility = col.facilities?.[facKey] || false;
                return (
                  <div
                    key={col.id}
                    className={`p-3.5 border-r border-gray-100 text-xs font-bold ${
                      colleges.length === 1 ? 'col-span-9' : colleges.length === 2 ? 'col-span-4' : 'col-span-3'
                    }`}
                  >
                    {hasFacility ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <Check size={12} />
                        <span>Yes</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        <X size={12} />
                        <span>No</span>
                      </span>
                    )}
                  </div>
                );
              })}
              {colleges.length < 3 && <div className={`border-r border-gray-100 ${colleges.length === 1 ? 'col-span-9' : 'col-span-5'}`}></div>}
            </div>
          ))}

        </div>

      </div>

      {/* Save comparison modal overlay */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSaveModal(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-card shadow-xl p-6 z-10 animate-fade-in">
            <h2 className="text-lg font-bold text-primary mb-2 border-b border-gray-100 pb-2">Save Comparison Shortlist</h2>
            <p className="text-xs text-secondary-text mb-4">Provide a descriptive name to easily access this side-by-side comparison from your student dashboard later.</p>

            <form onSubmit={handleSaveComparison} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark-text mb-1">Comparison Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tier-1 Engineering Colleges, MBA Delhi NCR"
                  value={shortlistName}
                  onChange={e => setShortlistName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm bg-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-btn text-xs font-bold text-secondary-text hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-btn hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-75"
                >
                  {isSaving ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={12} />
                      <span>Save Shortlist</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
