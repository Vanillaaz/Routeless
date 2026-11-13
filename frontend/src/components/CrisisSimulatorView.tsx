import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  Zap, 
  ShieldAlert, 
  Sliders, 
  CheckCircle,
  Truck,
  Flame,
  Clock,
  Compass,
  TrendingUp
} from 'lucide-react';
import { Vehicle, RoadSegment, Disruption, RoadStatus, VehicleStatus } from '../types';

interface CrisisSimulatorProps {
  vehicles: Vehicle[];
  roads: RoadSegment[];
  disruptions: Disruption[];
  scenarioName: string;
  onTriggerScenario: (type: string, params?: any) => void;
  onToggleVehicle: (vehicleId: string) => void;
  onToggleRoad: (roadId: string) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const CrisisSimulatorView: React.FC<CrisisSimulatorProps> = ({
  vehicles,
  roads,
  disruptions,
  scenarioName,
  onTriggerScenario,
  onToggleVehicle,
  onToggleRoad,
  onReset,
  isLoading = false
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('BUS-101');
  const [selectedRoadId, setSelectedRoadId] = useState<string>('R6');
  const [surgePct, setSurgePct] = useState<number>(40);

  const presetScenarios = [
    {
      id: 'breakdown',
      title: 'Morning Rush Bus Breakdown',
      icon: Flame,
      color: 'red',
      description: 'KSRTC Express KA-42-F-1024 suffers transmission failure at Byramangala with 48 students on board.',
      actionLabel: 'Trigger Bus Breakdown'
    },
    {
      id: 'road_closure',
      title: 'Monsoon Culvert Road Closure',
      icon: AlertTriangle,
      color: 'amber',
      description: 'SH-17 Kailancha Bridge Road is flooded, severing direct passage between Kailancha and Channapatna.',
      actionLabel: 'Trigger Road Block'
    },
    {
      id: 'surge',
      title: 'Exam Day +40% Demand Surge',
      icon: TrendingUp,
      color: 'purple',
      description: 'Rural taluk pre-university exam triggers sudden +40% crowd surge at village feeder stands.',
      actionLabel: 'Trigger +40% Surge'
    },
    {
      id: 'multi_breakdown',
      title: 'Dual Fleet Breakdown Crisis',
      icon: ShieldAlert,
      color: 'rose',
      description: 'Simultaneous failure of both BUS-101 (Byramangala) and BUS-103 (Doddamallur), stranding 90+ students.',
      actionLabel: 'Trigger Dual Crisis'
    },
    {
      id: 'delay',
      title: 'Highway Construction Gridlock',
      icon: Clock,
      color: 'blue',
      description: 'Major traffic jam on Old Bangalore-Mysuru Section adds +35 minutes, violating college reporting deadlines.',
      actionLabel: 'Trigger Heavy Delay'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Transportation Crisis Simulator
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Interactive Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Simulate real-world rural transportation disruptions. Every crisis scenario dynamically triggers the mathematical OR-Tools engine to compute new routes, fleet reallocations, and triage plans.
          </p>
        </div>

        <button
          onClick={onReset}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 transition shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Network Baseline</span>
        </button>
      </div>

      {/* Preset Crisis Scenarios Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          1. Quick Scenario Presets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presetScenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-slate-700" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">{sc.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <button
                  onClick={() => onTriggerScenario(sc.id, { surgePct })}
                  disabled={isLoading}
                  className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{sc.actionLabel}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Disruption Sandbox Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Vehicle Status Toggles */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Fleet Health Sandbox (Click to Breakdown / Repair)</span>
            </h2>
            <span className="text-[11px] text-slate-400">{vehicles.length} units</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {vehicles.map((v) => {
              const isBroken = v.status === VehicleStatus.BREAKDOWN;
              return (
                <div
                  key={v.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                    isBroken
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{v.name}</span>
                      <span className="text-[10px] text-slate-500 capitalize">({v.type.replace('_', ' ')})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Capacity: <b>{v.capacity} seats</b> | Stationed: <b>{v.current_location_name}</b>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleVehicle(v.id)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded text-[11px] font-bold transition ${
                      isBroken
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
                    }`}
                  >
                    {isBroken ? 'Repair Vehicle' : 'Simulate Breakdown'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Road Segment Status Toggles */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Road Segment Sandbox (Click to Close / Open)</span>
            </h2>
            <span className="text-[11px] text-slate-400">{roads.length} segments</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {roads.map((r) => {
              const isClosed = r.status === RoadStatus.CLOSED;
              return (
                <div
                  key={r.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                    isClosed
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{r.name}</span>
                      <span className="text-[10px] text-slate-500">({r.distance_km} km)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Connects: {r.from_node} ↔ {r.to_node} ({r.travel_time_mins} mins)
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleRoad(r.id)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded text-[11px] font-bold transition ${
                      isClosed
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {isClosed ? 'Open Road' : 'Block Passage'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Incident Log */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Live Disruption Registry ({disruptions.length})
        </h2>

        {disruptions.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs">
            No active incidents. The rural transport corridor is operating normally.
          </div>
        ) : (
          <div className="space-y-2">
            {disruptions.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-amber-950 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>{d.title}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({d.timestamp})</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">{d.description}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-600">{d.affected_student_count}</span>
                  <div className="text-[10px] text-slate-400">students affected</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
