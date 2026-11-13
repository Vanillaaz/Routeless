import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bus, Search, Star, Clock, Navigation, Bell, Share2, ChevronRight, ArrowLeft, ArrowRight, MoreVertical, HelpCircle, Check } from 'lucide-react';
import { trackBusByNumber } from '../api';
export const LiveBusTracker = ({ initialBusId = 'BUS-101', allVehicles, allLocations, onBackToResults }) => {
    const [searchQuery, setSearchQuery] = useState(initialBusId);
    const [busData, setBusData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // View mode: 'timeline' (Image 2 Top) or 'live_map' (Image 2 Bottom)
    const [viewMode, setViewMode] = useState('timeline');
    const [isSaved, setIsSaved] = useState(false);
    const [isReminderSet, setIsReminderSet] = useState(false);
    const [sharedToast, setSharedToast] = useState(false);
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
    }, [initialBusId]);
    // Leaflet Map initialization (for live_map mode)
    useEffect(() => {
        if (viewMode !== 'live_map')
            return;
        if (!mapContainerRef.current)
            return;
        // Destroy existing instance if container changed
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
        const map = L.map(mapContainerRef.current, {
            center: [12.72, 77.28],
            zoom: 12,
            zoomControl: false
        });
        L.control.zoom({ position: 'topleft' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors | RouteFlow'
        }).addTo(map);
        const markerGroup = L.layerGroup().addTo(map);
        markerGroupRef.current = markerGroup;
        mapInstanceRef.current = map;
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [viewMode]);
    // Draw route and markers when busData updates in live_map mode
    useEffect(() => {
        if (viewMode !== 'live_map')
            return;
        const map = mapInstanceRef.current;
        const markerGroup = markerGroupRef.current;
        if (!map || !markerGroup || !busData)
            return;
        markerGroup.clearLayers();
        // 1. Draw route line through all stops
        if (busData.stops && busData.stops.length > 1) {
            const stopCoords = busData.stops.map((s) => [s.lat, s.lng]);
            const routeLine = L.polyline(stopCoords, {
                color: '#2563eb', // RouteFlow blue
                weight: 5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(markerGroup);
            // Stop pins
            busData.stops.forEach((stop, idx) => {
                const isCurrent = idx === 0;
                const isEnd = idx === busData.stops.length - 1;
                const stopIcon = L.divIcon({
                    className: 'custom-map-icon',
                    html: `
            <div style="
              width: 14px; 
              height: 14px; 
              background: #ffffff; 
              border: 3px solid ${isCurrent ? '#2563eb' : isEnd ? '#059669' : '#64748b'}; 
              border-radius: 50%; 
              box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            "></div>
          `,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                });
                const m = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(markerGroup);
                m.bindPopup(`
          <div style="font-family: inherit; font-size: 11px;">
            <strong style="color: #0f172a;">${stop.name}</strong><br/>
            <span style="color: #64748b;">Scheduled: ${stop.scheduled_time}</span>
          </div>
        `);
            });
            // 2. Moving live bus icon marker
            const busLat = busData.lat || stopCoords[0][0];
            const busLng = busData.lng || stopCoords[0][1];
            const busMarkerIcon = L.divIcon({
                className: 'custom-map-icon',
                html: `
          <div style="
            width: 38px; 
            height: 38px; 
            background: #2563eb; 
            border: 3px solid #ffffff; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 4px 12px rgba(37,99,235,0.4);
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"/>
              <path d="M15 6v6"/>
              <path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5c-.3-1-1.1-1.8-2.1-1.8H5.7c-1 0-1.8.8-2.1 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
              <circle cx="7" cy="18" r="2"/>
              <circle cx="17" cy="18" r="2"/>
            </svg>
          </div>
        `,
                iconSize: [38, 38],
                iconAnchor: [19, 19]
            });
            L.marker([busLat, busLng], { icon: busMarkerIcon })
                .addTo(markerGroup)
                .bindPopup(`
          <div style="font-family: inherit; font-size: 11px;">
            <strong style="color: #2563eb;">${busData.name}</strong><br/>
            Speed: ${busData.speed_kmh} km/h • ${busData.status}
          </div>
        `)
                .openPopup();
            map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
        }
    }, [viewMode, busData]);
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setSharedToast(true);
        setTimeout(() => setSharedToast(false), 2500);
    };
    const stops = busData?.stops || [];
    const currentStopName = stops[0]?.name || busData?.current_location_name || 'Ramanagara Bus Stand';
    const nextStopName = busData?.next_stop || stops[1]?.name || 'Bidadi Engineering College';
    const regNo = busData?.name?.split(' ').slice(-1)[0] || 'KA-42-F-1024';
    const busType = busData?.type === 'govt_bus' ? 'Ordinary Express' : busData?.type === 'minibus' ? 'Rural MiniBus' : 'Shared Auto';
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("button", { onClick: onBackToResults ? onBackToResults : () => setViewMode(viewMode === 'live_map' ? 'timeline' : 'timeline'), className: "flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), _jsx("span", { children: viewMode === 'live_map' ? 'Back to route details' : 'Back to results' })] }), _jsxs("form", { onSubmit: (e) => {
                            e.preventDefault();
                            loadBusData(searchQuery);
                        }, className: "flex items-center gap-2 w-full sm:w-auto", children: [_jsxs("div", { className: "relative flex-1 sm:w-64", children: [_jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Enter bus number (e.g. BUS-101)", className: "w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" })] }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0", children: "Track" })] })] }), error && (_jsx("div", { className: "p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800", children: error })), viewMode === 'timeline' && (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0", children: _jsx(Bus, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("h2", { className: "text-lg font-black text-slate-900", children: ["Bus ", regNo] }), _jsx("button", { onClick: () => setIsSaved(!isSaved), className: `p-1.5 rounded-lg border transition ${isSaved ? 'bg-amber-50 text-amber-500 border-amber-200' : 'text-slate-400 hover:text-slate-600 border-slate-200'}`, title: "Save Route", children: _jsx(Star, { className: `w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}` }) })] }), _jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: [currentStopName, " \u2192 ", busData?.destination_name || 'Bidadi Technical Academy', " \u2022 ", _jsx("span", { className: "font-semibold text-slate-700", children: busType })] })] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs("div", { className: "px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold", children: ["Next Bus: ", _jsx("span", { className: "text-emerald-700", children: "3 min (07:45 AM)" })] }), _jsx("div", { className: "px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold", children: "Departure: 07:15 AM" }), _jsxs("div", { className: "px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }), _jsx("span", { children: "On Time" })] })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Route Stops" }), _jsx("div", { className: "relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200", children: stops.map((stop, idx) => {
                                            const isFirst = idx === 0;
                                            const isLast = idx === stops.length - 1;
                                            return (_jsxs("div", { className: "relative flex items-center justify-between", children: [_jsx("div", { className: `absolute -left-6 w-5 h-5 rounded-full border-4 flex items-center justify-center ${isFirst
                                                            ? 'bg-blue-600 border-white ring-2 ring-blue-500'
                                                            : isLast
                                                                ? 'bg-emerald-600 border-white ring-2 ring-emerald-500'
                                                                : 'bg-white border-slate-300'}` }), _jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-bold text-slate-800", children: [stop.name, " ", isFirst && '(Start)', " ", isLast && '(End)'] }), _jsx("p", { className: "text-[11px] text-slate-400 mt-0.5", children: stop.taluk || 'Ramanagara Rural Stand' })] }), _jsx("div", { className: "text-xs font-semibold text-slate-600", children: stop.scheduled_time })] }, idx));
                                        }) }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-400 font-semibold block text-[11px]", children: "Distance" }), _jsx("span", { className: "font-extrabold text-slate-800 mt-0.5 block", children: "34 km" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400 font-semibold block text-[11px]", children: "Total Stops" }), _jsx("span", { className: "font-extrabold text-slate-800 mt-0.5 block", children: stops.length || 8 })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400 font-semibold block text-[11px]", children: "Est. Travel Time" }), _jsx("span", { className: "font-extrabold text-slate-800 mt-0.5 block", children: "45 min" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400 font-semibold block text-[11px]", children: "Bus Type" }), _jsx("span", { className: "font-extrabold text-slate-800 mt-0.5 block", children: busType })] })] }), _jsxs("div", { className: "flex items-center gap-3 pt-2", children: [_jsxs("button", { onClick: () => setIsSaved(!isSaved), className: `flex-1 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${isSaved ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`, children: [_jsx(Star, { className: `w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}` }), _jsx("span", { children: isSaved ? 'Route Saved' : 'Save Route' })] }), _jsxs("button", { onClick: () => setViewMode('live_map'), className: "flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm shadow-blue-500/20", children: [_jsx(Navigation, { className: "w-4 h-4" }), _jsx("span", { children: "Track Live" })] })] })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4", children: [_jsx("h3", { className: "text-xs font-bold text-slate-900 uppercase tracking-wider", children: "Trip Summary" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start gap-2.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-[11px] text-slate-400 font-medium block", children: "From" }), _jsx("span", { className: "text-xs font-bold text-slate-800", children: currentStopName })] })] }), _jsx("div", { className: "border-l-2 border-dashed border-slate-200 ml-1.5 h-4" }), _jsxs("div", { className: "flex items-start gap-2.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-[11px] text-slate-400 font-medium block", children: "To" }), _jsx("span", { className: "text-xs font-bold text-slate-800", children: busData?.destination_name || 'Bidadi Technical Academy' })] })] })] }), _jsxs("div", { className: "pt-3 border-t border-slate-100 space-y-2 text-xs", children: [_jsxs("div", { className: "flex justify-between text-slate-600", children: [_jsx("span", { className: "text-slate-400", children: "Estimated Travel Time:" }), _jsx("span", { className: "font-bold text-slate-800", children: "45 min (Approx.)" })] }), _jsxs("div", { className: "flex justify-between text-slate-600", children: [_jsx("span", { className: "text-slate-400", children: "Distance:" }), _jsx("span", { className: "font-bold text-slate-800", children: "34 km" })] }), _jsxs("div", { className: "flex justify-between text-slate-600", children: [_jsx("span", { className: "text-slate-400", children: "Total Stops:" }), _jsx("span", { className: "font-bold text-slate-800", children: stops.length || 8 })] })] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Bell, { className: "w-4 h-4 text-blue-600" }), _jsx("h4", { className: "text-xs font-bold text-slate-900", children: "Set Reminder" })] }), _jsx("p", { className: "text-[11px] text-slate-500", children: "Get notified 5 minutes before the bus arrives at your stop." }), _jsxs("button", { onClick: () => setIsReminderSet(!isReminderSet), className: `w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${isReminderSet
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`, children: [isReminderSet ? _jsx(Check, { className: "w-4 h-4 text-emerald-600" }) : _jsx(Bell, { className: "w-4 h-4 text-slate-500" }), _jsx("span", { children: isReminderSet ? 'Reminder Set for 07:40 AM' : 'Set Reminder' })] })] }), _jsxs("div", { className: "p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(HelpCircle, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { children: "Need help? Visit Help Center" })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-slate-400" })] })] })] })] })), viewMode === 'live_map' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [_jsxs("div", { className: "lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm h-[600px] flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-2", children: [_jsxs("span", { className: "text-xs font-bold text-slate-800 flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-ping" }), "Live GPS Satellite Telemetry \u2022 Bus ", regNo] }), _jsxs("span", { className: "text-[11px] font-semibold text-slate-400", children: ["Speed: ", busData?.speed_kmh || 42, " km/h"] })] }), _jsx("div", { ref: mapContainerRef, className: "flex-1 w-full rounded-xl overflow-hidden" })] }), _jsxs("div", { className: "lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 pb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white", children: _jsx(Bus, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsxs("h3", { className: "text-sm font-black text-slate-900", children: ["Bus ", regNo] }), _jsxs("p", { className: "text-[11px] text-slate-400", children: [currentStopName, " \u2192 College \u2022 Ordinary"] })] })] }), _jsx("button", { className: "text-slate-400 hover:text-slate-600 p-1", children: _jsx(MoreVertical, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-slate-400 font-semibold", children: "Current Stop" }), _jsx("span", { className: "text-slate-400 font-semibold", children: "Next Stop" })] }), _jsxs("div", { className: "flex items-center justify-between text-xs font-bold text-slate-800", children: [_jsx("span", { className: "truncate max-w-[120px]", children: currentStopName }), _jsx(ArrowRight, { className: "w-3.5 h-3.5 text-slate-400 shrink-0" }), _jsx("span", { className: "truncate max-w-[120px] text-blue-600", children: nextStopName })] }), _jsx("div", { className: "text-right text-[11px] text-slate-400", children: "(5.6 km away)" })] }), _jsxs("div", { className: "text-center py-2", children: [_jsx("div", { className: "text-xs text-slate-400 font-semibold", children: "Estimated Arrival at Next Stop" }), _jsxs("div", { className: "text-3xl font-black text-emerald-600 mt-1 flex items-center justify-center gap-2", children: [_jsx("span", { children: "5 min" }), _jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold", children: "On Time" })] }), _jsx("div", { className: "text-xs text-slate-500 mt-1", children: "Expected at 07:50 AM" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex justify-between text-[11px] font-semibold text-slate-500", children: [_jsx("span", { children: "Progress" }), _jsx("span", { children: "4 of 8 stops completed (50%)" })] }), _jsx("div", { className: "w-full h-2 rounded-full bg-slate-100 overflow-hidden", children: _jsx("div", { className: "h-full bg-blue-600 rounded-full transition-all duration-500", style: { width: '50%' } }) })] }), _jsxs("div", { className: "space-y-2 pt-2 border-t border-slate-100 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-400", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }), _jsx("span", { children: currentStopName })] }), _jsx("span", { children: "07:35 AM" })] }), _jsxs("div", { className: "flex items-center justify-between text-blue-700 font-bold bg-blue-50/60 p-2 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-blue-600 animate-ping" }), _jsx("span", { children: nextStopName })] }), _jsx("span", { children: "07:50 AM" })] }), _jsxs("div", { className: "flex items-center justify-between text-slate-400", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-slate-300" }), _jsx("span", { children: busData?.destination_name || 'Bidadi Technical Academy' })] }), _jsx("span", { children: "08:15 AM" })] })] }), _jsxs("div", { className: "space-y-2 pt-2", children: [_jsxs("button", { onClick: () => setIsReminderSet(!isReminderSet), className: "w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm", children: [_jsx(Bell, { className: "w-4 h-4" }), _jsx("span", { children: isReminderSet ? 'Notifications Active' : 'Notify Me' })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => setIsSaved(!isSaved), className: `flex-1 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${isSaved ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`, children: [_jsx(Star, { className: `w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}` }), _jsx("span", { children: isSaved ? 'Saved' : 'Save Route' })] }), _jsxs("button", { onClick: handleShare, className: "flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5", children: [sharedToast ? _jsx(Check, { className: "w-3.5 h-3.5 text-emerald-600" }) : _jsx(Share2, { className: "w-3.5 h-3.5" }), _jsx("span", { children: sharedToast ? 'Link Copied' : 'Share Trip' })] })] })] }), _jsxs("div", { className: "pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsx("span", { children: "Last updated: Just now" })] })] })] }))] }));
};
