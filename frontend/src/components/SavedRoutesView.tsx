import React, { useState } from 'react';
import {
  Star,
  Bus,
  Clock,
  Trash2,
  Plus,
  Zap,
  Bell,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface SavedRoutesViewProps {
  onTrackBus: (busId: string) => void;
  onNavigateSearch: () => void;
}

export const SavedRoutesView: React.FC<SavedRoutesViewProps> = ({
  onTrackBus,
  onNavigateSearch
}) => {
  const [routes, setRoutes] = useState([
    {
      id: 'saved-1',
      origin: 'Byramangala',
      destination: 'Bidadi Engineering & Technical Academy',
      busNumber: 'Bus KA-42-F-1024',
      vehicleId: 'BUS-101',
      category: 'Ordinary Express',
      via: 'Via: Byramangala Junction, Harohalli Link',
      nextBusMins: 3,
      arrivalTime: '07:45 AM',
      color: 'blue'
    },
    {
      id: 'saved-2',
      origin: 'Kailancha',
      destination: 'Ramanagara Govt Polytechnic',
      busNumber: 'Bus KA-42-F-4105',
      vehicleId: 'BUS-104',
      category: 'Taluk Connector',
      via: 'Via: Vibhutikere Cross, SH-17 Alternate',
      nextBusMins: 6,
      arrivalTime: '07:50 AM',
      color: 'emerald'
    },
    {
      id: 'saved-3',
      origin: 'Doddamallur',
      destination: 'Channapatna Govt First Grade College & ITI',
      busNumber: 'Bus KA-42-F-3011',
      vehicleId: 'BUS-103',
      category: 'Silk Route Express',
      via: 'Via: Akkur Rural Stop, Old Highway Road',
      nextBusMins: 8,
      arrivalTime: '07:55 AM',
      color: 'purple'
    },
    {
      id: 'saved-4',
      origin: 'Akkur',
      destination: 'Channapatna Govt First Grade College',
      busNumber: 'Bus KA-42-M-5590',
      vehicleId: 'MINI-202',
      category: 'Gramina Seva MiniBus',
      via: 'Via: Akkur Village Center, High School Cross',
      nextBusMins: 15,
      arrivalTime: '08:05 AM',
      color: 'amber'
    }
  ]);

  const handleRemove = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Saved Routes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quick access to your frequently used college commutes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Sort by</span>
          <select className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm">
            <option>Recently Used</option>
            <option>Next Departure</option>
            <option>Shortest Distance</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left List, Right Explanatory Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Saved Routes Cards) */}
        <div className="lg:col-span-2 space-y-3.5">
          {routes.map((route) => (
            <div
              key={route.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-200 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-slate-900">
                      {route.origin} → {route.destination}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {route.busNumber} • <span className="text-slate-400 font-normal">{route.category}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {route.via}
                  </p>
                </div>
              </div>

              {/* Right: Arrival + Action */}
              <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Next Bus</span>
                  <span className="text-sm font-black text-emerald-600 block mt-0.5">
                    {route.nextBusMins} min
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {route.arrivalTime}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTrackBus(route.vehicleId)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    Track
                  </button>
                  <button
                    onClick={() => handleRemove(route.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Remove Route"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Route Button */}
          <button
            onClick={onNavigateSearch}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 text-xs font-bold flex items-center justify-center gap-2 transition bg-white/50 hover:bg-blue-50/20"
          >
            <Plus className="w-4 h-4" />
            <span>Search and save a new route for quick access</span>
          </button>
        </div>

        {/* Right Column (Why Save Routes Info Card matching Image 3 Top) */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-600" />
              <span>Why save routes?</span>
            </h4>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800">Quick Access to Frequent Routes</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Open your daily morning village-to-college commute with a single tap.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800">Track Buses Faster</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Launch live GPS satellite telemetry instantly without retyping registration numbers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800">Get Timely Updates</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Receive automated notifications on road closures, delays, and breakdown reassignments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

