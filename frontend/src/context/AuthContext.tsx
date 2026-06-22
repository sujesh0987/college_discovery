import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setAccessToken } from '../utils/api';
import { useToast } from './ToastContext';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  examType?: string | null;
  targetYear?: number | null;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    email: string;
    name: string;
    password: string;
    phone?: string;
    examType?: string;
    targetYear?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User> & { password?: string }) => Promise<void>;
  openAuthModal: (mode: 'login' | 'signup', callback?: () => void) => void;
  closeAuthModal: () => void;
  authModalState: {
    isOpen: boolean;
    mode: 'login' | 'signup';
    onSuccessCallback?: () => void;
  };
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Auth modal triggered globally
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
    onSuccessCallback?: () => void;
  }>({
    isOpen: false,
    mode: 'login',
  });

  const openAuthModal = (mode: 'login' | 'signup', callback?: () => void) => {
    setAuthModalState({
      isOpen: true,
      mode,
      onSuccessCallback: callback,
    });
  };

  const closeAuthModal = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const hasToken = localStorage.getItem('access_token');
        if (hasToken) {
          const res = await apiFetch('/users/me');
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            setAccessToken(null);
          }
        } else {
          // If no token in localStorage, try refreshing once (in case user has refresh cookie)
          const res = await apiFetch('/auth/refresh', { method: 'POST' });
          if (res.success && res.data) {
            setUser(res.data.user);
            setAccessToken(res.data.accessToken);
          }
        }
      } catch (error) {
        // Silent catch for initial load
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data) {
        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        closeAuthModal();
        if (authModalState.onSuccessCallback) {
          authModalState.onSuccessCallback();
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Login failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any) => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (res.success && res.data) {
        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
        showToast(`Account created! Welcome, ${res.data.user.name}.`, 'success');
        closeAuthModal();
        if (authModalState.onSuccessCallback) {
          authModalState.onSuccessCallback();
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Registration failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      showToast('Logged out successfully', 'info');
    }
  };

  const updateUser = async (updatedData: any) => {
    try {
      const res = await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });

      if (res.success && res.data) {
        setUser(res.data);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        openAuthModal,
        closeAuthModal,
        authModalState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
