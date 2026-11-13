import React from 'react';
import { Bus, Navigation, MapPin, Sparkles, Clock, Phone } from 'lucide-react';

interface StudentHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeBusesCount: number;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  activeTab,
  setActiveTab,
  activeBusesCount
}) => {
  const tabs = [
    { id: 'tracker', label: 'Live Bus Tracker', icon: Bus },
    { id: 'planner', label: 'Find Best Route', icon: Navigation, badge: 'Smart AI' },
    { id: 'stops', label: 'Bus Stops & Timetable', icon: MapPin },
    { id: 'assistant', label: 'AI Student Assistant', icon: Sparkles },
  ];

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('tracker')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <Bus className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900">GRAMMOVE</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 -mt-0.5">
                Rural Student Bus Allocation & Live Tracking
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-emerald-100 text-emerald-800">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{activeBusesCount} Buses Running Live</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Morning Window: 07:15 - 09:00 AM</span>
            </div>
          </div>
        </div>

        {/* Mobile tabs row */}
        <div className="flex md:hidden border-t border-slate-100 py-2 overflow-x-auto gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
