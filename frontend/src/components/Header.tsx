import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, LogOut, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated, logout, openAuthModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Search Colleges', path: '/' },
    { label: 'Compare', path: '/compare' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary text-white rounded-lg group-hover:bg-primary-dark transition-colors duration-200">
              <GraduationCap size={22} className="animate-float" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              CollegeDiscovery
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive(link.path) 
                    ? 'text-primary' 
                    : 'text-secondary-text hover:text-dark-text'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth / Action Area */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-btn border transition-colors duration-200 ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-primary/5 border-primary/20 text-primary'
                      : 'border-gray-200 text-secondary-text hover:text-dark-text hover:bg-gray-50'
                  }`}
                >
                  <User size={14} />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-btn transition-colors duration-200"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-sm font-semibold text-secondary-text hover:text-dark-text transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-dark transition-all duration-200 shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-secondary-text hover:text-dark-text focus:outline-none p-1"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-2 animate-fade-in shadow-lg">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-btn text-base font-semibold transition-colors duration-200 ${
                isActive(link.path)
                  ? 'bg-primary/5 text-primary'
                  : 'text-secondary-text hover:text-dark-text hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100 my-2" />
          {isAuthenticated ? (
            <div className="space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-btn text-base font-semibold text-secondary-text hover:text-dark-text hover:bg-gray-50"
              >
                <User size={18} />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-btn text-base font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 text-left"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-2 text-center text-sm font-semibold border border-gray-200 rounded-btn text-secondary-text hover:text-dark-text"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('signup');
                }}
                className="w-full py-2 bg-primary text-white text-center text-sm font-semibold rounded-btn hover:bg-primary-dark"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
