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
  MapPin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Location, Vehicle, Student, OptimizationResult, Disruption, VehicleStatus, StudentStatus } from '../types';
import { RuralNetworkMap } from './RuralNetworkMap';

interface DashboardProps {
  locations: Location[];
  roads: any[];
  vehicles: Vehicle[];
  students: Student[];
  disruptions: Disruption[];
  optimization: OptimizationResult | null;
  onTriggerDisruption: (type: string) => void;
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
  // Aggregate KPI metrics
  const totalStudents = students.length;
  const strandedStudents = students.filter(s => s.status === StudentStatus.STRANDED || s.status === StudentStatus.UNSERVED).length;
  const rescuedStudents = students.filter(s => s.status === StudentStatus.RESCUED).length;
  const assignedStudents = students.filter(s => s.status === StudentStatus.ASSIGNED || s.status === StudentStatus.RESCUED).length;

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === VehicleStatus.AVAILABLE || v.status === VehicleStatus.ASSIGNED_RESCUE).length;
  const breakdownVehicles = vehicles.filter(v => v.status === VehicleStatus.BREAKDOWN).length;

  const totalSeats = vehicles.filter(v => v.status !== VehicleStatus.BREAKDOWN).reduce((acc, v) => acc + v.capacity, 0);
  const occupiedSeats = assignedStudents;
  const fleetUtilization = totalSeats > 0 ? Math.min(100, Math.round((occupiedSeats / totalSeats) * 100)) : 0;
  const coveragePct = optimization?.coverage_percentage ?? (totalStudents > 0 ? Math.round((assignedStudents / totalStudents) * 100) : 100);

  // Village demand chart data
  const villages = locations.filter(l => l.type === 'village');
  const villageChartData = villages.map(v => {
    const vStudents = students.filter(s => s.origin_id === v.id);
    const vStranded = vStudents.filter(s => s.status === StudentStatus.STRANDED || s.status === StudentStatus.UNSERVED).length;
    const vAssigned = vStudents.length - vStranded;
    return {
      name: v.name.length > 9 ? v.name.substring(0, 8) + '..' : v.name,
      fullName: v.name,
      transported: vAssigned,
      stranded: vStranded,
      total: vStudents.length
    };
  });

  // Fleet distribution data
  const fleetTypeData = [
    { name: 'Govt Buses', value: vehicles.filter(v => v.type === 'govt_bus').length, color: '#3b82f6' },
    { name: 'Minibuses', value: vehicles.filter(v => v.type === 'minibus').length, color: '#14b8a6' },
    { name: 'Shared Autos', value: vehicles.filter(v => v.type === 'shared_auto').length, color: '#f59e0b' },
  ];

  // Upcoming departures table data
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
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert (if disruption active) */}
      {activeDisruptions.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-slate-950 animate-bounce" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">
                CRISIS ACTIVE: {activeDisruptions[0].title}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {activeDisruptions[0].description} ({activeDisruptions[0].affected_student_count} students affected).
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('rescue')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
            >
              <Zap className="w-4 h-4" />
              <span>Inspect AI Rescue Engine</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Header with Quick Crisis Sandbox Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Live Mobility Operations Dashboard
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Real-time
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic rural corridor management for Ramanagara, Channapatna & Kanakapura taluks.
          </p>
        </div>

        {/* Quick Crisis Scenario Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Simulate Crisis:</span>
          <button
            onClick={() => onTriggerDisruption('breakdown')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition flex items-center gap-1"
          >
            <span>💥 Bus Breakdown</span>
          </button>
          <button
            onClick={() => onTriggerDisruption('road_closure')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition flex items-center gap-1"
          >
            <span>🚧 Road Closure</span>
          </button>
          <button
            onClick={() => onTriggerDisruption('surge')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition flex items-center gap-1"
          >
            <span>📈 +40% Surge</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Enrolled Demand</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalStudents}</span>
            <span className="text-xs font-semibold text-slate-500">students</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span><b>{assignedStudents}</b> currently transported</span>
          </div>
        </div>

        {/* Card 2: Stranded / At Risk */}
        <div className={`p-4 rounded-xl border shadow-sm transition ${
          strandedStudents > 0 
            ? 'bg-red-50/50 border-red-200 text-red-950' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Stranded / At-Risk</span>
            <ShieldAlert className={`w-4 h-4 ${strandedStudents > 0 ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${strandedStudents > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {strandedStudents}
            </span>
            <span className="text-xs font-semibold text-slate-500">students</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1">
            {strandedStudents > 0 ? (
              <span className="text-red-700 font-medium">⚠️ Awaiting rescue reallocation</span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Zero students left stranded
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Network Coverage % */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Network Coverage</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{coveragePct.toFixed(1)}%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {coveragePct >= 95 ? 'Optimal' : 'Compromised'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Target SLA: <b>&gt; 95.0%</b> on-time arrival
          </div>
        </div>

        {/* Card 4: Fleet Deployment */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Fleet Status</span>
            <Bus className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {totalVehicles - breakdownVehicles}/{totalVehicles}
            </span>
            <span className="text-xs font-semibold text-slate-500">active</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Seat Occupancy: <b>{fleetUtilization}%</b></span>
            {breakdownVehicles > 0 && (
              <span className="text-red-600 font-bold">{breakdownVehicles} breakdown</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Half) + Real-time Charts (Half) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Card */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">Live Taluk Route Telemetry</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('map')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Expand Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 rounded-lg overflow-hidden border border-slate-100">
            <RuralNetworkMap
              locations={locations}
              roads={roads}
              vehicles={vehicles}
              optimization={optimization}
            />
          </div>
        </div>

        {/* Village Demand & Fleet Charts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Chart 1: Village Demand Distribution */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-[230px] flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Commute Status by Rural Village
              </h2>
              <span className="text-[10px] text-slate-400">Students</span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={villageChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e2e8f0' }}
                    formatter={(val, name) => [val, name === 'transported' ? 'Transported' : 'Stranded']}
                  />
                  <Bar dataKey="transported" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="stranded" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Fleet Category Split */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-[225px] flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Fleet Distribution & Capacity
              </h2>
              <span className="text-[10px] text-slate-400">Total: {totalVehicles} units</span>
            </div>
            <div className="flex-1 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {fleetTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Departures & ETAs Board */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">Upcoming Rural Morning Departures & ETAs</h2>
          </div>
          <span className="text-xs text-slate-500">Live Dispatch Schedule (07:30 - 08:45 AM Window)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Station / Stand</th>
                <th className="py-2.5 px-3">Departure</th>
                <th className="py-2.5 px-3">Estimated Arrival</th>
                <th className="py-2.5 px-3">Occupancy</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {upcomingDepartures.map((dep, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{dep.vehicle}</td>
                  <td className="py-2.5 px-3 capitalize text-slate-600">{dep.type.replace('_', ' ')}</td>
                  <td className="py-2.5 px-3">{dep.location}</td>
                  <td className="py-2.5 px-3 text-slate-600">{dep.departure}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">{dep.eta}</td>
                  <td className="py-2.5 px-3">{dep.occupancy} seats</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      dep.status === 'breakdown'
                        ? 'bg-red-100 text-red-700'
                        : dep.status === 'assigned_rescue'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
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
  );
};
