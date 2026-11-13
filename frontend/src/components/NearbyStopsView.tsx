import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Bus,
  Navigation,
  ChevronRight,
  Info,
  CheckCircle2,
  Sparkles,
  Compass
} from 'lucide-react';
import type { Location, Vehicle } from '../types';

interface NearbyStopsViewProps {
  locations: Location[];
  vehicles: Vehicle[];
  onSelectStop: (stopId: string) => void;
  onTrackBus: (busId: string) => void;
}

export const NearbyStopsView: React.FC<NearbyStopsViewProps> = ({
  locations,
  vehicles,
  onSelectStop,
  onTrackBus
}) => {
  const [currentLocName, setCurrentLocName] = useState('Ramanagara Rural Transit Hub');
  const [selectedStopId, setSelectedStopId] = useState<string>(locations[0]?.id || 'V1');
  const [preferredStop, setPreferredStop] = useState<string>('V2');
  const [showPreferredToast, setShowPreferredToast] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Initialize Leaflet Map for Nearby Stops
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

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
    const userCenter = [12.7214, 77.2800] as [number, number];
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

  const handleSetPreferred = (stopId: string) => {
    setPreferredStop(stopId);
    setShowPreferredToast(true);
    setTimeout(() => setShowPreferredToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Location Bar matching Image 3 Bottom */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Nearby Stops
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Find bus stops near your current location across rural taluks.
          </p>
        </div>

        {/* Current Location Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
            <Compass className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Current Location: <strong className="text-slate-900">{currentLocName}</strong></span>
          </div>

          <button
            onClick={() => setCurrentLocName('Ramanagara Bus Terminal & Junction')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-blue-700 text-xs font-bold rounded-lg transition shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Use my location</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Stops List, Right Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Stops List) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Stops near you</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                {locations.length} stops found
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Sort by:</span>
              <span className="font-semibold text-slate-700">Distance</span>
            </div>
          </div>

          {/* List of stops matching Image 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {locations.map((loc, idx) => {
              const distanceKm = (0.3 + idx * 0.4).toFixed(1);
              const routesCount = 4 + (idx % 5);
              const isMajor = loc.type === 'college' || idx === 0 || idx === 1;
              const isSelected = selectedStopId === loc.id;
              const isPref = preferredStop === loc.id;

              return (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSelectedStopId(loc.id);
                    onSelectStop(loc.id);
                  }}
                  className={`p-4 transition flex items-center justify-between cursor-pointer ${
                    isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900">{loc.name}</h4>
                        {isMajor && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-blue-100 text-blue-800">
                            Major Stop
                          </span>
                        )}
                        {isPref && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-emerald-100 text-emerald-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {loc.taluk} Taluk • {loc.type === 'village' ? 'Rural Shelter' : 'College Campus Hub'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 block">{distanceKm} km</span>
                      <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{routesCount} Routes</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Banner Tip */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center gap-3 text-xs text-blue-800">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Distances are calculated from your current location. Tap on any stop to view available buses and timetables.
            </span>
          </div>
        </div>

        {/* Right Column (Map View & Default Stop Card) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Map Card matching Image 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm h-[380px] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-800">Map View</span>
              <span className="text-[10px] text-slate-400">Radar range: 3.5 km</span>
            </div>
            <div ref={mapContainerRef} className="flex-1 w-full rounded-xl overflow-hidden" />
          </div>

          {/* Preferred Stop Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-900">Did you know?</h4>
            </div>
            <p className="text-xs text-slate-500">
              You can set your preferred village stop as default for faster access every morning.
            </p>
            <button
              onClick={() => handleSetPreferred(selectedStopId)}
              className="w-full py-2.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-bold transition shadow-2xs"
            >
              {showPreferredToast ? 'Saved as Default Stop!' : 'Set Current Stop as Default'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
