import React, { useState } from 'react';
import { 
  Users, 
  Bus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  ArrowUpDown,
  Phone
} from 'lucide-react';
import { Student, Vehicle, StudentStatus, VehicleStatus, VehicleType } from '../types';

interface ManifestProps {
  students: Student[];
  vehicles: Vehicle[];
  onToggleVehicle: (vehicleId: string) => void;
}

export const ManifestView: React.FC<ManifestProps> = ({
  students,
  vehicles,
  onToggleVehicle
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'fleet'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');

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
    <div className="space-y-6 pb-12">
      {/* Header and View Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Student & Fleet Manifest Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry and student tracking across Ramanagara, Channapatna & Kanakapura taluks.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'students' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Students ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'fleet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fleet Vehicles ({vehicles.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'students' ? (
        /* STUDENTS TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name, ID, village or college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
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
              className="py-1.5 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none max-w-[200px]"
            >
              <option value="all">All Destinations</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Origin Village</th>
                  <th className="py-2.5 px-3">Destination Hub</th>
                  <th className="py-2.5 px-3">Pickup Time</th>
                  <th className="py-2.5 px-3">Arrival Deadline</th>
                  <th className="py-2.5 px-3">Assigned Vehicle</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredStudents.slice(0, 50).map((s) => {
                  const isStranded = s.status === StudentStatus.STRANDED || s.status === StudentStatus.UNSERVED;
                  const isRescued = s.status === StudentStatus.RESCUED;
                  const isDelayed = s.status === StudentStatus.DELAYED;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 font-mono text-slate-500">{s.id}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2 px-3">{s.origin_name}</td>
                      <td className="py-2 px-3 text-slate-600 truncate max-w-[180px]">{s.destination_name}</td>
                      <td className="py-2 px-3 text-slate-500">{s.pickup_time}</td>
                      <td className="py-2 px-3 font-semibold text-slate-700">{s.deadline}</td>
                      <td className="py-2 px-3">
                        <span className="font-mono text-xs text-blue-700">
                          {s.assigned_vehicle_id || 'None (Unassigned)'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isStranded
                            ? 'bg-red-100 text-red-700'
                            : isRescued
                            ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                            : isDelayed
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
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

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2">
            <span>Showing top {Math.min(50, filteredStudents.length)} of {filteredStudents.length} matching students</span>
            <span>Total Enrolled Database: {students.length} records</span>
          </div>
        </div>
      ) : (
        /* FLEET TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Vehicle Name</th>
                  <th className="py-2.5 px-3">Fleet Category</th>
                  <th className="py-2.5 px-3">Capacity</th>
                  <th className="py-2.5 px-3">Occupancy</th>
                  <th className="py-2.5 px-3">Current Location</th>
                  <th className="py-2.5 px-3">Driver Telemetry</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {vehicles.map((v) => {
                  const isBreakdown = v.status === VehicleStatus.BREAKDOWN;
                  const isRescue = v.status === VehicleStatus.ASSIGNED_RESCUE;
                  const occPct = Math.round((v.current_occupancy / v.capacity) * 100);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{v.name}</td>
                      <td className="py-2.5 px-3 capitalize text-slate-600">{v.type.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3 font-bold">{v.capacity} seats</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span>{v.current_occupancy} ({occPct}%)</span>
                          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${occPct > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, occPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">{v.current_location_name}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{v.driver_name} ({v.driver_phone})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isBreakdown
                            ? 'bg-red-100 text-red-700'
                            : isRescue
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {v.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onToggleVehicle(v.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                            isBreakdown
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-red-100 hover:bg-red-200 text-red-700'
                          }`}
                        >
                          {isBreakdown ? 'Mark Repaired' : 'Breakdown'}
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
