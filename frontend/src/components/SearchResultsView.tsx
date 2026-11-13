import React, { useState, useEffect } from 'react';
import {
  Bus,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { Location, Vehicle } from '../types';
import { planTripOptions } from '../api';

interface SearchResultsViewProps {
  initialQuery?: string;
  locations: Location[];
  vehicles: Vehicle[];
  onTrackBus: (busId: string) => void;
  onNavigateHome: () => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  initialQuery = 'Byramangala to Bidadi',
  locations,
  vehicles,
  onTrackBus,
  onNavigateHome
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('soonest');
  const [isLoading, setIsLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState<any>(null);

  // Parse origin and destination from query or fallback
  const fetchResults = async () => {
    setIsLoading(true);
    try {
      // Find matching origin/dest or default to Byramangala (V2) and Bidadi Tech (C3)
      let origId = 'V2';
      let destId = 'C3';

      const lower = query.toLowerCase();
      for (const loc of locations) {
        if (lower.includes(loc.name.toLowerCase())) {
          if (loc.type === 'village') origId = loc.id;
          else destId = loc.id;
        }
      }

      const res = await planTripOptions(origId, destId);
      setTripPlan(res);
    } catch (err) {
      console.error('Plan trip error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  // Build candidate options list combining planTripOptions and active vehicles
  const options = tripPlan?.options || [
    {
      id: 'OPT-1',
      title: 'KSRTC Rural Express KA-42-F-1024',
      vehicle_id: 'BUS-101',
      type: 'govt_bus',
      category: 'Ordinary Express',
      departure_time: '07:35 AM',
      arrival_time: '08:15 AM',
      duration_mins: 40,
      available_seats: 25,
      capacity: 50,
      crowd_status: 'Seats Available',
      distance_km: '0.6 km from your location',
      is_best: true,
      recommendation_reason: 'Recommended: Fastest direct route, zero transfers, arrives at 08:15 AM.'
    },
    {
      id: 'OPT-2',
      title: 'Cauvery Rural MiniBus KA-42-M-4412',
      vehicle_id: 'MINI-201',
      type: 'minibus',
      category: 'Feeder MiniBus',
      departure_time: '07:45 AM',
      arrival_time: '08:25 AM',
      duration_mins: 40,
      available_seats: 12,
      capacity: 24,
      crowd_status: 'Filling Fast',
      distance_km: '1.2 km from your location',
      is_best: false,
      recommendation_reason: 'Alternative Feeder option with guaranteed seating.'
    },
    {
      id: 'OPT-3',
      title: 'Gramina Rural Auto Rickshaw KA-42-A-9011',
      vehicle_id: 'AUTO-301',
      type: 'shared_auto',
      category: 'Shared Auto Feeder',
      departure_time: '07:50 AM',
      arrival_time: '08:20 AM',
      duration_mins: 30,
      available_seats: 2,
      capacity: 4,
      crowd_status: 'Last 2 Seats',
      distance_km: '1.8 km from your location',
      is_best: false,
      recommendation_reason: 'Last-mile shared feeder connector.'
    }
  ];

  // Filter options
  const filteredOptions = options.filter((opt: any) => {
    if (selectedType === 'all') return true;
    if (selectedType === 'govt_bus') return opt.type === 'govt_bus';
    if (selectedType === 'minibus') return opt.type === 'minibus';
    if (selectedType === 'shared_auto') return opt.type === 'shared_auto';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Search Bar matching Image 4 Bottom */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition font-medium">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-semibold">Search Results</span>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bus number or route (e.g. Byramangala to Bidadi)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Grid: Left Results, Right Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Results Table / Cards) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Search Results
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing results for <span className="text-blue-600 font-bold">"{query}"</span> ({filteredOptions.length} results found)
              </p>
            </div>
          </div>

          {/* Table Header Row */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 rounded-xl bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Bus Details</div>
            <div className="col-span-3">Route</div>
            <div className="col-span-2">Next Arrival</div>
            <div className="col-span-3 text-right">Action</div>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {filteredOptions.map((opt: any) => {
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
                    {/* Bus Details */}
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

                    {/* Route Details */}
                    <div className="sm:col-span-3">
                      <div className="text-xs font-bold text-slate-800">
                        {tripPlan?.origin_name || 'Byramangala'} → {tripPlan?.destination_name || 'Bidadi Tech'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Via Cherthala Bypass
                      </div>
                    </div>

                    {/* Next Arrival & Distance */}
                    <div className="sm:col-span-2">
                      <div className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>3 min</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {opt.departure_time || '07:45 AM'}
                      </div>
                    </div>

                    {/* Action & Distance */}
                    <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-[11px] text-slate-400 hidden lg:inline">
                        {opt.distance_km || '0.6 km'}
                      </span>
                      <button
                        onClick={() => onTrackBus(opt.vehicle_id || 'BUS-101')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                      >
                        <span>Track</span>
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
        </div>

        {/* Right Column (Filter & Search Tips) */}
        <div className="space-y-5">
          {/* Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Filter Results</h3>
            </div>

            {/* Sort by */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="soonest">Next Arrival (Soonest)</option>
                <option value="duration">Shortest Travel Time</option>
                <option value="seats">Most Seats Available</option>
              </select>
            </div>

            {/* Bus Type Checkboxes */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Bus Type
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
                  <span>All Types</span>
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
                  <span>Feeder MiniBus</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="busType"
                    checked={selectedType === 'shared_auto'}
                    onChange={() => setSelectedType('shared_auto')}
                    className="text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span>Gramina Shared Auto</span>
                </label>
              </div>
            </div>
          </div>

          {/* Search Tips Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Search Tips</span>
            </h4>
            <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside">
              <li>You can search by vehicle registration (e.g. <span className="font-semibold text-slate-700">KA-42-F-1024</span>) or bus ID (<span className="font-semibold text-slate-700">BUS-101</span>).</li>
              <li>Search village-to-college routes like <span className="font-semibold text-slate-700">Kailancha to Ramanagara</span>.</li>
              <li>Check crowd density badges before boarding.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
