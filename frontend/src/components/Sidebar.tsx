import React from 'react';
import {
  Home,
  Search,
  Star,
  MapPin,
  Bell,
  Settings,
  Bus,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadNotificationsCount?: number;
  isCrisisActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadNotificationsCount = 3,
  isCrisisActive = false
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'tracker', label: 'Live Bus Tracker', icon: Bus },
    { id: 'saved', label: 'Saved Routes', icon: Star },
    { id: 'nearby', label: 'Nearby Stops', icon: MapPin },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand & Navigation */}
      <div className="flex flex-col">
        {/* RouteFlow Brand Header */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 px-6 py-5 cursor-pointer border-b border-slate-100 transition hover:opacity-90"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">RouteFlow</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-blue-50 text-blue-700 border border-blue-200">
                AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 -mt-0.5">
              Your Journey, Simplified
            </p>
          </div>
        </div>

        {/* Main Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Special Prominent Exam-Day Crisis Button */}
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('exam_crisis')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition border ${
                activeTab === 'exam_crisis'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <ShieldAlert className="w-4 h-4" />
                <span>Exam Crisis Mode</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                activeTab === 'exam_crisis' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-800'
              }`}>
                AI OR
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Promotional Card Matching Screenshots */}
      <div className="p-3">
        <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/80 to-blue-100/50 border border-blue-100 flex flex-col items-center text-center">
          <div className="w-12 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-2.5 shadow-md shadow-blue-500/20">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">Track your bus in real-time</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Stay updated. Reach on time.</p>
        </div>
      </div>
    </aside>
  );
};
