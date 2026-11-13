import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Bus, 
  DollarSign, 
  Users,
  Compass
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
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import type { Student, Vehicle, Location, OptimizationResult } from '../types';

interface AnalyticsProps {
  students: Student[];
  vehicles: Vehicle[];
  locations: Location[];
  optimization: OptimizationResult | null;
}

export const AnalyticsView: React.FC<AnalyticsProps> = ({
  students,
  vehicles,
  locations,
  optimization
}) => {
  const villages = locations.filter(l => l.type === 'village');
  const colleges = locations.filter(l => l.type === 'college');

  // Destination distribution
  const destinationData = colleges.map(c => ({
    name: c.name.split(' ')[0] + ' ' + (c.name.split(' ')[1] || ''),
    students: students.filter(s => s.destination_id === c.id).length
  }));

  // Arrival timeline curve (07:15 to 09:00 AM)
  const timelineData = [
    { time: '07:15 AM', baselineDemand: 25, transported: 25 },
    { time: '07:30 AM', baselineDemand: 80, transported: 78 },
    { time: '07:45 AM', baselineDemand: 160, transported: 154 },
    { time: '08:00 AM', baselineDemand: 210, transported: optimization?.transported_students || 205 },
    { time: '08:15 AM', baselineDemand: 210, transported: optimization?.transported_students || 210 },
    { time: '08:30 AM', baselineDemand: 210, transported: optimization?.transported_students || 210 },
    { time: '08:45 AM', baselineDemand: 210, transported: optimization?.transported_students || 210 }
  ];

  // Modal split
  const modalData = [
    { name: 'KSRTC Government Buses', value: 165, color: '#3b82f6' },
    { name: 'Cauvery & Gramina Minibuses', value: 35, color: '#14b8a6' },
    { name: 'Gramina Mitra Shared Autos', value: 10, color: '#f59e0b' }
  ];

  const totalSeats = vehicles.reduce((a, v) => a + v.capacity, 0);
  const occupiedSeats = optimization?.transported_students || students.length;
  const transitEquityScore = Math.round((occupiedSeats / Math.max(1, students.length)) * 100);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Analytics Hero */}
      <div className="bg-[#111c38] p-5 rounded-xl border border-slate-800 text-slate-100 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-black text-white tracking-tight">
              Transportation Network Intelligence & Analytics
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
              EXECUTIVE BRIEFING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit-grade performance metrics for State Road Transport Corporations (KSRTC) and District Administration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Reporting Sector:</span>
          <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            Ramanagara Taluk Cluster
          </span>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Transit Equity Score */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Rural Transit Equity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{transitEquityScore}%</span>
            <span className="text-xs text-slate-400">coverage</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            All 8 feeder hamlets connected
          </div>
        </div>

        {/* Metric 2: Average Commute Time */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Average Rural Commute</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">28.4</span>
            <span className="text-xs text-slate-400">minutes</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Within 08:45 AM college deadline
          </div>
        </div>

        {/* Metric 3: Avoided Stranded Student Hours */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Lost Hours Avoided</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">142</span>
            <span className="text-xs text-slate-400">student-hours</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Preserved class attendance
          </div>
        </div>

        {/* Metric 4: Deadhead Mileage Index */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Deadhead Detour Ratio</span>
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">1.08x</span>
            <span className="text-xs text-emerald-400 font-bold">Optimal</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Minimal empty rescue travel
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#111c38] p-5 rounded-xl border border-slate-800 shadow-xl flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Peak Morning Transit Inflow (07:15 AM - 09:00 AM)
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Real-time vs Baseline Demand</span>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11, color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baselineDemand" name="Scheduled Demand" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="transported" name="Actual Transported" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modal Split Chart (5 cols) */}
        <div className="lg:col-span-5 bg-[#111c38] p-5 rounded-xl border border-slate-800 shadow-xl flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Modal Transit Share
            </h2>
            <span className="text-[10px] text-slate-400">Total: {students.length} Commuters</span>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {modalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11, color: '#f8fafc' }} />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* College Hub Inflow Chart (12 cols) */}
        <div className="lg:col-span-12 bg-[#111c38] p-5 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Student Inflow Distribution by Educational Destination
            </h2>
            <span className="text-[10px] text-slate-400">4 Higher Education Campuses</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11, color: '#f8fafc' }}
                />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
