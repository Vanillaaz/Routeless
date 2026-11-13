import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Users, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Bus, 
  AlertCircle,
  RotateCw,
  Award
} from 'lucide-react';
import { planTripOptions } from '../api';
import type { Location } from '../types';

interface TripPlannerProps {
  locations: Location[];
  onTrackBus: (busId: string) => void;
}

export const SmartTripPlanner: React.FC<TripPlannerProps> = ({
  locations,
  onTrackBus
}) => {
  const villages = locations.filter(l => l.type === 'village');
  const colleges = locations.filter(l => l.type === 'college');

  const [originId, setOriginId] = useState<string>(villages[0]?.id || 'V1');
  const [destinationId, setDestinationId] = useState<string>(colleges[0]?.id || 'C1');
  const [tripData, setTripData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadPlan = async (orig: string, dest: string) => {
    setIsLoading(true);
    try {
      const data = await planTripOptions(orig, dest);
      setTripData(data);
    } catch (err) {
      console.error('Trip plan error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlan(originId, destinationId);
  }, []);

  const handleSwap = () => {
    // If student wants to reverse
    const currentOrigin = originId;
    const currentDest = destinationId;
    // Keep valid village/college
    loadPlan(currentOrigin, currentDest);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Route Finder Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
              <Navigation className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Smart Bus Allocation & Route Finder
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare all available travel options from your village to college and choose the best route.
              </p>
            </div>
          </div>
        </div>

        {/* Input Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
          {/* Origin Village */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Starting From (Your Village)</span>
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  🏡 {v.name} ({v.taluk} Taluk)
                </option>
              ))}
            </select>
          </div>

          {/* Arrow divider */}
          <div className="md:col-span-2 flex justify-center pt-4 md:pt-0">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ArrowRight className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Destination College */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>Traveling To (Your College)</span>
            </label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  🎓 {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => loadPlan(originId, destinationId)}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            {isLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Find & Compare Travel Options</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      {tripData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Available Travel Options:
              </span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {tripData.origin.name} ➔ {tripData.destination.name}
              </div>
            </div>
            <div className="text-xs text-slate-500 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold text-emerald-800">
              Target College Arrival Deadline: <b>{tripData.deadline}</b>
            </div>
          </div>

          {/* Options Cards */}
          <div className="space-y-4">
            {tripData.options.map((opt: any) => {
              const isBest = opt.is_best;
              return (
                <div
                  key={opt.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isBest
                      ? 'bg-gradient-to-r from-emerald-50/70 via-white to-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isBest && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-sm mb-3">
                      <Award className="w-3.5 h-3.5" />
                      <span>RECOMMENDED BEST TRAVEL OPTION</span>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Timing & Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {opt.category}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                          {opt.fare}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          opt.available_seats > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {opt.available_seats} Seats Left
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        {opt.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>Departs: <b>{opt.departure_time}</b></span>
                        </div>
                        <div className="text-slate-300">→</div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          <span>Arrives: <b>{opt.arrival_time}</b></span>
                        </div>
                        <span className="text-slate-400">({opt.duration_mins} mins total)</span>
                      </div>

                      {/* Stops & Location info */}
                      <div className="text-xs text-slate-600 pt-1 space-y-0.5">
                        <div>Board at: <b>{opt.pickup_point}</b></div>
                        <div>Alight at: <b>{opt.dropoff_point}</b></div>
                      </div>

                      {/* Explanation note */}
                      <p className={`text-xs mt-2 font-medium ${isBest ? 'text-emerald-800' : 'text-slate-500'}`}>
                        {opt.recommendation_reason}
                      </p>
                    </div>

                    {/* Right: Action button */}
                    <div className="shrink-0 flex items-center md:flex-col justify-end gap-2">
                      <button
                        onClick={() => onTrackBus(opt.vehicle_id)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm ${
                          isBest
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <Bus className="w-4 h-4" />
                        <span>Track This Bus Live</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
