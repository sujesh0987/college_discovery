import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Building2, Calendar, Award, BookOpen, GraduationCap, Users, Bookmark, GitCompare, Share2, Search, ShieldAlert, Check, HelpCircle, PenTool, CheckCircle } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { RatingBadge } from '../components/RatingBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { CompareItem } from '../components/CompareBar';

interface Course {
  id: number;
  name: string;
  level: string;
  duration: string;
  seats: number;
  fees: number;
  eligibility: string;
  admissionMode: string;
}

interface Placement {
  id: number;
  year: number;
  avgPackage: number;
  highestPackage: number;
  medianPackage: number;
  placementPercentage: number;
  recruitersJson: string; // JSON string array of names
}

interface Facility {
  library: boolean;
  hostel: boolean;
  sports: boolean;
  labs: boolean;
  wifi: boolean;
  cafeteria: boolean;
  gym: boolean;
  medical: boolean;
}

interface Review {
  id: number;
  rating: number;
  academicsRating: number;
  facultyRating: number;
  placementsRating: number;
  infrastructureRating: number;
  socialLifeRating: number;
  title: string;
  body: string;
  helpfulCount: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

interface CollegeDetailData {
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
  mapEmbedUrl?: string | null;
  courses: Course[];
  placements: Placement[];
  facilities: Facility | null;
  reviews: Review[];
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

interface CollegeDetailProps {
  onToggleCompare: (college: any) => void;
  comparedItems: CompareItem[];
  onToggleSave: (collegeId: number) => Promise<void>;
  savedIds: number[];
}

export const CollegeDetail: React.FC<CollegeDetailProps> = ({
  onToggleCompare,
  comparedItems,
  onToggleSave,
  savedIds,
}) => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [college, setCollege] = useState<CollegeDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'placements' | 'reviews'>('overview');

  // Courses Tab States
  const [courseLevelFilter, setCourseLevelFilter] = useState<string>('All');
  const [courseSearch, setCourseSearch] = useState<string>('');

  // Reviews Tab States
  const [reviewSort, setReviewSort] = useState<'newest' | 'helpful'>('newest');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [helpfulClickedIds, setHelpfulClickedIds] = useState<number[]>([]);

