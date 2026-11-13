import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Bus, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { trackBusByNumber } from '../api';
import type { Vehicle, Location } from '../types';

interface BusTrackerProps {
  initialBusId?: string;
  allVehicles: Vehicle[];
  allLocations: Location[];
  onSelectRoute?: (origin: string, dest: string) => void;
}

export const LiveBusTracker: React.FC<BusTrackerProps> = ({
  initialBusId = 'BUS-101',
  allVehicles,
  allLocations
}) => {
  const [searchQuery, setSearchQuery] = useState(initialBusId);
  const [busData, setBusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

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
    if (!map || !markerGroup || !busData) return;

    markerGroup.clearLayers();

    // 1. Draw route line through all stops
    if (busData.stops && busData.stops.length > 1) {
      const stopCoords: [number, number][] = busData.stops.map((s: any) => [s.lat, s.lng]);
      
      const routeLine = L.polyline(stopCoords, {
        color: '#10b981',
        weight: 5,
        opacity: 0.85
      });
      markerGroup.addLayer(routeLine);

      // 2. Draw Stop markers
      busData.stops.forEach((s: any, idx: number) => {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Search Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Live Student Bus Tracker
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track your college bus live on the map, see upcoming bus stops with exact arrival timestamps, and check seat availability before heading out.
          </p>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadBusData(searchQuery);
            }}
            className="mt-4 flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter Bus Number (e.g. KA-42-F-1024 or BUS-101)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Bus className="w-4 h-4" />}
              <span>Track Bus</span>
            </button>
          </form>

          {/* Quick Selectable Pills */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Popular:</span>
            {quickPillBuses.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSearchQuery(p.id);
                  loadBusData(p.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                  searchQuery === p.id 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <b>{p.label}</b> ({p.route})
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Bus Tracking Telemetry View */}
      {busData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Bus Status Card + Route Stops Timetable (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Bus Info Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200 tracking-wide">
                    {busData.type.replace('_', ' ')}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-1.5 tracking-tight">
                    {busData.name}
                  </h2>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Reg: <b>{busData.registration_number}</b>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live En Route</span>
                  </span>
                  <div className="text-xs font-semibold text-slate-500 mt-1">
                    Speed: <b>{busData.speed_kmh} km/h</b>
                  </div>
                </div>
              </div>

              {/* Next Stop & Seat Availability Highlight */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Next Bus Stop
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-0.5 truncate">
                    {busData.next_stop}
                  </div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Arriving at {busData.eta_next_stop}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200">
                  <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                    Seat Availability
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    {busData.available_seats} Seats Left
                  </div>
                  <div className="text-xs text-blue-700 mt-0.5">
                    Occupancy: {busData.current_occupancy}/{busData.capacity}
                  </div>
                </div>
              </div>

              {/* Driver Contact */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                    👨‍✈️
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{busData.driver_name}</div>
                    <div className="text-slate-500 text-[11px]">Assigned KSRTC Driver</div>
                  </div>
                </div>

                <a
                  href={`tel:${busData.driver_phone}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Driver</span>
                </a>
              </div>
            </div>

            {/* Stops & Timetable Stepper */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">Bus Stops & Arrival Timestamps</h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {busData.stops?.length || 0} Scheduled Stops
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {busData.stops?.map((stop: any, idx: number) => {
                  const isDeparted = stop.status === 'Departed';
                  const isNext = stop.status === 'Next Stop';

                  return (
                    <div key={idx} className="relative flex items-start justify-between text-xs">
                      {/* Bullet icon */}
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        isDeparted
                          ? 'bg-emerald-600 border-white text-white'
                          : isNext
                          ? 'bg-amber-500 border-white text-white animate-pulse'
                          : 'bg-white border-slate-300 text-slate-500'
                      }`}>
                        {isDeparted ? '✓' : idx + 1}
                      </div>

                      <div className="pr-4">
                        <div className={`font-bold ${isNext ? 'text-slate-900 text-sm' : 'text-slate-800'}`}>
                          {stop.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Taluk: {stop.taluk} | Type: {stop.type}
                        </div>
                        {isNext && (
                          <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">
                            • Approaching Now
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold font-mono text-slate-900">{stop.scheduled_time}</span>
                        <div className="text-[10px] text-slate-400 capitalize">{stop.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Map (7 cols) */}
          <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[580px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Live Bus Movement & Route Path
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                GPS Signal Live
              </span>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
