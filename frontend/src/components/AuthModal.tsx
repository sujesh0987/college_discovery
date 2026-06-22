import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, GraduationCap, Calendar } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalState, closeAuthModal, login, signup } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(authModalState.mode === 'login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [examType, setExamType] = useState('JEE Main');
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode if changed from parent context
  React.useEffect(() => {
    setIsLoginMode(authModalState.mode === 'login');
  }, [authModalState.mode]);

  if (!authModalState.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signup({
          email,
          name,
          password,
          phone: phone || undefined,
          examType: examType || undefined,
          targetYear: targetYear ? Number(targetYear) : undefined,
        });
      }
    } catch (err) {
      // errors are handled & toasted by context
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeAuthModal}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-card shadow-card glass-modal overflow-hidden bg-white/95 p-6 animate-fade-in z-10">
        
        {/* Close Button */}
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-dark-text transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-primary mb-1">
            {isLoginMode ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-sm text-gray-500">
            {isLoginMode 
              ? 'Login to save colleges and compare shortlists' 
              : 'Sign up to unlock personalization tools'
            }
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLoginMode && (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
              />
            </div>
          )}

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Mail size={18} />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
            />
          </div>

          {!isLoginMode && (
            <>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone Number (Optional)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <GraduationCap size={18} />
                  </span>
                  <select
                    value={examType}
                    onChange={e => setExamType(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white appearance-none"
                  >
                    <option value="JEE Main">JEE Main</option>
                    <option value="NEET">NEET</option>
                    <option value="CAT">CAT</option>
                    <option value="CLAT">CLAT</option>
                    <option value="Direct">Direct</option>
                  </select>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Calendar size={18} />
                  </span>
                  <input
                    type="number"
                    value={targetYear}
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 6}
                    onChange={e => setTargetYear(Number(e.target.value))}
                    placeholder="Target Year"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-primary text-white rounded-btn font-semibold hover:bg-primary-dark transition-colors duration-200 shadow-sm flex items-center justify-center text-sm disabled:opacity-75"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isLoginMode ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-4 text-center text-xs text-gray-500">
          {isLoginMode ? (
            <>
              Don't have an account?{' '}
              <button 
                onClick={() => setIsLoginMode(false)}
                className="text-primary hover:underline font-semibold"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                onClick={() => setIsLoginMode(true)}
                className="text-primary hover:underline font-semibold"
              >
                Login
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
