import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Bus, Filter, ArrowLeftRight, ChevronRight, Clock, Sparkles, MapPin, CheckCircle2, Compass } from 'lucide-react';
import { planTripOptions } from '../api';
export const SearchResultsView = ({ initialQuery = 'Byramangala to Bidadi', initialOrigin = 'V2', initialDest = 'C3', locations, vehicles, onTrackBus, onNavigateHome }) => {
    // Origin and destination states (Requirement 3)
    const [selectedOrigin, setSelectedOrigin] = useState(initialOrigin);
    const [selectedDest, setSelectedDest] = useState(initialDest);
    const [selectedType, setSelectedType] = useState('all');
    const [sortBy, setSortBy] = useState('soonest');
    const [isLoading, setIsLoading] = useState(false);
    const [tripPlan, setTripPlan] = useState(null);
    // Group locations for clean dropdowns
    const villageLocations = locations.filter(l => l.type === 'village' || l.type === 'junction');
    const collegeLocations = locations.filter(l => l.type === 'college');
    // If none match specific filter, fallback to all
    const availableOrigins = villageLocations.length > 0 ? villageLocations : locations;
    const availableDests = collegeLocations.length > 0 ? collegeLocations : locations;
    const fetchResults = async (origId, destId) => {
        setIsLoading(true);
        try {
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
        fetchResults(selectedOrigin, selectedDest);
    }, [selectedOrigin, selectedDest]);
    const handleSwapLocations = () => {
        const temp = selectedOrigin;
        setSelectedOrigin(selectedDest);
        setSelectedDest(temp);
    };
    const options = tripPlan?.options || [];
    // Filter options by vehicle type
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
    // Sort options
    const sortedOptions = [...filteredOptions].sort((a, b) => {
        if (sortBy === 'duration') {
            return (a.duration_mins || 0) - (b.duration_mins || 0);
        }
        if (sortBy === 'seats') {
            return (b.available_seats || 0) - (a.available_seats || 0);
        }
        return 0; // soonest departure order by default
    });
    const originName = tripPlan?.origin?.name || locations.find(l => l.id === selectedOrigin)?.name || 'Byramangala';
    const destName = tripPlan?.destination?.name || locations.find(l => l.id === selectedDest)?.name || 'Bidadi Engineering College';
    const routeDistance = tripPlan?.distance_km || 14.2;
    const transitDuration = tripPlan?.travel_time_mins || 28;
    const viaText = tripPlan?.via_summary || 'Direct Route';
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs text-slate-400", children: [_jsx("button", { onClick: onNavigateHome, className: "hover:text-blue-600 transition font-medium", children: "Home" }), _jsx(ChevronRight, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "text-slate-700 font-semibold", children: "Route Planner & Travel Options" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-11 gap-3 items-center pt-1", children: [_jsxs("div", { className: "md:col-span-5 space-y-1", children: [_jsxs("label", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-blue-600" }), _jsx("span", { children: "Current Location / Boarding Stop" })] }), _jsx("select", { value: selectedOrigin, onChange: (e) => setSelectedOrigin(e.target.value), className: "w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs cursor-pointer", children: availableOrigins.map((loc) => (_jsxs("option", { value: loc.id, children: [loc.name, " (", loc.taluk, " Taluk)"] }, loc.id))) })] }), _jsx("div", { className: "md:col-span-1 flex items-center justify-center pt-4 md:pt-4", children: _jsx("button", { onClick: handleSwapLocations, className: "p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition shadow-2xs", title: "Swap Origin and Destination", children: _jsx(ArrowLeftRight, { className: "w-4 h-4" }) }) }), _jsxs("div", { className: "md:col-span-5 space-y-1", children: [_jsxs("label", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1", children: [_jsx(Compass, { className: "w-3.5 h-3.5 text-emerald-600" }), _jsx("span", { children: "Destination College / Higher Education Hub" })] }), _jsx("select", { value: selectedDest, onChange: (e) => setSelectedDest(e.target.value), className: "w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs cursor-pointer", children: availableDests.map((loc) => (_jsxs("option", { value: loc.id, children: [loc.name, " (", loc.taluk, " Taluk)"] }, loc.id))) })] })] }), _jsxs("div", { className: "p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-blue-600" }), _jsxs("span", { className: "font-bold text-blue-900", children: [originName, " \u2192 ", destName] }), _jsxs("span", { className: "text-slate-400 font-medium", children: ["(", viaText, ")"] })] }), _jsxs("div", { className: "flex items-center gap-4 text-blue-800 font-semibold text-[11px]", children: [_jsxs("span", { children: ["Road Distance: ", _jsxs("strong", { className: "text-slate-900", children: [routeDistance, " km"] })] }), _jsxs("span", { children: ["Transit Time: ", _jsxs("strong", { className: "text-slate-900", children: [transitDuration, " mins"] })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h2", { className: "text-base font-extrabold text-slate-900", children: "Available Travel Options" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Evaluated across real-time fleet occupancy, road connectivity & deadlines." })] }) }), isLoading && (_jsx("div", { className: "p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 font-medium animate-pulse", children: "Calculating realistic shortest path & vehicle availability..." })), !isLoading && sortedOptions.length > 0 && (_jsxs("div", { className: "hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 rounded-xl bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: [_jsx("div", { className: "col-span-4", children: "Vehicle Details" }), _jsx("div", { className: "col-span-3", children: "Departure & Arrival" }), _jsx("div", { className: "col-span-2", children: "Seats & Fare" }), _jsx("div", { className: "col-span-3 text-right", children: "Action" })] })), !isLoading && (_jsx("div", { className: "space-y-3", children: sortedOptions.map((opt) => {
                                    const regNumber = opt.title.split(' ').slice(-1)[0];
                                    const isBest = opt.is_best || false;
                                    return (_jsxs("div", { className: `p-4 rounded-2xl bg-white border transition ${isBest
                                            ? 'border-blue-300 ring-2 ring-blue-500/10 shadow-sm'
                                            : 'border-slate-200/80 hover:border-blue-200 hover:shadow-sm'}`, children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-12 gap-3 items-center", children: [_jsxs("div", { className: "sm:col-span-4 flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isBest ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-blue-50 text-blue-600'}`, children: _jsx(Bus, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [_jsx("span", { className: "text-xs font-black text-slate-900", children: regNumber }), _jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-600", children: opt.category || 'Ordinary' })] }), _jsx("p", { className: "text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]", children: opt.title })] })] }), _jsxs("div", { className: "sm:col-span-3", children: [_jsxs("div", { className: "text-xs font-bold text-slate-800 flex items-center gap-1", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-blue-600" }), _jsxs("span", { children: [opt.departure_time, " \u2192 ", opt.arrival_time] })] }), _jsxs("div", { className: "text-[11px] text-slate-400 mt-0.5", children: [opt.duration_mins, " mins travel (", opt.distance_km, ")"] })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsxs("div", { className: "text-xs font-extrabold text-emerald-600", children: [opt.available_seats, " seats free"] }), _jsx("div", { className: "text-[11px] text-slate-500 mt-0.5", children: opt.fare })] }), _jsx("div", { className: "sm:col-span-3 flex items-center justify-end gap-3", children: _jsxs("button", { onClick: () => onTrackBus(opt.vehicle_id || 'BUS-101'), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5", children: [_jsx("span", { children: "Track Bus" }), _jsx(ChevronRight, { className: "w-3.5 h-3.5" })] }) })] }), isBest && (_jsxs("div", { className: "mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50/60 px-3 py-1.5 rounded-lg", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5 text-blue-600 shrink-0" }), _jsx("span", { children: opt.recommendation_reason })] }))] }, opt.id));
                                }) }))] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4 text-blue-600" }), _jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Filter Travel Options" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5", children: "Sort by" }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer", children: [_jsx("option", { value: "soonest", children: "Next Arrival (Soonest)" }), _jsx("option", { value: "duration", children: "Shortest Travel Time" }), _jsx("option", { value: "seats", children: "Most Seats Available" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2", children: "Vehicle Type" }), _jsxs("div", { className: "space-y-2 text-xs font-medium text-slate-700", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "busType", checked: selectedType === 'all', onChange: () => setSelectedType('all'), className: "text-blue-600 focus:ring-blue-500 rounded" }), _jsx("span", { children: "All Available Vehicles" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "busType", checked: selectedType === 'govt_bus', onChange: () => setSelectedType('govt_bus'), className: "text-blue-600 focus:ring-blue-500 rounded" }), _jsx("span", { children: "KSRTC Government Express" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "busType", checked: selectedType === 'minibus', onChange: () => setSelectedType('minibus'), className: "text-blue-600 focus:ring-blue-500 rounded" }), _jsx("span", { children: "Cauvery Rural MiniBus" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: "busType", checked: selectedType === 'shared_auto', onChange: () => setSelectedType('shared_auto'), className: "text-blue-600 focus:ring-blue-500 rounded" }), _jsx("span", { children: "Gramina Mitra Shared Auto" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2", children: [_jsxs("h4", { className: "text-xs font-bold text-slate-900 flex items-center gap-1.5", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-600" }), _jsx("span", { children: "Free Student Bus Pass Info" })] }), _jsx("p", { className: "text-xs text-slate-500 leading-relaxed", children: "All government buses accept Karnataka State Student Concession Passes. Private minibuses and shared autos operate under district subsidized student fares." })] })] })] })] }));
};
