import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, X, Users, Bus, MapPin, ArrowRight, Zap, AlertTriangle } from 'lucide-react';
export const SearchModal = ({ isOpen, onClose, students, vehicles, locations, onSelectAction }) => {
    const [query, setQuery] = useState('');
    // Handle keyboard ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                onClose();
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const q = query.trim().toLowerCase();
    const matchedStudents = q
        ? students.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.origin_name.toLowerCase().includes(q)).slice(0, 4)
        : [];
    const matchedVehicles = q
        ? vehicles.filter(v => v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q) || v.driver_name.toLowerCase().includes(q)).slice(0, 4)
        : [];
    const matchedLocations = q
        ? locations.filter(l => l.name.toLowerCase().includes(q) || l.taluk.toLowerCase().includes(q)).slice(0, 4)
        : [];
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150", children: _jsxs("div", { className: "w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "p-4 border-b border-slate-800 flex items-center gap-3", children: [_jsx(Search, { className: "w-5 h-5 text-emerald-400 shrink-0" }), _jsx("input", { type: "text", autoFocus: true, placeholder: "Search students, vehicles, villages, or operations...", value: query, onChange: (e) => setQuery(e.target.value), className: "flex-1 bg-transparent border-none text-sm text-slate-100 placeholder-slate-500 focus:outline-none" }), query && (_jsx("button", { onClick: () => setQuery(''), className: "text-slate-400 hover:text-slate-200", children: _jsx(X, { className: "w-4 h-4" }) })), _jsx("kbd", { className: "px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700", children: "ESC" })] }), _jsxs("div", { className: "max-h-96 overflow-y-auto p-4 space-y-4 dark-scrollbar text-xs", children: [!q && (_jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-slate-500 tracking-wider", children: "Quick Command Center Shortcuts" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { onClick: () => {
                                                onSelectAction('tab', 'simulator');
                                                onClose();
                                            }, className: "p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left group", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-amber-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-slate-200 group-hover:text-white", children: "Crisis Simulator" }), _jsx("div", { className: "text-[10px] text-slate-400", children: "Trigger breakdowns & surges" })] })] }), _jsx(ArrowRight, { className: "w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" })] }), _jsxs("button", { onClick: () => {
                                                onSelectAction('tab', 'rescue');
                                                onClose();
                                            }, className: "p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left group", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-4 h-4 text-emerald-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-slate-200 group-hover:text-white", children: "AI Dynamic Rescue" }), _jsx("div", { className: "text-[10px] text-slate-400", children: "View OR-Tools formulation" })] })] }), _jsx(ArrowRight, { className: "w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" })] })] })] })), matchedStudents.length > 0 && (_jsxs("div", { className: "space-y-1.5", children: [_jsxs("span", { className: "text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5", children: [_jsx(Users, { className: "w-3 h-3 text-blue-400" }), _jsxs("span", { children: ["Students (", matchedStudents.length, ")"] })] }), matchedStudents.map((s) => (_jsxs("div", { onClick: () => {
                                        onSelectAction('tab', 'students');
                                        onClose();
                                    }, className: "p-2 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-800/80", children: [_jsxs("div", { children: [_jsx("span", { className: "font-bold text-slate-200", children: s.name }), _jsxs("span", { className: "text-[10px] text-slate-400 ml-2 font-mono", children: ["(", s.id, ")"] }), _jsxs("div", { className: "text-[11px] text-slate-400", children: [s.origin_name, " \u2192 ", s.destination_name, " (Deadline ", s.deadline, ")"] })] }), _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.status === 'stranded' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`, children: s.status })] }, s.id)))] })), matchedVehicles.length > 0 && (_jsxs("div", { className: "space-y-1.5", children: [_jsxs("span", { className: "text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5", children: [_jsx(Bus, { className: "w-3 h-3 text-emerald-400" }), _jsxs("span", { children: ["Vehicles (", matchedVehicles.length, ")"] })] }), matchedVehicles.map((v) => (_jsxs("div", { onClick: () => {
                                        onSelectAction('tab', 'fleet');
                                        onClose();
                                    }, className: "p-2 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-800/80", children: [_jsxs("div", { children: [_jsx("span", { className: "font-bold text-slate-200", children: v.name }), _jsxs("div", { className: "text-[11px] text-slate-400", children: ["Stationed at ", v.current_location_name, " | Capacity: ", v.capacity, " seats | Driver: ", v.driver_name] })] }), _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold uppercase ${v.status === 'breakdown' ? 'bg-red-950 text-red-400' : 'bg-blue-950 text-blue-400'}`, children: v.status })] }, v.id)))] })), matchedLocations.length > 0 && (_jsxs("div", { className: "space-y-1.5", children: [_jsxs("span", { className: "text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5", children: [_jsx(MapPin, { className: "w-3 h-3 text-amber-400" }), _jsxs("span", { children: ["Villages & Colleges (", matchedLocations.length, ")"] })] }), matchedLocations.map((l) => (_jsxs("div", { onClick: () => {
                                        onSelectAction('tab', 'map');
                                        onClose();
                                    }, className: "p-2 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-800/80", children: [_jsxs("div", { children: [_jsx("span", { className: "font-bold text-slate-200", children: l.name }), _jsxs("div", { className: "text-[11px] text-slate-400", children: ["Taluk: ", l.taluk, " | Type: ", l.type, " | Student Demand: ", l.student_demand] })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-slate-500" })] }, l.id)))] })), q && matchedStudents.length === 0 && matchedVehicles.length === 0 && matchedLocations.length === 0 && (_jsxs("div", { className: "py-8 text-center text-slate-500", children: ["No matching records found for \"", query, "\". Try searching \"Doddamallur\", \"BUS-101\", or \"Kailancha\"."] }))] })] }) }));
};
