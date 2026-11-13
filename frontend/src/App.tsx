import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LiveMobilityDashboard } from './components/LiveMobilityDashboard';
import { RuralNetworkMap } from './components/RuralNetworkMap';
import { AIRescueEngineView } from './components/AIRescueEngineView';
import { CrisisSimulatorView } from './components/CrisisSimulatorView';
import { ManifestView } from './components/ManifestView';
import { AITravelAssistantView } from './components/AITravelAssistantView';
import { 
  fetchNetworkState, 
  triggerOptimization, 
  triggerSimulationScenario, 
  toggleVehicle, 
  toggleRoad 
} from './api';
import { NetworkStateResponse, OptimizationResult } from './types';
import { AlertCircle, RefreshCw, Clock, Bus, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [networkData, setNetworkData] = useState<NetworkStateResponse | null>(null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Handle Crisis Presets
  const handleTriggerScenario = async (scenarioType: string, params?: any) => {
    try {
      setIsLoading(true);
      const res = await triggerSimulationScenario(scenarioType, params);
      setOptimization(res.optimization);
      // Refresh network state
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

  if (isLoading && !networkData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black animate-pulse shadow-xl shadow-emerald-500/30 mb-4">
          <Bus className="w-7 h-7 text-slate-950" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Initializing GRAMMOVE AI...</h2>
        <p className="text-xs text-slate-400 mt-1">
          Loading Karnataka rural road network, synthetic student commute models & OR-Tools solvers.
        </p>
      </div>
    );
  }

  const coverage = optimization?.coverage_percentage ?? 100;
  const scenarioName = networkData?.scenario_name || 'Morning Baseline';

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      {/* Dark Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        disruptions={networkData?.disruptions || []}
        onReset={handleReset}
        scenarioName={scenarioName}
        coveragePercentage={coverage}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Network Operating Window:
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>07:15 AM – 09:00 AM (Peak College Commute)</span>
            </div>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-medium text-slate-600">
              Sector: <b>Ramanagara District Rural Feeder Hub</b>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{coverage.toFixed(1)}% Students On-Time</span>
            </div>

            <button
              onClick={loadState}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global Error Banner (if any) */}
        {error && (
          <div className="bg-red-500 text-white px-6 py-2 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadState}
              className="font-bold underline text-white hover:text-red-100 ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && networkData && (
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
            <div className="h-[calc(100vh-140px)] flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="font-black text-lg text-slate-900 tracking-tight">
                    Rural Network Geographic Telemetry
                  </h1>
                  <p className="text-xs text-slate-500">
                    Real-time visual monitoring of buses, minibuses, shared autos, and dynamic rescue routes across Ramanagara district.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold">
                    {networkData.locations.length} Nodes | {networkData.roads.length} Roads | {networkData.vehicles.length} Fleet Units
                  </span>
                </div>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
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
              disruptions={networkData.disruptions}
              scenarioName={scenarioName}
              onTriggerScenario={handleTriggerScenario}
              onToggleVehicle={handleToggleVehicle}
              onToggleRoad={handleToggleRoad}
              onReset={handleReset}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'manifest' && networkData && (
            <ManifestView
              students={networkData.students}
              vehicles={networkData.vehicles}
              onToggleVehicle={handleToggleVehicle}
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
    </div>
  );
}

export default App;
