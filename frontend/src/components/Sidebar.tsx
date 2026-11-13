import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Zap, 
  AlertTriangle, 
  Users, 
  Bus, 
  BarChart3, 
  Settings, 
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Radio,
  Cpu
} from 'lucide-react';
import type { Disruption } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  disruptions: Disruption[];
  onReset: () => void;
  scenarioName: string;
  coveragePercentage: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  highlight?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
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

  const navSections: NavSection[] = [
    {
      title: 'OPERATIONS CONTROL',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'map', label: 'Live Network', icon: Map },
        { 
          id: 'simulator', 
          label: 'Crisis Simulator', 
          icon: AlertTriangle, 
          highlight: true,
          badge: activeDisruptionsCount > 0 ? `${activeDisruptionsCount} Crisis` : 'Active'
        },
      ]
    },
    {
      title: 'FLEET & TRANSIT ASSETS',
      items: [
        { id: 'students', label: 'Students', icon: Users },
        { id: 'fleet', label: 'Fleet Management', icon: Bus },
      ]
    },
    {
      title: 'INTELLIGENCE & RESCUE',
      items: [
        { 
          id: 'rescue', 
          label: 'AI Optimization', 
          icon: Zap,
          badge: activeDisruptionsCount > 0 ? 'MIP Active' : undefined
        },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'assistant', label: 'AI Travel Assistant', icon: MessageSquare },
      ]
    },
    {
      title: 'CONFIGURATION',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-[#0b132b] text-slate-100 flex flex-col h-screen border-r border-slate-800/80 shrink-0 select-none shadow-2xl z-20">
      {/* Brand & Command Center Header */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Bus className="w-5 h-5 text-slate-950" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0b132b] animate-ping" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0b132b]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">GRAMMOVE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
              Mobility Command Center
            </p>
          </div>
        </div>

        {/* Live Network Health Status Pill */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${activeDisruptionsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="text-[11px] font-semibold text-slate-200">
              {activeDisruptionsCount > 0 ? 'Rescue Operations Active' : 'Normal Grid Transit'}
            </span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            coveragePercentage >= 95 
              ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80' 
              : 'text-amber-400 bg-amber-950/60 border-amber-800/80'
          }`}>
            {coveragePercentage.toFixed(1)}% Cov
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3.5 space-y-4 overflow-y-auto dark-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : item.highlight && activeDisruptionsCount > 0
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive 
                        ? 'text-slate-950' 
                        : item.highlight && activeDisruptionsCount > 0
                        ? 'text-amber-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold tracking-tight ${
                      isActive 
                        ? 'bg-slate-950 text-white' 
                        : item.highlight
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Diagnostic Panel */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 text-[11px]">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Operational Scenario:</span>
          <span className="text-emerald-400 font-bold truncate max-w-[125px]">{scenarioName}</span>
        </div>

        <button
          onClick={onReset}
          className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700/80 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Network Baseline</span>
        </button>

        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>OR-Tools MIP 9.15</span>
          </span>
          <span className="text-slate-400 font-mono">Karnataka SECTOR-4</span>
        </div>
      </div>
    </aside>
  );
};
