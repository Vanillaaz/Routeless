import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { HomeView } from './components/HomeView';
import { SearchResultsView } from './components/SearchResultsView';
import { LiveBusTracker } from './components/LiveBusTracker';
import { SavedRoutesView } from './components/SavedRoutesView';
import { NearbyStopsView } from './components/NearbyStopsView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { AITravelAssistantView } from './components/AITravelAssistantView';
import { ExamCrisisCommandCenter } from './components/ExamCrisisCommandCenter';
import { fetchNetworkState } from './api';
import { Bus, AlertCircle } from 'lucide-react';
export function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [selectedBusId, setSelectedBusId] = useState('BUS-101');
    const [searchQuery, setSearchQuery] = useState('Byramangala to Bidadi');
    const [selectedStopId, setSelectedStopId] = useState('V1');
    const [networkData, setNetworkData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    const handleTrackBus = (busId) => {
        setSelectedBusId(busId);
        setActiveTab('tracker');
        setIsMobileMenuOpen(false);
    };
    const handleGlobalSearch = (query) => {
        // If it looks like a bus ID or registration, track directly
        const upper = query.toUpperCase();
        if (upper.startsWith('BUS-') || upper.startsWith('KA-') || upper.startsWith('MINI-') || upper.startsWith('AUTO-')) {
            setSelectedBusId(query);
            setActiveTab('tracker');
        }
        else {
            setSearchQuery(query);
            setActiveTab('search');
        }
        setIsMobileMenuOpen(false);
    };
    const handleSelectStop = (stopId) => {
        setSelectedStopId(stopId);
        setActiveTab('nearby');
        setIsMobileMenuOpen(false);
    };
    if (isLoading && !networkData) {
        return (_jsxs("div", { className: "min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black animate-pulse shadow-xl shadow-blue-500/30 mb-4", children: _jsx(Bus, { className: "w-8 h-8" }) }), _jsx("h2", { className: "text-xl font-extrabold text-slate-900 tracking-tight", children: "Loading RouteFlow..." }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Connecting to Ramanagara rural fleet GPS & live student route schedules." })] }));
    }
    const activeBuses = networkData?.vehicles.filter(v => v.status !== 'breakdown').length || 11;
    const isCrisisActive = networkData?.scenario_name?.includes('CRISIS') || false;
    return (_jsxs("div", { className: "min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex", children: [_jsx("div", { className: "hidden md:block", children: _jsx(Sidebar, { activeTab: activeTab, setActiveTab: (tab) => {
                        setActiveTab(tab);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, unreadNotificationsCount: 3, isCrisisActive: isCrisisActive }) }), isMobileMenuOpen && (_jsxs("div", { className: "fixed inset-0 z-50 flex md:hidden", children: [_jsx("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity", onClick: () => setIsMobileMenuOpen(false) }), _jsx("div", { className: "relative w-64 bg-white h-full shadow-2xl z-10", children: _jsx(Sidebar, { activeTab: activeTab, setActiveTab: (tab) => {
                                setActiveTab(tab);
                                setIsMobileMenuOpen(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }, unreadNotificationsCount: 3, isCrisisActive: isCrisisActive }) })] })), _jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [_jsx(TopNav, { onSearch: handleGlobalSearch, activeBusesCount: activeBuses, unreadCount: 3, onOpenNotifications: () => setActiveTab('notifications'), onOpenCrisis: () => setActiveTab('exam_crisis'), onToggleMobileMenu: () => setIsMobileMenuOpen(!isMobileMenuOpen), isMobileMenuOpen: isMobileMenuOpen }), error && (_jsxs("div", { className: "bg-amber-500 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsx("span", { children: error })] }), _jsx("button", { onClick: loadState, className: "underline font-bold hover:text-amber-100", children: "Retry" })] })), _jsxs("main", { className: "flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto", children: [activeTab === 'home' && networkData && (_jsx(HomeView, { locations: networkData.locations, vehicles: networkData.vehicles, onSearchRoute: handleGlobalSearch, onTrackBus: handleTrackBus, onSelectStop: handleSelectStop, onNavigateTab: (tab) => setActiveTab(tab) })), activeTab === 'search' && networkData && (_jsx(SearchResultsView, { initialQuery: searchQuery, locations: networkData.locations, vehicles: networkData.vehicles, onTrackBus: handleTrackBus, onNavigateHome: () => setActiveTab('home') })), activeTab === 'tracker' && networkData && (_jsx(LiveBusTracker, { initialBusId: selectedBusId, allVehicles: networkData.vehicles, allLocations: networkData.locations, onBackToResults: () => setActiveTab('search') }, selectedBusId)), activeTab === 'saved' && (_jsx(SavedRoutesView, { onTrackBus: handleTrackBus, onNavigateSearch: () => setActiveTab('search') })), activeTab === 'nearby' && networkData && (_jsx(NearbyStopsView, { locations: networkData.locations, vehicles: networkData.vehicles, onSelectStop: handleSelectStop, onTrackBus: handleTrackBus })), activeTab === 'notifications' && (_jsx(NotificationsView, {})), activeTab === 'settings' && (_jsx(SettingsView, { onOpenAssistant: () => setActiveTab('assistant') })), activeTab === 'assistant' && (_jsx(AITravelAssistantView, { optimization: networkData?.last_optimization || null, scenarioName: networkData?.scenario_name || 'Regular Morning Commute' })), activeTab === 'exam_crisis' && (_jsx(ExamCrisisCommandCenter, { initialNetworkData: networkData, onRefreshGlobalState: loadState, onNavigateTab: (tab) => setActiveTab(tab) }))] }), _jsx("footer", { className: "bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500 mt-auto", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2", children: [_jsx("span", { className: "font-semibold text-slate-700", children: "RouteFlow \u2022 GRAMMOVE AI \u2014 Rural Student Transit Allocation & Tracking" }), _jsx("span", { className: "text-slate-400", children: "Serving Ramanagara, Channapatna & Kanakapura Rural Taluks \u2022 Student Helpline: 1800-425-KSRTC" })] }) })] })] }));
}
export default App;
