import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { LiveMobilityDashboard } from './components/LiveMobilityDashboard';
import { RuralNetworkMap } from './components/RuralNetworkMap';
import { AIRescueEngineView } from './components/AIRescueEngineView';
import { CrisisSimulatorView } from './components/CrisisSimulatorView';
import { ManifestView } from './components/ManifestView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AITravelAssistantView } from './components/AITravelAssistantView';
import { SearchModal } from './components/SearchModal';
import { 
  fetchNetworkState, 
  triggerOptimization, 
  triggerSimulationScenario, 
  toggleVehicle, 
  toggleRoad 
} from './api';
import type { NetworkStateResponse, OptimizationResult } from './types';
import { AlertCircle, Bus } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [networkData, setNetworkData] = useState<NetworkStateResponse | null>(null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

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
    } catch (err: any) {
      console.error('Error fetching network:', err);
      setError('Backend API unavailable. Ensure FastAPI server is running on http://127.0.0.1:8000.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // Global Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Crisis Presets
  const handleTriggerScenario = async (scenarioType: string, params?: any) => {
    try {
      setIsLoading(true);
      const res = await triggerSimulationScenario(scenarioType, params);
      setOptimization(res.optimization);
      const updated = await fetchNetworkState();
      setNetworkData(updated);
    } catch (err: any) {
      console.error('Simulation error:', err);
      setError(`Failed to trigger scenario: ${err.message}`);
    } finally {
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
    } catch (err: any) {
      console.error('Optimization error:', err);
      setError(`Optimization failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle vehicle breakdown
  const handleToggleVehicle = async (vehId: string) => {
    try {
      setIsLoading(true);
      await toggleVehicle(vehId);
      const updated = await fetchNetworkState();
      setNetworkData(updated);
      if (updated.last_optimization) setOptimization(updated.last_optimization);
    } catch (err: any) {
      console.error('Vehicle toggle error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle road closure
  const handleToggleRoad = async (roadId: string) => {
    try {
      setIsLoading(true);
      await toggleRoad(roadId);
      const updated = await fetchNetworkState();
      setNetworkData(updated);
      if (updated.last_optimization) setOptimization(updated.last_optimization);
    } catch (err: any) {
      console.error('Road toggle error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to Baseline
  const handleReset = async () => {
    await handleTriggerScenario('reset');
  };

  // Handle Search Modal Actions
  const handleSearchAction = (actionType: string, id?: string) => {
    if (actionType === 'tab' && id) {
      setActiveTab(id);
    }
  };

  if (isLoading && !networkData) {
    return (
      <div className="min-h-screen bg-[#0b132b] flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black animate-pulse shadow-2xl shadow-emerald-500/40 mb-4">
          <Bus className="w-8 h-8 text-slate-950" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-white">INITIALIZING MOBILITY COMMAND CENTER</h2>
        <p className="text-xs text-slate-400 mt-1.5 font-mono">
          Connecting Karnataka rural road network, synthetic commuter graph & OR-Tools MIP solver...
        </p>
      </div>
    );
  }

  const coverage = optimization?.coverage_percentage ?? 100;
  const scenarioName = networkData?.scenario_name || 'Morning Baseline';

  return (
    <div className="flex h-screen bg-[#0b132b] text-slate-100 font-sans overflow-hidden">
      {/* Tactical Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        disruptions={networkData?.disruptions || []}
        onReset={handleReset}
        scenarioName={scenarioName}
        coveragePercentage={coverage}
      />

      {/* Main Command Center Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0e172f]">
        {/* Top Navigation Bar */}
        <TopNav
          scenarioName={scenarioName}
          disruptions={networkData?.disruptions || []}
          optimization={optimization}
          students={networkData?.students || []}
          vehicles={networkData?.vehicles || []}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateToTab={setActiveTab}
        />

        {/* Global Error Notice if any */}
        {error && (
          <div className="bg-red-950 border-b border-red-500/40 text-red-200 px-6 py-2 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadState}
              className="font-bold underline text-white hover:text-red-300 ml-4"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dynamic View Body */}
        <main className="flex-1 p-6 overflow-y-auto dark-scrollbar">
          {activeTab === 'overview' && networkData && (
            <LiveMobilityDashboard
              locations={networkData.locations}
              roads={networkData.roads}
              vehicles={networkData.vehicles}
              students={networkData.students}
              disruptions={networkData.disruptions}
              optimization={optimization}
              onTriggerDisruption={handleTriggerScenario}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'map' && networkData && (
            <div className="h-[calc(100vh-140px)] flex flex-col bg-[#111c38] p-4 rounded-xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="font-black text-lg text-white tracking-tight">
                    Rural Network Geographic Telemetry
                  </h1>
                  <p className="text-xs text-slate-400">
                    Real-time visual monitoring of buses, minibuses, shared autos, and dynamic rescue routes across Ramanagara district.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                    {networkData.locations.length} Nodes | {networkData.roads.length} Roads | {networkData.vehicles.length} Fleet Units
                  </span>
                </div>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
                <RuralNetworkMap
                  locations={networkData.locations}
                  roads={networkData.roads}
                  vehicles={networkData.vehicles}
                  optimization={optimization}
                  onVehicleClick={handleToggleVehicle}
                  onRoadClick={handleToggleRoad}
                />
              </div>
            </div>
          )}

          {activeTab === 'students' && networkData && (
            <ManifestView
              students={networkData.students}
              vehicles={networkData.vehicles}
              onToggleVehicle={handleToggleVehicle}
              defaultTab="students"
            />
          )}

          {activeTab === 'fleet' && networkData && (
            <ManifestView
              students={networkData.students}
              vehicles={networkData.vehicles}
              onToggleVehicle={handleToggleVehicle}
              defaultTab="fleet"
            />
          )}

          {activeTab === 'rescue' && networkData && (
            <AIRescueEngineView
              optimization={optimization}
              vehicles={networkData.vehicles}
              students={networkData.students}
              onReoptimize={handleReoptimize}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'simulator' && networkData && (
            <CrisisSimulatorView
              vehicles={networkData.vehicles}
              roads={networkData.roads}
              locations={networkData.locations}
              disruptions={networkData.disruptions}
              optimization={optimization}
              scenarioName={scenarioName}
              onTriggerScenario={handleTriggerScenario}
              onToggleVehicle={handleToggleVehicle}
              onToggleRoad={handleToggleRoad}
              onReset={handleReset}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'analytics' && networkData && (
            <AnalyticsView
              students={networkData.students}
              vehicles={networkData.vehicles}
              locations={networkData.locations}
              optimization={optimization}
            />
          )}

          {activeTab === 'settings' && networkData && (
            <SettingsView
              optimization={optimization}
              students={networkData.students}
              vehicles={networkData.vehicles}
              onReset={handleReset}
            />
          )}

          {activeTab === 'assistant' && (
            <AITravelAssistantView
              optimization={optimization}
              scenarioName={scenarioName}
            />
          )}
        </main>
      </div>

      {/* Global Command Palette / Search Modal */}
      {networkData && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          students={networkData.students}
          vehicles={networkData.vehicles}
          locations={networkData.locations}
          onSelectAction={handleSearchAction}
        />
      )}
    </div>
  );
}

export default App;
