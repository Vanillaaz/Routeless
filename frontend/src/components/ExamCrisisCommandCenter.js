import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Clock, Bus, MapPin, TrendingUp, FileText, RefreshCw, Zap, ShieldAlert, Copy, Check, Search, Navigation } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import L from 'leaflet';
import { fetchExamCrisisState, triggerExamCrisis, resetCrisisToNormal } from '../api';
export const ExamCrisisCommandCenter = ({ onRefreshGlobalState, onNavigateTab }) => {
    const [crisisData, setCrisisData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationStep, setSimulationStep] = useState(0);
    const [activeSubTab, setActiveSubTab] = useState('overview');
    const [manifestFilter, setManifestFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedReport, setCopiedReport] = useState(false);
    const mapContainerRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);
    const layerGroupRef = React.useRef(null);
    // Load state on mount
    const loadCrisisData = async () => {
        try {
            setIsLoading(true);
            const data = await fetchExamCrisisState();
            setCrisisData(data);
        }
        catch (err) {
            console.error('Error fetching crisis state:', err);
        }
        finally {
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
            if (onRefreshGlobalState)
                onRefreshGlobalState();
        }
        catch (err) {
            console.error('Error triggering crisis:', err);
        }
        finally {
            setIsSimulating(false);
            setSimulationStep(0);
        }
    };
    const handleResetToNormal = async () => {
        try {
            setIsLoading(true);
            await resetCrisisToNormal();
            await loadCrisisData();
            if (onRefreshGlobalState)
                onRefreshGlobalState();
        }
        catch (err) {
            console.error('Error resetting scenario:', err);
        }
        finally {
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
        if (activeSubTab !== 'map' || !mapContainerRef.current)
            return;
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
        if (!layerGroup || !crisisData)
            return;
        layerGroup.clearLayers();
        // 1. Draw Flooded Road (R6 - Kailancha to Iggalur) in pulsing red with hazard striping
        const floodedR6Coords = [
            [12.6321, 77.2514], // Kailancha V4
            [12.6710, 77.2280] // Iggalur Cross J1
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
        const detourCoords = [
            [12.6321, 77.2514], // V4 Kailancha
            [12.5982, 77.4112], // V8 Maralawadi
            [12.6841, 77.4529], // V3 Harohalli
            [12.7932, 77.3887], // V2 Byramangala
            [12.7880, 77.3650], // J2 Bidadi Bypass
            [12.7208, 77.2789] // C1 Ramanagara College
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
        return (_jsxs("div", { className: "min-h-[500px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200", children: [_jsx("div", { className: "w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" }), _jsx("h3", { className: "text-base font-bold text-slate-800", children: "Synchronizing Crisis Telemetry..." }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Reading fleet status, flooded road conditions, and student exam schedules." })] }));
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
            type: 'assigned',
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
            type: 'unassigned',
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
            if (!matchName && !matchVillage && !matchCollege && !matchId)
                return false;
        }
        if (manifestFilter === 'p1')
            return s.exam_priority === 'P1';
        if (manifestFilter === 'p2')
            return s.exam_priority === 'P2';
        if (manifestFilter === 'at_risk')
            return !s.is_on_time || !s.is_assigned;
        if (manifestFilter === 'unassigned')
            return !s.is_assigned;
        return true;
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: `p-6 rounded-3xl border transition-all duration-300 shadow-sm ${isCrisisActive
                    ? 'bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 text-white border-red-500/40 shadow-red-500/10'
                    : 'bg-white text-slate-900 border-slate-200 shadow-slate-100'}`, children: [_jsxs("div", { className: "flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: `px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${isCrisisActive
                                                    ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/40'
                                                    : 'bg-amber-100 text-amber-900 border border-amber-300'}`, children: [_jsx(Flame, { className: "w-3.5 h-3.5" }), isCrisisActive ? '🚨 EXAM-DAY EMERGENCY ACTIVE' : 'EXAM-DAY CRISIS MODE: STANDBY'] }), _jsx("span", { className: `text-xs font-semibold ${isCrisisActive ? 'text-slate-300' : 'text-slate-500'}`, children: "Ramanagara Rural Transportation Command Center" })] }), _jsx("h1", { className: "text-2xl sm:text-3xl font-black tracking-tight", children: "Exam-Day Emergency Crisis Management" }), _jsxs("p", { className: `text-xs sm:text-sm max-w-3xl leading-relaxed ${isCrisisActive ? 'text-slate-300' : 'text-slate-600'}`, children: ["Simulate four simultaneous transit disruptions: ", _jsx("b", { children: "2 bus breakdowns" }), ", a ", _jsx("b", { children: "+40% student demand surge" }), ", a ", _jsx("b", { children: "flash-flooded bridge" }), ", and ", _jsx("b", { children: "urgent examination deadlines" }), ". Google OR-Tools dynamically prioritizes students with immediate exams while diagnosing remaining capacity bottlenecks."] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs("button", { onClick: handleExecuteExamCrisis, disabled: isSimulating, className: `flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 ${isSimulating
                                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-600/30'}`, children: [_jsx(Zap, { className: `w-4 h-4 ${isSimulating ? 'animate-spin' : ''}` }), _jsx("span", { children: isSimulating ? 'EXECUTING SIMULATION...' : 'EXECUTE EXAM-DAY CRISIS' })] }), isCrisisActive && (_jsxs("button", { onClick: handleResetToNormal, disabled: isSimulating, className: "flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition active:scale-95", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "RESTORE NORMAL SCHEDULE" })] }))] })] }), isSimulating && (_jsxs("div", { className: "mt-6 pt-6 border-t border-white/10 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between text-xs font-bold text-amber-300", children: [_jsxs("span", { children: ["Executing Step ", simulationStep, " of 9"] }), _jsxs("span", { children: [simulationStep === 1 && 'STEP 1: Marking 2 government buses (BUS-101, BUS-103) as BROKEN DOWN...', simulationStep === 2 && 'STEP 2: Increasing student transportation demand by +40% (+81 students)...', simulationStep === 3 && 'STEP 3: Marking R6 Kailancha Bridge as FLOODED and closed in road graph...', simulationStep === 4 && 'STEP 4: Classifying students into P1 (<60m) and P2 (<120m) examination priorities...', simulationStep === 5 && 'STEP 5: Running Google OR-Tools Multi-Objective MIP Solver...', simulationStep === 6 && 'STEP 6: Reallocating standby minibuses and shared autos to rescue corridors...', simulationStep === 7 && 'STEP 7: Recalculating Dijkstra shortest paths avoiding flooded bridge...', simulationStep === 8 && 'STEP 8: Updating live telemetry, student manifest, and interactive map...', simulationStep === 9 && 'STEP 9: Generating Gemini AI Emergency Response Directive Report...'] })] }), _jsx("div", { className: "w-full h-2.5 bg-black/40 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300 rounded-full", style: { width: `${(simulationStep / 9) * 100}%` } }) })] }))] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-4 rounded-2xl bg-white border border-red-200/80 shadow-sm flex items-start gap-3.5", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0", children: _jsx(Bus, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider", children: "A. Bus Breakdown" }), _jsxs("div", { className: "text-base font-black text-slate-900 mt-0.5", children: [m?.failed_buses_count || 2, " Failed Buses"] }), _jsx("div", { className: "text-xs text-red-600 font-semibold mt-1", children: "BUS-101 & BUS-103 down (-107 seats)" })] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-amber-200/80 shadow-sm flex items-start gap-3.5", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0", children: _jsx(TrendingUp, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider", children: "B. Demand Surge" }), _jsxs("div", { className: "text-base font-black text-slate-900 mt-0.5", children: ["+", m?.demand_surge_pct || 40, "% Exam Influx"] }), _jsxs("div", { className: "text-xs text-amber-700 font-semibold mt-1", children: [m?.total_students_requiring_transport || 291, " total commuters (+81 surge)"] })] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-blue-200/80 shadow-sm flex items-start gap-3.5", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0", children: _jsx(MapPin, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider", children: "C. Flooded Road" }), _jsx("div", { className: "text-base font-black text-slate-900 mt-0.5", children: "R6 Kailancha Bridge" }), _jsx("div", { className: "text-xs text-blue-700 font-semibold mt-1", children: "Culvert flooded (1.4m water). CLOSED." })] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-purple-200/80 shadow-sm flex items-start gap-3.5", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0", children: _jsx(Clock, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider", children: "D. Exam Priority" }), _jsxs("div", { className: "text-base font-black text-slate-900 mt-0.5", children: [m?.students_with_exams || 207, " Exam Candidates"] }), _jsxs("div", { className: "text-xs text-purple-700 font-semibold mt-1", children: ["P1 (<60m): ", m?.p1_count || 92, " | P2 (<120m): ", m?.p2_count || 115] })] })] })] }), _jsx("div", { className: "flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto", children: [
                    { id: 'overview', label: 'Crisis Overview & KPIs', icon: ShieldAlert },
                    { id: 'map', label: 'Interactive Emergency Map', icon: Navigation },
                    { id: 'manifest', label: 'Exam Priority Manifest', icon: CheckCircle2, badge: `${filteredStudents.length}` },
                    { id: 'analytics', label: 'Before-and-After Analytics', icon: TrendingUp },
                    { id: 'report', label: 'AI Emergency Directive Report', icon: FileText, badge: 'Gemini' }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;
                    return (_jsxs("button", { onClick: () => setActiveSubTab(tab.id), className: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${isActive
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label }), tab.badge && (_jsx("span", { className: `text-[10px] px-1.5 py-0.2 rounded font-black ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`, children: tab.badge }))] }, tab.id));
                }) }), activeSubTab === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5", children: [_jsxs("div", { className: "p-4 rounded-2xl bg-white border border-slate-200", children: [_jsx("div", { className: "text-[11px] font-bold text-slate-400 uppercase", children: "Total Demand" }), _jsx("div", { className: "text-xl font-black text-slate-900 mt-1", children: m?.total_students_requiring_transport || 291 }), _jsx("div", { className: "text-[11px] text-slate-500 mt-0.5", children: "+40% Exam Surge" })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-slate-200", children: [_jsx("div", { className: "text-[11px] font-bold text-slate-400 uppercase", children: "Exam Candidates" }), _jsx("div", { className: "text-xl font-black text-purple-600 mt-1", children: m?.students_with_exams || 207 }), _jsxs("div", { className: "text-[11px] text-purple-700 font-medium mt-0.5", children: ["P1 (<60m): ", m?.p1_count || 92] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-slate-200", children: [_jsx("div", { className: "text-[11px] font-bold text-slate-400 uppercase", children: "Active Fleet" }), _jsxs("div", { className: "text-xl font-black text-slate-900 mt-1", children: [m?.available_vehicles_count || 11, " / 13"] }), _jsx("div", { className: "text-[11px] text-red-600 font-semibold mt-0.5", children: "2 Buses Broken Down" })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-slate-200", children: [_jsx("div", { className: "text-[11px] font-bold text-slate-400 uppercase", children: "Fleet Capacity" }), _jsxs("div", { className: "text-xl font-black text-slate-900 mt-1", children: [m?.remaining_seating_capacity || 230, " seats"] }), _jsx("div", { className: "text-[11px] text-emerald-600 font-bold mt-0.5", children: "100% Saturated" })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-slate-200", children: [_jsx("div", { className: "text-[11px] font-bold text-slate-400 uppercase", children: "Transported" }), _jsx("div", { className: "text-xl font-black text-emerald-600 mt-1", children: m?.students_assigned || 234 }), _jsxs("div", { className: "text-[11px] text-slate-500 mt-0.5", children: ["Coverage: ", m?.coverage_percentage || 80.4, "%"] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white border border-slate-200", children: [_jsx("div", { className: "text-[11px] font-bold text-slate-400 uppercase", children: "Capacity Shortage" }), _jsx("div", { className: "text-xl font-black text-red-600 mt-1", children: m?.students_unassigned || 57 }), _jsx("div", { className: "text-[11px] text-red-500 font-medium mt-0.5", children: "Unserved backlog" })] })] }), _jsxs("div", { className: "p-5 rounded-2xl bg-slate-900 text-white space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" }), _jsx("span", { className: "text-xs font-black uppercase tracking-wider text-emerald-400", children: "OR-Tools Optimization Narrative" })] }), _jsxs("span", { className: "text-xs font-mono text-slate-400", children: ["Solve Time: ", opt?.solve_time_ms || 112.3, " ms"] })] }), _jsx("p", { className: "text-xs sm:text-sm text-slate-200 leading-relaxed", children: opt?.rescue_narrative || 'AI Dynamic Rescue Engine solved the multi-objective allocation.' })] }), _jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-black text-slate-900", children: "Dynamic Fleet Reallocations" }), _jsx("p", { className: "text-xs text-slate-500", children: "Secondary minibuses and shared autos deployed to accommodate stranded passengers." })] }), _jsxs("span", { className: "text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800", children: [opt?.assignments.filter(a => a.is_rescue_mission).length || 8, " Active Rescue Missions"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3.5", children: (opt?.assignments || []).map(a => (_jsxs("div", { className: `p-4 rounded-xl border text-xs space-y-2 ${a.is_rescue_mission
                                        ? 'bg-emerald-50/50 border-emerald-200'
                                        : 'bg-slate-50 border-slate-200'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-bold text-slate-900", children: a.vehicle_name }), _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-black uppercase ${a.is_rescue_mission ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`, children: a.is_rescue_mission ? 'RESCUE SHUTTLE' : 'REGULAR ROUTE' })] }), _jsxs("div", { className: "flex items-center justify-between text-slate-600", children: [_jsxs("span", { children: ["Capacity: ", _jsxs("b", { children: [a.assigned_count, " / ", a.capacity] }), " seats"] }), _jsxs("span", { children: ["Utilization: ", _jsxs("b", { children: [a.vehicle_utilization_percentage || Math.round((a.assigned_count / a.capacity) * 100), "%"] })] }), _jsxs("span", { children: ["ETA: ", _jsxs("b", { children: ["~", a.eta_minutes, " mins"] })] })] }), _jsxs("div", { className: "text-[11px] text-slate-500", children: [_jsx("b", { children: "Corridor:" }), " ", a.pickup_stops.slice(0, 2).join(', '), " \u2794 ", a.dropoff_stops.join(', ')] }), a.selection_reason && (_jsxs("div", { className: "text-[11px] text-slate-600 italic border-t border-slate-200/60 pt-1.5 mt-1", children: ["\uD83D\uDCA1 ", a.selection_reason] }))] }, a.vehicle_id))) })] })] })), activeSubTab === 'map' && (_jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-black text-slate-900", children: "Live Crisis Network Map" }), _jsx("p", { className: "text-xs text-slate-500", children: "Visualizing flooded road avoidance, failed vehicle positions, and emergency shuttle detours." })] }), _jsxs("div", { className: "flex items-center gap-3 text-xs font-semibold", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-3 h-1 bg-red-500 inline-block rounded" }), "Flooded Road (R6)"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-3 h-1 bg-emerald-500 inline-block rounded" }), "Alternative Detour"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2.5 h-2.5 bg-red-500 rounded-full inline-block" }), "Failed Bus"] })] })] }), _jsx("div", { ref: mapContainerRef, className: "w-full h-[520px] rounded-xl border border-slate-200 overflow-hidden relative shadow-inner" })] })), activeSubTab === 'manifest' && (_jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 space-y-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-black text-slate-900", children: "Priority-Aware Student Manifest" }), _jsx("p", { className: "text-xs text-slate-500", children: "Students ranked by examination start times, travel windows, and arrival buffer margins." })] }), _jsx("div", { className: "flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold", children: [
                                    { id: 'all', label: 'All Students' },
                                    { id: 'p1', label: 'P1 Exam (<60m)' },
                                    { id: 'p2', label: 'P2 Exam (<120m)' },
                                    { id: 'at_risk', label: 'At Risk' },
                                    { id: 'unassigned', label: 'Shortage' }
                                ].map(f => (_jsx("button", { onClick: () => setManifestFilter(f.id), className: `px-3 py-1.5 rounded-lg transition ${manifestFilter === f.id
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'}`, children: f.label }, f.id))) })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3.5 top-3" }), _jsx("input", { type: "text", placeholder: "Search by student name, village, college, or student ID...", value: searchQuery, onChange: e => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" })] }), _jsx("div", { className: "overflow-x-auto border border-slate-200 rounded-xl", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-200 font-bold text-slate-600", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3", children: "Student" }), _jsx("th", { className: "p-3", children: "Origin \u2794 Destination" }), _jsx("th", { className: "p-3", children: "Exam Priority" }), _jsx("th", { className: "p-3", children: "Latest Departure" }), _jsx("th", { className: "p-3", children: "Assigned Vehicle" }), _jsx("th", { className: "p-3", children: "Arrival ETA" }), _jsx("th", { className: "p-3", children: "Punctuality" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: filteredStudents.slice(0, 50).map(s => (_jsxs("tr", { className: "hover:bg-slate-50/80 transition", children: [_jsxs("td", { className: "p-3 font-semibold text-slate-900", children: [_jsx("div", { children: s.student_name }), _jsx("div", { className: "text-[10px] text-slate-400 font-mono", children: s.student_id })] }), _jsxs("td", { className: "p-3 text-slate-600", children: [_jsx("div", { children: _jsx("b", { children: s.origin_name }) }), _jsxs("div", { className: "text-[11px] text-slate-500", children: ["\u2794 ", s.destination_name] })] }), _jsxs("td", { className: "p-3", children: [s.exam_priority === 'P1' && (_jsxs("span", { className: "px-2 py-0.5 rounded font-black text-[10px] bg-red-100 text-red-800 border border-red-200", children: ["P1 (Exam ", s.exam_time || '08:45 AM', ")"] })), s.exam_priority === 'P2' && (_jsxs("span", { className: "px-2 py-0.5 rounded font-black text-[10px] bg-amber-100 text-amber-800 border border-amber-200", children: ["P2 (Exam ", s.exam_time || '09:30 AM', ")"] })), (!s.exam_priority || s.exam_priority === 'P3') && (_jsx("span", { className: "px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-100 text-slate-600", children: "P3 (Regular)" }))] }), _jsx("td", { className: "p-3 font-mono text-slate-600", children: s.pickup_time || '07:30 AM' }), _jsx("td", { className: "p-3 font-medium", children: s.is_assigned ? (_jsx("span", { className: "text-emerald-700 font-semibold", children: s.assigned_vehicle_name })) : (_jsx("span", { className: "text-red-600 font-bold", children: "Unassigned (Shortage)" })) }), _jsx("td", { className: "p-3 font-mono text-slate-700", children: s.eta }), _jsx("td", { className: "p-3", children: s.is_assigned ? (_jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800", children: "On-Time" })) : (_jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800", children: "At Risk" })) })] }, s.student_id))) })] }) }), _jsxs("div", { className: "text-[11px] text-slate-400 text-right", children: ["Showing top ", Math.min(50, filteredStudents.length), " of ", filteredStudents.length, " matching students."] })] })), activeSubTab === 'analytics' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-black text-slate-900", children: "Before-and-After Scenario Analytics" }), _jsx("p", { className: "text-xs text-slate-500", children: "Comparing network baseline metrics against post-optimization crisis metrics." })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-4 rounded-xl bg-slate-50 border border-slate-200", children: [_jsx("div", { className: "text-[11px] font-bold text-slate-500 uppercase", children: "Students Transported" }), _jsxs("div", { className: "flex items-baseline gap-2 mt-1", children: [_jsx("span", { className: "text-xl font-black text-slate-900", children: m?.after_transported || 234 }), _jsxs("span", { className: "text-xs text-slate-400 line-through", children: ["was ", m?.before_transported || 210] })] }), _jsx("div", { className: "text-[11px] text-emerald-600 font-bold mt-0.5", children: "+24 surge students saved" })] }), _jsxs("div", { className: "p-4 rounded-xl bg-slate-50 border border-slate-200", children: [_jsx("div", { className: "text-[11px] font-bold text-slate-500 uppercase", children: "Operational Seating" }), _jsxs("div", { className: "flex items-baseline gap-2 mt-1", children: [_jsx("span", { className: "text-xl font-black text-slate-900", children: m?.after_capacity || 230 }), _jsxs("span", { className: "text-xs text-slate-400 line-through", children: ["was ", m?.before_capacity || 337] })] }), _jsx("div", { className: "text-[11px] text-red-600 font-semibold mt-0.5", children: "-107 seats (2 failed buses)" })] }), _jsxs("div", { className: "p-4 rounded-xl bg-slate-50 border border-slate-200", children: [_jsx("div", { className: "text-[11px] font-bold text-slate-500 uppercase", children: "Network Coverage" }), _jsxs("div", { className: "flex items-baseline gap-2 mt-1", children: [_jsxs("span", { className: "text-xl font-black text-slate-900", children: [m?.after_coverage_pct || 80.4, "%"] }), _jsxs("span", { className: "text-xs text-slate-400 line-through", children: ["was ", m?.before_coverage_pct || 100, "%"] })] }), _jsx("div", { className: "text-[11px] text-amber-600 font-semibold mt-0.5", children: "Physical limit reached" })] }), _jsxs("div", { className: "p-4 rounded-xl bg-slate-50 border border-slate-200", children: [_jsx("div", { className: "text-[11px] font-bold text-slate-500 uppercase", children: "Exam Candidates Handled" }), _jsx("div", { className: "flex items-baseline gap-2 mt-1", children: _jsx("span", { className: "text-xl font-black text-purple-600", children: m?.students_with_exams || 207 }) }), _jsx("div", { className: "text-[11px] text-purple-700 font-bold mt-0.5", children: "Prioritized by OR-Tools" })] })] }), _jsx("div", { className: "h-72 w-full pt-4", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: comparisonChartData, margin: { top: 10, right: 20, left: 0, bottom: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#e2e8f0" }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: 11, fill: '#64748b' }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fontSize: 11, fill: '#64748b' }, axisLine: false, tickLine: false }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' } }), _jsx(Legend, { wrapperStyle: { fontSize: '11px', paddingTop: '10px' } }), _jsx(Bar, { dataKey: "Before", fill: "#94a3b8", radius: [4, 4, 0, 0] }), _jsx(Bar, { dataKey: "After", fill: "#10b981", radius: [4, 4, 0, 0] })] }) }) })] }) })), activeSubTab === 'report' && (_jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 pb-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-800", children: "Google Gemini 2.5" }), _jsx("h3", { className: "text-base font-black text-slate-900", children: "Official Emergency Response Directive" })] }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Authoritative 12-section operational report generated from mathematical solver telemetry." })] }), _jsxs("button", { onClick: handleCopyReport, className: "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition", children: [copiedReport ? _jsx(Check, { className: "w-4 h-4 text-emerald-600" }) : _jsx(Copy, { className: "w-4 h-4" }), _jsx("span", { children: copiedReport ? 'Copied to Clipboard!' : 'Copy Report' })] })] }), _jsx("div", { className: "prose prose-sm max-w-none text-slate-700 font-sans leading-relaxed bg-slate-50/70 p-6 rounded-xl border border-slate-200/80 whitespace-pre-line font-mono text-xs", children: crisisData?.gemini_report || 'Generating report...' })] }))] }));
};
