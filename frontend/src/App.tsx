import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CompareBar } from './components/CompareBar';
import type { CompareItem } from './components/CompareBar';
import { CollegeList } from './pages/CollegeList';
import { CollegeDetail } from './pages/CollegeDetail';
import { Compare } from './pages/Compare';
import { Dashboard } from './pages/Dashboard';
import { apiFetch } from './utils/api';
import './App.css';

// Protected Route Component for Auth gating
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthModal('login');
    }
  }, [isAuthenticated, isLoading, openAuthModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function MainAppContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  // Compare Session States
  const [comparedColleges, setComparedColleges] = useState<CompareItem[]>(() => {
    try {
      const saved = localStorage.getItem('compare_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Saved Bookmarks List (syncs with Database)
  const [savedIds, setSavedIds] = useState<number[]>([]);

  // Sync compare items to localStorage
  useEffect(() => {
    localStorage.setItem('compare_items', JSON.stringify(comparedColleges));
  }, [comparedColleges]);

  // Load Saved colleges when user logs in
  useEffect(() => {
    const fetchSaved = async () => {
      if (isAuthenticated) {
        try {
          const res = await apiFetch('/saved-colleges');
          if (res.success && res.data) {
            setSavedIds(res.data.map((item: any) => item.collegeId));
          }
        } catch (e) {
          console.error('Failed to load saved colleges list', e);
        }
      } else {
        setSavedIds([]);
      }
    };
    fetchSaved();
  }, [isAuthenticated]);

  const handleToggleCompare = (college: any) => {
    const isAdded = comparedColleges.some(item => item.id === college.id);
    if (isAdded) {
      setComparedColleges(prev => prev.filter(item => item.id !== college.id));
      showToast('Removed from compare list', 'info');
    } else {
      if (comparedColleges.length >= 3) {
        showToast('You can compare a maximum of 3 colleges', 'warning');
        return;
      }
      const newItem: CompareItem = {
        id: college.id,
        name: college.name,
        logoUrl: college.logoUrl,
        locationCity: college.locationCity,
      };
      setComparedColleges(prev => [...prev, newItem]);
      showToast('Added to compare list', 'success');
    }
  };

  const handleRemoveCompare = (id: number) => {
    setComparedColleges(prev => prev.filter(item => item.id !== id));
    showToast('Removed from compare list', 'info');
  };

  const handleClearCompare = () => {
    setComparedColleges([]);
    showToast('Cleared compare list', 'info');
  };

  const handleToggleSave = async (collegeId: number) => {
    const isBookmarked = savedIds.includes(collegeId);
    if (isBookmarked) {
      try {
        const res = await apiFetch(`/saved-colleges/${collegeId}`, {
          method: 'DELETE',
        });
        if (res.success) {
          setSavedIds(prev => prev.filter(id => id !== collegeId));
          showToast('College bookmark removed.', 'info');
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to remove bookmark', 'error');
      }
    } else {
      try {
        const res = await apiFetch('/saved-colleges', {
          method: 'POST',
          body: JSON.stringify({ collegeId }),
        });
        if (res.success) {
          setSavedIds(prev => [...prev, collegeId]);
          showToast('College bookmarked successfully!', 'success');
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to bookmark college', 'error');
      }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <span className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-secondary-text animate-pulse">Initializing CollegeDiscovery...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-bg">
      {/* Navigation Header */}
      <Header />

      {/* Main Pages router */}
      <main className="flex-grow flex flex-col pb-24">
        <Routes>
          <Route
            path="/"
            element={
              <CollegeList
                comparedItems={comparedColleges}
                onToggleCompare={handleToggleCompare}
                onToggleSave={handleToggleSave}
                savedIds={savedIds}
              />
            }
          />
          <Route
            path="/college/:id"
            element={
              <CollegeDetail
                comparedItems={comparedColleges}
                onToggleCompare={handleToggleCompare}
                onToggleSave={handleToggleSave}
                savedIds={savedIds}
              />
            }
          />
          <Route path="/compare" element={<Compare />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent Compare bottom bar widget */}
      <CompareBar
        items={comparedColleges}
        onRemove={handleRemoveCompare}
        onClear={handleClearCompare}
      />

      {/* Footer */}
      <Footer />

      {/* Auth overlay Modal dialog */}
      <AuthModal />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainAppContent />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
