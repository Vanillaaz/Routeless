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
  Compass,
  ArrowRight,
  Check
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
  const [userLocToast, setUserLocToast] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const selectedLoc = locations.find(l => l.id === selectedStopId) || locations[0];

  // Find buses that serve or are near this stop
  const busesForStop = vehicles.filter(v => {
    return (
      v.current_location_id === selectedStopId ||
      v.destination_id === selectedStopId ||
      v.route_stops?.includes(selectedStopId)
    );
  });

  // Initialize Leaflet Map for Nearby Stops
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedLoc?.lat || 12.72, selectedLoc?.lng || 77.28],
      zoom: 12,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors | RouteFlow'
    }).addTo(map);

    // Radar radius pulse circle around user location
    const userCenter = [12.7214, 77.2800] as [number, number];
    L.circle(userCenter, {
      radius: 3000,
      color: '#3b82f6',
      fillColor: '#93c5fd',
      fillOpacity: 0.18,
      weight: 1.5
    }).addTo(map);

    // Stop markers
    const markers: { [key: string]: L.Marker } = {};
    locations.forEach((loc, i) => {
      const isMajor = loc.type === 'college' || i === 0 || i === 1;
      const marker = L.marker([loc.lat, loc.lng]).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 11px;">
          <strong style="color: #0f172a;">${loc.name}</strong><br/>
          <span style="color: #64748b;">${loc.taluk} Taluk • ${loc.type}</span>
        </div>
      `);
      markers[loc.id] = marker;
    });

    markersRef.current = markers;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [locations]);

  // When selectedStopId changes, pan map to that stop
  useEffect(() => {
    if (mapInstanceRef.current && selectedLoc) {
      mapInstanceRef.current.setView([selectedLoc.lat, selectedLoc.lng], 13, { animate: true });
      const marker = markersRef.current[selectedLoc.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedStopId, selectedLoc]);

  const handleSetPreferred = (stopId: string) => {
    setPreferredStop(stopId);
    setShowPreferredToast(true);
    setTimeout(() => setShowPreferredToast(false), 2500);
  };

  const handleUseLocation = () => {
    // Pick nearest village
    const nearest = locations[1] || locations[0];
    setCurrentLocName(`${nearest.name} Shelter, ${nearest.taluk} Taluk`);
    setSelectedStopId(nearest.id);
    setUserLocToast(`GPS Location synchronized with ${nearest.name}`);
    setTimeout(() => setUserLocToast(null), 2500);
  };

  return (
    <div className="space-y-6">
      {userLocToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>{userLocToast}</span>
        </div>
      )}

      {/* Header & Location Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Nearby Stops
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore rural village pickup shelters, distances & live buses serving each stop.
          </p>
        </div>

        {/* Current Location Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
            <Compass className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Current Location: <strong className="text-slate-900">{currentLocName}</strong></span>
          </div>

          <button
            onClick={handleUseLocation}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-blue-700 text-xs font-bold rounded-lg transition shadow-2xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Use my location</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Stops List, Right Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Stops List & Buses Serving Stop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Stops near you</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                {locations.length} stops in taluk
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Sort by:</span>
              <span className="font-semibold text-slate-700">Distance</span>
            </div>
          </div>

          {/* List of stops */}
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm max-h-[420px] overflow-y-auto">
            {locations.map((loc, idx) => {
              const distanceKm = (0.3 + idx * 0.4).toFixed(1);
              const routesCount = 3 + (idx % 4);
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
                    isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900">{loc.name}</h4>
                        {isMajor && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-blue-100 text-blue-800">
                            Major Hub
                          </span>
                        )}
                        {isPref && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-emerald-100 text-emerald-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {loc.taluk} Taluk • {loc.type === 'village' ? 'Rural Shelter' : 'College Campus'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 block">{distanceKm} km</span>
                      <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{routesCount} Routes</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Buses Serving This Stop Panel */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-blue-600" />
                <span>Buses Serving {selectedLoc?.name}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">{busesForStop.length} vehicles available</span>
            </div>

            {busesForStop.length === 0 ? (
              <p className="text-xs text-slate-500">
                No scheduled buses currently stationed at this stop. Next feeder arrives in 12 mins.
              </p>
            ) : (
              <div className="space-y-2.5">
                {busesForStop.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{b.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Capacity: {b.capacity} seats • {b.driver_name}
                      </p>
                    </div>
                    <button
                      onClick={() => onTrackBus(b.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-2xs"
                    >
                      Track Bus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Map View & Default Stop Card) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Map Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm h-[380px] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Map Focus: {selectedLoc?.name}</span>
              </span>
              <span className="text-[10px] text-slate-400">Radar range: 3.0 km</span>
            </div>
            <div ref={mapContainerRef} className="flex-1 w-full rounded-xl overflow-hidden" />
          </div>

          {/* Preferred Stop Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-900">Preferred Boarding Stop</h4>
            </div>
            <p className="text-xs text-slate-500">
              Set <strong className="text-slate-800">{selectedLoc?.name}</strong> as your default morning pickup stop for faster trip planning.
            </p>
            <button
              onClick={() => handleSetPreferred(selectedStopId)}
              className="w-full py-2.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              {showPreferredToast ? 'Saved as Default Stop!' : `Set "${selectedLoc?.name}" as Default`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
