import React, { useState, useEffect } from 'react';
import { StudentHeader } from './components/StudentHeader';
import { LiveBusTracker } from './components/LiveBusTracker';
import { SmartTripPlanner } from './components/SmartTripPlanner';
import { BusStopsDirectory } from './components/BusStopsDirectory';
import { AITravelAssistantView } from './components/AITravelAssistantView';
import { fetchNetworkState } from './api';
import type { NetworkStateResponse } from './types';
import { Bus, AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('tracker');
  const [selectedBusId, setSelectedBusId] = useState<string>('BUS-101');
  const [networkData, setNetworkData] = useState<NetworkStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleTrackSpecificBus = (busId: string) => {
    setSelectedBusId(busId);
    setActiveTab('tracker');
  };

  if (isLoading && !networkData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black animate-pulse shadow-xl shadow-emerald-500/30 mb-4">
          <Bus className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Loading GRAMMOVE Bus Tracker...</h2>
        <p className="text-xs text-slate-500 mt-1">
          Connecting to Ramanagara rural fleet GPS & live student route schedules.
        </p>
      </div>
    );
  }

  const activeBuses = networkData?.vehicles.filter(v => v.status !== 'breakdown').length || 12;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Student Friendly Header */}
      <StudentHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeBusesCount={activeBuses}
      />

      {/* Global Error Banner (if any) */}
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

      {/* Main Student Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {activeTab === 'tracker' && networkData && (
          <LiveBusTracker
            key={selectedBusId}
            initialBusId={selectedBusId}
            allVehicles={networkData.vehicles}
            allLocations={networkData.locations}
          />
        )}

        {activeTab === 'planner' && networkData && (
          <SmartTripPlanner
            locations={networkData.locations}
            onTrackBus={handleTrackSpecificBus}
          />
        )}

        {activeTab === 'stops' && networkData && (
          <BusStopsDirectory
            locations={networkData.locations}
            vehicles={networkData.vehicles}
            onTrackBus={handleTrackSpecificBus}
          />
        )}

        {activeTab === 'assistant' && (
          <AITravelAssistantView
            optimization={networkData?.last_optimization || null}
            scenarioName={networkData?.scenario_name || 'Regular Morning Commute'}
          />
        )}
      </main>

      {/* Clean Student-Friendly Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <span className="font-semibold text-slate-700">
            GRAMMOVE AI — Smart Rural Student Bus Allocation & Tracking
          </span>
          <span className="text-slate-400">
            Serving Ramanagara, Channapatna & Kanakapura Rural Taluks • Student Helpline: 1800-425-KSRTC
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