  // Write Review Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newAcademics, setNewAcademics] = useState(5);
  const [newFaculty, setNewFaculty] = useState(5);
  const [newPlacements, setNewPlacements] = useState(5);
  const [newInfra, setNewInfra] = useState(5);
  const [newSocial, setNewSocial] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchCollegeDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/colleges/${id}`);
      if (res.success && res.data) {
        setCollege(res.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch college detail:', error);
      showToast(error.message || 'College not found', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollegeDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <SkeletonLoader variant="detail" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ShieldAlert size={48} className="text-red-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-dark-text mb-2">College Not Found</h2>
        <p className="text-sm text-secondary-text mb-6">The requested college detail could not be loaded or does not exist.</p>
        <Link to="/" className="px-5 py-2.5 bg-primary text-white rounded-btn font-bold text-sm shadow-sm">
          Return to Directory
        </Link>
      </div>
    );
  }

  const isSaved = savedIds.includes(college.id);
  const isCompared = comparedItems.some(item => item.id === college.id);

  const handleSaveClick = async () => {
    if (!isAuthenticated) {
      openAuthModal('login', () => onToggleSave(college.id));
    } else {
      await onToggleSave(college.id);
    }
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!', 'success');
  };

  const handleHelpfulClick = async (reviewId: number) => {
    if (helpfulClickedIds.includes(reviewId)) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await apiFetch(`/colleges/${college.id}/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      if (res.success) {
        setHelpfulClickedIds(prev => [...prev, reviewId]);
        setCollege(prev => {
          if (!prev) return null;
          return {
            ...prev,
            reviews: prev.reviews.map(r => 
              r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
            )
          };
        });
        showToast('Marked as helpful!', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Action failed', 'error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (newBody.length < 10) {
      showToast('Review body must be at least 10 characters long.', 'error');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await apiFetch(`/colleges/${college.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: newRating,
          academicsRating: newAcademics,
          facultyRating: newFaculty,
          placementsRating: newPlacements,
          infrastructureRating: newInfra,
          socialLifeRating: newSocial,
          title: newTitle,
          body: newBody,
        }),
      });

      if (res.success) {
        showToast('Review submitted successfully!', 'success');
        setShowReviewModal(false);
        // Clear fields
        setNewTitle('');
        setNewBody('');
        // Reload details to get fresh reviews and aggregate ratings
        await fetchCollegeDetail();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filter courses based on selections
  const filteredCourses = college.courses.filter(course => {
    const matchesLevel = courseLevelFilter === 'All' || course.level === courseLevelFilter;
    const matchesSearch = course.name.toLowerCase().includes(courseSearch.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const sortedReviews = [...college.reviews].sort((a, b) => {
    if (reviewSort === 'helpful') {
      return b.helpfulCount - a.helpfulCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex flex-col flex-grow w-full">
      {/* Banner & Hero Section */}
      <section className="relative bg-dark-text text-white">
        {/* Banner image wrapper */}
        <div className="absolute inset-0 z-0">
          <img
            src={college.bannerUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80'}
            alt=""
            className="w-full h-full object-cover opacity-35"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-text via-dark-text/75 to-transparent"></div>
        </div>

        {/* Hero details container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <img
              src={college.logoUrl || '/assets/react.svg'}
              alt={`${college.name} Logo`}
              className="w-24 h-24 rounded-2xl bg-white p-2 object-contain shadow-lg border border-white/10 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=60';
              }}
            />
            
            <div className="flex-grow min-w-0">
              {/* Accreditations row */}
              <div className="flex flex-wrap gap-2 mb-3">
                {college.nirfRank && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white border border-primary/20">
                    <Award size={12} />
                    NIRF #{college.nirfRank}
                  </span>
                )}
                {college.naacGrade && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">
                    NAAC {college.naacGrade}
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/10">
                  {college.ownership}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/10">
                  {college.type}
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
                {college.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-300 font-semibold mt-2">
                <div className="flex items-center gap-1">
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span>{college.locationCity}, {college.locationState}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 size={14} className="text-primary shrink-0" />
                  <span>Est. {college.established}</span>
                </div>
                {college.affiliatedUniversity && (
                  <div className="flex items-center gap-1">
                    <GraduationCap size={14} className="text-primary shrink-0" />
                    <span>Affiliated to {college.affiliatedUniversity}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats box */}
            <div className="shrink-0 flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-card">
              <RatingBadge rating={college.rating} reviewCount={college.reviewCount} showCount={false} size="lg" />
              <div className="border-l border-white/20 pl-4">
                <div className="text-lg font-extrabold text-white leading-none">{college.reviewCount}</div>
                <div className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mt-1">Reviews</div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleSaveClick}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-btn border transition-all ${
                isSaved
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Bookmark size={14} className={isSaved ? 'fill-white' : ''} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => onToggleCompare(college)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-btn border transition-all ${
                isCompared
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <GitCompare size={14} />
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>

            <button
              onClick={handleShareClick}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-btn border bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all ml-auto"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Tab Navigation */}
      <nav className="sticky top-16 z-30 bg-white border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto no-scrollbar h-12 items-center">
            {(['overview', 'courses', 'placements', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold capitalize whitespace-nowrap h-full border-b-2 transition-all px-1 flex items-center ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary-text hover:text-dark-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Page Tabs Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            {/* Left: About, highlights & Facilities */}
            <div className="lg:col-span-2 space-y-6">
              {/* About block */}
              <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm">
                <h2 className="text-lg font-bold text-dark-text mb-4 border-b border-gray-100 pb-2">About {college.name}</h2>
                <p className="text-sm text-secondary-text leading-relaxed whitespace-pre-line">{college.about}</p>
              </div>

              {/* Highlights grid */}
              <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm">
                <h2 className="text-lg font-bold text-dark-text mb-4 border-b border-gray-100 pb-2">Key Highlights</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {college.established && (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-btn">
                      <div className="text-[10px] text-secondary-text uppercase font-bold tracking-wider mb-1">Established</div>
                      <div className="text-sm font-bold text-dark-text">{college.established}</div>
                    </div>
                  )}
                  {college.campusSize && (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-btn">
                      <div className="text-[10px] text-secondary-text uppercase font-bold tracking-wider mb-1">Campus Size</div>
                      <div className="text-sm font-bold text-dark-text">{college.campusSize} Acres</div>
                    </div>
                  )}
                  {college.studentCount && (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-btn">
                      <div className="text-[10px] text-secondary-text uppercase font-bold tracking-wider mb-1">Total Students</div>
                      <div className="text-sm font-bold text-dark-text flex items-center gap-1">
                        <Users size={14} className="text-primary" />
                        {college.studentCount.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {college.facultyCount && (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-btn">
                      <div className="text-[10px] text-secondary-text uppercase font-bold tracking-wider mb-1">Faculty Size</div>
                      <div className="text-sm font-bold text-dark-text">{college.facultyCount} Members</div>
                    </div>
                  )}
                  {college.ownership && (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-btn">
                      <div className="text-[10px] text-secondary-text uppercase font-bold tracking-wider mb-1">Ownership</div>
                      <div className="text-sm font-bold text-dark-text">{college.ownership}</div>
                    </div>
                  )}
                  {college.regulatoryBody && (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-btn">
                      <div className="text-[10px] text-secondary-text uppercase font-bold tracking-wider mb-1">Regulatory Body</div>
                      <div className="text-sm font-bold text-dark-text">{college.regulatoryBody}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Facilities checkmarks */}
              {college.facilities && (
                <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-dark-text mb-4 border-b border-gray-100 pb-2">Campus Facilities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(college.facilities)
                      .filter(([key]) => key !== 'id' && key !== 'collegeId')
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className={`flex items-center gap-2.5 p-3 rounded-btn border text-sm font-bold transition-all duration-200 ${
                            value
                              ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                              : 'bg-gray-50/50 border-gray-100 text-gray-400'
                          }`}
                        >
                          {value ? (
                            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                          ) : (
                            <HelpCircle size={16} className="text-gray-300 shrink-0" />
                          )}
                          <span className="capitalize">{key}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Map embed & Info sidebar */}
            <div className="space-y-6">
              {/* Maps embed */}
              {college.mapEmbedUrl && (
                <div className="bg-white border border-gray-200/80 rounded-card p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-dark-text uppercase tracking-wider mb-3">Campus Location</h2>
                  <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                    <iframe
                      src={college.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      title={`${college.name} Location Map`}
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm animate-fade-in space-y-6">
            {/* Filtering & Search Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-dark-text">Available Programs & Courses</h2>
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-8 pr-4 py-1.5 border border-gray-200 rounded-btn text-xs bg-white outline-none focus:border-primary"
                  />
                </div>
                
                <select
                  value={courseLevelFilter}
                  onChange={e => setCourseLevelFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-btn text-xs bg-white font-bold text-secondary-text outline-none focus:border-primary"
                >
                  <option value="All">All Levels</option>
                  <option value="UG">Undergraduate (UG)</option>
                  <option value="PG">Postgraduate (PG)</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>
            </div>

            {/* Courses Table */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                <BookOpen size={36} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-secondary-text">No courses match your filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-secondary-text font-bold text-xs uppercase tracking-wider bg-gray-50">
                      <th className="py-3.5 px-4 rounded-tl-btn">Course Name</th>
                      <th className="py-3.5 px-4">Level</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4 text-right">Annual Fees</th>
                      <th className="py-3.5 px-4 text-center">Seats</th>
                      <th className="py-3.5 px-4">Eligibility Criteria</th>
                      <th className="py-3.5 px-4 rounded-tr-btn">Admission Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCourses.map(course => (
                      <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-dark-text">{course.name}</td>
                        <td className="py-3.5 px-4 text-xs font-semibold">
                          <span className={`px-2 py-0.5 rounded-full ${
                            course.level === 'UG' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-purple-50 text-purple-700 border border-purple-100'
                          }`}>
                            {course.level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-secondary-text font-medium">{course.duration}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-dark-text">
                          ₹{course.fees.toLocaleString()}/yr
                        </td>
                        <td className="py-3.5 px-4 text-center text-secondary-text font-bold">{course.seats}</td>
                        <td className="py-3.5 px-4 text-xs text-secondary-text max-w-xs truncate" title={course.eligibility}>
                          {course.eligibility}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 rounded">
                            {course.admissionMode}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'placements' && (
          <div className="space-y-6 animate-fade-in">
            {/* Year Placement Stats */}
            <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-dark-text border-b border-gray-100 pb-2">Placement Package Statistics (Last 3 Years)</h2>
              
              {college.placements.length === 0 ? (
                <p className="text-sm text-secondary-text py-4 text-center">Placement metrics are not updated yet.</p>
              ) : (
                <div className="space-y-8">
                  {college.placements.map(placement => (
                    <div key={placement.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-dark-text flex items-center gap-1.5">
                          <Calendar size={14} className="text-primary" />
                          <span>Year {placement.year}</span>
                        </span>
                        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {placement.placementPercentage}% Placed
                        </span>
                      </div>

                      {/* Package Bar charts using native CSS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-btn">
                          <div className="text-[10px] text-secondary-text uppercase font-bold tracking-wider mb-1">Average Package</div>
                          <div className="text-lg font-extrabold text-dark-text mb-2">₹{placement.avgPackage.toFixed(1)} LPA</div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${(placement.avgPackage / 50) * 100}%` }}></div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-btn">
                          <div className="text-[10px] text-secondary-text uppercase font-bold tracking-wider mb-1">Highest Package</div>
                          <div className="text-lg font-extrabold text-dark-text mb-2">₹{placement.highestPackage.toFixed(1)} LPA</div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(placement.highestPackage / 150) * 100}%` }}></div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-btn">
                          <div className="text-[10px] text-secondary-text uppercase font-bold tracking-wider mb-1">Median Package</div>
                          <div className="text-lg font-extrabold text-dark-text mb-2">₹{placement.medianPackage.toFixed(1)} LPA</div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(placement.medianPackage / 50) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Recruiters Logos grid */}
            {college.placements.length > 0 && (
              <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm">
                <h2 className="text-lg font-bold text-dark-text mb-4 border-b border-gray-100 pb-2">Top Hiring Companies</h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 items-center text-center">
                  {JSON.parse(college.placements[0].recruitersJson || '[]').map((comp: string, i: number) => (
                    <div
                      key={i}
                      className="p-4 border border-gray-100 rounded-btn bg-gray-50/50 flex flex-col items-center justify-center font-extrabold text-sm text-secondary-text hover:text-dark-text hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all h-20"
                    >
                      <Building2 size={24} className="text-gray-400 mb-1" />
                      <span className="truncate w-full text-xs">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            {/* Left: Overall rating dimensions breakdown */}
            <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-dark-text border-b border-gray-100 pb-2">Ratings Breakdown</h2>
              
              <div className="space-y-4">
                {[
                  { label: 'Academics', value: college.ratingsBreakdown.academics },
                  { label: 'Faculty & Support', value: college.ratingsBreakdown.faculty },
                  { label: 'Placements Rate', value: college.ratingsBreakdown.placements },
                  { label: 'Infrastructure', value: college.ratingsBreakdown.infrastructure },
                  { label: 'Social & Campus Life', value: college.ratingsBreakdown.socialLife },
                ].map((dim, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold text-dark-text">
                      <span>{dim.label}</span>
                      <span className="font-extrabold text-primary">{dim.value.toFixed(1)}/5.0</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${(dim.value / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 text-center">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModal('login', () => setShowReviewModal(true));
                    } else {
                      setShowReviewModal(true);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-btn hover:bg-primary-dark transition-colors shadow-sm cursor-pointer"
                >
                  <PenTool size={14} />
                  <span>Write a Review</span>
                </button>
              </div>
            </div>

            {/* Right: Individual review list */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="text-lg font-bold text-dark-text">Student Reviews</h2>
                
                <div className="flex items-center gap-1.5 text-xs text-secondary-text">
                  <span>Sort by:</span>
                  <select
                    value={reviewSort}
                    onChange={e => setReviewSort(e.target.value as any)}
                    className="bg-white border border-gray-200 rounded px-2 py-1 outline-none text-dark-text font-semibold"
                  >
                    <option value="newest">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>
              </div>

              {sortedReviews.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-card p-12 text-center shadow-sm">
                  <p className="text-sm text-secondary-text mb-4">No reviews have been written for this college yet. Be the first to write one!</p>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        openAuthModal('login', () => setShowReviewModal(true));
                      } else {
                        setShowReviewModal(true);
                      }
                    }}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-btn hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedReviews.map(review => (
                    <div key={review.id} className="bg-white border border-gray-200/80 rounded-card p-5 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-extrabold text-sm text-dark-text leading-snug">{review.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-secondary-text mt-1 font-semibold">
                            <span>By {review.user.name}</span>
                            <span>&bull;</span>
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold text-xs shrink-0">
                          <span>{review.rating.toFixed(1)}</span>
                          <span>★</span>
                        </div>
                      </div>

                      {/* Dimension Ratings in review details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 font-semibold border-y border-gray-50 py-1.5">
                        <span>Acad: {review.academicsRating}/5</span>
                        <span>Faculty: {review.facultyRating}/5</span>
                        <span>Placements: {review.placementsRating}/5</span>
                        <span>Infra: {review.infrastructureRating}/5</span>
                        <span>Social: {review.socialLifeRating}/5</span>
                      </div>

                      <p className="text-sm text-secondary-text leading-relaxed whitespace-pre-line">{review.body}</p>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => handleHelpfulClick(review.id)}
                          disabled={helpfulClickedIds.includes(review.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded text-xs border font-semibold transition-all ${
                            helpfulClickedIds.includes(review.id)
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                              : 'text-secondary-text border-gray-200 hover:border-dark-text hover:text-dark-text hover:bg-gray-50'
                          }`}
                        >
                          <Check size={12} />
                          <span>Helpful ({review.helpfulCount})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Review Submission drawer overlay */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-card shadow-xl p-6 overflow-y-auto max-h-[90vh] z-10 animate-fade-in">
            <h2 className="text-lg font-bold text-primary mb-1 border-b border-gray-100 pb-2">
              Write a Review for {college.name}
            </h2>
            <p className="text-xs text-secondary-text mb-4">Sharing your honest feedback helps prospective students make better choices.</p>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Title input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-dark-text">Review Title</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your experience (e.g., Outstanding infrastructure, but placement cells need work)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm bg-white"
                />
              </div>

