import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentHeader } from './components/StudentHeader';
import { LiveBusTracker } from './components/LiveBusTracker';
import { SmartTripPlanner } from './components/SmartTripPlanner';
import { BusStopsDirectory } from './components/BusStopsDirectory';
import { AITravelAssistantView } from './components/AITravelAssistantView';
import { ExamCrisisCommandCenter } from './components/ExamCrisisCommandCenter';
import { fetchNetworkState } from './api';
import { Bus, AlertCircle } from 'lucide-react';
export function App() {
    const [activeTab, setActiveTab] = useState('tracker');
    const [selectedBusId, setSelectedBusId] = useState('BUS-101');
    const [networkData, setNetworkData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadState = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchNetworkState();
            setNetworkData(data);
        }
        catch (err) {
            console.error('Error fetching data:', err);
            setError('Unable to connect to live bus server. Please make sure the backend is active.');
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadState();
    }, []);
    const handleTrackSpecificBus = (busId) => {
        setSelectedBusId(busId);
        setActiveTab('tracker');
    };
    if (isLoading && !networkData) {
        return (_jsxs("div", { className: "min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black animate-pulse shadow-xl shadow-emerald-500/30 mb-4", children: _jsx(Bus, { className: "w-8 h-8" }) }), _jsx("h2", { className: "text-xl font-black text-slate-900 tracking-tight", children: "Loading GRAMMOVE Bus Tracker..." }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Connecting to Ramanagara rural fleet GPS & live student route schedules." })] }));
    }
    const activeBuses = networkData?.vehicles.filter(v => v.status !== 'breakdown').length || 12;
    return (_jsxs("div", { className: "min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col", children: [_jsx(StudentHeader, { activeTab: activeTab, setActiveTab: setActiveTab, activeBusesCount: activeBuses }), error && (_jsxs("div", { className: "bg-amber-500 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsx("span", { children: error })] }), _jsx("button", { onClick: loadState, className: "underline font-bold hover:text-amber-100", children: "Retry" })] })), _jsxs("main", { className: "flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto", children: [activeTab === 'tracker' && networkData && (_jsx(LiveBusTracker, { initialBusId: selectedBusId, allVehicles: networkData.vehicles, allLocations: networkData.locations }, selectedBusId)), activeTab === 'planner' && networkData && (_jsx(SmartTripPlanner, { locations: networkData.locations, onTrackBus: handleTrackSpecificBus })), activeTab === 'stops' && networkData && (_jsx(BusStopsDirectory, { locations: networkData.locations, vehicles: networkData.vehicles, onTrackBus: handleTrackSpecificBus })), activeTab === 'assistant' && (_jsx(AITravelAssistantView, { optimization: networkData?.last_optimization || null, scenarioName: networkData?.scenario_name || 'Regular Morning Commute' })), activeTab === 'exam_crisis' && (_jsx(ExamCrisisCommandCenter, { initialNetworkData: networkData, onRefreshGlobalState: loadState, onNavigateTab: (tab) => setActiveTab(tab) }))] }), _jsx("footer", { className: "bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2", children: [_jsx("span", { className: "font-semibold text-slate-700", children: "GRAMMOVE AI \u2014 Smart Rural Student Bus Allocation & Tracking" }), _jsx("span", { className: "text-slate-400", children: "Serving Ramanagara, Channapatna & Kanakapura Rural Taluks \u2022 Student Helpline: 1800-425-KSRTC" })] }) })] }));
}
export default App;
