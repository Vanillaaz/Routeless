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
  Check,
  Play,
  Pause,
  RotateCw,
  LocateFixed,
  FastForward,
  Compass,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { trackBusByNumber } from '../api';
import type { Vehicle, Location } from '../types';

interface LiveBusTrackerProps {
  initialBusId?: string;
  allVehicles: Vehicle[];
  allLocations: Location[];
  onBackToResults?: () => void;
  onNavigateSettings?: () => void;
}

// Calculate bearing angle between two geographic coordinates
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

// Convert degrees to cardinal direction
function degreesToCompass(deg: number): string {
  const val = Math.floor((deg / 45) + 0.5);
  const arr = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return arr[(val % 8)];
}

export const LiveBusTracker: React.FC<LiveBusTrackerProps> = ({
  initialBusId = 'BUS-101',
  allVehicles,
  allLocations,
  onBackToResults,
  onNavigateSettings
}) => {
  const [selectedBusId, setSelectedBusId] = useState<string>(initialBusId);
  const [busData, setBusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // View mode: 'timeline' (Image 2 Top) or 'live_map' (Image 2 Bottom)
  const [viewMode, setViewMode] = useState<'timeline' | 'live_map'>('timeline');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isReminderSet, setIsReminderSet] = useState<boolean>(false);
  const [sharedToast, setSharedToast] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [callModalOpen, setCallModalOpen] = useState<boolean>(false);

  // Live Animation Controls (Google Maps Style)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [followBus, setFollowBus] = useState<boolean>(true);
  const [currentCoordIndex, setCurrentCoordIndex] = useState<number>(0);
  const [currentHeading, setCurrentHeading] = useState<number>(45);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const movingMarkerRef = useRef<L.Marker | null>(null);
  const passedPolylineRef = useRef<L.Polyline | null>(null);
  const upcomingPolylineRef = useRef<L.Polyline | null>(null);
  const stopMarkersRef = useRef<L.LayerGroup | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastStepTimeRef = useRef<number>(Date.now());

  const loadBusData = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await trackBusByNumber(query);
      setBusData(data);
      setCurrentCoordIndex(0);
    } catch (err: any) {
      console.error('Track error:', err);
      setError(`Bus "${query}" not found. Try selecting from the dropdown.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBusData(selectedBusId);
  }, [selectedBusId]);

  // Leaflet Map initialization (for live_map mode)
  useEffect(() => {
    if (viewMode !== 'live_map') return;
    if (!mapContainerRef.current) return;

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
      attribution: '© OpenStreetMap contributors | RouteFlow Live'
    }).addTo(map);

    const stopGroup = L.layerGroup().addTo(map);
    stopMarkersRef.current = stopGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [viewMode]);

  // Draw Stops and Polylines when busData updates
  useEffect(() => {
    if (viewMode !== 'live_map') return;
    const map = mapInstanceRef.current;
    const stopGroup = stopMarkersRef.current;
    if (!map || !stopGroup || !busData) return;

    stopGroup.clearLayers();

    const coords: [number, number][] = busData.route_coordinates && busData.route_coordinates.length > 0
      ? busData.route_coordinates
      : busData.stops?.map((s: any) => [s.lat, s.lng]) || [];

    if (coords.length > 1) {
      // 1. Passed path (initially empty)
      if (passedPolylineRef.current) {
        passedPolylineRef.current.remove();
      }
      passedPolylineRef.current = L.polyline([], {
        color: '#94a3b8',
        weight: 6,
        opacity: 0.65,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // 2. Upcoming path (Google Maps Route Blue)
      if (upcomingPolylineRef.current) {
        upcomingPolylineRef.current.remove();
      }
      upcomingPolylineRef.current = L.polyline(coords, {
        color: '#1a73e8', // Google Maps navigation blue
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // 3. Stop pins with labeled pulses
      busData.stops?.forEach((stop: any, idx: number) => {
        const isFirst = idx === 0;
        const isLast = idx === busData.stops.length - 1;

        const stopIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div style="
              width: ${isFirst || isLast ? '18px' : '14px'}; 
              height: ${isFirst || isLast ? '18px' : '14px'}; 
              background: #ffffff; 
              border: 3px solid ${isFirst ? '#2563eb' : isLast ? '#059669' : '#475569'}; 
              border-radius: 50%; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });

        const m = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(stopGroup);
        m.bindPopup(`
          <div style="font-family: inherit; font-size: 11px;">
            <strong style="color: #0f172a;">${stop.name}</strong><br/>
            <span style="color: #64748b;">Scheduled: ${stop.scheduled_time}</span><br/>
            <span style="color: #2563eb;">Distance: ${stop.distance_from_start_km || 0} km from origin</span>
          </div>
        `);
      });

      // 4. Moving bus marker (Google Maps Nav puck with direction heading)
      const startPos = coords[0];
      const initialBearing = coords.length > 1 ? calculateBearing(coords[0][0], coords[0][1], coords[1][0], coords[1][1]) : 45;
      setCurrentHeading(initialBearing);

      const navPuckIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div id="bus-nav-puck" style="
            position: relative;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(${initialBearing}deg);
            transition: transform 0.2s linear;
          ">
            <!-- Pulsing outer ring -->
            <div style="
              position: absolute;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: rgba(37, 99, 235, 0.25);
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <!-- Central Navigation Icon -->
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #1d4ed8;
              border: 2.5px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <!-- Directional Pointer Arrow -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polygon points="12 2 19 21 12 17 5 21 12 2" fill="#ffffff" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      if (movingMarkerRef.current) {
        movingMarkerRef.current.remove();
      }
      movingMarkerRef.current = L.marker(startPos, { icon: navPuckIcon, zIndexOffset: 1000 }).addTo(map);

      map.fitBounds(L.polyline(coords).getBounds(), { padding: [60, 60] });
    }
  }, [viewMode, busData]);

  // Google Maps Smooth Continuous Movement Animation Loop
  useEffect(() => {
    if (viewMode !== 'live_map' || !isPlaying || !busData) return;

    const coords: [number, number][] = busData.route_coordinates && busData.route_coordinates.length > 0
      ? busData.route_coordinates
      : busData.stops?.map((s: any) => [s.lat, s.lng]) || [];

    if (coords.length < 2) return;

    const stepIntervalMs = Math.max(80, 260 / animSpeed);

    const interval = setInterval(() => {
      setCurrentCoordIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % coords.length;
        const curPos = coords[prevIndex];
        const nextPos = coords[nextIndex];

        // Update bearing
        const bearing = calculateBearing(curPos[0], curPos[1], nextPos[0], nextPos[1]);
        setCurrentHeading(bearing);

        // Update marker position & rotation
        if (movingMarkerRef.current) {
          movingMarkerRef.current.setLatLng(curPos);
          const puckElem = document.getElementById('bus-nav-puck');
          if (puckElem) {
            puckElem.style.transform = `rotate(${bearing}deg)`;
          }
        }

        // Update passed and upcoming polylines
        if (passedPolylineRef.current && upcomingPolylineRef.current) {
          const passed = coords.slice(0, prevIndex + 1);
          const upcoming = coords.slice(prevIndex);
          passedPolylineRef.current.setLatLngs(passed);
          upcomingPolylineRef.current.setLatLngs(upcoming);
        }

        // Auto pan map if followBus is active
        if (followBus && mapInstanceRef.current) {
          mapInstanceRef.current.panTo(curPos, { animate: true, duration: 0.25 });
        }

        return nextIndex;
      });
    }, stepIntervalMs);

    return () => clearInterval(interval);
  }, [viewMode, isPlaying, animSpeed, followBus, busData]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 2500);
  };

  const handleSaveToggle = () => {
    const next = !isSaved;
    setIsSaved(next);
    setSavedToast(next ? `Bus ${regNo} added to your Saved Routes!` : 'Route removed from favorites');
    setTimeout(() => setSavedToast(null), 2500);
  };

  const handleReminderToggle = () => {
    const next = !isReminderSet;
    setIsReminderSet(next);
    setReminderToast(next ? `Reminder set! You'll receive alert 5 mins before arrival at ${currentStopName}.` : 'Reminder cancelled.');
    setTimeout(() => setReminderToast(null), 2500);
  };

  const stops = busData?.stops || [];
  const currentStopName = stops[0]?.name || busData?.current_location_name || 'Ramanagara Bus Stand';
  const nextStopName = busData?.next_stop || stops[1]?.name || 'Bidadi Technical Academy';
  const regNo = busData?.name?.split(' ').slice(-1)[0] || 'KA-42-F-1024';
  const busType = busData?.type === 'govt_bus' ? 'Ordinary Express' : busData?.type === 'minibus' ? 'Rural MiniBus' : 'Shared Auto';
  const totalDistance = busData?.total_distance_km || 34.0;
  const currentSpeed = busData?.speed_kmh || 42;

  // Fleet dropdown items (from allVehicles or backend all_vehicles)
  const fleetList = busData?.all_vehicles || allVehicles || [];

  return (
    <div className="space-y-6">
      {/* Toast Feedback Banners */}
      {savedToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{savedToast}</span>
        </div>
      )}

      {reminderToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <Bell className="w-4 h-4 text-blue-400" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* TOP CONTROLS & BUS SELECTOR DROPDOWN (User Requirement 2) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Back button */}
          <button
            onClick={() => {
              if (viewMode === 'live_map') {
                setViewMode('timeline');
              } else if (onBackToResults) {
                onBackToResults();
              }
            }}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{viewMode === 'live_map' ? 'Back to route timetable' : 'Back to route search'}</span>
          </button>

          {/* Bus Selector Dropdown & Search Combo */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
            <label className="text-xs font-bold text-slate-500 whitespace-nowrap self-center hidden lg:inline">
              Select Bus to Track:
            </label>

            {/* Dropdown Listing All Available Fleet Buses */}
            <div className="relative flex-1">
              <select
                value={selectedBusId}
                onChange={(e) => {
                  setSelectedBusId(e.target.value);
                }}
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs appearance-none cursor-pointer"
              >
                {fleetList.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    [{v.reg_no || v.id}] {v.name} ({v.type === 'govt_bus' ? 'KSRTC Express' : v.type === 'minibus' ? 'MiniBus' : 'Shared Auto'})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Mode Toggle Button */}
            <button
              onClick={() => setViewMode(viewMode === 'timeline' ? 'live_map' : 'timeline')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
                viewMode === 'live_map'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>{viewMode === 'live_map' ? 'Show Timetable' : 'Live Map Tracking'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
          {error}
        </div>
      )}

      {/* VIEW MODE 1: TIMELINE & ROUTE TIMETABLE (Image 2 Top) */}
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
                      onClick={handleSaveToggle}
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Route Stops & Timetable</h3>
                <span className="text-xs text-slate-400 font-medium">{stops.length} designated boarding points</span>
              </div>

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
                          {stop.name} {isFirst && '(Start Point)'} {isLast && '(End Destination)'}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {stop.taluk} Taluk • {stop.distance_from_start_km || (idx * 4.2).toFixed(1)} km from origin
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
                  <span className="text-slate-400 font-semibold block text-[11px]">Total Distance</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">{totalDistance} km</span>
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
                  onClick={handleSaveToggle}
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
                  <span>Track Live with GPS</span>
                </button>
              </div>
            </div>

            {/* Right Column (Trip Summary & Actions) */}
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
                    <span className="text-slate-400">Total Distance:</span>
                    <span className="font-bold text-slate-800">{totalDistance} km</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Occupancy:</span>
                    <span className="font-bold text-emerald-600">{busData?.available_seats || 12} seats free</span>
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
                  Get notified 5 minutes before the bus reaches your village stop.
                </p>
                <button
                  onClick={handleReminderToggle}
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

              {/* Driver Contact & Help */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Assigned Driver:</span>
                  <span className="font-semibold text-slate-700">{busData?.driver_name || 'Basavaraju M.'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Helpline:</span>
                  <a href="tel:18004255778" className="text-blue-600 font-bold hover:underline">1800-425-KSRTC</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: LIVE MAP WITH GOOGLE MAPS STYLE DIRECTIONS & MOVEMENT (Requirements 3 & 4) */}
      {viewMode === 'live_map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Leaflet Map Area with Floating Google Maps HUD */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm h-[640px] flex flex-col relative overflow-hidden">
            
            {/* FLOATING GOOGLE MAPS NAVIGATION BANNER */}
            <div className="absolute top-6 left-6 right-6 z-[400] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
                  <Navigation className="w-5 h-5 text-white" style={{ transform: `rotate(${currentHeading - 45}deg)` }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                      En Route
                    </span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-200">
                      Next Stop in 1.4 km
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white mt-0.5 truncate max-w-[280px]">
                    {nextStopName}
                  </h4>
                </div>
              </div>

              {/* Speedometer & Bearing HUD */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 text-right">
                <div>
                  <div className="text-xs font-black text-emerald-400">
                    {currentSpeed} km/h
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-slate-400 inline" />
                    <span>Heading {degreesToCompass(currentHeading)} ({Math.round(currentHeading)}°)</span>
                  </div>
                </div>

                {/* Follow Bus Toggle Button */}
                <button
                  onClick={() => setFollowBus(!followBus)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    followBus
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Auto-center map on moving bus"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{followBus ? 'Recenter ON' : 'Recenter OFF'}</span>
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div ref={mapContainerRef} className="flex-1 w-full rounded-xl overflow-hidden mt-16 sm:mt-12" />

            {/* FLOATING MAP ANIMATION PLAYBACK CONTROLS (BOTTOM HUD) */}
            <div className="absolute bottom-6 left-6 right-6 z-[400] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm flex items-center gap-1.5"
                  title={isPlaying ? 'Pause Movement' : 'Resume Movement'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setAnimSpeed(spd)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black transition ${
                        animSpeed === spd ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-500 hidden sm:block">
                Simulating continuous real-time road movement
              </div>

              <button
                onClick={() => {
                  setCurrentCoordIndex(0);
                  setIsPlaying(true);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1"
                title="Restart Route"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restart</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Tracking Card (Image 2 Bottom Right) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
            {/* Bus Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
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

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-8 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-xs text-slate-700">
                    <button
                      onClick={() => {
                        setCallModalOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 font-medium flex items-center gap-2"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Contact Driver</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('timeline');
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 font-medium flex items-center gap-2"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Full Timetable</span>
                    </button>
                  </div>
                )}
              </div>
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
                (1.4 km away)
              </div>
            </div>

            {/* Estimated Arrival Countdown */}
            <div className="text-center py-2">
              <div className="text-xs text-slate-400 font-semibold">
                Estimated Arrival at Next Stop
              </div>
              <div className="text-3xl font-black text-emerald-600 mt-1 flex items-center justify-center gap-2">
                <span>3 min</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  On Time
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                Expected at 07:48 AM
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Progress</span>
                <span>{Math.min(stops.length, Math.floor(stops.length * 0.5))} of {stops.length} stops completed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: '50%' }} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleReminderToggle}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Bell className="w-4 h-4" />
                <span>{isReminderSet ? 'Notifications Active' : 'Notify Me at Stop'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToggle}
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
              <span>Last satellite telemetry update: Just now</span>
            </div>
          </div>
        </div>
      )}

      {/* Driver Call Modal */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">Contact Assigned Driver</h3>
              <p className="text-xs text-slate-500 mt-1">
                Driver: <span className="font-bold text-slate-800">{busData?.driver_name || 'Basavaraju M.'}</span>
              </p>
              <p className="text-sm font-extrabold text-blue-600 mt-2">
                {busData?.driver_phone || '+91 94480 23114'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCallModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Close
              </button>
              <a
                href={`tel:${busData?.driver_phone || '18004255778'}`}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