              {/* Slider fields for ratings breakdown */}
              <div className="grid grid-cols-2 gap-4 border border-gray-100 p-3 rounded bg-gray-50/50">
                <div className="col-span-2 flex items-center justify-between border-b border-gray-200/50 pb-2 mb-1">
                  <span className="text-xs font-bold text-dark-text uppercase tracking-wider">Overall Rating</span>
                  <select
                    value={newRating}
                    onChange={e => setNewRating(Number(e.target.value))}
                    className="p-1 border border-gray-200 rounded text-xs bg-white font-extrabold text-primary"
                  >
                    {[5, 4, 3, 2, 1].map(v => (
                      <option key={v} value={v}>{v}.0 Stars</option>
                    ))}
                  </select>
                </div>
                
                {[
                  { label: 'Academics', state: newAcademics, setter: setNewAcademics },
                  { label: 'Faculty', state: newFaculty, setter: setNewFaculty },
                  { label: 'Placements', state: newPlacements, setter: setNewPlacements },
                  { label: 'Infrastructure', state: newInfra, setter: setNewInfra },
                  { label: 'Social & Campus', state: newSocial, setter: setNewSocial },
                ].map((dim, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-secondary-text font-semibold">{dim.label}</span>
                      <span className="font-bold text-dark-text">{dim.state}★</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={dim.state}
                      onChange={e => dim.setter(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Review Body */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-dark-text">Detailed Review Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about classroom environments, library resources, canteen quality, placement companies, sports opportunities, and social circles (min 10 characters)..."
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm bg-white"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end border-t border-gray-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-btn text-xs font-bold text-secondary-text hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-btn hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-75"
                >
                  {isSubmittingReview ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <PenTool size={12} />
                      <span>Submit Review</span>
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
