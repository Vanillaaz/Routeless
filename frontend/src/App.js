import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LiveMobilityDashboard } from './components/LiveMobilityDashboard';
import { RuralNetworkMap } from './components/RuralNetworkMap';
import { AIRescueEngineView } from './components/AIRescueEngineView';
import { CrisisSimulatorView } from './components/CrisisSimulatorView';
import { ManifestView } from './components/ManifestView';
import { AITravelAssistantView } from './components/AITravelAssistantView';
import { fetchNetworkState, triggerOptimization, triggerSimulationScenario, toggleVehicle, toggleRoad } from './api';
import { AlertCircle, RefreshCw, Clock, Bus } from 'lucide-react';
export function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [networkData, setNetworkData] = useState(null);
    const [optimization, setOptimization] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Load baseline network state
    const loadState = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchNetworkState();
            setNetworkData(data);
            if (data.last_optimization) {
                setOptimization(data.last_optimization);
            }
        }
        catch (err) {
            console.error('Error fetching network:', err);
            setError('Backend API unavailable. Ensure FastAPI server is running on http://127.0.0.1:8000.');
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadState();
    }, []);
    // Handle Crisis Presets
    const handleTriggerScenario = async (scenarioType, params) => {
        try {
            setIsLoading(true);
            const res = await triggerSimulationScenario(scenarioType, params);
            setOptimization(res.optimization);
            // Refresh network state
            const updated = await fetchNetworkState();
            setNetworkData(updated);
        }
        catch (err) {
            console.error('Simulation error:', err);
            setError(`Failed to trigger scenario: ${err.message}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Handle Dynamic Re-optimization
    const handleReoptimize = async () => {
        try {
            setIsLoading(true);
            const opt = await triggerOptimization(false);
            setOptimization(opt);
            const updated = await fetchNetworkState();
            setNetworkData(updated);
        }
        catch (err) {
            console.error('Optimization error:', err);
            setError(`Optimization failed: ${err.message}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Toggle vehicle breakdown
    const handleToggleVehicle = async (vehId) => {
        try {
            setIsLoading(true);
            await toggleVehicle(vehId);
            const updated = await fetchNetworkState();
            setNetworkData(updated);
            if (updated.last_optimization)
                setOptimization(updated.last_optimization);
        }
        catch (err) {
            console.error('Vehicle toggle error:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Toggle road closure
    const handleToggleRoad = async (roadId) => {
        try {
            setIsLoading(true);
            await toggleRoad(roadId);
            const updated = await fetchNetworkState();
            setNetworkData(updated);
            if (updated.last_optimization)
                setOptimization(updated.last_optimization);
        }
        catch (err) {
            console.error('Road toggle error:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Reset to Baseline
    const handleReset = async () => {
        await handleTriggerScenario('reset');
    };
    if (isLoading && !networkData) {
        return (_jsxs("div", { className: "min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black animate-pulse shadow-xl shadow-emerald-500/30 mb-4", children: _jsx(Bus, { className: "w-7 h-7 text-slate-950" }) }), _jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Initializing GRAMMOVE AI..." }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Loading Karnataka rural road network, synthetic student commute models & OR-Tools solvers." })] }));
    }
    const coverage = optimization?.coverage_percentage ?? 100;
    const scenarioName = networkData?.scenario_name || 'Morning Baseline';
    return (_jsxs("div", { className: "flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden", children: [_jsx(Sidebar, { activeTab: activeTab, setActiveTab: setActiveTab, disruptions: networkData?.disruptions || [], onReset: handleReset, scenarioName: scenarioName, coveragePercentage: coverage }), _jsxs("div", { className: "flex-1 flex flex-col h-screen overflow-hidden", children: [_jsxs("header", { className: "h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Network Operating Window:" }), _jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-slate-500" }), _jsx("span", { children: "07:15 AM \u2013 09:00 AM (Peak College Commute)" })] }), _jsx("span", { className: "text-xs text-slate-400", children: "|" }), _jsxs("span", { className: "text-xs font-medium text-slate-600", children: ["Sector: ", _jsx("b", { children: "Ramanagara District Rural Feeder Hub" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }), _jsxs("span", { children: [coverage.toFixed(1), "% Students On-Time"] })] }), _jsx("button", { onClick: loadState, className: "p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition", title: "Refresh Telemetry", children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] })] }), error && (_jsxs("div", { className: "bg-red-500 text-white px-6 py-2 text-xs flex items-center justify-between shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsx("span", { children: error })] }), _jsx("button", { onClick: loadState, className: "font-bold underline text-white hover:text-red-100 ml-4", children: "Retry" })] })), _jsxs("main", { className: "flex-1 p-6 overflow-y-auto", children: [activeTab === 'dashboard' && networkData && (_jsx(LiveMobilityDashboard, { locations: networkData.locations, roads: networkData.roads, vehicles: networkData.vehicles, students: networkData.students, disruptions: networkData.disruptions, optimization: optimization, onTriggerDisruption: handleTriggerScenario, onNavigateToTab: setActiveTab })), activeTab === 'map' && networkData && (_jsxs("div", { className: "h-[calc(100vh-140px)] flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-black text-lg text-slate-900 tracking-tight", children: "Rural Network Geographic Telemetry" }), _jsx("p", { className: "text-xs text-slate-500", children: "Real-time visual monitoring of buses, minibuses, shared autos, and dynamic rescue routes across Ramanagara district." })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("span", { className: "text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold", children: [networkData.locations.length, " Nodes | ", networkData.roads.length, " Roads | ", networkData.vehicles.length, " Fleet Units"] }) })] }), _jsx("div", { className: "flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner", children: _jsx(RuralNetworkMap, { locations: networkData.locations, roads: networkData.roads, vehicles: networkData.vehicles, optimization: optimization, onVehicleClick: handleToggleVehicle, onRoadClick: handleToggleRoad }) })] })), activeTab === 'rescue' && networkData && (_jsx(AIRescueEngineView, { optimization: optimization, vehicles: networkData.vehicles, students: networkData.students, onReoptimize: handleReoptimize, isLoading: isLoading })), activeTab === 'simulator' && networkData && (_jsx(CrisisSimulatorView, { vehicles: networkData.vehicles, roads: networkData.roads, disruptions: networkData.disruptions, scenarioName: scenarioName, onTriggerScenario: handleTriggerScenario, onToggleVehicle: handleToggleVehicle, onToggleRoad: handleToggleRoad, onReset: handleReset, isLoading: isLoading })), activeTab === 'manifest' && networkData && (_jsx(ManifestView, { students: networkData.students, vehicles: networkData.vehicles, onToggleVehicle: handleToggleVehicle })), activeTab === 'assistant' && (_jsx(AITravelAssistantView, { optimization: optimization, scenarioName: scenarioName }))] })] })] }));
}
export default App;
