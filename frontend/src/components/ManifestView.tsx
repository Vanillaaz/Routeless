import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Bus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Phone,
  ArrowUpDown,
  Compass
} from 'lucide-react';
import type { Student, Vehicle } from '../types';
import { StudentStatus, VehicleStatus } from '../types';

interface ManifestProps {
  students: Student[];
  vehicles: Vehicle[];
  onToggleVehicle: (vehicleId: string) => void;
  defaultTab?: 'students' | 'fleet';
}

export const ManifestView: React.FC<ManifestProps> = ({
  students,
  vehicles,
  onToggleVehicle,
  defaultTab = 'students'
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'fleet'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.origin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.destination_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesCollege = collegeFilter === 'all' || s.destination_id === collegeFilter;
    return matchesSearch && matchesStatus && matchesCollege;
  });

  // Unique colleges for filtering
  const colleges = Array.from(new Set(students.map(s => JSON.stringify({ id: s.destination_id, name: s.destination_name }))))
    .map(s => JSON.parse(s));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-slate-100">
      {/* Header and View Selector */}
      <div className="bg-[#111c38] p-5 rounded-xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            {activeTab === 'students' ? (
              <Users className="w-5 h-5 text-blue-400" />
            ) : (
              <Bus className="w-5 h-5 text-emerald-400" />
            )}
            <h1 className="text-xl font-black text-white tracking-tight">
              {activeTab === 'students' ? 'Rural Student Passenger Manifest' : 'Regional Transit Fleet Inventory'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and student tracking across Ramanagara, Channapatna & Kanakapura taluks.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'students' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'fleet' ? 'bg-emerald-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Fleet Vehicles ({vehicles.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'students' ? (
        /* STUDENTS TABLE VIEW */
        <div className="bg-[#111c38] rounded-xl border border-slate-800 shadow-xl p-5 space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name, ID, village or college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses ({students.length})</option>
              <option value="assigned">Assigned</option>
              <option value="rescued">Rescued (Dynamic)</option>
              <option value="stranded">Stranded</option>
              <option value="delayed">Delayed</option>
              <option value="unserved">Unserved</option>
            </select>

            {/* College Filter */}
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none max-w-[200px]"
            >
              <option value="all">All Destinations</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto dark-scrollbar rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Origin Village</th>
                  <th className="py-2.5 px-3">Destination Campus</th>
                  <th className="py-2.5 px-3">Pickup Time</th>
                  <th className="py-2.5 px-3">Deadline</th>
                  <th className="py-2.5 px-3">Assigned Vehicle</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
                {filteredStudents.slice(0, 50).map((s) => {
                  const isStranded = s.status === StudentStatus.STRANDED || s.status === StudentStatus.UNSERVED;
                  const isRescued = s.status === StudentStatus.RESCUED;
                  const isDelayed = s.status === StudentStatus.DELAYED;

                  return (
                    <tr key={s.id} className="hover:bg-slate-900/60 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{s.id}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{s.name}</td>
                      <td className="py-2.5 px-3">{s.origin_name}</td>
                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-[180px]">{s.destination_name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{s.pickup_time}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{s.deadline}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-xs text-blue-400">
                          {s.assigned_vehicle_id || 'None (Unassigned)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isStranded
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : isRescued
                            ? 'bg-emerald-950 text-emerald-400 font-black border border-emerald-800'
                            : isDelayed
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2">
            <span>Showing top {Math.min(50, filteredStudents.length)} of {filteredStudents.length} matching student records</span>
            <span>Enrolled Commuter Database: <b>{students.length} Total</b></span>
          </div>
        </div>
      ) : (
        /* FLEET TABLE VIEW */
        <div className="bg-[#111c38] rounded-xl border border-slate-800 shadow-xl p-5 space-y-4">
          <div className="overflow-x-auto dark-scrollbar rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Vehicle Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Max Capacity</th>
                  <th className="py-2.5 px-3">Live Occupancy</th>
                  <th className="py-2.5 px-3">Current Location</th>
                  <th className="py-2.5 px-3">Driver Telemetry</th>
                  <th className="py-2.5 px-3">Operating Status</th>
                  <th className="py-2.5 px-3">Manual Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
                {vehicles.map((v) => {
                  const isBreakdown = v.status === VehicleStatus.BREAKDOWN;
                  const isRescue = v.status === VehicleStatus.ASSIGNED_RESCUE;
                  const occPct = Math.round((v.current_occupancy / v.capacity) * 100);

                  return (
                    <tr key={v.id} className="hover:bg-slate-900/60 transition">
                      <td className="py-2.5 px-3 font-bold text-white">{v.name}</td>
                      <td className="py-2.5 px-3 capitalize text-slate-300">{v.type.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3 font-bold">{v.capacity} seats</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{v.current_occupancy} ({occPct}%)</span>
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${occPct > 90 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                              style={{ width: `${Math.min(100, occPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">{v.current_location_name}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.driver_name} ({v.driver_phone})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isBreakdown
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : isRescue
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 font-black'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}>
                          {v.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onToggleVehicle(v.id)}
                          className={`px-3 py-1 rounded text-[11px] font-bold transition ${
                            isBreakdown
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-700'
                          }`}
                        >
                          {isBreakdown ? 'Repair Vehicle' : 'Simulate Breakdown'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
