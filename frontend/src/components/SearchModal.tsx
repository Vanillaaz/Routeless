import React, { useState, useEffect } from 'react';
import { Search, X, Users, Bus, MapPin, ArrowRight, Zap, AlertTriangle } from 'lucide-react';
import type { Student, Vehicle, Location } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  vehicles: Vehicle[];
  locations: Location[];
  onSelectAction: (actionType: string, id?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  students,
  vehicles,
  locations,
  onSelectAction
}) => {
  const [query, setQuery] = useState('');

  // Handle keyboard ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedStudents = q
    ? students.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.origin_name.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchedVehicles = q
    ? vehicles.filter(v => v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q) || v.driver_name.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchedLocations = q
    ? locations.filter(l => l.name.toLowerCase().includes(q) || l.taluk.toLowerCase().includes(q)).slice(0, 4)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search students, vehicles, villages, or operations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 dark-scrollbar text-xs">
          {/* Quick Action Commands */}
          {!q && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Quick Command Center Shortcuts
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onSelectAction('tab', 'simulator');
                    onClose();
                  }}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white">Crisis Simulator</div>
                      <div className="text-[10px] text-slate-400">Trigger breakdowns & surges</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                </button>

                <button
                  onClick={() => {
                    onSelectAction('tab', 'rescue');
                    onClose();
                  }}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white">AI Dynamic Rescue</div>
                      <div className="text-[10px] text-slate-400">View OR-Tools formulation</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                </button>
              </div>
            </div>
          )}

          {/* Students Results */}
          {matchedStudents.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Users className="w-3 h-3 text-blue-400" />
                <span>Students ({matchedStudents.length})</span>
              </span>
              {matchedStudents.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectAction('tab', 'students');
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-800/80"
                >
                  <div>
                    <span className="font-bold text-slate-200">{s.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">({s.id})</span>
                    <div className="text-[11px] text-slate-400">
                      {s.origin_name} → {s.destination_name} (Deadline {s.deadline})
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    s.status === 'stranded' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Vehicles Results */}
          {matchedVehicles.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Bus className="w-3 h-3 text-emerald-400" />
                <span>Vehicles ({matchedVehicles.length})</span>
              </span>
              {matchedVehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    onSelectAction('tab', 'fleet');
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-800/80"
                >
                  <div>
                    <span className="font-bold text-slate-200">{v.name}</span>
                    <div className="text-[11px] text-slate-400">
                      Stationed at {v.current_location_name} | Capacity: {v.capacity} seats | Driver: {v.driver_name}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    v.status === 'breakdown' ? 'bg-red-950 text-red-400' : 'bg-blue-950 text-blue-400'
                  }`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Locations Results */}
          {matchedLocations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>Villages & Colleges ({matchedLocations.length})</span>
              </span>
              {matchedLocations.map((l) => (
                <div
                  key={l.id}
                  onClick={() => {
                    onSelectAction('tab', 'map');
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between cursor-pointer border border-slate-800/80"
                >
                  <div>
                    <span className="font-bold text-slate-200">{l.name}</span>
                    <div className="text-[11px] text-slate-400">
                      Taluk: {l.taluk} | Type: {l.type} | Student Demand: {l.student_demand}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          )}

          {q && matchedStudents.length === 0 && matchedVehicles.length === 0 && matchedLocations.length === 0 && (
            <div className="py-8 text-center text-slate-500">
              No matching records found for "{query}". Try searching "Doddamallur", "BUS-101", or "Kailancha".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
