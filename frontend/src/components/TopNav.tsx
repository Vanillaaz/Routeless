import React, { useState } from 'react';
import { Search, Bell, Bus, User, Menu, X, ShieldAlert } from 'lucide-react';

interface TopNavProps {
  onSearch: (query: string) => void;
  activeBusesCount: number;
  unreadCount?: number;
  onOpenNotifications: () => void;
  onOpenCrisis: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onSearch,
  activeBusesCount,
  unreadCount = 3,
  onOpenNotifications,
  onOpenCrisis,
  onToggleMobileMenu,
  isMobileMenuOpen
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Menu Toggle & Brand for Mobile */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Bus className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">RouteFlow</span>
        </div>
      </div>

      {/* Center Search Bar matching RouteFlow screenshots */}
      <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search bus number or route (eg KA-42-F-1024 or Byramangala)"
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 font-medium pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Buses Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{activeBusesCount} Buses Live</span>
        </div>

        {/* Exam Crisis Shortcut Badge */}
        <button
          onClick={onOpenCrisis}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
          title="Open Exam-Day Crisis Command Center"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Exam Crisis</span>
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Student Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
            <User className="w-4 h-4 text-slate-600" />
          </div>
        </div>
      </div>
    </header>
  );
};
