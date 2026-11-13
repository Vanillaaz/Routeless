import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LayoutDashboard, Map, Zap, AlertTriangle, Users, Bus, BarChart3, Settings, MessageSquare, RotateCcw, Radio, Cpu } from 'lucide-react';
export const Sidebar = ({ activeTab, setActiveTab, disruptions, onReset, scenarioName, coveragePercentage }) => {
    const activeDisruptionsCount = disruptions.filter(d => d.active).length;
    const navSections = [
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
    return (_jsxs("aside", { className: "w-72 bg-[#0b132b] text-slate-100 flex flex-col h-screen border-r border-slate-800/80 shrink-0 select-none shadow-2xl z-20", children: [_jsxs("div", { className: "p-5 border-b border-slate-800/80 bg-slate-950/40", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20", children: _jsx(Bus, { className: "w-5 h-5 text-slate-950" }) }), _jsx("span", { className: "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0b132b] animate-ping" }), _jsx("span", { className: "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0b132b]" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "font-extrabold text-base tracking-tight text-white", children: "GRAMMOVE" }), _jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-wider", children: "AI" })] }), _jsx("p", { className: "text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5", children: "Mobility Command Center" })] })] }), _jsxs("div", { className: "mt-4 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-inner", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Radio, { className: `w-3.5 h-3.5 ${activeDisruptionsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}` }), _jsx("span", { className: "text-[11px] font-semibold text-slate-200", children: activeDisruptionsCount > 0 ? 'Rescue Operations Active' : 'Normal Grid Transit' })] }), _jsxs("span", { className: `text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${coveragePercentage >= 95
                                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80'
                                    : 'text-amber-400 bg-amber-950/60 border-amber-800/80'}`, children: [coveragePercentage.toFixed(1), "% Cov"] })] })] }), _jsx("nav", { className: "flex-1 p-3.5 space-y-4 overflow-y-auto dark-scrollbar", children: navSections.map((section, sIdx) => (_jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "px-3 py-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase", children: section.title }), section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (_jsxs("button", { onClick: () => setActiveTab(item.id), className: `w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                                    : item.highlight && activeDisruptionsCount > 0
                                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`, children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Icon, { className: `w-4 h-4 transition-colors ${isActive
                                                    ? 'text-slate-950'
                                                    : item.highlight && activeDisruptionsCount > 0
                                                        ? 'text-amber-400'
                                                        : 'text-slate-400 group-hover:text-slate-200'}` }), _jsx("span", { className: "tracking-tight", children: item.label })] }), item.badge && (_jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded font-extrabold tracking-tight ${isActive
                                            ? 'bg-slate-950 text-white'
                                            : item.highlight
                                                ? 'bg-amber-500 text-slate-950 font-black'
                                                : 'bg-slate-800 text-slate-300 border border-slate-700'}`, children: item.badge }))] }, item.id));
                        })] }, sIdx))) }), _jsxs("div", { className: "p-3.5 border-t border-slate-800/80 bg-slate-950/60 text-[11px]", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-400 mb-1.5", children: [_jsx("span", { className: "text-[10px] uppercase font-semibold text-slate-400", children: "Operational Scenario:" }), _jsx("span", { className: "text-emerald-400 font-bold truncate max-w-[125px]", children: scenarioName })] }), _jsxs("button", { onClick: onReset, className: "w-full mt-1.5 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700/80 shadow-sm", children: [_jsx(RotateCcw, { className: "w-3.5 h-3.5 text-slate-400" }), _jsx("span", { children: "Reset Network Baseline" })] }), _jsxs("div", { className: "mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Cpu, { className: "w-3 h-3 text-emerald-400" }), _jsx("span", { children: "OR-Tools MIP 9.15" })] }), _jsx("span", { className: "text-slate-400 font-mono", children: "Karnataka SECTOR-4" })] })] })] }));
};
