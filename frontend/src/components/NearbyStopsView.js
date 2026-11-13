import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bus, Navigation, ChevronRight, Info, Sparkles, Compass } from 'lucide-react';
export const NearbyStopsView = ({ locations, vehicles, onSelectStop, onTrackBus }) => {
    const [currentLocName, setCurrentLocName] = useState('Ramanagara Rural Transit Hub');
    const [selectedStopId, setSelectedStopId] = useState(locations[0]?.id || 'V1');
    const [preferredStop, setPreferredStop] = useState('V2');
    const [showPreferredToast, setShowPreferredToast] = useState(false);
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    // Initialize Leaflet Map for Nearby Stops
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current)
            return;
        const map = L.map(mapContainerRef.current, {
            center: [12.72, 77.28],
            zoom: 12,
            zoomControl: false
        });
        L.control.zoom({ position: 'topright' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors | RouteFlow'
        }).addTo(map);
        // Add radar radius pulse circle for user location
        const userCenter = [12.7214, 77.2800];
        L.circle(userCenter, {
            radius: 2800,
            color: '#3b82f6',
            fillColor: '#93c5fd',
            fillOpacity: 0.2,
            weight: 1.5
        }).addTo(map);
        // User pin
        const userPinIcon = L.divIcon({
            className: 'custom-map-icon',
            html: `
        <div style="width: 20px; height: 20px; background: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(37,99,235,0.6);"></div>
      `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        L.marker(userCenter, { icon: userPinIcon }).addTo(map).bindPopup('<b>Your Current Location</b><br/>Ramanagara Rural Transit Hub');
        // Add stop markers
        locations.forEach((loc, i) => {
            const isMajor = loc.type === 'college' || i === 0 || i === 1;
            const marker = L.marker([loc.lat, loc.lng]).addTo(map);
            marker.bindPopup(`
        <div style="font-family: inherit; font-size: 11px;">
          <strong style="color: #0f172a;">${loc.name}</strong><br/>
          <span style="color: #64748b;">${loc.taluk} Taluk • ${loc.type}</span>
        </div>
      `);
        });
        mapInstanceRef.current = map;
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [locations]);
    const handleSetPreferred = (stopId) => {
        setPreferredStop(stopId);
        setShowPreferredToast(true);
        setTimeout(() => setShowPreferredToast(false), 2500);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight", children: "Nearby Stops" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Find bus stops near your current location across rural taluks." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100", children: [_jsxs("div", { className: "flex items-center gap-2.5 text-xs text-slate-700 font-semibold", children: [_jsx(Compass, { className: "w-4 h-4 text-blue-600 shrink-0" }), _jsxs("span", { children: ["Current Location: ", _jsx("strong", { className: "text-slate-900", children: currentLocName })] })] }), _jsxs("button", { onClick: () => setCurrentLocName('Ramanagara Bus Terminal & Junction'), className: "px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-blue-700 text-xs font-bold rounded-lg transition shadow-2xs flex items-center gap-1.5 self-start sm:self-auto", children: [_jsx(Navigation, { className: "w-3.5 h-3.5 text-blue-600" }), _jsx("span", { children: "Use my location" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [_jsxs("div", { className: "lg:col-span-7 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-bold text-slate-900", children: "Stops near you" }), _jsxs("span", { className: "px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]", children: [locations.length, " stops found"] })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-slate-400", children: [_jsx("span", { children: "Sort by:" }), _jsx("span", { className: "font-semibold text-slate-700", children: "Distance" })] })] }), _jsx("div", { className: "bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm", children: locations.map((loc, idx) => {
                                    const distanceKm = (0.3 + idx * 0.4).toFixed(1);
                                    const routesCount = 4 + (idx % 5);
                                    const isMajor = loc.type === 'college' || idx === 0 || idx === 1;
                                    const isSelected = selectedStopId === loc.id;
                                    const isPref = preferredStop === loc.id;
                                    return (_jsxs("div", { onClick: () => {
                                            setSelectedStopId(loc.id);
                                            onSelectStop(loc.id);
                                        }, className: `p-4 transition flex items-center justify-between cursor-pointer ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`, children: [_jsxs("div", { className: "flex items-center gap-3.5", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0", children: _jsx(Bus, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("h4", { className: "text-xs font-bold text-slate-900", children: loc.name }), isMajor && (_jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded font-black bg-blue-100 text-blue-800", children: "Major Stop" })), isPref && (_jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded font-black bg-emerald-100 text-emerald-800", children: "Default" }))] }), _jsxs("p", { className: "text-[11px] text-slate-400 mt-0.5", children: [loc.taluk, " Taluk \u2022 ", loc.type === 'village' ? 'Rural Shelter' : 'College Campus Hub'] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsxs("span", { className: "text-xs font-black text-slate-900 block", children: [distanceKm, " km"] }), _jsxs("span", { className: "text-[10px] font-semibold text-slate-400 block mt-0.5", children: [routesCount, " Routes"] })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-slate-400" })] })] }, loc.id));
                                }) }), _jsxs("div", { className: "p-4 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center gap-3 text-xs text-blue-800", children: [_jsx(Info, { className: "w-4 h-4 text-blue-600 shrink-0" }), _jsx("span", { children: "Distances are calculated from your current location. Tap on any stop to view available buses and timetables." })] })] }), _jsxs("div", { className: "lg:col-span-5 space-y-5", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm h-[380px] flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-slate-100 mb-2", children: [_jsx("span", { className: "text-xs font-bold text-slate-800", children: "Map View" }), _jsx("span", { className: "text-[10px] text-slate-400", children: "Radar range: 3.5 km" })] }), _jsx("div", { ref: mapContainerRef, className: "flex-1 w-full rounded-xl overflow-hidden" })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-blue-600" }), _jsx("h4", { className: "text-xs font-bold text-slate-900", children: "Did you know?" })] }), _jsx("p", { className: "text-xs text-slate-500", children: "You can set your preferred village stop as default for faster access every morning." }), _jsx("button", { onClick: () => handleSetPreferred(selectedStopId), className: "w-full py-2.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-bold transition shadow-2xs", children: showPreferredToast ? 'Saved as Default Stop!' : 'Set Current Stop as Default' })] })] })] })] }));
};
