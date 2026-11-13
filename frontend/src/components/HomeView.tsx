import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Bus,
  Star,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import type { Vehicle, Location } from '../types';

interface HomeViewProps {
  locations: Location[];
  vehicles: Vehicle[];
  onSearchRoute: (query: string) => void;
  onTrackBus: (busId: string) => void;
  onSelectStop: (stopId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  locations,
  vehicles,
  onSearchRoute,
  onTrackBus,
  onSelectStop,
  onNavigateTab
}) => {
  const [searchInput, setSearchInput] = useState('');

  const quickSuggestions = [
    { label: 'Byramangala → Bidadi Tech', query: 'Byramangala to Bidadi' },
    { label: 'Kailancha → Ramanagara College', query: 'Kailancha to Ramanagara' },
    { label: 'Doddamallur → Channapatna ITI', query: 'Doddamallur to Channapatna' },
    { label: 'Sugganahalli → Polytechnic', query: 'Sugganahalli to Ramanagara' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchRoute(searchInput.trim());
    }
  };

  // 3 Nearby stops (villages or colleges)
  const nearbyStops = locations.slice(0, 3).map((loc, idx) => ({
    id: loc.id,
    name: loc.name,
    distance: `${(0.4 + idx * 0.4).toFixed(1)} km away`,
    eta: `${2 + idx * 3} min ETA`
  }));

  // Suggested active buses
  const suggestedBuses = vehicles.filter(v => v.status !== 'breakdown').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card matching Image 4 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hello! Where would you like to go?
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore smart bus allocations, real-time tracking, and verified rural transit routes.
        </p>

        {/* Big Search Box */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter bus number or route (e.g., Byramangala to Bidadi)"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition shrink-0"
          >
            Search
          </button>
        </form>

        {/* Quick Suggestions Pills */}
        <div className="mt-4 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Quick Suggestions :</span>
          {quickSuggestions.map((item, i) => (
            <button
              key={i}
              onClick={() => onSearchRoute(item.query)}
              className="px-3 py-1.5 rounded-lg bg-blue-50/80 hover:bg-blue-100/90 text-blue-700 font-medium transition border border-blue-100"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left 2/3 Content, Right 1/3 Live Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Nearby Stops + Suggested Routes + Saved Routes) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Nearby Stops */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Nearby Stops</h3>
              </div>
              <button
                onClick={() => onNavigateTab('nearby')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {nearbyStops.map((stop) => (
                <div
                  key={stop.id}
                  onClick={() => onSelectStop(stop.id)}
                  className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{stop.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {stop.distance} • <span className="text-emerald-600 font-semibold">{stop.eta}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Suggested Routes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Suggested Routes</h3>
              </div>
              <button
                onClick={() => onNavigateTab('search')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">{bus.name.split(' ').slice(-1)[0]}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                          {bus.type === 'govt_bus' ? 'Ordinary' : bus.type === 'minibus' ? 'MiniBus' : 'Auto'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {bus.current_location_name} → College
                      </p>
                      <p className="text-[11px] text-emerald-600 font-semibold">
                        Next arrival: <span className="font-bold">3 min</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onTrackBus(bus.id)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                  >
                    Track
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Saved Routes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Saved Routes</h3>
              </div>
              <button
                onClick={() => onNavigateTab('saved')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Byramangala → Bidadi Engineering</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bus KA-42-F-1024 • Ordinary</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    Next bus: <span className="font-bold">4 min</span>
                  </p>
                </div>
                <button
                  onClick={() => onTrackBus('BUS-101')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                >
                  Track
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Kailancha → Ramanagara Polytechnic</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bus KA-42-F-4105 • Taluk Connector</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    Next bus: <span className="font-bold">6 min</span>
                  </p>
                </div>
                <button
                  onClick={() => onTrackBus('BUS-104')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                >
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Updates Ticker matching Image 4 */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-900">Live Updates</h3>
            </div>

            <div className="space-y-3.5">
              {/* Item 1 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bus className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Bus KA-42-F-1024</span>
                    <span className="text-[10px] text-slate-400">3 min ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Arriving in <span className="text-emerald-700 font-bold">3 min</span> at Ramanagara Bus Stand.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Route Saved</span>
                    <span className="text-[10px] text-slate-400">10 min ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Kozhikode → Kannur schedule pinned to your favorites.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Traffic Delay Alert</span>
                    <span className="text-[10px] text-slate-400">15 min ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Bus KA-42-F-4105 delayed by 6 min due to railway gate closure.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Feeder MiniBus Active</span>
                    <span className="text-[10px] text-slate-400">20 min ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Cauvery Rural MiniBus MINI-201 deployed for morning feeder service.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Tip */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Morning Peak Window: 07:15 AM – 09:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
