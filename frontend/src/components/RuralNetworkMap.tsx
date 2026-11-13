import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Location, RoadSegment, Vehicle, OptimizationResult, RoadStatus, VehicleStatus } from '../types';
import { Eye, EyeOff, Layers, Zap, AlertCircle } from 'lucide-react';

interface RuralNetworkMapProps {
  locations: Location[];
  roads: RoadSegment[];
  vehicles: Vehicle[];
  optimization: OptimizationResult | null;
  onVehicleClick?: (vehicleId: string) => void;
  onRoadClick?: (roadId: string) => void;
  onLocationClick?: (locationId: string) => void;
}

export const RuralNetworkMap: React.FC<RuralNetworkMapProps> = ({
  locations,
  roads,
  vehicles,
  optimization,
  onVehicleClick,
  onRoadClick,
  onLocationClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer filter states
  const [showVehicles, setShowVehicles] = useState(true);
  const [showVillages, setShowVillages] = useState(true);
  const [showColleges, setShowColleges] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showRescueRoutes, setShowRescueRoutes] = useState(true);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Ramanagara / Channapatna / Bidadi cluster
    const map = L.map(mapContainerRef.current, {
      center: [12.715, 77.295],
      zoom: 11,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors | GRAMMOVE AI'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Map Markers & Polylines whenever data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const locMap = new Map<string, Location>(locations.map(l => [l.id, l]));

    // 1. Draw Road Network
    if (showRoads) {
      roads.forEach(road => {
        const fromLoc = locMap.get(road.from_node);
        const toLoc = locMap.get(road.to_node);
        if (!fromLoc || !toLoc) return;

        const isClosed = road.status === RoadStatus.CLOSED;
        const isCongested = road.status === RoadStatus.CONGESTED;

        const polyline = L.polyline(
          [
            [fromLoc.lat, fromLoc.lng],
            [toLoc.lat, toLoc.lng]
          ],
          {
            color: isClosed ? '#ef4444' : isCongested ? '#f59e0b' : '#94a3b8',
            weight: isClosed ? 5 : isCongested ? 4 : 2.5,
            dashArray: isClosed ? '8, 8' : isCongested ? '4, 4' : undefined,
            opacity: isClosed ? 0.95 : 0.65
          }
        );

        polyline.bindPopup(`
          <div class="p-2 text-slate-900 font-sans">
            <div class="font-bold text-sm flex items-center gap-1.5 ${isClosed ? 'text-red-600' : 'text-slate-800'}">
              ${isClosed ? '⛔ ROAD CLOSED' : isCongested ? '⚠️ CONGESTED' : '🛣️ ROAD'}: ${road.name}
            </div>
            <div class="text-xs text-slate-600 mt-1">
              Length: <b>${road.distance_km} km</b> | Typical Time: <b>${road.travel_time_mins} mins</b>
            </div>
            <div class="text-xs text-slate-500 mt-0.5">
              Connects: ${fromLoc.name} ↔ ${toLoc.name}
            </div>
          </div>
        `);

        if (onRoadClick) {
          polyline.on('click', () => onRoadClick(road.id));
        }

        layerGroup.addLayer(polyline);
      });
    }

    // 2. Draw Dynamic AI Rescue Routes (Emerald Glow Lines)
    if (showRescueRoutes && optimization && optimization.assignments) {
      optimization.assignments.forEach(assign => {
        if (!assign.is_rescue_mission || !assign.route_path_coordinates || assign.route_path_coordinates.length < 2) {
          return;
        }

        const rescuePolyline = L.polyline(
          assign.route_path_coordinates,
          {
            color: '#10b981',
            weight: 5,
            opacity: 0.95,
            className: 'rescue-glow'
          }
        );

        rescuePolyline.bindPopup(`
          <div class="p-2.5 text-slate-900 font-sans">
            <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ⚡ ACTIVE AI RESCUE MISSION
            </div>
            <div class="font-bold text-sm text-slate-900 mt-1">
              ${assign.vehicle_name}
            </div>
            <div class="text-xs text-slate-700 mt-1 space-y-0.5">
              <div>Type: <b class="capitalize">${assign.vehicle_type.replace('_', ' ')}</b></div>
              <div>Rescued Students: <b class="text-emerald-700 font-bold">${assign.assigned_count}/${assign.capacity} seats</b></div>
              <div>Pickups: <b>${assign.pickup_stops.join(', ')}</b></div>
              <div>Dropoffs: <b>${assign.dropoff_stops.join(', ')}</b></div>
              <div>ETA: <b>${assign.eta_minutes} mins</b></div>
            </div>
          </div>
        `);

        layerGroup.addLayer(rescuePolyline);
      });
    }

    // 3. Draw Locations (Villages, Colleges, Junctions)
    locations.forEach(loc => {
      if (loc.type === 'village' && !showVillages) return;
      if (loc.type === 'college' && !showColleges) return;
      if (loc.type === 'junction') return;

      const isCollege = loc.type === 'college';
      
      const iconHtml = isCollege
        ? `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold shadow-lg border-2 border-white text-xs">🎓</div>`
        : `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white font-bold shadow-md border-2 border-white text-[11px]">${loc.student_demand}</div>`;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-map-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

      marker.bindPopup(`
        <div class="p-2 text-slate-900 font-sans">
          <div class="font-bold text-sm ${isCollege ? 'text-indigo-700' : 'text-amber-800'}">
            ${isCollege ? '🎓 Hub' : '🏡 Village'}: ${loc.name}
          </div>
          <div class="text-xs text-slate-600 mt-1">
            Taluk: <b>${loc.taluk}</b>
          </div>
          ${!isCollege ? `<div class="text-xs text-slate-700 mt-0.5">Morning Student Demand: <b>${loc.student_demand} students</b></div>` : ''}
          <div class="text-xs text-slate-500 mt-1 italic">${loc.description}</div>
        </div>
      `);

      if (onLocationClick) {
        marker.on('click', () => onLocationClick(loc.id));
      }

      layerGroup.addLayer(marker);
    });

    // 4. Draw Vehicles
    if (showVehicles) {
      vehicles.forEach(veh => {
        const loc = locMap.get(veh.current_location_id);
        if (!loc) return;

        // Slight random offset if multiple vehicles are at same location
        const offsetLat = (Math.sin(veh.id.charCodeAt(veh.id.length - 1)) * 0.003);
        const offsetLng = (Math.cos(veh.id.charCodeAt(veh.id.length - 1)) * 0.003);
        const lat = loc.lat + offsetLat;
        const lng = loc.lng + offsetLng;

        const isBreakdown = veh.status === VehicleStatus.BREAKDOWN;
        const isRescue = veh.status === VehicleStatus.ASSIGNED_RESCUE;

        let iconSymbol = '🚌';
        let bgColor = 'bg-blue-600';
        if (veh.type === 'minibus') {
          iconSymbol = '🚐';
          bgColor = 'bg-teal-600';
        } else if (veh.type === 'shared_auto') {
          iconSymbol = '🛺';
          bgColor = 'bg-amber-600';
        }

        if (isBreakdown) {
          bgColor = 'bg-red-600 broken-pulse';
          iconSymbol = '💥';
        } else if (isRescue) {
          bgColor = 'bg-emerald-600 rescue-glow';
        }

        const vehIcon = L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 rounded-xl ${bgColor} text-white font-bold shadow-xl border-2 border-white text-sm cursor-pointer hover:scale-110 transition-transform">${iconSymbol}</div>`,
          className: 'custom-map-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        const marker = L.marker([lat, lng], { icon: vehIcon });

        marker.bindPopup(`
          <div class="p-2 text-slate-900 font-sans min-w-[200px]">
            <div class="font-bold text-sm flex items-center justify-between">
              <span>${veh.name}</span>
            </div>
            <div class="mt-1 flex items-center gap-1.5">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                isBreakdown ? 'bg-red-100 text-red-700' : isRescue ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }">
                ${veh.status.replace('_', ' ')}
              </span>
              <span class="text-xs text-slate-600 capitalize">(${veh.type.replace('_', ' ')})</span>
            </div>
            <div class="text-xs text-slate-700 mt-2 space-y-0.5">
              <div>Capacity: <b>${veh.current_occupancy}/${veh.capacity} seats</b></div>
              <div>Stationed at: <b>${veh.current_location_name}</b></div>
              <div>Driver: <b>${veh.driver_name}</b> (${veh.driver_phone})</div>
            </div>
          </div>
        `);

        if (onVehicleClick) {
          marker.on('click', () => onVehicleClick(veh.id));
        }

        layerGroup.addLayer(marker);
      });
    }

  }, [locations, roads, vehicles, optimization, showVehicles, showVillages, showColleges, showRoads, showRescueRoutes]);

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200">
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Layer Toggles & Legend Bar */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 border-b border-slate-100 pb-1">
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          <span>Interactive Map Controls</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowVehicles(!showVehicles)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition ${
              showVehicles ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {showVehicles ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Vehicles
          </button>
          <button
            onClick={() => setShowVillages(!showVillages)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition ${
              showVillages ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {showVillages ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Villages
          </button>
          <button
            onClick={() => setShowColleges(!showColleges)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition ${
              showColleges ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {showColleges ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Colleges
          </button>
          <button
            onClick={() => setShowRoads(!showRoads)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition ${
              showRoads ? 'bg-slate-200 text-slate-800 border border-slate-400' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {showRoads ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Roads
          </button>
          <button
            onClick={() => setShowRescueRoutes(!showRescueRoutes)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition ${
              showRescueRoutes ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Zap className="w-3 h-3 text-emerald-600" />
            AI Rescue Routes
          </button>
        </div>
      </div>

      {/* Floating Map Legend Indicator */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-lg shadow-lg border border-slate-700/80 text-[11px] flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Govt Bus (55)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
          <span>Minibus (22)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Auto (8)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>Breakdown / Block</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-3 h-1 bg-emerald-400 rounded-sm" />
          <span>AI Rescue Route</span>
        </div>
      </div>
    </div>
  );
};
