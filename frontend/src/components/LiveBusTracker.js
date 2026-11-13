import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bus, Search, MapPin, Clock, Phone, RotateCw } from 'lucide-react';
import { trackBusByNumber } from '../api';
export const LiveBusTracker = ({ initialBusId = 'BUS-101', allVehicles, allLocations }) => {
    const [searchQuery, setSearchQuery] = useState(initialBusId);
    const [busData, setBusData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerGroupRef = useRef(null);
    const loadBusData = async (query) => {
        if (!query.trim())
            return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await trackBusByNumber(query);
            setBusData(data);
        }
        catch (err) {
            console.error('Track error:', err);
            setError(`Bus "${query}" not found. Try searching KA-42-F-1024 or BUS-101.`);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadBusData(searchQuery);
    }, []);
    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current)
            return;
        const map = L.map(mapContainerRef.current, {
            center: [12.72, 77.28],
            zoom: 12,
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
    // Update map when busData changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markerGroup = markerGroupRef.current;
        if (!map || !markerGroup || !busData)
            return;
        markerGroup.clearLayers();
        // 1. Draw route line through all stops
        if (busData.stops && busData.stops.length > 1) {
            const stopCoords = busData.stops.map((s) => [s.lat, s.lng]);
            const routeLine = L.polyline(stopCoords, {
                color: '#10b981',
                weight: 5,
                opacity: 0.85
            });
            markerGroup.addLayer(routeLine);
            // 2. Draw Stop markers
            busData.stops.forEach((s, idx) => {
                const isDest = idx === busData.stops.length - 1;
                const iconHtml = `
          <div class="flex items-center justify-center w-7 h-7 rounded-full ${isDest ? 'bg-indigo-600' : 'bg-slate-700'} text-white font-bold text-xs shadow-md border-2 border-white">
            ${isDest ? '🎓' : idx + 1}
          </div>
        `;
                const stopIcon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-map-icon',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                });
                const stopMarker = L.marker([s.lat, s.lng], { icon: stopIcon });
                stopMarker.bindPopup(`
          <div class="p-2 text-slate-900 font-sans">
            <div class="font-bold text-xs text-slate-800">Stop ${idx + 1}: ${s.name}</div>
            <div class="text-xs text-slate-600 mt-1">Arrival Time: <b>${s.scheduled_time}</b></div>
            <div class="text-[10px] text-slate-500 capitalize">Status: ${s.status}</div>
          </div>
        `);
                markerGroup.addLayer(stopMarker);
            });
            // Fit map to route
            map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
        }
        // 3. Draw Live Moving Bus Marker
        const busHtml = `
      <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black shadow-xl border-3 border-white bus-pulse text-base cursor-pointer">
        🚌
      </div>
    `;
        const busIcon = L.divIcon({
            html: busHtml,
            className: 'custom-map-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        const busMarker = L.marker([busData.lat, busData.lng], { icon: busIcon });
        busMarker.bindPopup(`
      <div class="p-2 text-slate-900 font-sans">
        <div class="font-bold text-sm text-emerald-800">${busData.name}</div>
        <div class="text-xs text-slate-600 mt-1">Speed: <b>${busData.speed_kmh} km/h</b></div>
        <div class="text-xs text-slate-600">Available Seats: <b>${busData.available_seats} left</b></div>
        <div class="text-xs text-slate-600">Next: <b>${busData.next_stop}</b> (${busData.eta_next_stop})</div>
      </div>
    `);
        markerGroup.addLayer(busMarker);
    }, [busData]);
    const quickPillBuses = [
        { id: 'BUS-101', label: 'Bus KA-42-F-1024', route: 'Byramangala → Bidadi' },
        { id: 'BUS-102', label: 'Bus KA-42-F-2180', route: 'Sugganahalli → Ramanagara' },
        { id: 'BUS-103', label: 'Bus KA-42-F-3011', route: 'Doddamallur → Channapatna' },
        { id: 'BUS-104', label: 'Bus KA-42-F-4105', route: 'Kailancha → Ramanagara' },
        { id: 'MINI-201', label: 'Minibus KA-42-M-4412', route: 'Bidadi Feeder' },
    ];
    return (_jsxs("div", { className: "space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200", children: [_jsx("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: _jsxs("div", { className: "max-w-3xl", children: [_jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Live Student Bus Tracker" }), _jsx("p", { className: "text-sm text-slate-600 mt-1", children: "Track your college bus live on the map, see upcoming bus stops with exact arrival timestamps, and check seat availability before heading out." }), _jsxs("form", { onSubmit: (e) => {
                                e.preventDefault();
                                loadBusData(searchQuery);
                            }, className: "mt-4 flex flex-col sm:flex-row items-center gap-2", children: [_jsxs("div", { className: "relative flex-1 w-full", children: [_jsx(Search, { className: "w-5 h-5 text-slate-400 absolute left-3.5 top-3" }), _jsx("input", { type: "text", placeholder: "Enter Bus Number (e.g. KA-42-F-1024 or BUS-101)...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" })] }), _jsxs("button", { type: "submit", disabled: isLoading, className: "w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition disabled:opacity-50", children: [isLoading ? _jsx(RotateCw, { className: "w-4 h-4 animate-spin" }) : _jsx(Bus, { className: "w-4 h-4" }), _jsx("span", { children: "Track Bus" })] })] }), _jsxs("div", { className: "mt-3 flex items-center gap-2 overflow-x-auto pb-1", children: [_jsx("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0", children: "Popular:" }), quickPillBuses.map((p) => (_jsxs("button", { onClick: () => {
                                        setSearchQuery(p.id);
                                        loadBusData(p.id);
                                    }, className: `px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${searchQuery === p.id
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`, children: [_jsx("b", { children: p.label }), " (", p.route, ")"] }, p.id)))] })] }) }), error && (_jsx("div", { className: "p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium", children: error })), busData && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [_jsxs("div", { className: "lg:col-span-5 space-y-6", children: [_jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200 tracking-wide", children: busData.type.replace('_', ' ') }), _jsx("h2", { className: "text-xl font-black text-slate-900 mt-1.5 tracking-tight", children: busData.name }), _jsxs("div", { className: "text-xs text-slate-500 font-mono mt-0.5", children: ["Reg: ", _jsx("b", { children: busData.registration_number })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("span", { className: "px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }), _jsx("span", { children: "Live En Route" })] }), _jsxs("div", { className: "text-xs font-semibold text-slate-500 mt-1", children: ["Speed: ", _jsxs("b", { children: [busData.speed_kmh, " km/h"] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 pt-2 border-t border-slate-100", children: [_jsxs("div", { className: "p-3 rounded-xl bg-emerald-50/80 border border-emerald-200", children: [_jsx("div", { className: "text-[11px] font-bold text-emerald-800 uppercase tracking-wider", children: "Next Bus Stop" }), _jsx("div", { className: "text-sm font-black text-slate-900 mt-0.5 truncate", children: busData.next_stop }), _jsxs("div", { className: "text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsxs("span", { children: ["Arriving at ", busData.eta_next_stop] })] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-blue-50/80 border border-blue-200", children: [_jsx("div", { className: "text-[11px] font-bold text-blue-800 uppercase tracking-wider", children: "Seat Availability" }), _jsxs("div", { className: "text-sm font-black text-slate-900 mt-0.5", children: [busData.available_seats, " Seats Left"] }), _jsxs("div", { className: "text-xs text-blue-700 mt-0.5", children: ["Occupancy: ", busData.current_occupancy, "/", busData.capacity] })] })] }), _jsxs("div", { className: "pt-2 border-t border-slate-100 flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700", children: "\uD83D\uDC68\u200D\u2708\uFE0F" }), _jsxs("div", { children: [_jsx("div", { className: "font-bold text-slate-900", children: busData.driver_name }), _jsx("div", { className: "text-slate-500 text-[11px]", children: "Assigned KSRTC Driver" })] })] }), _jsxs("a", { href: `tel:${busData.driver_phone}`, className: "px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition", children: [_jsx(Phone, { className: "w-3.5 h-3.5 text-emerald-600" }), _jsx("span", { children: "Call Driver" })] })] })] }), _jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-emerald-600" }), _jsx("h3", { className: "font-bold text-sm text-slate-900", children: "Bus Stops & Arrival Timestamps" })] }), _jsxs("span", { className: "text-[11px] font-semibold text-slate-500", children: [busData.stops?.length || 0, " Scheduled Stops"] })] }), _jsx("div", { className: "relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200", children: busData.stops?.map((stop, idx) => {
                                            const isDeparted = stop.status === 'Departed';
                                            const isNext = stop.status === 'Next Stop';
                                            return (_jsxs("div", { className: "relative flex items-start justify-between text-xs", children: [_jsx("div", { className: `absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${isDeparted
                                                            ? 'bg-emerald-600 border-white text-white'
                                                            : isNext
                                                                ? 'bg-amber-500 border-white text-white animate-pulse'
                                                                : 'bg-white border-slate-300 text-slate-500'}`, children: isDeparted ? '✓' : idx + 1 }), _jsxs("div", { className: "pr-4", children: [_jsx("div", { className: `font-bold ${isNext ? 'text-slate-900 text-sm' : 'text-slate-800'}`, children: stop.name }), _jsxs("div", { className: "text-[11px] text-slate-500", children: ["Taluk: ", stop.taluk, " | Type: ", stop.type] }), isNext && (_jsx("span", { className: "mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800", children: "\u2022 Approaching Now" }))] }), _jsxs("div", { className: "text-right shrink-0", children: [_jsx("span", { className: "font-bold font-mono text-slate-900", children: stop.scheduled_time }), _jsx("div", { className: "text-[10px] text-slate-400 capitalize", children: stop.status })] })] }, idx));
                                        }) })] })] }), _jsxs("div", { className: "lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[580px]", children: [_jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-emerald-600" }), _jsx("h3", { className: "font-bold text-sm text-slate-900", children: "Live Bus Movement & Route Path" })] }), _jsxs("span", { className: "text-xs font-semibold text-slate-500 flex items-center gap-1", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-ping" }), "GPS Signal Live"] })] }), _jsx("div", { className: "flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner", children: _jsx("div", { ref: mapContainerRef, className: "w-full h-full" }) })] })] }))] }));
};
