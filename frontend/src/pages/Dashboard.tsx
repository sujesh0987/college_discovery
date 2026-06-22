import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Bookmark, GitCompare, Key, Trash2, Settings, ShieldAlert, GraduationCap, MapPin, ExternalLink } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonLoader } from '../components/SkeletonLoader';

interface SavedCollege {
  id: number;
  collegeId: number;
  createdAt: string;
  college: {
    id: number;
    name: string;
    logoUrl: string;
    locationCity: string;
    locationState: string;
    feesMin: number;
    feesMax: number;
    rating: number;
    reviewCount: number;
  };
}

interface SavedComparison {
  id: number;
  name: string;
  collegeIds: number[];
  createdAt: string;
  colleges: {
    id: number;
    name: string;
    logoUrl: string;
    locationCity: string;
  }[];
}

export const Dashboard: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'saved-colleges' | 'saved-comparisons'>('profile');
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Profile Edit fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [examType, setExamType] = useState(user?.examType || 'JEE Main');
  const [targetYear, setTargetYear] = useState(user?.targetYear || new Date().getFullYear());
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Sync state with auth user info
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setExamType(user.examType || 'JEE Main');
      setTargetYear(user.targetYear || new Date().getFullYear());
    }
  }, [user]);

  // Load Saved Colleges & Comparisons
  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      if (activeTab === 'saved-colleges') {
        const res = await apiFetch('/saved-colleges');
        if (res.success && res.data) {
          setSavedColleges(res.data);
        }
      } else if (activeTab === 'saved-comparisons') {
        const res = await apiFetch('/saved-comparisons');
        if (res.success && res.data) {
          setSavedComparisons(res.data);
        }
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to fetch saved items', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const payload: any = {
        name,
        phone: phone || null,
        examType: examType || null,
        targetYear: targetYear ? Number(targetYear) : null,
      };

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          showToast('New passwords do not match.', 'error');
          setIsUpdatingProfile(false);
          return;
        }
        if (newPassword.length < 6) {
          showToast('Password must be at least 6 characters.', 'error');
          setIsUpdatingProfile(false);
          return;
        }
        payload.password = newPassword;
      }

      await updateUser(payload);
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      // Toast handles error message
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUnsaveCollege = async (collegeId: number) => {
    try {
      // Optimistic delete
      setSavedColleges(prev => prev.filter(c => c.collegeId !== collegeId));
      const res = await apiFetch(`/saved-colleges/${collegeId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast('College bookmark removed.', 'info');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to remove bookmark', 'error');
      // Reload on failure
      loadDashboardData();
    }
  };

  const handleDeleteComparison = async (compId: number) => {
    try {
      // Optimistic delete
      setSavedComparisons(prev => prev.filter(c => c.id !== compId));
      const res = await apiFetch(`/saved-comparisons/${compId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast('Comparison shortlist deleted.', 'info');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to delete shortlist', 'error');
      loadDashboardData();
    }
  };

  const handleLoadComparison = (comp: SavedComparison) => {
    navigate(`/compare?ids=${comp.collegeIds.join(',')}`);
  };

  const handleAccountDeletion = async () => {
    // Under MVP, we can simulate account deletion by calling logout
    // (Or we can implement a BE endpoint, but there is no specific endpoint in spec,
    // so clearing JWT/Cookies and routing to index is standard).
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      showToast("Please type 'delete' to confirm.", 'error');
      return;
    }
    
    // Simulate delete: call logout, toast and redirect
    showToast('Your account has been deleted. We are sorry to see you go.', 'info');
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow flex flex-col">
      {/* Welcome Banner */}
      <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
          <User size={24} />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-extrabold text-dark-text tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-xs text-secondary-text font-semibold mt-1">Targeting {user?.examType || 'JEE Main'} in the {user?.targetYear || new Date().getFullYear()} admission session.</p>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start flex-grow">
        
        {/* Navigation Sidebar */}
        <aside className="bg-white border border-gray-200/80 rounded-card p-4 shadow-sm flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-btn transition-all text-left ${
              activeTab === 'profile'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary-text hover:text-dark-text hover:bg-gray-50'
            }`}
          >
            <Settings size={18} />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('saved-colleges')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-btn transition-all text-left ${
              activeTab === 'saved-colleges'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary-text hover:text-dark-text hover:bg-gray-50'
            }`}
          >
            <Bookmark size={18} />
            <span>Saved Colleges</span>
          </button>

          <button
            onClick={() => setActiveTab('saved-comparisons')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-btn transition-all text-left ${
              activeTab === 'saved-comparisons'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary-text hover:text-dark-text hover:bg-gray-50'
            }`}
          >
            <GitCompare size={18} />
            <span>Saved Comparisons</span>
          </button>
        </aside>

        {/* Dynamic Detail Pane */}
        <section className="lg:col-span-3 min-w-0">
          
          {/* TAB 1: PROFILE EDIT */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm space-y-8 animate-fade-in">
              <h2 className="text-lg font-bold text-dark-text border-b border-gray-100 pb-2 flex items-center gap-2">
                <Settings size={18} className="text-primary" />
                <span>Profile Settings</span>
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* General Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-dark-text">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-dark-text">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-dark-text">Target Exam</label>
                    <select
                      value={examType}
                      onChange={e => setExamType(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm bg-white font-semibold text-secondary-text"
                    >
                      <option value="JEE Main">JEE Main</option>
                      <option value="NEET">NEET</option>
                      <option value="CAT">CAT</option>
                      <option value="CLAT">CLAT</option>
                      <option value="Direct">Direct</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-dark-text">Target Admission Year</label>
                    <input
                      type="number"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 6}
                      value={targetYear}
                      onChange={e => setTargetYear(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Password change panel */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold text-dark-text mb-4 flex items-center gap-1.5">
                    <Key size={16} className="text-primary" />
                    <span>Change Password (Leave blank to keep current)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-secondary-text">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-secondary-text">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded focus:outline-none focus:border-primary text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Form CTA */}
                <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                  >
                    Delete Account
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-btn hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-75 cursor-pointer"
                  >
                    {isUpdatingProfile ? (
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 2: SAVED COLLEGES */}
          {activeTab === 'saved-colleges' && (
            <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-dark-text border-b border-gray-100 pb-2 flex items-center gap-2">
                <Bookmark size={18} className="text-primary" />
                <span>Shortlisted Colleges ({savedColleges.length})</span>
              </h2>

              {isLoadingData ? (
                <div className="space-y-4">
                  <SkeletonLoader variant="list" count={3} />
                </div>
              ) : savedColleges.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                  <GraduationCap size={36} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-secondary-text mb-4">No colleges saved yet.</p>
                  <Link to="/" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-btn hover:bg-primary-dark transition-colors">
                    Explore Colleges
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {savedColleges.map(saved => (
                    <div
                      key={saved.id}
                      className="p-4 border border-gray-200 rounded-card bg-white flex flex-col sm:flex-row items-center gap-4 hover:shadow-sm hover:border-gray-300 transition-all duration-200"
                    >
                      <img
                        src={saved.college.logoUrl}
                        alt=""
                        className="w-12 h-12 rounded object-contain border border-gray-100 p-1 bg-white shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=60';
                        }}
                      />
                      
                      <div className="flex-grow text-center sm:text-left min-w-0">
                        <Link
                          to={`/college/${saved.college.id}`}
                          className="font-bold text-sm text-dark-text hover:text-primary transition-colors truncate block leading-snug"
                        >
                          {saved.college.name}
                        </Link>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs text-secondary-text">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin size={12} />
                            {saved.college.locationCity}, {saved.college.locationState}
                          </span>
                          <span>&bull;</span>
                          <span className="font-extrabold text-primary">{saved.college.rating.toFixed(1)}★</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUnsaveCollege(saved.collegeId)}
                          className="p-2 border border-gray-200 rounded-btn text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shadow-xs"
                          title="Remove bookmark"
                        >
                          <Trash2 size={15} />
                        </button>
                        
                        <Link
                          to={`/college/${saved.college.id}`}
                          className="flex items-center gap-1 px-3 py-2 bg-primary/5 hover:bg-primary text-primary hover:text-white border border-primary/10 text-xs font-bold rounded-btn transition-colors"
                        >
                          <span>Profile</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED COMPARISONS */}
          {activeTab === 'saved-comparisons' && (
            <div className="bg-white border border-gray-200/80 rounded-card p-6 shadow-sm space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-dark-text border-b border-gray-100 pb-2 flex items-center gap-2">
                <GitCompare size={18} className="text-primary" />
                <span>Saved Comparisons ({savedComparisons.length})</span>
              </h2>

              {isLoadingData ? (
                <div className="space-y-4">
                  <SkeletonLoader variant="list" count={3} />
                </div>
              ) : savedComparisons.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                  <GitCompare size={36} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-secondary-text mb-4">No comparisons saved yet.</p>
                  <Link to="/" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-btn hover:bg-primary-dark transition-colors">
                    Compare Colleges
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {savedComparisons.map(comp => (
                    <div
                      key={comp.id}
                      className="p-4 border border-gray-200 rounded-card bg-white flex flex-col sm:flex-row items-center gap-4 hover:shadow-sm hover:border-gray-300 transition-all duration-200"
                    >
                      <div className="flex-grow min-w-0 text-center sm:text-left">
                        <h3 className="font-extrabold text-sm text-dark-text truncate leading-snug">{comp.name}</h3>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1.5">
                          {comp.colleges.map(col => (
                            <div key={col.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-gray-200 text-[10px] font-semibold text-secondary-text bg-gray-50/50">
                              <img src={col.logoUrl} alt="" className="w-3 h-3 rounded-full object-contain" />
                              <span className="truncate max-w-[100px]">{col.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-gray-400 font-medium">
                          Saved: {new Date(comp.createdAt).toLocaleDateString()}
                        </span>
                        
                        <button
                          onClick={() => handleDeleteComparison(comp.id)}
                          className="p-2 border border-gray-200 rounded-btn text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shadow-xs"
                          title="Delete Shortlist"
                        >
                          <Trash2 size={15} />
                        </button>
                        
                        <button
                          onClick={() => handleLoadComparison(comp)}
                          className="flex items-center gap-1 px-3 py-2 bg-primary text-white text-xs font-bold rounded-btn hover:bg-primary-dark transition-colors shadow-xs"
                        >
                          <span>Open</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </section>
      </div>

      {/* Account deletion warning modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-card shadow-xl p-6 z-10 animate-fade-in border border-red-100">
            <h2 className="text-lg font-bold text-red-600 mb-2 border-b border-red-50 pb-2 flex items-center gap-2">
              <ShieldAlert size={20} className="text-red-500 animate-pulse" />
              <span>Danger Zone: Delete Account</span>
            </h2>
            <p className="text-xs text-secondary-text leading-relaxed mb-4">
              Are you absolutely sure you want to delete your profile? This action will permanently remove all your saved bookmarks, shortlist comparison comparisons, and reviews. This action is irreversible.
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-secondary-text">Type <span className="font-extrabold text-red-600">"delete"</span> to confirm:</label>
                <input
                  type="text"
                  placeholder="delete"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded text-sm bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-btn text-xs font-bold text-secondary-text hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccountDeletion}
                  className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-btn hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete Account Permanent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
