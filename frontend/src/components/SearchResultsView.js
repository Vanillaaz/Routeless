import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Bus, Search, Filter, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { planTripOptions } from '../api';
export const SearchResultsView = ({ initialQuery = 'Byramangala to Bidadi', locations, vehicles, onTrackBus, onNavigateHome }) => {
    const [query, setQuery] = useState(initialQuery);
    const [selectedType, setSelectedType] = useState('all');
    const [sortBy, setSortBy] = useState('soonest');
    const [isLoading, setIsLoading] = useState(false);
    const [tripPlan, setTripPlan] = useState(null);
    // Parse origin and destination from query or fallback
    const fetchResults = async () => {
        setIsLoading(true);
        try {
            // Find matching origin/dest or default to Byramangala (V2) and Bidadi Tech (C3)
            let origId = 'V2';
            let destId = 'C3';
            const lower = query.toLowerCase();
            for (const loc of locations) {
                if (lower.includes(loc.name.toLowerCase())) {
                    if (loc.type === 'village')
                        origId = loc.id;
                    else
                        destId = loc.id;
                }
            }
            const res = await planTripOptions(origId, destId);
            setTripPlan(res);
        }
        catch (err) {
            console.error('Plan trip error:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchResults();
    }, [query]);
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchResults();
    };
    // Build candidate options list combining planTripOptions and active vehicles
    const options = tripPlan?.options || [
        {
            id: 'OPT-1',
            title: 'KSRTC Rural Express KA-42-F-1024',
            vehicle_id: 'BUS-101',
            type: 'govt_bus',
            category: 'Ordinary Express',
            departure_time: '07:35 AM',
            arrival_time: '08:15 AM',
            duration_mins: 40,
            available_seats: 25,
            capacity: 50,
            crowd_status: 'Seats Available',
            distance_km: '0.6 km from your location',
            is_best: true,
            recommendation_reason: 'Recommended: Fastest direct route, zero transfers, arrives at 08:15 AM.'
        },
        {
            id: 'OPT-2',
            title: 'Cauvery Rural MiniBus KA-42-M-4412',
            vehicle_id: 'MINI-201',
            type: 'minibus',
            category: 'Feeder MiniBus',
            departure_time: '07:45 AM',
            arrival_time: '08:25 AM',
            duration_mins: 40,
            available_seats: 12,
            capacity: 24,
            crowd_status: 'Filling Fast',
            distance_km: '1.2 km from your location',
            is_best: false,
            recommendation_reason: 'Alternative Feeder option with guaranteed seating.'
        },
        {
            id: 'OPT-3',
            title: 'Gramina Rural Auto Rickshaw KA-42-A-9011',
            vehicle_id: 'AUTO-301',
            type: 'shared_auto',
            category: 'Shared Auto Feeder',
            departure_time: '07:50 AM',
            arrival_time: '08:20 AM',
            duration_mins: 30,
            available_seats: 2,
            capacity: 4,
            crowd_status: 'Last 2 Seats',
            distance_km: '1.8 km from your location',
            is_best: false,
            recommendation_reason: 'Last-mile shared feeder connector.'
        }
    ];
    // Filter options
    const filteredOptions = options.filter((opt) => {
        if (selectedType === 'all')
            return true;
        if (selectedType === 'govt_bus')
            return opt.type === 'govt_bus';
        if (selectedType === 'minibus')
            return opt.type === 'minibus';
        if (selectedType === 'shared_auto')
            return opt.type === 'shared_auto';
        return true;
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs text-slate-400", children: [_jsx("button", { onClick: onNavigateHome, className: "hover:text-blue-600 transition font-medium", children: "Home" }), _jsx(ChevronRight, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "text-slate-700 font-semibold", children: "Search Results" })] }), _jsxs("form", { onSubmit: handleSearchSubmit, className: "flex gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search bus number or route (e.g. Byramangala to Bidadi)", className: "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" })] }), _jsx("button", { type: "submit", className: "px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0", children: "Search" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h2", { className: "text-base font-extrabold text-slate-900", children: "Search Results" }), _jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: ["Showing results for ", _jsxs("span", { className: "text-blue-600 font-bold", children: ["\"", query, "\""] }), " (", filteredOptions.length, " results found)"] })] }) }), _jsxs("div", { className: "hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 rounded-xl bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: [_jsx("div", { className: "col-span-4", children: "Bus Details" }), _jsx("div", { className: "col-span-3", children: "Route" }), _jsx("div", { className: "col-span-2", children: "Next Arrival" }), _jsx("div", { className: "col-span-3 text-right", children: "Action" })] }), _jsx("div", { className: "space-y-3", children: filteredOptions.map((opt) => {
                                    const regNumber = opt.title.split(' ').slice(-1)[0];
                                    const isBest = opt.is_best || false;
                                    return (_jsxs("div", { className: `p-4 rounded-2xl bg-white border transition ${isBest
                                            ? 'border-blue-300 ring-2 ring-blue-500/10 shadow-sm'
                                            : 'border-slate-200/80 hover:border-blue-200 hover:shadow-sm'}`, children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-12 gap-3 items-center", children: [_jsxs("div", { className: "sm:col-span-4 flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isBest ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-blue-50 text-blue-600'}`, children: _jsx(Bus, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [_jsx("span", { className: "text-xs font-black text-slate-900", children: regNumber }), _jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-600", children: opt.category || 'Ordinary' })] }), _jsx("p", { className: "text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]", children: opt.title })] })] }), _jsxs("div", { className: "sm:col-span-3", children: [_jsxs("div", { className: "text-xs font-bold text-slate-800", children: [tripPlan?.origin_name || 'Byramangala', " \u2192 ", tripPlan?.destination_name || 'Bidadi Tech'] }), _jsx("div", { className: "text-[11px] text-slate-400 mt-0.5", children: "Via Cherthala Bypass" })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsxs("div", { className: "text-xs font-extrabold text-emerald-600 flex items-center gap-1", children: [_jsx(Clock, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "3 min" })] }), _jsx("div", { className: "text-[11px] text-slate-500 mt-0.5", children: opt.departure_time || '07:45 AM' })] }), _jsxs("div", { className: "sm:col-span-3 flex items-center justify-between sm:justify-end gap-3", children: [_jsx("span", { className: "text-[11px] text-slate-400 hidden lg:inline", children: opt.distance_km || '0.6 km' }), _jsxs("button", { onClick: () => onTrackBus(opt.vehicle_id || 'BUS-101'), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5", children: [_jsx("span", { children: "Track" }), _jsx(ChevronRight, { className: "w-3.5 h-3.5" })] })] })] }), isBest && (_jsxs("div", { className: "mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50/60 px-3 py-1.5 rounded-lg", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5 text-blue-600 shrink-0" }), _jsx("span", { children: opt.recommendation_reason })] }))] }, opt.id));
                                }) })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4 text-blue-600" }), _jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Filter Results" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5", children: "Sort by" }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "soonest", children: "Next Arrival (Soonest)" }), _jsx("option", { value: "duration", children: "Shortest Travel Time" }), _jsx("option", { value: "seats", children: "Most Seats Available" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2", children: "Bus Type" }), _jsxs("div", { className: "space-y-2 text-xs font-medium text-slate-700", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "busType", checked: selectedType === 'all', onChange: () => setSelectedType('all'), className: "text-blue-600 focus:ring-blue-500 rounded" }), _jsx("span", { children: "All Types" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "busType", checked: selectedType === 'govt_bus', onChange: () => setSelectedType('govt_bus'), className: "text-blue-600 focus:ring-blue-500 rounded" }), _jsx("span", { children: "KSRTC Government Express" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "busType", checked: selectedType === 'minibus', onChange: () => setSelectedType('minibus'), className: "text-blue-600 focus:ring-blue-500 rounded" }), _jsx("span", { children: "Feeder MiniBus" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "busType", checked: selectedType === 'shared_auto', onChange: () => setSelectedType('shared_auto'), className: "text-blue-600 focus:ring-blue-500 rounded" }), _jsx("span", { children: "Gramina Shared Auto" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm", children: [_jsxs("h4", { className: "text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { children: "Search Tips" })] }), _jsxs("ul", { className: "text-xs text-slate-500 space-y-2 list-disc list-inside", children: [_jsxs("li", { children: ["You can search by vehicle registration (e.g. ", _jsx("span", { className: "font-semibold text-slate-700", children: "KA-42-F-1024" }), ") or bus ID (", _jsx("span", { className: "font-semibold text-slate-700", children: "BUS-101" }), ")."] }), _jsxs("li", { children: ["Search village-to-college routes like ", _jsx("span", { className: "font-semibold text-slate-700", children: "Kailancha to Ramanagara" }), "."] }), _jsx("li", { children: "Check crowd density badges before boarding." })] })] })] })] })] }));
};
