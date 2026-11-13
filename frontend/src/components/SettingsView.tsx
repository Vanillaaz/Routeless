import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Sliders, 
  Cpu, 
  Save, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  Sparkles,
  MapPin
} from 'lucide-react';
import type { OptimizationResult, Student, Vehicle } from '../types';

interface SettingsProps {
  optimization: OptimizationResult | null;
  students: Student[];
  vehicles: Vehicle[];
  onReset: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({
  optimization,
  students,
  vehicles,
  onReset
}) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('GRAMMOVE_GEMINI_API_KEY') || '');
  const [isSaved, setIsSaved] = useState(false);
  const [priorityMode, setPriorityMode] = useState<'max_students' | 'min_time' | 'balanced'>('max_students');
  const [maxDetourMins, setMaxDetourMins] = useState<number>(75);
  const [allowAutos, setAllowAutos] = useState<boolean>(true);
  const [selectedTaluk, setSelectedTaluk] = useState<string>('Ramanagara');

  const handleSaveApiKey = () => {
    localStorage.setItem('GRAMMOVE_GEMINI_API_KEY', apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportData = () => {
    const exportPayload = {
      timestamp: new Date().toISOString(),
      taluk: selectedTaluk,
      total_students: students.length,
      total_vehicles: vehicles.length,
      optimization: optimization,
      students: students,
      vehicles: vehicles
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grammove_telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-slate-100 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#111c38] p-5 rounded-xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Command Center Configuration & Solver Settings
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage optimization weights, API secrets, and telemetry preferences.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400">
          v1.0-PRODUCTION
        </span>
      </div>

      {/* Setting Section 1: AI & Gemini API Configuration */}
      <div className="bg-[#111c38] p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Google Gemini API Authentication</h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
            Gemini 2.5 Flash
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Provide a Google Gemini API key to enable live dynamic natural-language interpretation in the AI Travel Assistant. If left blank, the system automatically runs on the built-in intelligent deterministic reasoning engine grounded in OR-Tools solver telemetry.
        </p>

        <div className="flex items-center gap-3">
          <input
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSaveApiKey}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Saved!' : 'Save Key'}</span>
          </button>
        </div>
      </div>

      {/* Setting Section 2: Mathematical Solver Parameters */}
      <div className="bg-[#111c38] p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Google OR-Tools Optimization Parameters</h2>
        </div>

        {/* Priority Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Objective Priority Strategy</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPriorityMode('max_students')}
              className={`p-3 rounded-xl border text-xs text-left transition ${
                priorityMode === 'max_students'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white">Max Students Transported</div>
              <div className="text-[10px] text-slate-400 mt-1">Weight: 1000x per student. Refuses to leave any student stranded.</div>
            </button>

            <button
              onClick={() => setPriorityMode('balanced')}
              className={`p-3 rounded-xl border text-xs text-left transition ${
                priorityMode === 'balanced'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white">Balanced Operation</div>
              <div className="text-[10px] text-slate-400 mt-1">Balances total students transported with travel delay penalties.</div>
            </button>

            <button
              onClick={() => setPriorityMode('min_time')}
              className={`p-3 rounded-xl border text-xs text-left transition ${
                priorityMode === 'min_time'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-white">Minimum Travel Delay</div>
              <div className="text-[10px] text-slate-400 mt-1">Minimizes detour times to ensure early campus arrival.</div>
            </button>
          </div>
        </div>

        {/* Max Detour Slider */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-300">Max Permissible Commute Time:</span>
            <span className="text-emerald-400 font-mono font-bold">{maxDetourMins} minutes</span>
          </div>
          <input
            type="range"
            min="30"
            max="120"
            step="5"
            value={maxDetourMins}
            onChange={(e) => setMaxDetourMins(Number(e.target.value))}
            className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>30 mins (Direct Only)</span>
            <span>75 mins (Default SLA)</span>
            <span>120 mins (Max Deep Rural)</span>
          </div>
        </div>

        {/* Shared Auto Tactical Dispatch Switch */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-200">Shared Auto Tactical Dispatch</div>
            <div className="text-[11px] text-slate-400">Allow 8-seater Gramina Mitra autos for rapid last-mile rescue.</div>
          </div>
          <button
            onClick={() => setAllowAutos(!allowAutos)}
            className={`w-12 h-6 rounded-full transition relative ${allowAutos ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition ${allowAutos ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Setting Section 3: Data Export & Reset */}
      <div className="bg-[#111c38] p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white">Data Governance & Export</h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Full Telemetry JSON</span>
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Network to Initial State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
