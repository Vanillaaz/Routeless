import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Bus,
  Search,
  Star,
  Clock,
  MapPin,
  Navigation,
  CheckCircle2,
  Bell,
  Share2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  HelpCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import { trackBusByNumber } from '../api';
import type { Vehicle, Location } from '../types';

interface LiveBusTrackerProps {
  initialBusId?: string;
  allVehicles: Vehicle[];
  allLocations: Location[];
  onBackToResults?: () => void;
}

export const LiveBusTracker: React.FC<LiveBusTrackerProps> = ({
  initialBusId = 'BUS-101',
  allVehicles,
  allLocations,
  onBackToResults
}) => {
  const [searchQuery, setSearchQuery] = useState(initialBusId);
  const [busData, setBusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // View mode: 'timeline' (Image 2 Top) or 'live_map' (Image 2 Bottom)
  const [viewMode, setViewMode] = useState<'timeline' | 'live_map'>('timeline');
  const [isSaved, setIsSaved] = useState(false);
  const [isReminderSet, setIsReminderSet] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  const loadBusData = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await trackBusByNumber(query);
      setBusData(data);
    } catch (err: any) {
      console.error('Track error:', err);
      setError(`Bus "${query}" not found. Try searching KA-42-F-1024 or BUS-101.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBusData(searchQuery);
  }, [initialBusId]);

  // Leaflet Map initialization (for live_map mode)
  useEffect(() => {
    if (viewMode !== 'live_map') return;
    if (!mapContainerRef.current) return;

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
    if (viewMode !== 'live_map') return;
    const map = mapInstanceRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup || !busData) return;

    markerGroup.clearLayers();

    // 1. Draw route line through all stops
    if (busData.stops && busData.stops.length > 1) {
      const stopCoords: [number, number][] = busData.stops.map((s: any) => [s.lat, s.lng]);

      const routeLine = L.polyline(stopCoords, {
        color: '#2563eb', // RouteFlow blue
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(markerGroup);

      // Stop pins
      busData.stops.forEach((stop: any, idx: number) => {
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

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Back Link */}
        <button
          onClick={onBackToResults ? onBackToResults : () => setViewMode(viewMode === 'live_map' ? 'timeline' : 'timeline')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{viewMode === 'live_map' ? 'Back to route details' : 'Back to results'}</span>
        </button>

        {/* Bus Search Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadBusData(searchQuery);
          }}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter bus number (e.g. BUS-101)"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
          >
            Track
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
          {error}
        </div>
      )}

      {/* VIEW MODE 1: ROUTE STOPS TIMELINE & TRIP SUMMARY (Image 2 Top) */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {/* Top Bus Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      Bus {regNo}
                    </h2>
                    <button
                      onClick={() => setIsSaved(!isSaved)}
                      className={`p-1.5 rounded-lg border transition ${
                        isSaved ? 'bg-amber-50 text-amber-500 border-amber-200' : 'text-slate-400 hover:text-slate-600 border-slate-200'
                      }`}
                      title="Save Route"
                    >
                      <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentStopName} → {busData?.destination_name || 'Bidadi Technical Academy'} • <span className="font-semibold text-slate-700">{busType}</span>
                  </p>
                </div>
              </div>

              {/* Status Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  Next Bus: <span className="text-emerald-700">3 min (07:45 AM)</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                  Departure: 07:15 AM
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>On Time</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Split: Left Route Stops, Right Trip Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Route Stops Timeline) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-900">Route Stops</h3>

              {/* Vertical Stops Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {stops.map((stop: any, idx: number) => {
                  const isFirst = idx === 0;
                  const isLast = idx === stops.length - 1;

                  return (
                    <div key={idx} className="relative flex items-center justify-between">
                      {/* Node Circle */}
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full border-4 flex items-center justify-center ${
                          isFirst
                            ? 'bg-blue-600 border-white ring-2 ring-blue-500'
                            : isLast
                            ? 'bg-emerald-600 border-white ring-2 ring-emerald-500'
                            : 'bg-white border-slate-300'
                        }`}
                      />

                      {/* Stop Info */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          {stop.name} {isFirst && '(Start)'} {isLast && '(End)'}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {stop.taluk || 'Ramanagara Rural Stand'}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs font-semibold text-slate-600">
                        {stop.scheduled_time}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Distance</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">34 km</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Total Stops</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">{stops.length || 8}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Est. Travel Time</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">45 min</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Bus Type</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">{busType}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex-1 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    isSaved ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                  <span>{isSaved ? 'Route Saved' : 'Save Route'}</span>
                </button>

                <button
                  onClick={() => setViewMode('live_map')}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm shadow-blue-500/20"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Track Live</span>
                </button>
              </div>
            </div>

            {/* Right Column (Trip Summary & Reminder) */}
            <div className="space-y-5">
              {/* Trip Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Trip Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0" />
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">From</span>
                      <span className="text-xs font-bold text-slate-800">{currentStopName}</span>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-200 ml-1.5 h-4" />

                  <div className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0" />
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">To</span>
                      <span className="text-xs font-bold text-slate-800">{busData?.destination_name || 'Bidadi Technical Academy'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Estimated Travel Time:</span>
                    <span className="font-bold text-slate-800">45 min (Approx.)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Distance:</span>
                    <span className="font-bold text-slate-800">34 km</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Total Stops:</span>
                    <span className="font-bold text-slate-800">{stops.length || 8}</span>
                  </div>
                </div>
              </div>

              {/* Set Reminder Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900">Set Reminder</h4>
                </div>
                <p className="text-[11px] text-slate-500">
                  Get notified 5 minutes before the bus arrives at your stop.
                </p>
                <button
                  onClick={() => setIsReminderSet(!isReminderSet)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    isReminderSet
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isReminderSet ? <Check className="w-4 h-4 text-emerald-600" /> : <Bell className="w-4 h-4 text-slate-500" />}
                  <span>{isReminderSet ? 'Reminder Set for 07:40 AM' : 'Set Reminder'}</span>
                </button>
              </div>

              {/* Help Center */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Need help? Visit Help Center</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE LIVE MAP TRACKING (Image 2 Bottom) */}
      {viewMode === 'live_map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Leaflet Map (Image 2 Bottom Map Area) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm h-[600px] flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live GPS Satellite Telemetry • Bus {regNo}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Speed: {busData?.speed_kmh || 42} km/h
              </span>
            </div>
            <div ref={mapContainerRef} className="flex-1 w-full rounded-xl overflow-hidden" />
          </div>

          {/* Right Column: Live Tracking Panel (Image 2 Bottom Right Panel) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
            {/* Bus Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Bus {regNo}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {currentStopName} → College • Ordinary
                  </p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Current Stop -> Next Stop Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Current Stop</span>
                <span className="text-slate-400 font-semibold">Next Stop</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="truncate max-w-[120px]">{currentStopName}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[120px] text-blue-600">{nextStopName}</span>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                (5.6 km away)
              </div>
            </div>

            {/* Estimated Arrival Countdown */}
            <div className="text-center py-2">
              <div className="text-xs text-slate-400 font-semibold">
                Estimated Arrival at Next Stop
              </div>
              <div className="text-3xl font-black text-emerald-600 mt-1 flex items-center justify-center gap-2">
                <span>5 min</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  On Time
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Expected at 07:50 AM
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Progress</span>
                <span>4 of 8 stops completed (50%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: '50%' }} />
              </div>
            </div>

            {/* Stops mini list */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{currentStopName}</span>
                </div>
                <span>07:35 AM</span>
              </div>
              <div className="flex items-center justify-between text-blue-700 font-bold bg-blue-50/60 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>{nextStopName}</span>
                </div>
                <span>07:50 AM</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>{busData?.destination_name || 'Bidadi Technical Academy'}</span>
                </div>
                <span>08:15 AM</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsReminderSet(!isReminderSet)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Bell className="w-4 h-4" />
                <span>{isReminderSet ? 'Notifications Active' : 'Notify Me'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isSaved ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Route'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  {sharedToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{sharedToast ? 'Link Copied' : 'Share Trip'}</span>
                </button>
              </div>
            </div>

            {/* Footer timestamp */}
            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Last updated: Just now</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
