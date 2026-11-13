import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Clock, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Flame,
  Radio
} from 'lucide-react';
import type { Disruption, OptimizationResult, Student, Vehicle } from '../types';

interface TopNavProps {
  scenarioName: string;
  disruptions: Disruption[];
  optimization: OptimizationResult | null;
  students: Student[];
  vehicles: Vehicle[];
  onOpenSearch: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  scenarioName,
  disruptions,
  optimization,
  students,
  vehicles,
  onOpenSearch,
  onNavigateToTab
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const activeDisruptions = disruptions.filter(d => d.active);
  const coverage = optimization?.coverage_percentage ?? 100;
  const isHealthy = activeDisruptions.length === 0;

  return (
    <header className="h-16 bg-[#0f172a] border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-30 select-none shadow-md">
      {/* Left: Operational Status & Sector Badge */}
      <div className="flex items-center gap-4">
        {/* Network Status Beacon */}
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
          isHealthy
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-red-950/40 border-red-500/40 text-red-300 shadow-sm shadow-red-500/10'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-red-500 animate-ping'}`} />
          <span className="tracking-wide uppercase text-[11px]">
            {isHealthy ? 'NETWORK STATUS: NOMINAL' : `CRISIS: ${activeDisruptions.length} ACTIVE INCIDENT(S)`}
          </span>
          <span className="font-mono text-xs opacity-70">|</span>
          <span className="font-mono text-xs">{coverage.toFixed(1)}% Cov</span>
        </div>

        {/* Operating Window */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">07:15 AM – 09:00 AM (Peak College Window)</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Ramanagara & Channapatna Sector</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-xs transition shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search students, vehicles, routes, or villages...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: AI System Status, Notifications & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* AI System Telemetry Chip */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium">MIP Solver:</span>
          <span className="text-emerald-400 font-mono font-bold">
            {optimization?.solve_time_ms ? `${optimization.solve_time_ms}ms` : '<15ms'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Gemini Grounded</span>
          </span>
        </div>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition border border-transparent ${
              activeDisruptions.length > 0 ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : ''
            }`}
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {activeDisruptions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[9px] font-black flex items-center justify-center animate-pulse">
                {activeDisruptions.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-[#111c38] border border-slate-700/80 rounded-xl shadow-2xl p-4 text-xs z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-slate-100">
                  <Bell className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time Operations Log</span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto dark-scrollbar">
                {activeDisruptions.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                    <p className="font-semibold text-slate-200">No Active Disruptions</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">All 13 fleet vehicles reporting nominal morning operations.</p>
                  </div>
                ) : (
                  activeDisruptions.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-red-300">
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                          {d.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{d.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{d.description}</p>
                      <div className="pt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-red-400 font-bold">{d.affected_student_count} students affected</span>
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            onNavigateToTab('rescue');
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                        >
                          <span>Inspect Rescue</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Crisis Button */}
        <button
          onClick={() => onNavigateToTab('simulator')}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-600/20"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Crisis Simulator</span>
        </button>
      </div>
    </header>
  );
};

