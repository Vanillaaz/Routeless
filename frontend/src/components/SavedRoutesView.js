import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Star, Bus, Clock, Trash2, Plus, Zap, Bell } from 'lucide-react';
export const SavedRoutesView = ({ onTrackBus, onNavigateSearch }) => {
    const [routes, setRoutes] = useState([
        {
            id: 'saved-1',
            origin: 'Byramangala',
            destination: 'Bidadi Engineering & Technical Academy',
            busNumber: 'Bus KA-42-F-1024',
            vehicleId: 'BUS-101',
            category: 'Ordinary Express',
            via: 'Via: Byramangala Junction, Harohalli Link',
            nextBusMins: 3,
            arrivalTime: '07:45 AM',
            color: 'blue'
        },
        {
            id: 'saved-2',
            origin: 'Kailancha',
            destination: 'Ramanagara Govt Polytechnic',
            busNumber: 'Bus KA-42-F-4105',
            vehicleId: 'BUS-104',
            category: 'Taluk Connector',
            via: 'Via: Vibhutikere Cross, SH-17 Alternate',
            nextBusMins: 6,
            arrivalTime: '07:50 AM',
            color: 'emerald'
        },
        {
            id: 'saved-3',
            origin: 'Doddamallur',
            destination: 'Channapatna Govt First Grade College & ITI',
            busNumber: 'Bus KA-42-F-3011',
            vehicleId: 'BUS-103',
            category: 'Silk Route Express',
            via: 'Via: Akkur Rural Stop, Old Highway Road',
            nextBusMins: 8,
            arrivalTime: '07:55 AM',
            color: 'purple'
        },
        {
            id: 'saved-4',
            origin: 'Akkur',
            destination: 'Channapatna Govt First Grade College',
            busNumber: 'Bus KA-42-M-5590',
            vehicleId: 'MINI-202',
            category: 'Gramina Seva MiniBus',
            via: 'Via: Akkur Village Center, High School Cross',
            nextBusMins: 15,
            arrivalTime: '08:05 AM',
            color: 'amber'
        }
    ]);
    const handleRemove = (id) => {
        setRoutes(routes.filter(r => r.id !== id));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight", children: "Saved Routes" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Quick access to your frequently used college commutes." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-slate-400 font-semibold", children: "Sort by" }), _jsxs("select", { className: "text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm", children: [_jsx("option", { children: "Recently Used" }), _jsx("option", { children: "Next Departure" }), _jsx("option", { children: "Shortest Distance" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-3.5", children: [routes.map((route) => (_jsxs("div", { className: "p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-200 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5", children: _jsx(Bus, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "flex items-center gap-2 flex-wrap", children: _jsxs("h3", { className: "text-sm font-black text-slate-900", children: [route.origin, " \u2192 ", route.destination] }) }), _jsxs("p", { className: "text-xs font-semibold text-slate-600 mt-0.5", children: [route.busNumber, " \u2022 ", _jsx("span", { className: "text-slate-400 font-normal", children: route.category })] }), _jsx("p", { className: "text-[11px] text-slate-400 mt-1", children: route.via })] })] }), _jsxs("div", { className: "flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100", children: [_jsxs("div", { className: "text-left sm:text-right", children: [_jsx("span", { className: "text-[11px] text-slate-400 block font-medium", children: "Next Bus" }), _jsxs("span", { className: "text-sm font-black text-emerald-600 block mt-0.5", children: [route.nextBusMins, " min"] }), _jsx("span", { className: "text-[10px] text-slate-400 block mt-0.5", children: route.arrivalTime })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => onTrackBus(route.vehicleId), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm", children: "Track" }), _jsx("button", { onClick: () => handleRemove(route.id), className: "p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition", title: "Remove Route", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] })] }, route.id))), _jsxs("button", { onClick: onNavigateSearch, className: "w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 text-xs font-bold flex items-center justify-center gap-2 transition bg-white/50 hover:bg-blue-50/20", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Search and save a new route for quick access" })] })] }), _jsx("div", { children: _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4", children: [_jsxs("h4", { className: "text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2", children: [_jsx(Star, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { children: "Why save routes?" })] }), _jsxs("div", { className: "space-y-4 text-xs", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5", children: _jsx(Zap, { className: "w-3.5 h-3.5" }) }), _jsxs("div", { children: [_jsx("h5", { className: "font-bold text-slate-800", children: "Quick Access to Frequent Routes" }), _jsx("p", { className: "text-slate-500 text-[11px] mt-0.5", children: "Open your daily morning village-to-college commute with a single tap." })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5", children: _jsx(Clock, { className: "w-3.5 h-3.5" }) }), _jsxs("div", { children: [_jsx("h5", { className: "font-bold text-slate-800", children: "Track Buses Faster" }), _jsx("p", { className: "text-slate-500 text-[11px] mt-0.5", children: "Launch live GPS satellite telemetry instantly without retyping registration numbers." })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5", children: _jsx(Bell, { className: "w-3.5 h-3.5" }) }), _jsxs("div", { children: [_jsx("h5", { className: "font-bold text-slate-800", children: "Get Timely Updates" }), _jsx("p", { className: "text-slate-500 text-[11px] mt-0.5", children: "Receive automated notifications on road closures, delays, and breakdown reassignments." })] })] })] })] }) })] })] }));
};
