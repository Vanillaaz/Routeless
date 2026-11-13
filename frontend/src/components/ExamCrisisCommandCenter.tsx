import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Bus,
  MapPin,
  TrendingUp,
  FileText,
  RefreshCw,
  Zap,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  Search,
  Filter,
  Navigation,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import L from 'leaflet';
import type {
  ExamCrisisResponse,
  NetworkStateResponse,
  StudentAssignmentDetail,
  UnassignedStudentDetail,
  VehicleAssignment
} from '../types';
import { fetchExamCrisisState, triggerExamCrisis, resetCrisisToNormal } from '../api';

interface ExamCrisisCommandCenterProps {
  initialNetworkData?: NetworkStateResponse | null;
  onRefreshGlobalState?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ExamCrisisCommandCenter: React.FC<ExamCrisisCommandCenterProps> = ({
  onRefreshGlobalState,
  onNavigateTab
}) => {
  const [crisisData, setCrisisData] = useState<ExamCrisisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'map' | 'manifest' | 'analytics' | 'report'>('overview');
  const [manifestFilter, setManifestFilter] = useState<'all' | 'p1' | 'p2' | 'at_risk' | 'unassigned'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const layerGroupRef = React.useRef<L.LayerGroup | null>(null);

  // Load state on mount
  const loadCrisisData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchExamCrisisState();
      setCrisisData(data);
    } catch (err) {
      console.error('Error fetching crisis state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCrisisData();
  }, []);

  // Execute multi-step simulation
  const handleExecuteExamCrisis = async () => {
    setIsSimulating(true);
    setSimulationStep(1);

    // Multi-step visual progression
    const stepTimes = [600, 700, 700, 800, 900, 800, 700, 600];
    for (let i = 0; i < stepTimes.length; i++) {
      await new Promise(r => setTimeout(r, stepTimes[i]));
      setSimulationStep(i + 2);
    }

    try {
      const result = await triggerExamCrisis();
      setCrisisData(result);
      if (onRefreshGlobalState) onRefreshGlobalState();
    } catch (err) {
      console.error('Error triggering crisis:', err);
    } finally {
      setIsSimulating(false);
      setSimulationStep(0);
    }
  };

