import React, { useState } from 'react';
import { Menu, X, ShieldCheck, SlidersHorizontal, User, LogIn, Calendar, Megaphone, Palette } from 'lucide-react';
import { UserProfile, WebsiteConfig } from '../types';

interface NavbarProps {
  onOpenApply: () => void;
  onOpenAdmin: () => void;
  currentUser: UserProfile | null;
  websiteConfig: WebsiteConfig;
  onOpenAuth: () => void;
  onOpenUserBookings: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenApply,
  onOpenAdmin,
  currentUser,
  websiteConfig,
  onOpenAuth,
  onOpenUserBookings,
  activeTab,
  setActiveTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminActive = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cyberpoint_admin_logged_in') === 'true';

  const navLinks = [
    { id: 'services', label: 'Services & Fees' },
    { id: 'send-docs', label: 'Send Documents' },
    { id: 'appointment', label: 'Book Slot' },
    { id: 'track', label: 'Track Status' },
    { id: 'about', label: 'About Desk' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Announcement Banner (Customizable by Admin) */}
      {websiteConfig.announcementEnabled && websiteConfig.announcementText && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white text-[11px] font-medium py-1.5 px-4 text-center border-b border-blue-500/40 flex items-center justify-center gap-2">
          <Megaphone className="w-3.5 h-3.5 text-blue-200 shrink-0" />
          <span className="truncate">{websiteConfig.announcementText}</span>
        </div>
      )}

      {/* Admin Quick Editing Strip when Admin is logged in */}
      {isAdminActive && (
        <div className="bg-slate-900 text-amber-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white">Admin Session Active (sayanbaishya64@gmail.com)</span>
          </div>
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-[11px] transition-colors"
          >
            <Palette className="w-3 h-3" />
            <span>Customize Website Live</span>
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-16">
            {/* Zone 1: Single clean text element wordmark */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {websiteConfig.cafeName.slice(0, 2).toUpperCase()}
              </span>
              <span>{websiteConfig.cafeName}</span>
            </a>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  activeTab === link.id
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action + subtle admin link + Firebase badge + User Auth */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentUser ? (
              <button
                onClick={onOpenUserBookings}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="View your booked appointments and applications"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] uppercase font-bold">
                  {currentUser.name.slice(0, 1)}
                </div>
                <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={onOpenAdmin}
              title="Cafe Owner Management Desk"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Owner Desk</span>
            </button>

            <button
              onClick={onOpenApply}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              Apply Online
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                {link.label}
              </button>
            ))}

            <div className="pt-2 border-t border-slate-100 space-y-2 px-3">
              {currentUser ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenUserBookings();
                  }}
                  className="w-full text-left py-2 text-xs font-semibold text-blue-600 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Account & Bookings ({currentUser.name})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left py-2 text-xs font-semibold text-blue-600 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </button>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1.5 py-1"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Owner Portal</span>
                </button>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Firebase Connected
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  );
};
