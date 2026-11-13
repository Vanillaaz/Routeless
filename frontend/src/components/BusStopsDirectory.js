import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Bus, Users } from 'lucide-react';
export const BusStopsDirectory = ({ locations, vehicles, onTrackBus }) => {
    const [selectedStopId, setSelectedStopId] = useState(locations[0]?.id || 'V1');
    const [filterType, setFilterType] = useState('all');
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerGroupRef = useRef(null);
    const selectedLoc = locations.find(l => l.id === selectedStopId) || locations[0];
    // Buses passing through or starting from this stop
    const passingBuses = vehicles.filter(v => v.current_location_id === selectedLoc.id ||
        (v.route_stops && v.route_stops.includes(selectedLoc.id)));
    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current)
            return;
        const map = L.map(mapContainerRef.current, {
            center: [12.715, 77.295],
            zoom: 11,
            zoomControl: false
        });
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors | GRAMMOVE AI'
        }).addTo(map);
        const markerGroup = L.layerGroup().addTo(map);
        markerGroupRef.current = markerGroup;
        mapInstanceRef.current = map;
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);
    // Update map markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markerGroup = markerGroupRef.current;
        if (!map || !markerGroup)
            return;
        markerGroup.clearLayers();
        locations.forEach(loc => {
            const isSelected = loc.id === selectedStopId;
            const isCollege = loc.type === 'college';
            const iconHtml = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full ${isSelected
                ? 'bg-emerald-600 ring-4 ring-emerald-200'
                : isCollege
                    ? 'bg-indigo-600'
                    : 'bg-slate-700'} text-white font-bold text-xs shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition">
          ${isCollege ? '🎓' : '🚏'}
        </div>
      `;
            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-map-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
            marker.on('click', () => setSelectedStopId(loc.id));
            marker.bindPopup(`
        <div class="p-2 text-slate-900 font-sans">
          <div class="font-bold text-sm">${loc.name}</div>
          <div class="text-xs text-slate-600">Taluk: <b>${loc.taluk}</b></div>
          <div class="text-xs text-slate-500 mt-1">${loc.description}</div>
        </div>
      `);
            markerGroup.addLayer(marker);
        });
        if (selectedLoc) {
            map.panTo([selectedLoc.lat, selectedLoc.lng], { animate: true });
        }
    }, [locations, selectedStopId]);
    const filteredLocations = locations.filter(l => {
        if (l.type === 'junction')
            return false;
        if (filterType === 'all')
            return true;
        return l.type === filterType;
    });
    return (_jsxs("div", { className: "space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200", children: [_jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Rural Bus Stops & Timetable Directory" }), _jsx("p", { className: "text-sm text-slate-600 mt-1", children: "Explore all designated village bus shelters and higher education campus stops with scheduled arrival timings." })] }), _jsxs("div", { className: "flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold", children: [_jsxs("button", { onClick: () => setFilterType('all'), className: `px-3 py-1.5 rounded-lg transition ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`, children: ["All Stops (", locations.filter(l => l.type !== 'junction').length, ")"] }), _jsx("button", { onClick: () => setFilterType('village'), className: `px-3 py-1.5 rounded-lg transition ${filterType === 'village' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`, children: "Village Shelters" }), _jsx("button", { onClick: () => setFilterType('college'), className: `px-3 py-1.5 rounded-lg transition ${filterType === 'college' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`, children: "College Campuses" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [_jsxs("div", { className: "lg:col-span-5 space-y-4", children: [_jsx("div", { className: "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-h-[560px] overflow-y-auto space-y-2", children: filteredLocations.map((loc) => {
                                    const isSelected = loc.id === selectedStopId;
                                    const isCollege = loc.type === 'college';
                                    return (_jsxs("div", { onClick: () => setSelectedStopId(loc.id), className: `p-3.5 rounded-xl border cursor-pointer transition ${isSelected
                                            ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                                            : 'bg-white border-slate-200 hover:border-slate-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-base", children: isCollege ? '🎓' : '🚏' }), _jsx("span", { className: `font-bold text-sm ${isSelected ? 'text-emerald-950 font-black' : 'text-slate-800'}`, children: loc.name })] }), _jsx("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize", children: loc.taluk })] }), _jsx("p", { className: "text-xs text-slate-500 mt-1 pl-6", children: loc.description }), loc.student_demand > 0 && (_jsxs("div", { className: "mt-2 pl-6 flex items-center gap-1.5 text-xs text-slate-600 font-semibold", children: [_jsx(Users, { className: "w-3.5 h-3.5 text-blue-600" }), _jsxs("span", { children: [loc.student_demand, " Students Boarding Daily"] })] }))] }, loc.id));
                                }) }), selectedLoc && (_jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-bold text-sm text-slate-900", children: ["Buses Serving: ", selectedLoc.name] }), _jsx("div", { className: "text-xs text-slate-500", children: "Morning Schedule (07:15 - 08:45 AM)" })] }), _jsxs("span", { className: "text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200", children: [passingBuses.length, " Service(s)"] })] }), _jsx("div", { className: "space-y-2 pt-1", children: passingBuses.length === 0 ? (_jsx("div", { className: "p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-lg", children: "Direct shuttles and connecting services operate on request via our Smart Trip Planner." })) : (passingBuses.map((bus) => (_jsxs("div", { className: "p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs", children: [_jsxs("div", { children: [_jsx("div", { className: "font-bold text-slate-900", children: bus.name }), _jsxs("div", { className: "text-[11px] text-slate-500 flex items-center gap-2 mt-0.5", children: [_jsxs("span", { children: ["Capacity: ", bus.capacity, " seats"] }), _jsx("span", { children: "\u2022" }), _jsx("span", { className: "text-emerald-700 font-semibold", children: "Departs 07:35 AM" })] })] }), _jsxs("button", { onClick: () => onTrackBus(bus.id), className: "px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1", children: [_jsx(Bus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Track" })] })] }, bus.id)))) })] }))] }), _jsxs("div", { className: "lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px]", children: [_jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-emerald-600" }), _jsx("h2", { className: "font-bold text-sm text-slate-900", children: "Taluk Stop Locations & Campus Map" })] }), _jsx("span", { className: "text-xs text-slate-500", children: "Click any stop pin to inspect timetable" })] }), _jsx("div", { className: "flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner", children: _jsx("div", { ref: mapContainerRef, className: "w-full h-full" }) })] })] })] }));
};
