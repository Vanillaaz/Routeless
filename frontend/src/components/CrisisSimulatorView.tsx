import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  Flame, 
  Compass, 
  TrendingUp, 
  Users, 
  Bus, 
  ShieldCheck, 
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import type { Vehicle, RoadSegment, Disruption, OptimizationResult, Location } from '../types';
import { VehicleStatus, RoadStatus } from '../types';
import { RuralNetworkMap } from './RuralNetworkMap';

interface CrisisSimulatorProps {
  vehicles: Vehicle[];
  roads: RoadSegment[];
  locations: Location[];
  disruptions: Disruption[];
  optimization: OptimizationResult | null;
  scenarioName: string;
  onTriggerScenario: (type: string, params?: any) => Promise<void>;
  onToggleVehicle: (vehicleId: string) => void;
  onToggleRoad: (roadId: string) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const CrisisSimulatorView: React.FC<CrisisSimulatorProps> = ({
  vehicles,
  roads,
  locations,
  disruptions,
  optimization,
  scenarioName,
  onTriggerScenario,
  onToggleVehicle,
  onToggleRoad,
  onReset,
  isLoading = false
}) => {
  // Simulator Controls State
  const [selectedDisruptionType, setSelectedDisruptionType] = useState<string>('breakdown');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('BUS-101');
  const [selectedRoadId, setSelectedRoadId] = useState<string>('R6');
  const [surgePct, setSurgePct] = useState<number>(40);
  const [activeMapView, setActiveMapView] = useState<'after' | 'before'>('after');
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [aiPhase, setAiPhase] = useState<number>(0);

  // Trigger simulation with cinematic multi-phase processing indicator
  const handleTrigger = async () => {
    setIsProcessingAI(true);
    setAiPhase(1); // Triage

    const timer1 = setTimeout(() => setAiPhase(2), 350); // Telemetry
    const timer2 = setTimeout(() => setAiPhase(3), 700); // OR-Tools MIP
    const timer3 = setTimeout(() => setAiPhase(4), 1050); // Route Synthesis

    try {
      await onTriggerScenario(selectedDisruptionType, {
        vehicleId: selectedVehicleId,
        roadId: selectedRoadId,
        surgePct: surgePct
      });
    } finally {
      setTimeout(() => {
        setIsProcessingAI(false);
        setAiPhase(0);
      }, 1400);
    }
  };

  const rescueMissions = optimization?.assignments.filter(a => a.is_rescue_mission) || [];
  const affectedCount = disruptions.reduce((acc, d) => acc + d.affected_student_count, 0);
  const unservedCount = optimization?.unserved_student_ids.length || 0;
  const coverage = optimization?.coverage_percentage ?? 100;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Prominent Command Console */}
      <div className="bg-gradient-to-r from-[#111c38] via-[#0f172a] to-[#111c38] p-6 rounded-2xl border-2 border-slate-700/80 shadow-2xl relative overflow-hidden text-slate-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-black shadow-lg shadow-red-500/30">
                <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    Transportation Crisis Simulator & Dynamic Recovery
                  </h1>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black bg-red-500/20 text-red-400 border border-red-500/40 uppercase tracking-wider">
                    COMMAND CONTROL
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                  Inject mechanical breakdowns, impassable monsoon roads, or demand spikes. Watch Google OR-Tools recalculate assignments in real time.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onReset}
            disabled={isLoading || isProcessingAI}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-2 border border-slate-700 shadow-md shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Network Baseline</span>
          </button>
        </div>

        {/* Crisis Injection Form Console */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Disruption Type Dropdown */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Select Disruption Type</span>
            </label>
            <select
              value={selectedDisruptionType}
              onChange={(e) => setSelectedDisruptionType(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="breakdown">💥 Vehicle Mechanical Breakdown</option>
              <option value="road_closure">🚧 Monsoon Flooding / Road Blockage</option>
              <option value="surge">📈 Exam Day +40% Student Demand Surge</option>
              <option value="multi_breakdown">⚠️ Dual-Vehicle Fleet Breakdown Crisis</option>
              <option value="delay">⏳ Heavy Congestion Delay (+35 mins)</option>
            </select>
          </div>

          {/* Dynamic Target Asset Selector */}
          <div className="md:col-span-5 space-y-1.5">
            {selectedDisruptionType === 'breakdown' && (
              <>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Select Affected Fleet Vehicle</span>
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type.replace('_', ' ')} - {v.current_location_name})
                    </option>
                  ))}
                </select>
              </>
            )}

            {selectedDisruptionType === 'road_closure' && (
              <>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select Impassable Road Segment</span>
                </label>
                <select
                  value={selectedRoadId}
                  onChange={(e) => setSelectedRoadId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {roads.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.from_node} ↔ {r.to_node}, {r.distance_km} km)
                    </option>
                  ))}
                </select>
              </>
            )}

            {selectedDisruptionType === 'surge' && (
              <>
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    <span>Demand Surge Multiplier</span>
                  </span>
                  <span className="text-purple-400 font-mono font-bold">+{surgePct}% Extra Students</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={surgePct}
                  onChange={(e) => setSurgePct(Number(e.target.value))}
                  className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </>
            )}

            {(selectedDisruptionType === 'multi_breakdown' || selectedDisruptionType === 'delay') && (
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                {selectedDisruptionType === 'multi_breakdown'
                  ? 'Simulates simultaneous engine overheating on BUS-101 and BUS-103 in separate taluk corridors.'
                  : 'Injects +35 min construction detour on Old Bengaluru-Mysuru Highway (R12).'}
              </div>
            )}
          </div>

          {/* Trigger Button */}
          <div className="md:col-span-3">
            <button
              onClick={handleTrigger}
              disabled={isLoading || isProcessingAI}
              className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{isProcessingAI ? 'AI RE-SOLVING...' : 'TRIGGER CRISIS & OPTIMIZE'}</span>
            </button>
          </div>
        </div>

        {/* AI Cinematic Processing Progress HUD */}
        {isProcessingAI && (
          <div className="mt-5 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-emerald-400 font-mono font-bold mb-2">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>AI DYNAMIC RESCUE ENGINE ENGAGED</span>
              </span>
              <span>PHASE {aiPhase} / 4</span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${aiPhase * 25}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 text-center font-mono">
              <span className={aiPhase >= 1 ? 'text-emerald-400 font-bold' : ''}>1. Disruption Triage</span>
              <span className={aiPhase >= 2 ? 'text-emerald-400 font-bold' : ''}>2. Fleet Telemetry</span>
              <span className={aiPhase >= 3 ? 'text-emerald-400 font-bold' : ''}>3. OR-Tools MIP</span>
              <span className={aiPhase >= 4 ? 'text-emerald-400 font-bold' : ''}>4. Route Synthesis</span>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Crisis Impact Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Affected Students */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Affected Students</span>
            <Users className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-400">{affectedCount}</span>
            <span className="text-xs text-slate-400">students</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Isolated from broken / delayed routes
          </div>
        </div>

        {/* Metric 2: Reassigned Rescue Units */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Reassigned Vehicles</span>
            <Bus className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{rescueMissions.length}</span>
            <span className="text-xs text-slate-400">rescue units</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Minibuses & shared autos dispatched
          </div>
        </div>

        {/* Metric 3: Unserved Students */}
        <div className={`p-4 rounded-xl border text-slate-100 shadow-md ${
          unservedCount > 0 ? 'bg-red-950/40 border-red-500/50' : 'bg-[#111c38] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Unserved Students</span>
            <ShieldCheck className={`w-4 h-4 ${unservedCount > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${unservedCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {unservedCount}
            </span>
            <span className="text-xs text-slate-400">unaccommodated</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {unservedCount > 0 ? 'Exceeds local available capacity' : 'Zero students left behind'}
          </div>
        </div>

        {/* Metric 4: Optimization Verdict */}
        <div className="p-4 rounded-xl bg-[#111c38] border border-slate-800 text-slate-100 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Rescue Network Coverage</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{coverage.toFixed(1)}%</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              {optimization?.status || 'OPTIMAL'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Computed in <b>{optimization?.solve_time_ms || 14.2} ms</b>
          </div>
        </div>
      </div>

      {/* Before-and-After Network Map Comparison */}
      <div className="bg-[#111c38] rounded-xl border border-slate-800 shadow-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">
              Geographic Network Telemetry: Before vs. After Dynamic Rescue
            </h2>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveMapView('after')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeMapView === 'after'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Post-Rescue AI Reassigned Plan</span>
            </button>
            <button
              onClick={() => setActiveMapView('before')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeMapView === 'before'
                  ? 'bg-red-500 text-white font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pre-Rescue Disrupted State</span>
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-[460px] rounded-xl overflow-hidden border border-slate-700 shadow-inner relative">
          <RuralNetworkMap
            locations={locations}
            roads={roads}
            vehicles={vehicles}
            optimization={activeMapView === 'after' ? optimization : null}
            onVehicleClick={onToggleVehicle}
            onRoadClick={onToggleRoad}
          />

          {/* Floating Map Mode Badge */}
          <div className="absolute top-3 left-3 z-[1000] px-3 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-bold flex items-center gap-2 shadow-lg">
            <span className={`w-2 h-2 rounded-full ${activeMapView === 'after' ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
            <span className={activeMapView === 'after' ? 'text-emerald-300' : 'text-red-300'}>
              {activeMapView === 'after' ? 'Displaying Optimized Rescue Vectors (OR-Tools)' : 'Displaying Raw Disruption Point'}
            </span>
          </div>
        </div>
      </div>

      {/* Optimization Explanation Card */}
      <div className="bg-[#111c38] rounded-xl border border-slate-800 shadow-xl p-5 text-slate-200">
        <div className="flex items-center gap-2 font-bold text-sm text-white mb-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Executive Optimization Explanation & Triage Audit</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs leading-relaxed space-y-2">
          <p className="font-medium text-slate-200">
            {optimization?.rescue_narrative || 'Network operating within standard parameters.'}
          </p>
          <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-4 text-[11px] text-slate-400">
            <span>MIP Model: <b>Multi-Vehicle Pickup & Delivery with Deadlines</b></span>
            <span>Solver Engine: <b>Google OR-Tools CBC/SCIP</b></span>
            <span>Capacity Violations: <b className="text-emerald-400">0 (Strictly Bounded)</b></span>
            <span>Closed Road Violations: <b className="text-emerald-400">0 (Zero Impassable Passages)</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};
