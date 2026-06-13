import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEstate } from '../../context/EstateContext';
import { Flame, LogOut, Menu, User, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { estateProfile } = useEstate();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const threshold = isLanding ? 300 : 10;
      if (window.scrollY > threshold) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check immediately on mount/path change
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Don't show regular navigation in Family PortalUnlocked view (makes it cleaner)
  const isFamilyPortalSubpage = location.pathname.startsWith('/family-portal/');

  const navBgClass = isLanding
    ? (scrolled 
        ? 'bg-[#0D0A07]/80 backdrop-blur-md border-b border-[#D4A853]/20 shadow-[0_4px_20px_rgba(193,125,60,0.12)]' 
        : 'bg-transparent border-transparent shadow-none')
    : 'bg-[#0D0A07]/80 backdrop-blur-md border-b border-[#D4A853]/20 shadow-sm';

  const textClass = 'text-white';
  const linkTextClass = 'text-[#E8D5B7]/80 hover:text-[#D4A853]';
  const secondaryLinkTextClass = 'text-[#D4A853]/90 hover:text-[#D4A853]';

  return (
    <nav className={`py-4 px-6 md:px-12 sticky top-0 z-40 transition-all duration-300 ${navBgClass}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group animate-logo-pulse">
          <div className="bg-amber/10 p-2 rounded-full group-hover:bg-amber/15 transition-all">
            <Flame className="text-amber w-6 h-6 animate-flame" />
          </div>
          <span className={`font-display text-2xl font-bold tracking-tight transition-colors duration-300 ${textClass}`}>
            AfterMind
          </span>
        </Link>

        {/* Navigation Links */}
        {!isFamilyPortalSubpage && (
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-6 text-sm font-sans font-semibold">
                  <Link 
                    to="/dashboard" 
                    className={`nav-link-underline font-semibold transition-colors duration-300 ${isActive('/dashboard') ? 'text-[#D4A853] font-bold' : linkTextClass}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/setup" 
                    className={`nav-link-underline font-semibold transition-colors duration-300 ${isActive('/setup') ? 'text-[#D4A853] font-bold' : linkTextClass}`}
                  >
                    Setup Chat
                  </Link>
                  <Link 
                    to="/capsules" 
                    className={`nav-link-underline font-semibold transition-colors duration-300 ${isActive('/capsules') ? 'text-[#D4A853] font-bold' : linkTextClass}`}
                  >
                    Time Capsules
                  </Link>
                  <Link 
                    to="/contacts" 
                    className={`nav-link-underline font-semibold transition-colors duration-300 ${isActive('/contacts') ? 'text-[#D4A853] font-bold' : linkTextClass}`}
                  >
                    Trusted Contacts
                  </Link>
                </div>

                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  {estateProfile?.status === 'triggered' && (
                    <Link to="/execution-status" className="flex items-center gap-1.5 bg-red-950 border border-red-500 text-red-200 text-xs px-2.5 py-1 rounded-full animate-pulse font-sans font-semibold">
                      <ShieldAlert size={14} />
                      <span>Executing</span>
                    </Link>
                  )}

                  <span className="hidden lg:flex items-center gap-1 text-xs font-sans text-[#E8D5B7] bg-white/5 px-2.5 py-1 rounded-full border border-white/10 font-semibold">
                    <User size={12} />
                    {user?.full_name || user?.email}
                  </span>

                  <button 
                    onClick={handleLogout}
                    className="p-2 transition-colors rounded-full hover:bg-white/10 cursor-pointer text-[#E8D5B7]/80 hover:text-white"
                    title="Log Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/family-portal" 
                  className={`nav-link-underline font-semibold text-sm transition-colors duration-300 px-3 py-1.5 ${secondaryLinkTextClass}`}
                >
                  Family Portal
                </Link>
                <Link 
                  to="/login" 
                  className={`nav-link-underline font-semibold text-sm transition-colors duration-300 px-3 py-1.5 ${linkTextClass}`}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary-premium text-sm font-sans font-semibold px-4 py-2 rounded-md cursor-pointer"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
        
        {isFamilyPortalSubpage && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-amber bg-amber/5 border border-amber/20 px-3 py-1 rounded-full font-medium uppercase tracking-wider">
              Family Secure View
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
