import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AlertTriangle, RotateCcw, Zap, ShieldAlert, Truck, Flame, Clock, Compass, TrendingUp } from 'lucide-react';
import { RoadStatus, VehicleStatus } from '../types';
export const CrisisSimulatorView = ({ vehicles, roads, disruptions, scenarioName, onTriggerScenario, onToggleVehicle, onToggleRoad, onReset, isLoading = false }) => {
    const [selectedVehicleId, setSelectedVehicleId] = useState('BUS-101');
    const [selectedRoadId, setSelectedRoadId] = useState('R6');
    const [surgePct, setSurgePct] = useState(40);
    const presetScenarios = [
        {
            id: 'breakdown',
            title: 'Morning Rush Bus Breakdown',
            icon: Flame,
            color: 'red',
            description: 'KSRTC Express KA-42-F-1024 suffers transmission failure at Byramangala with 48 students on board.',
            actionLabel: 'Trigger Bus Breakdown'
        },
        {
            id: 'road_closure',
            title: 'Monsoon Culvert Road Closure',
            icon: AlertTriangle,
            color: 'amber',
            description: 'SH-17 Kailancha Bridge Road is flooded, severing direct passage between Kailancha and Channapatna.',
            actionLabel: 'Trigger Road Block'
        },
        {
            id: 'surge',
            title: 'Exam Day +40% Demand Surge',
            icon: TrendingUp,
            color: 'purple',
            description: 'Rural taluk pre-university exam triggers sudden +40% crowd surge at village feeder stands.',
            actionLabel: 'Trigger +40% Surge'
        },
        {
            id: 'multi_breakdown',
            title: 'Dual Fleet Breakdown Crisis',
            icon: ShieldAlert,
            color: 'rose',
            description: 'Simultaneous failure of both BUS-101 (Byramangala) and BUS-103 (Doddamallur), stranding 90+ students.',
            actionLabel: 'Trigger Dual Crisis'
        },
        {
            id: 'delay',
            title: 'Highway Construction Gridlock',
            icon: Clock,
            color: 'blue',
            description: 'Major traffic jam on Old Bangalore-Mysuru Section adds +35 minutes, violating college reporting deadlines.',
            actionLabel: 'Trigger Heavy Delay'
        }
    ];
    return (_jsxs("div", { className: "space-y-6 pb-12", children: [_jsxs("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold", children: _jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" }) }), _jsx("h1", { className: "text-xl font-black text-slate-900 tracking-tight", children: "Transportation Crisis Simulator" }), _jsx("span", { className: "text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300", children: "Interactive Sandbox" })] }), _jsx("p", { className: "text-xs text-slate-500 mt-1 max-w-2xl", children: "Simulate real-world rural transportation disruptions. Every crisis scenario dynamically triggers the mathematical OR-Tools engine to compute new routes, fleet reallocations, and triage plans." })] }), _jsxs("button", { onClick: onReset, disabled: isLoading, className: "px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 transition shadow-sm", children: [_jsx(RotateCcw, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Reset Network Baseline" })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider mb-3", children: "1. Quick Scenario Presets" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: presetScenarios.map((sc) => {
                            const Icon = sc.icon;
                            return (_jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center", children: _jsx(Icon, { className: "w-4 h-4 text-slate-700" }) }), _jsx("span", { className: "text-sm font-bold text-slate-900", children: sc.title })] }), _jsx("p", { className: "text-xs text-slate-500 mt-2 leading-relaxed", children: sc.description })] }), _jsxs("button", { onClick: () => onTriggerScenario(sc.id, { surgePct }), disabled: isLoading, className: "mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50", children: [_jsx(Zap, { className: "w-3.5 h-3.5 text-amber-400" }), _jsx("span", { children: sc.actionLabel })] })] }, sc.id));
                        }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h2", { className: "text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2", children: [_jsx(Truck, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { children: "Fleet Health Sandbox (Click to Breakdown / Repair)" })] }), _jsxs("span", { className: "text-[11px] text-slate-400", children: [vehicles.length, " units"] })] }), _jsx("div", { className: "space-y-2 max-h-[300px] overflow-y-auto pr-1", children: vehicles.map((v) => {
                                    const isBroken = v.status === VehicleStatus.BREAKDOWN;
                                    return (_jsxs("div", { className: `p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${isBroken
                                            ? 'bg-red-50 border-red-200 text-red-950'
                                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80'}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "font-bold flex items-center gap-1.5", children: [_jsx("span", { children: v.name }), _jsxs("span", { className: "text-[10px] text-slate-500 capitalize", children: ["(", v.type.replace('_', ' '), ")"] })] }), _jsxs("div", { className: "text-[11px] text-slate-500 mt-0.5", children: ["Capacity: ", _jsxs("b", { children: [v.capacity, " seats"] }), " | Stationed: ", _jsx("b", { children: v.current_location_name })] })] }), _jsx("button", { onClick: () => onToggleVehicle(v.id), disabled: isLoading, className: `px-3 py-1 rounded text-[11px] font-bold transition ${isBroken
                                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                    : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'}`, children: isBroken ? 'Repair Vehicle' : 'Simulate Breakdown' })] }, v.id));
                                }) })] }), _jsxs("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h2", { className: "text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2", children: [_jsx(Compass, { className: "w-4 h-4 text-emerald-600" }), _jsx("span", { children: "Road Segment Sandbox (Click to Close / Open)" })] }), _jsxs("span", { className: "text-[11px] text-slate-400", children: [roads.length, " segments"] })] }), _jsx("div", { className: "space-y-2 max-h-[300px] overflow-y-auto pr-1", children: roads.map((r) => {
                                    const isClosed = r.status === RoadStatus.CLOSED;
                                    return (_jsxs("div", { className: `p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${isClosed
                                            ? 'bg-red-50 border-red-200 text-red-950'
                                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80'}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "font-bold flex items-center gap-1.5", children: [_jsx("span", { children: r.name }), _jsxs("span", { className: "text-[10px] text-slate-500", children: ["(", r.distance_km, " km)"] })] }), _jsxs("div", { className: "text-[11px] text-slate-500 mt-0.5", children: ["Connects: ", r.from_node, " \u2194 ", r.to_node, " (", r.travel_time_mins, " mins)"] })] }), _jsx("button", { onClick: () => onToggleRoad(r.id), disabled: isLoading, className: `px-3 py-1 rounded text-[11px] font-bold transition ${isClosed
                                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'}`, children: isClosed ? 'Open Road' : 'Block Passage' })] }, r.id));
                                }) })] })] }), _jsxs("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm", children: [_jsxs("h2", { className: "text-xs font-bold text-slate-700 uppercase tracking-wider mb-3", children: ["Live Disruption Registry (", disruptions.length, ")"] }), disruptions.length === 0 ? (_jsx("div", { className: "p-4 text-center text-slate-400 text-xs", children: "No active incidents. The rural transport corridor is operating normally." })) : (_jsx("div", { className: "space-y-2", children: disruptions.map((d) => (_jsxs("div", { className: "p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "font-bold text-amber-950 flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500 animate-ping" }), _jsx("span", { children: d.title }), _jsxs("span", { className: "text-[10px] text-slate-500 font-normal", children: ["(", d.timestamp, ")"] })] }), _jsx("div", { className: "text-slate-600 mt-0.5", children: d.description })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "font-bold text-red-600", children: d.affected_student_count }), _jsx("div", { className: "text-[10px] text-slate-400", children: "students affected" })] })] }, d.id))) }))] })] }));
};