  const handleResetToNormal = async () => {
    try {
      setIsLoading(true);
      await resetCrisisToNormal();
      await loadCrisisData();
      if (onRefreshGlobalState) onRefreshGlobalState();
    } catch (err) {
      console.error('Error resetting scenario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (crisisData?.gemini_report) {
      navigator.clipboard.writeText(crisisData.gemini_report);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    }
  };

  // Map Initialization & Marker Updates
  useEffect(() => {
    if (activeSubTab !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.715, 77.295],
        zoom: 11,
        zoomControl: false
      });
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors | GRAMMOVE AI'
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const layerGroup = layerGroupRef.current;
    if (!layerGroup || !crisisData) return;

    layerGroup.clearLayers();

    // 1. Draw Flooded Road (R6 - Kailancha to Iggalur) in pulsing red with hazard striping
    const floodedR6Coords: [number, number][] = [
      [12.6321, 77.2514], // Kailancha V4
      [12.6710, 77.2280]  // Iggalur Cross J1
    ];
    const floodedLine = L.polyline(floodedR6Coords, {
      color: '#ef4444',
      weight: 7,
      dashArray: '8, 8',
      opacity: 0.95
    }).addTo(layerGroup);

    floodedLine.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <b style="color: #b91c1c;">🌊 SH-17 KAILANCHA BRIDGE [FLOODED]</b><br/>
        <span style="color: #4b5563;">Culvert submerged under 1.4m water.<br/><b>IMPASSABLE:</b> Zero vehicle traversals allowed.</span>
      </div>
    `);

    // 2. Draw Normal / Alternative Roads
    // Alternative detour route avoiding R6: Kailancha -> Maralawadi -> Harohalli -> Byramangala -> Bidadi -> Ramanagara
    const detourCoords: [number, number][] = [
      [12.6321, 77.2514], // V4 Kailancha
      [12.5982, 77.4112], // V8 Maralawadi
      [12.6841, 77.4529], // V3 Harohalli
      [12.7932, 77.3887], // V2 Byramangala
      [12.7880, 77.3650], // J2 Bidadi Bypass
      [12.7208, 77.2789]  // C1 Ramanagara College
    ];
    const detourLine = L.polyline(detourCoords, {
      color: '#10b981',
      weight: 4,
      dashArray: '4, 4',
      opacity: 0.85
    }).addTo(layerGroup);
    detourLine.bindPopup('<b>Alternative Flood Detour Path</b><br/>Safe bypass route computed by Dijkstra shortest path.');

    // 3. Render Failed Bus Markers (Red breakdown icon)
    const brokenBusLocations = [
      { id: 'BUS-101', name: 'KSRTC Express KA-42-F-1024', lat: 12.7932, lng: 77.3887, loc: 'Byramangala' },
      { id: 'BUS-103', name: 'KSRTC Silk Express KA-42-F-3011', lat: 12.7214, lng: 77.2023, loc: 'Doddamallur' }
    ];

    brokenBusLocations.forEach(b => {
      const icon = L.divIcon({
        className: 'custom-breakdown-icon',
        html: `
          <div style="background-color: #ef4444; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 10px rgba(239,68,68,0.5);">
            🚨
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      L.marker([b.lat, b.lng], { icon })
        .addTo(layerGroup)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <b style="color: #ef4444;">ENGINE FAILURE: ${b.name}</b><br/>
            Location: ${b.loc}<br/>
            <span style="color: #6b7280;">Capacity removed. Passengers reallocated to rescue fleet.</span>
          </div>
        `);
    });

    // 4. Render Active Rescue Vehicles (Emerald / Blue)
    const rescueUnits = [
      { name: 'Cauvery MiniBus KA-42-M-4412', lat: 12.7880, lng: 77.3650, type: 'Minibus (24 seats)' },
      { name: 'Gramina Seva MiniBus KA-42-M-5590', lat: 12.7056, lng: 77.2912, type: 'Minibus (22 seats)' },
      { name: 'Gramina Mitra Auto-1', lat: 12.7932, lng: 77.3887, type: 'Shared Auto (8 seats)' },
      { name: 'Gramina Mitra Auto-2', lat: 12.7932, lng: 77.3887, type: 'Shared Auto (8 seats)' }
    ];

    rescueUnits.forEach(v => {
      const icon = L.divIcon({
        className: 'custom-rescue-icon',
        html: `
          <div style="background-color: #10b981; color: white; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 8px rgba(16,185,129,0.4);">
            🚌
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      L.marker([v.lat, v.lng], { icon })
        .addTo(layerGroup)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <b style="color: #047857;">RESCUE UNIT ACTIVE</b><br/>
            <b>${v.name}</b><br/>
            ${v.type}<br/>
            Status: Priority Exam Shuttle Dispatch
          </div>
        `);
    });
  }, [activeSubTab, crisisData]);

  if (isLoading && !crisisData) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">Synchronizing Crisis Telemetry...</h3>
        <p className="text-xs text-slate-500 mt-1">Reading fleet status, flooded road conditions, and student exam schedules.</p>
      </div>
    );
  }

  const m = crisisData?.metrics;
  const isCrisisActive = m?.crisis_active ?? false;
  const opt = crisisData?.optimization;

  // Comparison analytics chart data
  const comparisonChartData = [
    {
      name: 'Students Transported',
      Before: m?.before_transported || 210,
      After: m?.after_transported || 234
    },
    {
      name: 'Available Seating',
      Before: m?.before_capacity || 337,
      After: m?.after_capacity || 230
    },
    {
      name: 'Exam Candidates',
      Before: 126,
      After: m?.students_with_exams || 207
    },
    {
      name: 'Unserved Shortage',
      Before: 0,
      After: m?.students_unassigned || 57
    }
  ];

  // Filtered Student List
  const allStudentAssignments = opt?.student_assignments || [];
  const allUnservedStudents = opt?.unassigned_students_details || [];

  const combinedStudents = [
    ...allStudentAssignments.map(s => ({
      ...s,
      type: 'assigned' as const,
      is_assigned: true
    })),
    ...allUnservedStudents.map(u => ({
      student_id: u.student_id,
      student_name: u.student_name,
      origin_name: u.origin_name,
      destination_name: u.destination_name,
      assigned_vehicle_id: 'NONE',
      assigned_vehicle_name: 'UNASSIGNED',
      pickup_time: 'N/A',
      eta: 'N/A',
      deadline: u.deadline,
      is_on_time: false,
      travel_time_mins: 0,
      detour_mins: 0,
      assignment_reason: u.explanation,
      exam_time: u.exam_time,
      exam_priority: u.exam_priority,
      is_exam_on_time: false,
      type: 'unassigned' as const,
      is_assigned: false,
      diagnostic_reason: u.diagnostic_reason
    }))
  ];

  const filteredStudents = combinedStudents.filter(s => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.student_name.toLowerCase().includes(q);
      const matchVillage = s.origin_name.toLowerCase().includes(q);
      const matchCollege = s.destination_name.toLowerCase().includes(q);
      const matchId = s.student_id.toLowerCase().includes(q);
      if (!matchName && !matchVillage && !matchCollege && !matchId) return false;
    }

    if (manifestFilter === 'p1') return s.exam_priority === 'P1';
    if (manifestFilter === 'p2') return s.exam_priority === 'P2';
    if (manifestFilter === 'at_risk') return !s.is_on_time || !s.is_assigned;
    if (manifestFilter === 'unassigned') return !s.is_assigned;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Simulator Trigger */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-sm ${
        isCrisisActive
          ? 'bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 text-white border-red-500/40 shadow-red-500/10'
          : 'bg-white text-slate-900 border-slate-200 shadow-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                isCrisisActive
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/40'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                <Flame className="w-3.5 h-3.5" />
                {isCrisisActive ? '🚨 EXAM-DAY EMERGENCY ACTIVE' : 'EXAM-DAY CRISIS MODE: STANDBY'}
              </span>
              <span className={`text-xs font-semibold ${isCrisisActive ? 'text-slate-300' : 'text-slate-500'}`}>
                Ramanagara Rural Transportation Command Center
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Exam-Day Emergency Crisis Management
            </h1>
            <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${isCrisisActive ? 'text-slate-300' : 'text-slate-600'}`}>
              Simulate four simultaneous transit disruptions: <b>2 bus breakdowns</b>, a <b>+40% student demand surge</b>, 
              a <b>flash-flooded bridge</b>, and <b>urgent examination deadlines</b>. Google OR-Tools dynamically prioritizes 
              students with immediate exams while diagnosing remaining capacity bottlenecks.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExecuteExamCrisis}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 ${
                isSimulating
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-600/30'
              }`}
            >
              <Zap className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'EXECUTING SIMULATION...' : 'EXECUTE EXAM-DAY CRISIS'}</span>
            </button>

            {isCrisisActive && (
              <button
                onClick={handleResetToNormal}
                disabled={isSimulating}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RESTORE NORMAL SCHEDULE</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-step execution progress bar */}
        {isSimulating && (
          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span>Executing Step {simulationStep} of 9</span>
              <span>
                {simulationStep === 1 && 'STEP 1: Marking 2 government buses (BUS-101, BUS-103) as BROKEN DOWN...'}
                {simulationStep === 2 && 'STEP 2: Increasing student transportation demand by +40% (+81 students)...'}
                {simulationStep === 3 && 'STEP 3: Marking R6 Kailancha Bridge as FLOODED and closed in road graph...'}
                {simulationStep === 4 && 'STEP 4: Classifying students into P1 (<60m) and P2 (<120m) examination priorities...'}
                {simulationStep === 5 && 'STEP 5: Running Google OR-Tools Multi-Objective MIP Solver...'}
                {simulationStep === 6 && 'STEP 6: Reallocating standby minibuses and shared autos to rescue corridors...'}
                {simulationStep === 7 && 'STEP 7: Recalculating Dijkstra shortest paths avoiding flooded bridge...'}
                {simulationStep === 8 && 'STEP 8: Updating live telemetry, student manifest, and interactive map...'}
                {simulationStep === 9 && 'STEP 9: Generating Gemini AI Emergency Response Directive Report...'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300 rounded-full"
                style={{ width: `${(simulationStep / 9) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Four Disruption Pillars Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Disruption 1: Bus Breakdowns */}
        <div className="p-4 rounded-2xl bg-white border border-red-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">A. Bus Breakdown</div>
            <div className="text-base font-black text-slate-900 mt-0.5">
              {m?.failed_buses_count || 2} Failed Buses
            </div>
            <div className="text-xs text-red-600 font-semibold mt-1">
              BUS-101 & BUS-103 down (-107 seats)
            </div>
          </div>
        </div>

        {/* Disruption 2: Demand Surge */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">B. Demand Surge</div>
            <div className="text-base font-black text-slate-900 mt-0.5">
              +{m?.demand_surge_pct || 40}% Exam Influx
            </div>
            <div className="text-xs text-amber-700 font-semibold mt-1">
              {m?.total_students_requiring_transport || 291} total commuters (+81 surge)
            </div>
          </div>
        </div>

        {/* Disruption 3: Flooded Road */}
        <div className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">C. Flooded Road</div>
            <div className="text-base font-black text-slate-900 mt-0.5">
              R6 Kailancha Bridge
            </div>
            <div className="text-xs text-blue-700 font-semibold mt-1">
              Culvert flooded (1.4m water). CLOSED.
            </div>
          </div>
        </div>

        {/* Disruption 4: Exam Deadlines */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">D. Exam Priority</div>
            <div className="text-base font-black text-slate-900 mt-0.5">
              {m?.students_with_exams || 207} Exam Candidates
            </div>
            <div className="text-xs text-purple-700 font-semibold mt-1">
              P1 (&lt;60m): {m?.p1_count || 92} | P2 (&lt;120m): {m?.p2_count || 115}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Crisis Overview & KPIs', icon: ShieldAlert },
          { id: 'map', label: 'Interactive Emergency Map', icon: Navigation },
          { id: 'manifest', label: 'Exam Priority Manifest', icon: CheckCircle2, badge: `${filteredStudents.length}` },
          { id: 'analytics', label: 'Before-and-After Analytics', icon: TrendingUp },
          { id: 'report', label: 'AI Emergency Directive Report', icon: FileText, badge: 'Gemini' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB A: OVERVIEW & KPIs */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Demand</div>
              <div className="text-xl font-black text-slate-900 mt-1">{m?.total_students_requiring_transport || 291}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">+40% Exam Surge</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Exam Candidates</div>
              <div className="text-xl font-black text-purple-600 mt-1">{m?.students_with_exams || 207}</div>
              <div className="text-[11px] text-purple-700 font-medium mt-0.5">P1 (&lt;60m): {m?.p1_count || 92}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Active Fleet</div>
              <div className="text-xl font-black text-slate-900 mt-1">{m?.available_vehicles_count || 11} / 13</div>
              <div className="text-[11px] text-red-600 font-semibold mt-0.5">2 Buses Broken Down</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Fleet Capacity</div>
              <div className="text-xl font-black text-slate-900 mt-1">{m?.remaining_seating_capacity || 230} seats</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-0.5">100% Saturated</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Transported</div>
              <div className="text-xl font-black text-emerald-600 mt-1">{m?.students_assigned || 234}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Coverage: {m?.coverage_percentage || 80.4}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Capacity Shortage</div>
              <div className="text-xl font-black text-red-600 mt-1">{m?.students_unassigned || 57}</div>
              <div className="text-[11px] text-red-500 font-medium mt-0.5">Unserved backlog</div>
            </div>
          </div>

          {/* Rescue Narrative Card */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  OR-Tools Optimization Narrative
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Solve Time: {opt?.solve_time_ms || 112.3} ms
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {opt?.rescue_narrative || 'AI Dynamic Rescue Engine solved the multi-objective allocation.'}
            </p>
          </div>

          {/* Deployed Rescue Units List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Dynamic Fleet Reallocations</h3>
                <p className="text-xs text-slate-500">
                  Secondary minibuses and shared autos deployed to accommodate stranded passengers.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                {opt?.assignments.filter(a => a.is_rescue_mission).length || 8} Active Rescue Missions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(opt?.assignments || []).map(a => (
                <div
                  key={a.vehicle_id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    a.is_rescue_mission
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{a.vehicle_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      a.is_rescue_mission ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {a.is_rescue_mission ? 'RESCUE SHUTTLE' : 'REGULAR ROUTE'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Capacity: <b>{a.assigned_count} / {a.capacity}</b> seats</span>
                    <span>Utilization: <b>{a.vehicle_utilization_percentage || Math.round((a.assigned_count / a.capacity) * 100)}%</b></span>
                    <span>ETA: <b>~{a.eta_minutes} mins</b></span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    <b>Corridor:</b> {a.pickup_stops.slice(0, 2).join(', ')} ➔ {a.dropoff_stops.join(', ')}
                  </div>

                  {a.selection_reason && (
                    <div className="text-[11px] text-slate-600 italic border-t border-slate-200/60 pt-1.5 mt-1">
                      💡 {a.selection_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB B: INTERACTIVE EMERGENCY MAP */}
      {activeSubTab === 'map' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">Live Crisis Network Map</h3>
              <p className="text-xs text-slate-500">
                Visualizing flooded road avoidance, failed vehicle positions, and emergency shuttle detours.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-red-500 inline-block rounded" />
                Flooded Road (R6)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-500 inline-block rounded" />
                Alternative Detour
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
                Failed Bus
              </span>
            </div>
          </div>

          <div
            ref={mapContainerRef}
            className="w-full h-[520px] rounded-xl border border-slate-200 overflow-hidden relative shadow-inner"
          />
        </div>
      )}

      {/* TAB C: PRIORITY-AWARE STUDENT MANIFEST */}
      {activeSubTab === 'manifest' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Priority-Aware Student Manifest</h3>
              <p className="text-xs text-slate-500">
                Students ranked by examination start times, travel windows, and arrival buffer margins.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {[
                { id: 'all', label: 'All Students' },
                { id: 'p1', label: 'P1 Exam (<60m)' },
                { id: 'p2', label: 'P2 Exam (<120m)' },
                { id: 'at_risk', label: 'At Risk' },
                { id: 'unassigned', label: 'Shortage' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setManifestFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    manifestFilter === f.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name, village, college, or student ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Origin ➔ Destination</th>
                  <th className="p-3">Exam Priority</th>
                  <th className="p-3">Latest Departure</th>
                  <th className="p-3">Assigned Vehicle</th>
                  <th className="p-3">Arrival ETA</th>
                  <th className="p-3">Punctuality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.slice(0, 50).map(s => (
                  <tr key={s.student_id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{s.student_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.student_id}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div><b>{s.origin_name}</b></div>
                      <div className="text-[11px] text-slate-500">➔ {s.destination_name}</div>
                    </td>
                    <td className="p-3">
                      {s.exam_priority === 'P1' && (
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-red-100 text-red-800 border border-red-200">
                          P1 (Exam {s.exam_time || '08:45 AM'})
                        </span>
                      )}
                      {s.exam_priority === 'P2' && (
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-amber-100 text-amber-800 border border-amber-200">
                          P2 (Exam {s.exam_time || '09:30 AM'})
                        </span>
                      )}
                      {(!s.exam_priority || s.exam_priority === 'P3') && (
                        <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-100 text-slate-600">
                          P3 (Regular)
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {s.pickup_time || '07:30 AM'}
                    </td>
                    <td className="p-3 font-medium">
                      {s.is_assigned ? (
                        <span className="text-emerald-700 font-semibold">{s.assigned_vehicle_name}</span>
                      ) : (
                        <span className="text-red-600 font-bold">Unassigned (Shortage)</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {s.eta}
                    </td>
                    <td className="p-3">
                      {s.is_assigned ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          On-Time
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          At Risk
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-400 text-right">
            Showing top {Math.min(50, filteredStudents.length)} of {filteredStudents.length} matching students.
          </div>
        </div>
      )}

      {/* TAB D: BEFORE-AND-AFTER ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900">Before-and-After Scenario Analytics</h3>
              <p className="text-xs text-slate-500">
                Comparing network baseline metrics against post-optimization crisis metrics.
              </p>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Students Transported</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-slate-900">{m?.after_transported || 234}</span>
                  <span className="text-xs text-slate-400 line-through">was {m?.before_transported || 210}</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-0.5">+24 surge students saved</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Operational Seating</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-slate-900">{m?.after_capacity || 230}</span>
                  <span className="text-xs text-slate-400 line-through">was {m?.before_capacity || 337}</span>
                </div>
                <div className="text-[11px] text-red-600 font-semibold mt-0.5">-107 seats (2 failed buses)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Network Coverage</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-slate-900">{m?.after_coverage_pct || 80.4}%</span>
                  <span className="text-xs text-slate-400 line-through">was {m?.before_coverage_pct || 100}%</span>
                </div>
                <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Physical limit reached</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Exam Candidates Handled</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-purple-600">{m?.students_with_exams || 207}</span>
                </div>
                <div className="text-[11px] text-purple-700 font-bold mt-0.5">Prioritized by OR-Tools</div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Before" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="After" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB E: AI EMERGENCY REPORT */}
      {activeSubTab === 'report' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-800">
                  Google Gemini 2.5
                </span>
                <h3 className="text-base font-black text-slate-900">Official Emergency Response Directive</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Authoritative 12-section operational report generated from mathematical solver telemetry.
              </p>
            </div>

            <button
              onClick={handleCopyReport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedReport ? 'Copied to Clipboard!' : 'Copy Report'}</span>
            </button>
          </div>

          {/* Formatted Report Content */}
          <div className="prose prose-sm max-w-none text-slate-700 font-sans leading-relaxed bg-slate-50/70 p-6 rounded-xl border border-slate-200/80 whitespace-pre-line font-mono text-xs">
            {crisisData?.gemini_report || 'Generating report...'}
          </div>
        </div>
      )}
    </div>
  );
};
