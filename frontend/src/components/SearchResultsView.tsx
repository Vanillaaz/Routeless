import React, { useState, useEffect } from 'react';
import {
  Bus,
  Search,
  Filter,
  ArrowRight,
  ArrowLeftRight,
  ChevronRight,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Compass,
  Check
} from 'lucide-react';
import type { Location, Vehicle } from '../types';
import { planTripOptions } from '../api';

interface SearchResultsViewProps {
  initialQuery?: string;
  initialOrigin?: string;
  initialDest?: string;
  locations: Location[];
  vehicles: Vehicle[];
  onTrackBus: (busId: string) => void;
  onNavigateHome: () => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  initialQuery = 'Byramangala to Bidadi',
  initialOrigin = 'V2',
  initialDest = 'C3',
  locations,
  vehicles,
  onTrackBus,
  onNavigateHome
}) => {
  // Origin and destination states (Requirement 3)
  const [selectedOrigin, setSelectedOrigin] = useState<string>(initialOrigin);
  const [selectedDest, setSelectedDest] = useState<string>(initialDest);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('soonest');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tripPlan, setTripPlan] = useState<any>(null);

  // Group locations for clean dropdowns
  const villageLocations = locations.filter(l => l.type === 'village' || l.type === 'junction');
  const collegeLocations = locations.filter(l => l.type === 'college');

  // If none match specific filter, fallback to all
  const availableOrigins = villageLocations.length > 0 ? villageLocations : locations;
  const availableDests = collegeLocations.length > 0 ? collegeLocations : locations;

  const fetchResults = async (origId: string, destId: string) => {
    setIsLoading(true);
    try {
      const res = await planTripOptions(origId, destId);
      setTripPlan(res);
    } catch (err) {
      console.error('Plan trip error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(selectedOrigin, selectedDest);
  }, [selectedOrigin, selectedDest]);

  const handleSwapLocations = () => {
    const temp = selectedOrigin;
    setSelectedOrigin(selectedDest);
    setSelectedDest(temp);
  };

  const options = tripPlan?.options || [];

  // Filter options by vehicle type
  const filteredOptions = options.filter((opt: any) => {
    if (selectedType === 'all') return true;
    if (selectedType === 'govt_bus') return opt.type === 'govt_bus';
    if (selectedType === 'minibus') return opt.type === 'minibus';
    if (selectedType === 'shared_auto') return opt.type === 'shared_auto';
    return true;
  });

  // Sort options
  const sortedOptions = [...filteredOptions].sort((a: any, b: any) => {
    if (sortBy === 'duration') {
      return (a.duration_mins || 0) - (b.duration_mins || 0);
    }
    if (sortBy === 'seats') {
      return (b.available_seats || 0) - (a.available_seats || 0);
    }
    return 0; // soonest departure order by default
  });

  const originName = tripPlan?.origin?.name || locations.find(l => l.id === selectedOrigin)?.name || 'Byramangala';
  const destName = tripPlan?.destination?.name || locations.find(l => l.id === selectedDest)?.name || 'Bidadi Engineering College';
  const routeDistance = tripPlan?.distance_km || 14.2;
  const transitDuration = tripPlan?.travel_time_mins || 28;
  const viaText = tripPlan?.via_summary || 'Direct Route';

  return (
    <div className="space-y-6">
      {/* Top Location Selection Bar (User Requirement 3) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition font-medium">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-semibold">Route Planner & Travel Options</span>
        </div>

        {/* Origin & Destination Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center pt-1">
          {/* Origin Selector */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Current Location / Boarding Stop</span>
            </label>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              {availableOrigins.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.taluk} Taluk)
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex items-center justify-center pt-4 md:pt-4">
            <button
              onClick={handleSwapLocations}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition shadow-2xs"
              title="Swap Origin and Destination"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Selector */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Destination College / Higher Education Hub</span>
            </label>
            <select
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              {availableDests.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.taluk} Taluk)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Realistic Route Corridor Summary Pill */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="font-bold text-blue-900">
              {originName} → {destName}
            </span>
            <span className="text-slate-400 font-medium">({viaText})</span>
          </div>
          <div className="flex items-center gap-4 text-blue-800 font-semibold text-[11px]">
            <span>Road Distance: <strong className="text-slate-900">{routeDistance} km</strong></span>
            <span>Transit Time: <strong className="text-slate-900">{transitDuration} mins</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Results, Right Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Results Table / Cards) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Available Travel Options
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated across real-time fleet occupancy, road connectivity & deadlines.
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 font-medium animate-pulse">
              Calculating realistic shortest path & vehicle availability...
            </div>
          )}

          {/* Table Header Row */}
          {!isLoading && sortedOptions.length > 0 && (
            <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 rounded-xl bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">Vehicle Details</div>
              <div className="col-span-3">Departure & Arrival</div>
              <div className="col-span-2">Seats & Fare</div>
              <div className="col-span-3 text-right">Action</div>
            </div>
          )}

          {/* Results List */}
          {!isLoading && (
            <div className="space-y-3">
              {sortedOptions.map((opt: any) => {
                const regNumber = opt.title.split(' ').slice(-1)[0];
                const isBest = opt.is_best || false;

                return (
                  <div
                    key={opt.id}
                    className={`p-4 rounded-2xl bg-white border transition ${
                      isBest
                        ? 'border-blue-300 ring-2 ring-blue-500/10 shadow-sm'
                        : 'border-slate-200/80 hover:border-blue-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      {/* Vehicle Details */}
                      <div className="sm:col-span-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isBest ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <Bus className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-900">{regNumber}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-600">
                              {opt.category || 'Ordinary'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                            {opt.title}
                          </p>
                        </div>
                      </div>

                      {/* Departure & Arrival */}
                      <div className="sm:col-span-3">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{opt.departure_time} → {opt.arrival_time}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {opt.duration_mins} mins travel ({opt.distance_km})
                        </div>
                      </div>

                      {/* Seats & Fare */}
                      <div className="sm:col-span-2">
                        <div className="text-xs font-extrabold text-emerald-600">
                          {opt.available_seats} seats free
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {opt.fare}
                        </div>
                      </div>

                      {/* Track Action */}
                      <div className="sm:col-span-3 flex items-center justify-end gap-3">
                        <button
                          onClick={() => onTrackBus(opt.vehicle_id || 'BUS-101')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <span>Track Bus</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Recommendation Banner if isBest */}
                    {isBest && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50/60 px-3 py-1.5 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{opt.recommendation_reason}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (Filter & Search Tips) */}
        <div className="space-y-5">
          {/* Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Filter Travel Options</h3>
            </div>

            {/* Sort by */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
              >
                <option value="soonest">Next Arrival (Soonest)</option>
                <option value="duration">Shortest Travel Time</option>
                <option value="seats">Most Seats Available</option>
              </select>
            </div>

            {/* Bus Type Checkboxes */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Vehicle Type
              </label>
              <div className="space-y-2 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="busType"
                    checked={selectedType === 'all'}
                    onChange={() => setSelectedType('all')}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span>All Available Vehicles</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="busType"
                    checked={selectedType === 'govt_bus'}
                    onChange={() => setSelectedType('govt_bus')}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span>KSRTC Government Express</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="busType"
                    checked={selectedType === 'minibus'}
                    onChange={() => setSelectedType('minibus')}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span>Cauvery Rural MiniBus</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="busType"
                    checked={selectedType === 'shared_auto'}
                    onChange={() => setSelectedType('shared_auto')}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span>Gramina Mitra Shared Auto</span>
                </label>
              </div>
            </div>
          </div>

          {/* Student Pass & Helpline Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Free Student Bus Pass Info</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              All government buses accept Karnataka State Student Concession Passes. Private minibuses and shared autos operate under district subsidized student fares.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
