import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Zap, 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  RotateCcw,
  ShieldCheck,
  Bus
} from 'lucide-react';
import { Disruption } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  disruptions: Disruption[];
  onReset: () => void;
  scenarioName: string;
  coveragePercentage: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  disruptions,
  onReset,
  scenarioName,
  coveragePercentage
}) => {
  const activeDisruptionsCount = disruptions.filter(d => d.active).length;

  const navItems = [
    { id: 'dashboard', label: 'Live Mobility Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Rural Network Map', icon: Map },
    { id: 'rescue', label: 'AI Dynamic Rescue Engine', icon: Zap, badge: activeDisruptionsCount > 0 ? `${activeDisruptionsCount} Alert` : undefined },
    { id: 'simulator', label: 'Crisis Simulator', icon: AlertTriangle },
    { id: 'manifest', label: 'Student & Fleet Manifest', icon: Users },
    { id: 'assistant', label: 'AI Travel Assistant', icon: MessageSquare },
  ];

  return (
    <aside className="w-72 bg-[#0f172a] text-slate-100 flex flex-col h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Bus className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">GRAMMOVE</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Refusing to leave a student stranded
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${activeDisruptionsCount > 0 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-xs text-slate-300 font-medium">
              {activeDisruptionsCount > 0 ? 'Disruption Active' : 'Normal Fleet Status'}
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
            {coveragePercentage.toFixed(0)}% Cov
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Operations & Control
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isActive ? 'bg-slate-950 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Scenario Indicator & Reset Control */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
          <span>Active Simulation:</span>
          <span className="text-emerald-400 font-semibold truncate max-w-[130px]">{scenarioName}</span>
        </div>
        
        <button
          onClick={onReset}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Network Baseline</span>
        </button>

        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            OR-Tools 9.15 Active
          </span>
          <span>Karnataka Taluk v1.0</span>
        </div>
      </div>
    </aside>
  );
};
