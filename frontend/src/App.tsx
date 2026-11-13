import React, { useState, useEffect } from 'react';
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
import type { NetworkStateResponse } from './types';
import { Bus, AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedBusId, setSelectedBusId] = useState<string>('BUS-101');
  const [searchQuery, setSearchQuery] = useState<string>('Byramangala to Bidadi');
  const [searchOrigin, setSearchOrigin] = useState<string>('V2');
  const [searchDest, setSearchDest] = useState<string>('C3');
  const [selectedStopId, setSelectedStopId] = useState<string>('V1');
  const [networkData, setNetworkData] = useState<NetworkStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const loadState = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchNetworkState();
      setNetworkData(data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Unable to connect to live bus server. Please make sure the backend is active.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  const handleTrackBus = (busId: string) => {
    setSelectedBusId(busId);
    setActiveTab('tracker');
    setIsMobileMenuOpen(false);
  };

  const handleGlobalSearch = (query: string, originId?: string, destId?: string) => {
    // If it looks like a bus ID or registration, track directly
    const upper = query.toUpperCase();
    if (upper.startsWith('BUS-') || upper.startsWith('KA-') || upper.startsWith('MINI-') || upper.startsWith('AUTO-')) {
      setSelectedBusId(query);
      setActiveTab('tracker');
    } else {
      setSearchQuery(query);
      if (originId) setSearchOrigin(originId);
      if (destId) setSearchDest(destId);
      setActiveTab('search');
    }
    setIsMobileMenuOpen(false);
  };

  const handleSelectStop = (stopId: string) => {
    setSelectedStopId(stopId);
    setActiveTab('nearby');
    setIsMobileMenuOpen(false);
  };

  if (isLoading && !networkData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black animate-pulse shadow-xl shadow-blue-500/30 mb-4">
          <Bus className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Loading RouteFlow...</h2>
        <p className="text-xs text-slate-500 mt-1">
          Connecting to Ramanagara rural fleet GPS & live student route schedules.
        </p>
      </div>
    );
  }

  const activeBuses = networkData?.vehicles.filter(v => v.status !== 'breakdown').length || 11;
  const isCrisisActive = networkData?.scenario_name?.includes('CRISIS') || false;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex">
      {/* Desktop Sidebar matching RouteFlow Screenshots */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          unreadNotificationsCount={3}
          isCrisisActive={isCrisisActive}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-white h-full shadow-2xl z-10">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              unreadNotificationsCount={3}
              isCrisisActive={isCrisisActive}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <TopNav
          onSearch={handleGlobalSearch}
          activeBusesCount={activeBuses}
          unreadCount={3}
          onOpenNotifications={() => setActiveTab('notifications')}
          onOpenCrisis={() => setActiveTab('exam_crisis')}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="bg-amber-500 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadState}
              className="underline font-bold hover:text-amber-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Views Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* 1. Home View (Image 4 Top) */}
          {activeTab === 'home' && networkData && (
            <HomeView
              locations={networkData.locations}
              vehicles={networkData.vehicles}
              onSearchRoute={handleGlobalSearch}
              onTrackBus={handleTrackBus}
              onSelectStop={handleSelectStop}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* 2. Search Results View (Image 4 Bottom) */}
          {activeTab === 'search' && networkData && (
            <SearchResultsView
              initialQuery={searchQuery}
              initialOrigin={searchOrigin}
              initialDest={searchDest}
              locations={networkData.locations}
              vehicles={networkData.vehicles}
              onTrackBus={handleTrackBus}
              onNavigateHome={() => setActiveTab('home')}
            />
          )}

          {/* 3. Live Bus Tracker View (Image 2 Top & Bottom) */}
          {activeTab === 'tracker' && networkData && (
            <LiveBusTracker
              key={selectedBusId}
              initialBusId={selectedBusId}
              allVehicles={networkData.vehicles}
              allLocations={networkData.locations}
              onBackToResults={() => setActiveTab('search')}
              onNavigateSettings={() => setActiveTab('settings')}
            />
          )}

          {/* 4. Saved Routes View (Image 3 Top) */}
          {activeTab === 'saved' && (
            <SavedRoutesView
              onTrackBus={handleTrackBus}
              onNavigateSearch={() => setActiveTab('search')}
            />
          )}

          {/* 5. Nearby Stops View (Image 3 Bottom) */}
          {activeTab === 'nearby' && networkData && (
            <NearbyStopsView
              locations={networkData.locations}
              vehicles={networkData.vehicles}
              onSelectStop={handleSelectStop}
              onTrackBus={handleTrackBus}
            />
          )}

          {/* 6. Notifications View (Image 5 Top) */}
          {activeTab === 'notifications' && (
            <NotificationsView />
          )}

          {/* 7. Settings View (Image 5 Bottom) */}
          {activeTab === 'settings' && (
            <SettingsView onOpenAssistant={() => setActiveTab('assistant')} />
          )}

          {/* 8. AI Travel Assistant */}
          {activeTab === 'assistant' && (
            <AITravelAssistantView
              optimization={networkData?.last_optimization || null}
              scenarioName={networkData?.scenario_name || 'Regular Morning Commute'}
            />
          )}

          {/* 9. Exam Crisis Mode (The Surprise Hackathon Challenge Command Center) */}
          {activeTab === 'exam_crisis' && (
            <ExamCrisisCommandCenter
              initialNetworkData={networkData}
              onRefreshGlobalState={loadState}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}
        </main>

        {/* Clean RouteFlow Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
            <span className="font-semibold text-slate-700">
              RouteFlow • GRAMMOVE AI — Rural Student Transit Allocation & Tracking
            </span>
            <span className="text-slate-400">
              Serving Ramanagara, Channapatna & Kanakapura Rural Taluks • Student Helpline: 1800-425-KSRTC
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
