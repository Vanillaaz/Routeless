import React from 'react';
import { 
  Users, 
  Bus, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Zap, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Flame,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import type { Location, Vehicle, Student, OptimizationResult, Disruption } from '../types';
import { VehicleStatus, StudentStatus } from '../types';
import { RuralNetworkMap } from './RuralNetworkMap';

interface DashboardProps {
  locations: Location[];
  roads: any[];
  vehicles: Vehicle[];
  students: Student[];
  disruptions: Disruption[];
  optimization: OptimizationResult | null;
  onTriggerDisruption: (type: string, params?: any) => void;
  onNavigateToTab: (tab: string) => void;
}

export const LiveMobilityDashboard: React.FC<DashboardProps> = ({
  locations,
  roads,
  vehicles,
  students,
  disruptions,
  optimization,
  onTriggerDisruption,
  onNavigateToTab
}) => {
  // Aggregate Metrics
  const totalStudents = students.length;
  const strandedStudents = students.filter(s => s.status === StudentStatus.STRANDED || s.status === StudentStatus.UNSERVED).length;
  const rescuedStudents = students.filter(s => s.status === StudentStatus.RESCUED).length;
  const transportedStudents = students.filter(s => s.status === StudentStatus.ASSIGNED || s.status === StudentStatus.RESCUED).length;
  
  const totalVehicles = vehicles.length;
  const breakdownVehicles = vehicles.filter(v => v.status === VehicleStatus.BREAKDOWN).length;
  const activeVehicles = totalVehicles - breakdownVehicles;

  const totalSeats = vehicles.filter(v => v.status !== VehicleStatus.BREAKDOWN).reduce((acc, v) => acc + v.capacity, 0);
  const occupiedSeats = transportedStudents;
  const fleetUtilization = totalSeats > 0 ? Math.min(100, Math.round((occupiedSeats / totalSeats) * 100)) : 0;
  const efficiency = optimization?.coverage_percentage ?? (totalStudents > 0 ? Math.round((transportedStudents / totalStudents) * 100) : 100);

  // Village demand chart data
  const villages = locations.filter(l => l.type === 'village');
  const villageChartData = villages.map(v => {
    const vStudents = students.filter(s => s.origin_id === v.id);
    const vStranded = vStudents.filter(s => s.status === StudentStatus.STRANDED || s.status === StudentStatus.UNSERVED).length;
    const vTransported = vStudents.length - vStranded;
    return {
      name: v.name.length > 9 ? v.name.substring(0, 8) + '..' : v.name,
      fullName: v.name,
      transported: vTransported,
      stranded: vStranded,
      total: vStudents.length
    };
  });

  // Fleet category utilization data
  const fleetUtilData = [
    {
      category: 'Govt Buses (55s)',
      capacity: vehicles.filter(v => v.type === 'govt_bus').reduce((a, v) => a + v.capacity, 0),
      occupied: vehicles.filter(v => v.type === 'govt_bus').reduce((a, v) => a + v.current_occupancy, 0),
    },
    {
      category: 'Minibuses (22s)',
      capacity: vehicles.filter(v => v.type === 'minibus').reduce((a, v) => a + v.capacity, 0),
      occupied: vehicles.filter(v => v.type === 'minibus').reduce((a, v) => a + v.current_occupancy, 0),
    },
    {
      category: 'Shared Autos (8s)',
      capacity: vehicles.filter(v => v.type === 'shared_auto').reduce((a, v) => a + v.capacity, 0),
      occupied: vehicles.filter(v => v.type === 'shared_auto').reduce((a, v) => a + v.current_occupancy, 0),
    },
  ];

  // Upcoming departures
  const upcomingDepartures = vehicles.slice(0, 6).map((v, idx) => ({
    vehicle: v.name,
    type: v.type,
    location: v.current_location_name,
    status: v.status,
    occupancy: `${v.current_occupancy}/${v.capacity}`,
    departure: `07:${30 + idx * 5} AM`,
    eta: `08:${20 + idx * 4} AM`
  }));

  const activeDisruptions = disruptions.filter(d => d.active);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Active Crisis Alert Banner */}
      {activeDisruptions.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-500/40 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-red-950/20">
          <div className="flex items-start md:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold border border-red-500/40 shrink-0">
              <Flame className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white uppercase">
                  ACTIVE NETWORK CRISIS: {activeDisruptions[0].title}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500 text-white animate-pulse">
                  RESCUE REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {activeDisruptions[0].description} ({activeDisruptions[0].affected_student_count} students affected).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateToTab('rescue')}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>Inspect AI Dynamic Rescue Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Header with Crisis Simulator Quick Launcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#111c38] p-5 rounded-xl border border-slate-800 text-slate-100 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-white tracking-tight">
              Rural Mobility Operations Command Center
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 tracking-wider uppercase">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Intelligent orchestration for Ramanagara, Channapatna & Kanakapura taluks. Dynamically reorganizing government buses, private minibuses, and shared autos with Google OR-Tools.
          </p>
        </div>

        {/* Quick Crisis Simulation Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Crisis:</span>
          </span>
          <button
            onClick={() => onTriggerDisruption('breakdown')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/60 transition flex items-center gap-1"
          >
            <span>💥 Bus Breakdown</span>
          </button>
          <button
            onClick={() => onTriggerDisruption('road_closure')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/60 transition flex items-center gap-1"
          >
            <span>🚧 Road Closure</span>
          </button>
          <button
            onClick={() => onTriggerDisruption('surge')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/60 transition flex items-center gap-1"
          >
            <span>📈 +40% Surge</span>
          </button>
        </div>
      </div>

      {/* 5 Command Center KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Students */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalStudents}</span>
            <span className="text-xs text-slate-400 font-medium">commuters</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>8 Feeder Villages Enrolled</span>
          </div>
        </div>

        {/* KPI 2: Active Vehicles */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Active Vehicles</span>
            <Bus className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeVehicles} / {totalVehicles}</span>
            <span className="text-xs text-slate-400 font-medium">units</span>
          </div>
          <div className="mt-2 text-[11px] flex items-center justify-between">
            <span className="text-slate-400">Availability:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {Math.round((activeVehicles / totalVehicles) * 100)}%
            </span>
          </div>
        </div>

        {/* KPI 3: Students Transported */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Transported Safely</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{transportedStudents}</span>
            <span className="text-xs text-slate-400 font-medium">students</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {rescuedStudents > 0 ? (
              <span className="text-emerald-400 font-bold">{rescuedStudents} dynamically rescued</span>
            ) : (
              <span>100% on baseline transit</span>
            )}
          </div>
        </div>

        {/* KPI 4: Students Needing Assistance */}
        <div className={`p-4 rounded-xl border transition shadow-md ${
          strandedStudents > 0
            ? 'bg-red-950/40 border-red-500/60 text-red-200'
            : 'bg-[#111c38] border-slate-800 text-slate-100'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Needing Assistance</span>
            <ShieldAlert className={`w-4 h-4 ${strandedStudents > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${strandedStudents > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {strandedStudents}
            </span>
            <span className="text-xs text-slate-400 font-medium">stranded</span>
          </div>
          <div className="mt-2 text-[11px]">
            {strandedStudents > 0 ? (
              <span className="text-red-400 font-bold">⚠️ Emergency triage active</span>
            ) : (
              <span className="text-emerald-400 font-medium">✓ Zero stranded students</span>
            )}
          </div>
        </div>

        {/* KPI 5: Transportation Efficiency */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Transit Efficiency</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{efficiency.toFixed(1)}%</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              SLA &gt; 95%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Seat Occupancy:</span>
            <span className="font-mono font-bold text-white">{fleetUtilization}%</span>
          </div>
        </div>
      </div>

      {/* Main Command Workspace: Telemetry Map + Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Network Map (7 cols) */}
        <div className="lg:col-span-7 bg-[#111c38] p-4 rounded-xl border border-slate-800 shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-sm text-white">Live Rural Route Telemetry Map</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('map')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>Fullscreen Telemetry</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 rounded-lg overflow-hidden border border-slate-700/80 shadow-inner">
            <RuralNetworkMap
              locations={locations}
              roads={roads}
              vehicles={vehicles}
              optimization={optimization}
            />
          </div>
        </div>

        {/* Analytics Charts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Chart 1: Village Demand Chart */}
          <div className="bg-[#111c38] p-4 rounded-xl border border-slate-800 shadow-xl h-[250px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-xs text-white uppercase tracking-wider">
                Village-Wise Student Demand & Status
              </h2>
              <span className="text-[10px] text-slate-400">Total: {totalStudents}</span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={villageChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11, color: '#f8fafc' }}
                    formatter={(val, name) => [val, name === 'transported' ? 'Transported' : 'Stranded']}
                  />
                  <Bar dataKey="transported" stackId="a" fill="#10b981" />
                  <Bar dataKey="stranded" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Vehicle Utilization Chart */}
          <div className="bg-[#111c38] p-4 rounded-xl border border-slate-800 shadow-xl h-[245px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-xs text-white uppercase tracking-wider">
                Vehicle Category Capacity Utilization
              </h2>
              <span className="text-[10px] text-slate-400">Seat Capacity vs Occupancy</span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fleetUtilData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11, color: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="capacity" name="Max Capacity" fill="#334155" />
                  <Bar dataKey="occupied" name="Occupied Seats" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Disruption Events & Departures Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Disruption Events (6 cols) */}
        <div className="lg:col-span-6 bg-[#111c38] rounded-xl border border-slate-800 shadow-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-sm text-white">Recent Disruption Events Log</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('simulator')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Crisis Control Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {disruptions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-lg text-xs">
                No disruptions logged. Network operations nominal.
              </div>
            ) : (
              disruptions.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-slate-100">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span>{d.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">({d.timestamp})</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{d.description}</p>
                  </div>
                  <div className="text-right pl-4 shrink-0">
                    <span className="text-xs font-bold text-red-400 font-mono">
                      {d.affected_student_count} Affected
                    </span>
                    <button
                      onClick={() => onNavigateToTab('rescue')}
                      className="mt-1 block text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      View Rescue Plan →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Rural Departures (6 cols) */}
        <div className="lg:col-span-6 bg-[#111c38] rounded-xl border border-slate-800 shadow-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h2 className="font-bold text-sm text-white">Upcoming Departures & Arrival ETAs</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('fleet')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Manage Fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto dark-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-2 px-2.5">Vehicle</th>
                  <th className="py-2 px-2.5">Stand</th>
                  <th className="py-2 px-2.5">Departure</th>
                  <th className="py-2 px-2.5">ETA</th>
                  <th className="py-2 px-2.5">Occupancy</th>
                  <th className="py-2 px-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
                {upcomingDepartures.map((dep, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition">
                    <td className="py-2 px-2.5 font-bold text-white">{dep.vehicle}</td>
                    <td className="py-2 px-2.5 text-slate-300">{dep.location}</td>
                    <td className="py-2 px-2.5 text-slate-400">{dep.departure}</td>
                    <td className="py-2 px-2.5 font-mono font-bold text-emerald-400">{dep.eta}</td>
                    <td className="py-2 px-2.5 font-mono">{dep.occupancy}</td>
                    <td className="py-2 px-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        dep.status === 'breakdown'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : dep.status === 'assigned_rescue'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {dep.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
