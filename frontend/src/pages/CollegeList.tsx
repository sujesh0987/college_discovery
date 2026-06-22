import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, X, BookOpen, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { CollegeCard } from '../components/CollegeCard';
import type { College } from '../components/CollegeCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';
import type { CompareItem } from '../components/CompareBar';

interface FilterOptions {
  states: string[];
  cities: string[];
  ownerships: string[];
  types: string[];
  accreditations: string[];
  streams: string[];
  stateCityMap: Record<string, string[]>;
}

interface CollegeListProps {
  comparedItems: CompareItem[];
  onToggleCompare: (college: College) => void;
  onToggleSave: (collegeId: number) => Promise<void>;
  savedIds: number[];
}

export const CollegeList: React.FC<CollegeListProps> = ({
  comparedItems,
  onToggleCompare,
  onToggleSave,
  savedIds,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State for fetched data
  const [colleges, setColleges] = useState<College[]>([]);
  const [filtersData, setFiltersData] = useState<FilterOptions | null>(null);
  const [isLoadingColleges, setIsLoadingColleges] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Pagination metadata
  const [meta, setMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  // Autocomplete Suggestions State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<{ id: number; name: string; locationCity: string; locationState: string; logoUrl: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Mobile Filters Modal State
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync Search Query from URL
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Fetch filter options once
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await apiFetch('/colleges/filters');
        if (res.success && res.data) {
          setFiltersData(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
        showToast('Failed to load filters', 'error');
      } finally {
        setIsLoadingFilters(false);
      }
    };
    fetchFilters();
  }, [showToast]);

  // Fetch colleges list whenever search params change
  const fetchColleges = useCallback(async () => {
    setIsLoadingColleges(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {};
      
      // Populate filters from query parameters
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Default page if missing
      if (!params.page) params.page = 1;
      params.limit = 12;

      const res = await apiFetch('/colleges', { params });
      if (res.success && res.data) {
        setColleges(res.data);
        if (res.meta) {
          setMeta(res.meta);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch colleges:', error);
      showToast(error.message || 'Failed to fetch colleges', 'error');
    } finally {
      setIsLoadingColleges(false);
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Debounced search suggestion autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await apiFetch(`/colleges/suggest?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.success && res.data) {
          setSuggestions(res.data);
        }
      } catch (e) {
        console.error('Autocomplete fetch failed', e);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close suggestions drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update query params helper
  const updateQueryParam = (key: string, value: string | number | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    // Reset page to 1 when filter/search changes
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  // Multiple params update
  const removeFilter = (key: string) => {
    updateQueryParam(key, null);
    if (key === 'state') {
      // If we remove state, we should also clear city
      updateQueryParam('city', null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParam('q', searchQuery.trim());
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (id: number) => {
    navigate(`/college/${id}`);
    setShowSuggestions(false);
  };

  // Cascading logic: cities based on state
  const getAvailableCities = () => {
    if (!filtersData) return [];
    const activeState = searchParams.get('state');
    if (activeState && filtersData.stateCityMap[activeState]) {
      return filtersData.stateCityMap[activeState];
    }
    return filtersData.cities;
  };

  // Get active filters mapping for chip displays
  const getActiveFilterChips = () => {
    const chips: { key: string; label: string }[] = [];
    const mapping: Record<string, string> = {
      q: 'Search',
      state: 'State',
      city: 'City',
      stream: 'Stream',
      fees_max: 'Max Fee',
      rating: 'Rating',
      ownership: 'Ownership',
      type: 'Type',
      accreditation: 'Accreditation',
    };

    searchParams.forEach((val, key) => {
      if (key !== 'page' && key !== 'sort' && key !== 'limit' && val) {
        let label = val;
        if (key === 'fees_max') label = `Max Fees: ₹${parseFloat(val) / 100000}L`;
        if (key === 'rating') label = `Rating: ${val}+`;
        chips.push({ key, label: `${mapping[key] || key}: ${label}` });
      }
    });

    return chips;
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchQuery('');
  };

  const activeChips = getActiveFilterChips();

  return (
    <div className="flex flex-col flex-grow">
      {/* Banner / Search Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-12 px-4 shadow-inner relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute -bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl transform -translate-x-1/3"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 mb-4 animate-fade-in">
            <GraduationCap size={14} />
            <span>Discover Higher Education in India</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm leading-tight">
            Find Your Dream College
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto mb-8 font-medium">
            Search, filter, and compare across 50+ premier institutions with detailed course fees, placements data, and reviews.
          </p>

          {/* Large Search Bar */}
          <div ref={searchContainerRef} className="relative max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-card shadow-lg p-1.5 border border-white/20">
              <div className="flex-grow flex items-center pl-3">
                <Search className="text-gray-400 shrink-0" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search by college name, city, or state..."
                  className="w-full bg-transparent border-0 outline-none text-dark-text py-2 px-3 text-sm md:text-base focus:ring-0"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-btn shadow-sm transition-colors text-sm"
              >
                Search
              </button>
            </form>

            {/* Auto-suggest list */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-card shadow-xl border border-gray-100 z-50 text-left overflow-hidden divide-y divide-gray-100 animate-fade-in">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSuggestionClick(s.id)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <img
                      src={s.logoUrl}
                      alt=""
                      className="w-8 h-8 rounded border border-gray-100 object-contain p-0.5 bg-white shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div className="min-w-0 flex-grow">
                      <div className="text-sm font-bold text-dark-text truncate">{s.name}</div>
                      <div className="text-xs text-secondary-text truncate">{s.locationCity}, {s.locationState}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col md:flex-row gap-8 items-start">
        
        {/* Desktop Filter Panel (Left sidebar) */}
        <aside className="hidden lg:block w-72 bg-white rounded-card border border-gray-200/80 p-6 shadow-sm shrink-0 sticky top-20">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <h2 className="font-bold text-dark-text flex items-center gap-2 text-base">
              <SlidersHorizontal size={18} className="text-primary" />
              <span>Filters</span>
            </h2>
            {activeChips.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary hover:text-primary-dark font-bold transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {isLoadingFilters ? (
            <div className="space-y-4">
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 no-scrollbar">
              {/* Streams Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-3">Popular Streams</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {filtersData?.streams.map((stream) => {
                    const isActive = searchParams.get('stream') === stream;
                    return (
                      <button
                        key={stream}
                        onClick={() => updateQueryParam('stream', isActive ? null : stream)}
                        className={`px-3 py-2 text-xs font-semibold rounded border text-center transition-all ${
                          isActive
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white text-secondary-text border-gray-200 hover:border-dark-text hover:text-dark-text'
                        }`}
                      >
                        {stream}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* State Cascading Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-2">Location State</label>
                <select
                  value={searchParams.get('state') || ''}
                  onChange={(e) => updateQueryParam('state', e.target.value || null)}
                  className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary bg-white font-medium"
                >
                  <option value="">All States</option>
                  {filtersData?.states.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* City Cascading Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-2">Location City</label>
                <select
                  value={searchParams.get('city') || ''}
                  onChange={(e) => updateQueryParam('city', e.target.value || null)}
                  disabled={!searchParams.get('state')}
                  className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary bg-white font-medium disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="">All Cities</option>
                  {getAvailableCities().map((ct) => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
                {!searchParams.get('state') && (
                  <span className="text-[10px] text-gray-400 mt-1 block">Please select a state first.</span>
                )}
              </div>

              {/* Fees Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text">Max Fees (Per Annum)</label>
                  <span className="text-xs font-extrabold text-primary">
                    {searchParams.get('fees_max') ? `₹${parseFloat(searchParams.get('fees_max')!) / 100000}L` : '₹25L+'}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="2500000"
                  step="50000"
                  value={searchParams.get('fees_max') || '2500000'}
                  onChange={(e) => updateQueryParam('fees_max', e.target.value === '2500000' ? null : e.target.value)}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                  <span>₹50K</span>
                  <span>₹12.5L</span>
                  <span>₹25L+</span>
                </div>
              </div>

              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-2.5">Minimum Rating</label>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.0].map((rate) => (
                    <label key={rate} className="flex items-center gap-2.5 text-sm text-dark-text cursor-pointer select-none">
                      <input
                        type="radio"
                        name="rating"
                        checked={searchParams.get('rating') === String(rate)}
                        onChange={() => updateQueryParam('rating', searchParams.get('rating') === String(rate) ? null : rate)}
                        onClick={() => {
                          if (searchParams.get('rating') === String(rate)) {
                            updateQueryParam('rating', null);
                          }
                        }}
                        className="w-4 h-4 text-primary accent-primary border-gray-300 focus:ring-primary/20"
                      />
                      <span className="font-semibold">{rate}+ Stars</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* College Ownership Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-2">Ownership</label>
                <select
                  value={searchParams.get('ownership') || ''}
                  onChange={(e) => updateQueryParam('ownership', e.target.value || null)}
                  className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary bg-white font-medium"
                >
                  <option value="">All Ownership Types</option>
                  {filtersData?.ownerships.map((own) => (
                    <option key={own} value={own}>{own}</option>
                  ))}
                </select>
              </div>

              {/* College Type Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-2">College Type</label>
                <select
                  value={searchParams.get('type') || ''}
                  onChange={(e) => updateQueryParam('type', e.target.value || null)}
                  className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary bg-white font-medium"
                >
                  <option value="">All Types</option>
                  {filtersData?.types.map((tp) => (
                    <option key={tp} value={tp}>{tp}</option>
                  ))}
                </select>
              </div>

              {/* NAAC Accreditation Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-2">NAAC Grade</label>
                <select
                  value={searchParams.get('accreditation') || ''}
                  onChange={(e) => updateQueryParam('accreditation', e.target.value || null)}
                  className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary bg-white font-medium"
                >
                  <option value="">All Accreditations</option>
                  {filtersData?.accreditations.map((acc) => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </aside>

        {/* Results Area */}
        <section className="flex-grow w-full">
          {/* Active Chips & Sorting bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
            <div>
              <div className="text-sm font-semibold text-secondary-text">
                Showing{' '}
                <span className="font-extrabold text-dark-text">
                  {isLoadingColleges ? '...' : meta.total}
                </span>{' '}
                colleges
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Trigger Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 hover:border-dark-text text-sm font-semibold bg-white text-secondary-text hover:text-dark-text transition-all shadow-sm cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2.5 py-1.5 shadow-sm text-sm">
                <ArrowUpDown size={14} className="text-gray-400" />
                <select
                  value={searchParams.get('sort') || 'rating'}
                  onChange={(e) => updateQueryParam('sort', e.target.value)}
                  className="bg-transparent border-0 outline-none text-dark-text font-bold cursor-pointer pr-1 focus:ring-0"
                >
                  <option value="rating">Rating: High to Low</option>
                  <option value="fees">Fees: Low to High</option>
                  <option value="nirf">NIRF Rank: Low to High</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Chips Row */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-secondary-text font-bold uppercase tracking-wider">Active:</span>
              {activeChips.map((c) => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded bg-primary/5 border border-primary/20 text-xs font-bold text-primary shadow-sm"
                >
                  <span>{c.label}</span>
                  <button
                    onClick={() => removeFilter(c.key)}
                    className="p-0.5 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:text-red-700 font-bold ml-1 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Cards Grid */}
          {isLoadingColleges ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <SkeletonLoader variant="card" count={6} />
            </div>
          ) : colleges.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-card p-12 text-center shadow-sm max-w-2xl mx-auto mt-8">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-dark-text mb-2">No colleges match your filters</h3>
              <p className="text-sm text-secondary-text mb-6">
                Try widening your search range, removing location constraints, or choosing different options.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-primary text-white font-bold rounded-btn hover:bg-primary-dark transition-colors shadow-sm text-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {colleges.map((col) => {
                const isCompared = comparedItems.some((item) => item.id === col.id);
                const isSaved = savedIds.includes(col.id);
                return (
                  <CollegeCard
                    key={col.id}
                    college={col}
                    isSaved={isSaved}
                    onToggleSave={onToggleSave}
                    isCompared={isCompared}
                    onToggleCompare={() => onToggleCompare(col)}
                    compareCount={comparedItems.length}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && !isLoadingColleges && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-gray-200">
              <button
                disabled={meta.page === 1}
                onClick={() => updateQueryParam('page', meta.page - 1)}
                className="p-2 border border-gray-200 rounded hover:border-dark-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: meta.totalPages }, (_, index) => {
                const pageNum = index + 1;
                const isCurrent = meta.page === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateQueryParam('page', pageNum)}
                    className={`w-9 h-9 flex items-center justify-center font-bold text-xs rounded transition-all ${
                      isCurrent
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-gray-200 hover:border-dark-text bg-white text-dark-text'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={meta.page === meta.totalPages}
                onClick={() => updateQueryParam('page', meta.page + 1)}
                className="p-2 border border-gray-200 rounded hover:border-dark-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Drawer (Collapsible slide-up / overlay) */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowMobileFilters(false)}
          />
          
          <div className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl p-6 overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h2 className="font-bold text-dark-text flex items-center gap-2 text-base">
                <SlidersHorizontal size={18} className="text-primary" />
                <span>Filters</span>
              </h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {isLoadingFilters ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-6 flex-grow pb-8">
                {/* Streams */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-3">Popular Streams</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {filtersData?.streams.map((stream) => {
                      const isActive = searchParams.get('stream') === stream;
                      return (
                        <button
                          key={stream}
                          onClick={() => {
                            updateQueryParam('stream', isActive ? null : stream);
                          }}
                          className={`px-3 py-2 text-xs font-semibold rounded border text-center transition-all ${
                            isActive
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-white text-secondary-text border-gray-200 hover:border-dark-text'
                          }`}
                        >
                          {stream}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-2">Location State</label>
                  <select
                    value={searchParams.get('state') || ''}
                    onChange={(e) => {
                      updateQueryParam('state', e.target.value || null);
                    }}
                    className="w-full p-2 border border-gray-200 rounded text-sm bg-white font-medium"
                  >
                    <option value="">All States</option>
                    {filtersData?.states.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-2">Location City</label>
                  <select
                    value={searchParams.get('city') || ''}
                    onChange={(e) => {
                      updateQueryParam('city', e.target.value || null);
                    }}
                    disabled={!searchParams.get('state')}
                    className="w-full p-2 border border-gray-200 rounded text-sm bg-white font-medium disabled:opacity-50"
                  >
                    <option value="">All Cities</option>
                    {getAvailableCities().map((ct) => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>

                {/* Fees slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text">Max Fees (Per Annum)</label>
                    <span className="text-xs font-extrabold text-primary">
                      {searchParams.get('fees_max') ? `₹${parseFloat(searchParams.get('fees_max')!) / 100000}L` : '₹25L+'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="2500000"
                    step="50000"
                    value={searchParams.get('fees_max') || '2500000'}
                    onChange={(e) => {
                      updateQueryParam('fees_max', e.target.value === '2500000' ? null : e.target.value);
                    }}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-2.5">Minimum Rating</label>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.0].map((rate) => (
                      <label key={rate} className="flex items-center gap-2.5 text-sm text-dark-text cursor-pointer select-none">
                        <input
                          type="radio"
                          name="rating-mob"
                          checked={searchParams.get('rating') === String(rate)}
                          onChange={() => updateQueryParam('rating', rate)}
                          onClick={() => {
                            if (searchParams.get('rating') === String(rate)) {
                              updateQueryParam('rating', null);
                            }
                          }}
                          className="w-4 h-4 text-primary accent-primary"
                        />
                        <span className="font-semibold">{rate}+ Stars</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ownership */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-2">Ownership</label>
                  <select
                    value={searchParams.get('ownership') || ''}
                    onChange={(e) => updateQueryParam('ownership', e.target.value || null)}
                    className="w-full p-2 border border-gray-200 rounded text-sm bg-white font-medium"
                  >
                    <option value="">All Ownership Types</option>
                    {filtersData?.ownerships.map((own) => (
                      <option key={own} value={own}>{own}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div className="flex gap-4 border-t border-gray-100 pt-4 mt-auto">
              <button
                onClick={clearAllFilters}
                className="w-1/2 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-btn text-xs font-bold text-secondary-text"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-1/2 py-2.5 bg-primary text-white hover:bg-primary-dark rounded-btn text-xs font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
