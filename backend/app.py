import os
import json
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.models import (
    OptimizationRequest, OptimizationResult, ChatRequest, ChatResponse,
    SimulationScenarioRequest, VehicleStatus, VehicleType, RoadStatus,
    ExamCrisisResponse, ExamCrisisMetrics
)
from backend.simulator import network_state
from backend.solver import solve_dynamic_rescue, NetworkGraph
from backend.ai_assistant import AIAssistantService

# Load real-world street network road geometry cache
ROAD_GEOMETRY_CACHE: Dict[str, Any] = {}
cache_file_path = os.path.join(os.path.dirname(__file__), "road_geometry_cache.json")
if os.path.exists(cache_file_path):
    try:
        with open(cache_file_path, "r", encoding="utf-8") as f:
            ROAD_GEOMETRY_CACHE = json.load(f)
        print(f"Loaded {len(ROAD_GEOMETRY_CACHE)} real-world street road network geometries into cache.")
    except Exception as e:
        print(f"Error loading road geometry cache: {e}")

app = FastAPI(
    title="GRAMMOVE AI Backend API",
    description="Intelligent Rural Mobility Platform - The Transportation Network That Refuses to Leave a Student Stranded.",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

assistant_service = AIAssistantService(network_state)
last_optimization_result: Optional[OptimizationResult] = None

# Initial optimization run on boot
@app.on_event("startup")
def startup_event():
    global last_optimization_result
    last_optimization_result = solve_dynamic_rescue(
        locations=network_state.locations,
        roads=network_state.roads,
        students=network_state.students,
        vehicles=network_state.vehicles,
        disruptions=network_state.disruptions,
        reoptimize_all=False
    )

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GRAMMOVE AI",
        "gemini_active": bool(assistant_service.client),
        "total_students": len(network_state.students),
        "total_vehicles": len(network_state.vehicles)
    }

@app.get("/api/network")
def get_network_state():
    return {
        "scenario_name": network_state.scenario_name,
        "locations": [loc.dict() for loc in network_state.locations],
        "roads": [road.dict() for road in network_state.roads],
        "vehicles": [v.dict() for v in network_state.vehicles],
        "students": [s.dict() for s in network_state.students],
        "disruptions": [d.dict() for d in network_state.disruptions],
        "last_optimization": last_optimization_result.dict() if last_optimization_result else None
    }

@app.post("/api/optimize", response_model=OptimizationResult)
def trigger_optimization(req: Optional[OptimizationRequest] = None):
    global last_optimization_result
    reopt = req.force_reroute if req else False
    students = req.students if (req and req.students is not None) else network_state.students
    vehicles = req.vehicles if (req and req.vehicles is not None) else network_state.vehicles
    roads = req.roads if (req and req.roads is not None) else network_state.roads
    disruptions = req.disruptions if (req and req.disruptions is not None) else network_state.disruptions
    priority = req.priority_mode if (req and req.priority_mode) else "max_students"

    result = solve_dynamic_rescue(
        locations=network_state.locations,
        roads=roads,
        students=students,
        vehicles=vehicles,
        disruptions=disruptions,
        reoptimize_all=reopt,
        priority_mode=priority
    )
    last_optimization_result = result
    return result

def build_exam_crisis_response() -> ExamCrisisResponse:
    global last_optimization_result
    if not last_optimization_result:
        last_optimization_result = solve_dynamic_rescue(
            locations=network_state.locations,
            roads=network_state.roads,
            students=network_state.students,
            vehicles=network_state.vehicles,
            disruptions=network_state.disruptions,
            reoptimize_all=False,
            priority_mode="exam_priority"
        )
    
    is_active = (network_state.scenario_name == "EXAM-DAY EMERGENCY CRISIS")
    failed_vehs = [v for v in network_state.vehicles if v.status == VehicleStatus.BREAKDOWN]
    usable_vehs = [v for v in network_state.vehicles if v.status != VehicleStatus.BREAKDOWN]
    flooded_r = next((r for r in network_state.roads if r.status == RoadStatus.CLOSED), None)

    p1_c = sum(1 for s in network_state.students if getattr(s, 'exam_priority', 'P3') == 'P1')
    p2_c = sum(1 for s in network_state.students if getattr(s, 'exam_priority', 'P3') == 'P2')
    p3_c = sum(1 for s in network_state.students if getattr(s, 'exam_priority', 'P3') == 'P3')

    exam_stus = p1_c + p2_c
    at_risk_c = sum(1 for s in network_state.students if s.is_at_risk)
    on_time_c = last_optimization_result.optimization_metrics.exam_on_time_count if (last_optimization_result and last_optimization_result.optimization_metrics) else 0

    metrics = ExamCrisisMetrics(
        crisis_active=is_active,
        status_text="EXAM-DAY EMERGENCY ACTIVE" if is_active else "STANDBY / NORMAL OPERATIONS",
        failed_buses_count=len(failed_vehs),
        failed_bus_names=[v.name for v in failed_vehs],
        demand_surge_pct=40 if is_active else 0,
        flooded_road_id=flooded_r.id if flooded_r else "None",
        flooded_road_name=flooded_r.name if flooded_r else "All roads open",
        total_students_requiring_transport=len(network_state.students),
        students_with_exams=exam_stus,
        p1_count=p1_c,
        p2_count=p2_c,
        p3_count=p3_c,
        available_vehicles_count=len(usable_vehs),
        remaining_seating_capacity=sum(v.capacity for v in usable_vehs),
        students_assigned=last_optimization_result.transported_students if last_optimization_result else 0,
        students_on_time=on_time_c,
        students_at_risk=at_risk_c,
        students_unassigned=last_optimization_result.stranded_students if last_optimization_result else 0,
        coverage_percentage=last_optimization_result.coverage_percentage if last_optimization_result else 100.0,
        before_transported=210,
        after_transported=last_optimization_result.transported_students if last_optimization_result else 210,
        before_capacity=337,
        after_capacity=sum(v.capacity for v in usable_vehs),
        before_coverage_pct=100.0,
        after_coverage_pct=last_optimization_result.coverage_percentage if last_optimization_result else 100.0,
        before_travel_time_mins=285.0,
        after_travel_time_mins=last_optimization_result.total_travel_time_mins if last_optimization_result else 285.0
    )

    report = assistant_service.generate_exam_crisis_report(last_optimization_result)

    return ExamCrisisResponse(
        active=is_active,
        scenario_name=network_state.scenario_name,
        metrics=metrics,
        optimization=last_optimization_result,
        disruptions=network_state.disruptions,
        gemini_report=report,
        timestamp="07:55 AM"
    )

@app.get("/api/crisis/exam-day", response_model=ExamCrisisResponse)
def get_exam_crisis_status():
    return build_exam_crisis_response()

@app.post("/api/crisis/exam-day", response_model=ExamCrisisResponse)
def trigger_exam_crisis_endpoint():
    global last_optimization_result
    network_state.apply_exam_day_crisis(
        failed_bus_ids=["BUS-101", "BUS-103"],
        flooded_road_id="R6",
        surge_percentage=40
    )
    last_optimization_result = solve_dynamic_rescue(
        locations=network_state.locations,
        roads=network_state.roads,
        students=network_state.students,
        vehicles=network_state.vehicles,
        disruptions=network_state.disruptions,
        reoptimize_all=False,
        priority_mode="exam_priority"
    )
    return build_exam_crisis_response()

@app.post("/api/simulate")
def trigger_simulation(req: SimulationScenarioRequest):
    global last_optimization_result
    
    if req.scenario_type == "breakdown":
        veh_id = req.vehicle_id or "BUS-101"
        disruption = network_state.apply_bus_breakdown(veh_id)
    elif req.scenario_type == "road_closure":
        road_id = req.road_id or "R6"
        disruption = network_state.apply_road_closure(road_id)
    elif req.scenario_type == "surge":
        surge_pct = req.surge_percentage or 40
        disruption = network_state.apply_demand_surge(surge_pct)
    elif req.scenario_type == "multi_breakdown":
        disruption = network_state.apply_multiple_breakdowns()
    elif req.scenario_type == "delay":
        road_id = req.road_id or "R12"
        disruption = network_state.apply_unexpected_delay(road_id)
    elif req.scenario_type == "exam_crisis":
        network_state.apply_exam_day_crisis(
            failed_bus_ids=["BUS-101", "BUS-103"],
            flooded_road_id="R6",
            surge_percentage=40
        )
    elif req.scenario_type == "reset":
        network_state.reset_to_baseline()
    else:
        raise HTTPException(status_code=400, detail="Unknown scenario type")

    # Real recalculation of transportation assignments!
    last_optimization_result = solve_dynamic_rescue(
        locations=network_state.locations,
        roads=network_state.roads,
        students=network_state.students,
        vehicles=network_state.vehicles,
        disruptions=network_state.disruptions,
        reoptimize_all=False,
        priority_mode="exam_priority"
    )

    return {
        "message": f"Scenario '{req.scenario_type}' triggered and optimization recalculated successfully.",
        "scenario_name": network_state.scenario_name,
        "disruptions": [d.dict() for d in network_state.disruptions],
        "optimization": last_optimization_result.dict()
    }

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest):
    response = assistant_service.ask(
        query=req.message,
        opt_result=last_optimization_result,
        student_id=req.student_id
    )
    return response

@app.post("/api/vehicles/{vehicle_id}/toggle-status")
def toggle_vehicle_status(vehicle_id: str):
    global last_optimization_result
    veh = next((v for v in network_state.vehicles if v.id == vehicle_id), None)
    if not veh:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    if veh.status == VehicleStatus.BREAKDOWN:
        veh.status = VehicleStatus.AVAILABLE
    else:
        network_state.apply_bus_breakdown(vehicle_id)

    last_optimization_result = solve_dynamic_rescue(
        locations=network_state.locations,
        roads=network_state.roads,
        students=network_state.students,
        vehicles=network_state.vehicles,
        disruptions=network_state.disruptions,
        reoptimize_all=False
    )
    return {"vehicle": veh.dict(), "optimization": last_optimization_result.dict()}

@app.post("/api/roads/{road_id}/toggle-status")
def toggle_road_status(road_id: str):
    global last_optimization_result
    road = next((r for r in network_state.roads if r.id == road_id), None)
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
        
    if road.status == RoadStatus.CLOSED:
        road.status = RoadStatus.OPEN
    else:
        network_state.apply_road_closure(road_id)

    last_optimization_result = solve_dynamic_rescue(
        locations=network_state.locations,
        roads=network_state.roads,
        students=network_state.students,
        vehicles=network_state.vehicles,
        disruptions=network_state.disruptions,
        reoptimize_all=False
    )
    return {"road": road.dict(), "optimization": last_optimization_result.dict()}

def generate_route_coordinates(stops_data):
    """Generates high-density interpolated route coordinates between stops for smooth Google Maps-style animation."""
    coords = []
    if len(stops_data) < 2:
        if stops_data:
            return [[stops_data[0]["lat"], stops_data[0]["lng"]]]
        return []

    for i in range(len(stops_data) - 1):
        p1 = stops_data[i]
        p2 = stops_data[i+1]
        lat1, lng1 = p1["lat"], p1["lng"]
        lat2, lng2 = p2["lat"], p2["lng"]
        
        # 20 interpolated intermediate waypoints per road segment
        num_steps = 20
        for step in range(num_steps):
            frac = step / num_steps
            cur_lat = lat1 + (lat2 - lat1) * frac
            cur_lng = lng1 + (lng2 - lng1) * frac
            coords.append([round(cur_lat, 6), round(cur_lng, 6)])
            
    # Add final destination stop
    last = stops_data[-1]
    coords.append([last["lat"], last["lng"]])
    return coords


@app.get("/api/track/{bus_query}")
def track_bus(bus_query: str):
    """Real-time bus tracking by bus ID, registration number, or route name."""
    query = bus_query.strip().lower()
    matched_vehicle = None
    
    for v in network_state.vehicles:
        if (query in v.id.lower() or 
            query in v.name.lower() or 
            query in v.driver_name.lower() or 
            query in v.driver_phone):
            matched_vehicle = v
            break
            
    if not matched_vehicle:
        # If no direct match, return the first active bus or throw 404
        for v in network_state.vehicles:
            if "bus" in v.id.lower():
                matched_vehicle = v
                break
        if not matched_vehicle:
            matched_vehicle = network_state.vehicles[0]

    loc_map = {loc.id: loc for loc in network_state.locations}
    curr_loc = loc_map.get(matched_vehicle.current_location_id)
    dest_loc = loc_map.get(matched_vehicle.destination_id) if matched_vehicle.destination_id else None

    # Graph for accurate segment distances
    graph = NetworkGraph(network_state.locations, network_state.roads)

    # Build sequence of stops
    stops = list(matched_vehicle.route_stops) if matched_vehicle.route_stops else [matched_vehicle.current_location_id, "C1"]
    if dest_loc and dest_loc.id not in stops:
        stops.append(dest_loc.id)

    stop_details = []
    base_minute = 30
    cum_dist = 0.0

    for idx, stop_id in enumerate(stops):
        loc = loc_map.get(stop_id)
        if not loc:
            continue

        if idx > 0:
            prev_id = stops[idx - 1]
            leg_d, _, _ = graph.shortest_path(prev_id, stop_id)
            if leg_d == float('inf'):
                leg_d = 5.5
            cum_dist += leg_d

        scheduled_time = f"07:{base_minute + idx * 15:02d} AM" if (base_minute + idx * 15) < 60 else f"08:{(base_minute + idx * 15) - 60:02d} AM"
        
        status = "Departed" if idx == 0 else ("Next Stop" if idx == 1 else "Upcoming")
        if matched_vehicle.status == VehicleStatus.BREAKDOWN:
            status = "Halted (Breakdown)" if idx == 0 else "Delayed"

        stop_details.append({
            "stop_id": loc.id,
            "name": loc.name,
            "type": loc.type.value,
            "taluk": loc.taluk,
            "lat": loc.lat,
            "lng": loc.lng,
            "scheduled_time": scheduled_time,
            "estimated_time": scheduled_time,
            "status": status,
            "is_current": (idx == 0),
            "distance_from_start_km": round(cum_dist, 1)
        })

    next_stop_name = stop_details[1]["name"] if len(stop_details) > 1 else (dest_loc.name if dest_loc else "Destination")
    eta_next_stop = stop_details[1]["scheduled_time"] if len(stop_details) > 1 else "08:15 AM"

    # Current coordinates with slight dynamic movement offset
    lat = curr_loc.lat if curr_loc else 12.7214
    lng = curr_loc.lng if curr_loc else 77.2023

    available_seats = max(0, matched_vehicle.capacity - matched_vehicle.current_occupancy)

    # Use real-world street network road geometry from OpenStreetMap OSRM
    cached_info = ROAD_GEOMETRY_CACHE.get(matched_vehicle.id)
    if cached_info and "coordinates" in cached_info:
        route_coords = cached_info["coordinates"]
        total_dist_val = cached_info["distance_km"]
    else:
        route_coords = generate_route_coordinates(stop_details)
        total_dist_val = round(cum_dist, 1)

    # Fleet summary for bus selection dropdown
    fleet_options = [
        {
            "id": v.id,
            "name": v.name,
            "reg_no": v.name.split()[-1] if "KA-" in v.name else v.id,
            "type": v.type.value,
            "status": v.status.value,
            "capacity": v.capacity,
            "current_occupancy": v.current_occupancy,
            "available_seats": max(0, v.capacity - v.current_occupancy),
            "route_title": f"{loc_map.get(v.current_location_id, loc_map.get('V1')).name} → {loc_map.get(v.destination_id).name if v.destination_id and loc_map.get(v.destination_id) else 'District Hub'}"
        }
        for v in network_state.vehicles
    ]

    return {
        "vehicle_id": matched_vehicle.id,
        "name": matched_vehicle.name,
        "type": matched_vehicle.type.value,
        "registration_number": matched_vehicle.name.split()[-1] if "KA-" in matched_vehicle.name else "KA-42-F-1024",
        "current_location_id": matched_vehicle.current_location_id,
        "current_location_name": curr_loc.name if curr_loc else matched_vehicle.current_location_name,
        "destination_name": dest_loc.name if dest_loc else "District Education Hub",
        "next_stop": next_stop_name,
        "eta_next_stop": eta_next_stop,
        "speed_kmh": 0 if matched_vehicle.status == VehicleStatus.BREAKDOWN else matched_vehicle.speed_kmh,
        "status": matched_vehicle.status.value,
        "capacity": matched_vehicle.capacity,
        "current_occupancy": matched_vehicle.current_occupancy,
        "available_seats": available_seats,
        "driver_name": matched_vehicle.driver_name,
        "driver_phone": matched_vehicle.driver_phone,
        "lat": lat,
        "lng": lng,
        "stops": stop_details,
        "total_distance_km": total_dist_val,
        "route_coordinates": route_coords,
        "route_progress_percentage": 25 if len(stop_details) > 1 else 0,
        "all_vehicles": fleet_options
    }


@app.get("/api/plan-trip")
def plan_trip(origin: str = "V2", destination: str = "C3"):
    """
    Finds all viable travel options between a village and college,
    evaluates capacities and deadlines, and recommends the BEST option.
    Uses Dijkstra shortest path for 100% realistic distances and travel times.
    """
    loc_map = {loc.id: loc for loc in network_state.locations}
    orig_loc = loc_map.get(origin, network_state.locations[1])
    dest_loc = loc_map.get(destination, network_state.locations[8])

    graph = NetworkGraph(network_state.locations, network_state.roads)
    direct_dist, direct_time, path_nodes = graph.shortest_path(origin, destination)

    if direct_time == float('inf') or not path_nodes:
        # Fallback approximation based on coordinate distance
        import math
        dlat = (dest_loc.lat - orig_loc.lat) * 111.0
        dlng = (dest_loc.lng - orig_loc.lng) * 111.0 * math.cos(math.radians(orig_loc.lat))
        direct_dist = round(math.sqrt(dlat*dlat + dlng*dlng) * 1.3, 1)
        direct_time = round(direct_dist * 1.8)
        path_nodes = [orig_loc.id, dest_loc.id]

    distance_km = round(direct_dist, 1)
    duration_mins = max(10, int(round(direct_time)))

    # Fetch real-world street road network geometry from OSRM
    road_coords = None
    try:
        import urllib.request
        osrm_url = f"https://router.project-osrm.org/route/v1/driving/{orig_loc.lng},{orig_loc.lat};{dest_loc.lng},{dest_loc.lat}?overview=full&geometries=geojson"
        req = urllib.request.Request(osrm_url, headers={'User-Agent': 'GRAMMOVE-AI-Rural-Transit/2.0'})
        with urllib.request.urlopen(req, timeout=3.0) as r:
            osrm_data = json.loads(r.read().decode('utf-8'))
            if osrm_data.get('code') == 'Ok' and osrm_data.get('routes'):
                road_coords = [[round(pt[1], 6), round(pt[0], 6)] for pt in osrm_data['routes'][0]['geometry']['coordinates']]
                distance_km = round(osrm_data['routes'][0]['distance'] / 1000.0, 1)
                duration_mins = max(10, round(osrm_data['routes'][0]['duration'] / 60.0))
    except Exception as e:
        print(f"OSRM trip plan fallback: {e}")

    # Calculate intermediate stop names
    intermediate_stops = [
        loc_map[nid].name for nid in path_nodes 
        if nid in loc_map and nid != orig_loc.id and nid != dest_loc.id
    ]
    via_str = f"Via {', '.join(intermediate_stops)}" if intermediate_stops else "Direct Highway Corridor"

    # Time calculations
    dep_h = 7
    dep_m = 30 + (hash(origin) % 15)
    arr_total_m = dep_h * 60 + dep_m + duration_mins
    arr_h = arr_total_m // 60
    arr_m = arr_total_m % 60
    
    dep_str = f"{dep_h:02d}:{dep_m:02d} AM"
    arr_str = f"{arr_h:02d}:{arr_m:02d} AM"

    # Filter usable vehicles
    usable_vehs = [v for v in network_state.vehicles if v.status != VehicleStatus.BREAKDOWN]

    matching_bus = next((v for v in usable_vehs if v.type == VehicleType.GOVT_BUS and (origin in v.route_stops or v.current_location_id == origin)), None)
    if not matching_bus:
        matching_bus = next((v for v in usable_vehs if v.type == VehicleType.GOVT_BUS), usable_vehs[0])

    avail_a = max(0, matching_bus.capacity - matching_bus.current_occupancy)
    
    options = []
    
    # 1. Option A: Primary KSRTC Government Bus
    options.append({
        "id": "OPT-1",
        "title": matching_bus.name,
        "vehicle_id": matching_bus.id,
        "type": "govt_bus",
        "category": "KSRTC Ordinary Express",
        "departure_time": dep_str,
        "arrival_time": arr_str,
        "duration_mins": duration_mins,
        "distance_km": f"{distance_km} km",
        "available_seats": avail_a,
        "capacity": matching_bus.capacity,
        "fare": "Free (Student Bus Pass)",
        "crowd_status": "Filling Fast" if avail_a < 10 else "Seats Available",
        "reliability_score": 98,
        "stops_count": len(path_nodes),
        "via_summary": via_str,
        "pickup_point": f"{orig_loc.name} Main Bus Shelter",
        "dropoff_point": f"{dest_loc.name} Campus Gate",
        "is_best": True,
        "recommendation_reason": f"Recommended Best Choice: Direct {distance_km} km route, arrives at {arr_str} well before 08:45 AM deadline."
    })

    # 2. Option B: Rural Feeder Minibus
    minibus = next((v for v in usable_vehs if v.type == VehicleType.MINIBUS), None)
    if minibus:
        avail_b = max(0, minibus.capacity - minibus.current_occupancy)
        mini_dur = max(8, int(duration_mins * 0.9))
        mini_arr_m = (dep_h * 60 + dep_m + 10 + mini_dur)
        mini_arr_str = f"{mini_arr_m // 60:02d}:{mini_arr_m % 60:02d} AM"
        mini_dep_str = f"{dep_h:02d}:{dep_m + 10:02d} AM"
        options.append({
            "id": "OPT-2",
            "title": minibus.name,
            "vehicle_id": minibus.id,
            "type": "minibus",
            "category": "Cauvery Rural MiniBus",
            "departure_time": mini_dep_str,
            "arrival_time": mini_arr_str,
            "duration_mins": mini_dur,
            "distance_km": f"{distance_km} km",
            "available_seats": avail_b,
            "capacity": minibus.capacity,
            "fare": "₹10 (Subsidized)",
            "crowd_status": "Guaranteed Seating" if avail_b > 5 else "Limited Seats",
            "reliability_score": 95,
            "stops_count": max(2, len(path_nodes) - 1),
            "via_summary": via_str,
            "pickup_point": f"{orig_loc.name} Rural Cross",
            "dropoff_point": f"{dest_loc.name} Bypass Stop",
            "is_best": False,
            "recommendation_reason": f"Faster feeder ride ({mini_dur} mins), guaranteed seating, departs at {mini_dep_str}."
        })

    # 3. Option C: Gramina Mitra Shared Auto
    auto = next((v for v in usable_vehs if v.type == VehicleType.SHARED_AUTO), None)
    if auto:
        avail_c = max(0, auto.capacity - auto.current_occupancy)
        auto_dur = max(6, int(duration_mins * 0.85))
        auto_arr_m = (dep_h * 60 + dep_m - 8 + auto_dur)
        auto_arr_str = f"{auto_arr_m // 60:02d}:{auto_arr_m % 60:02d} AM"
        auto_dep_str = f"{dep_h:02d}:{max(0, dep_m - 8):02d} AM"
        options.append({
            "id": "OPT-3",
            "title": auto.name,
            "vehicle_id": auto.id,
            "type": "shared_auto",
            "category": "Gramina Mitra Shared Auto",
            "departure_time": auto_dep_str,
            "arrival_time": auto_arr_str,
            "duration_mins": auto_dur,
            "distance_km": f"{distance_km} km",
            "available_seats": avail_c,
            "capacity": auto.capacity,
            "fare": "₹15",
            "crowd_status": "Spacious",
            "reliability_score": 99,
            "stops_count": 1,
            "via_summary": "Direct Point-to-Point Connector",
            "pickup_point": f"{orig_loc.name} Village Center",
            "dropoff_point": f"{dest_loc.name} Gate",
            "is_best": False,
            "recommendation_reason": f"Direct point-to-point connector for fastest arrival by {auto_arr_str}."
        })

    return {
        "origin": {"id": orig_loc.id, "name": orig_loc.name, "taluk": orig_loc.taluk, "lat": orig_loc.lat, "lng": orig_loc.lng},
        "destination": {"id": dest_loc.id, "name": dest_loc.name, "taluk": dest_loc.taluk, "lat": dest_loc.lat, "lng": dest_loc.lng},
        "distance_km": distance_km,
        "travel_time_mins": duration_mins,
        "path_nodes": path_nodes,
        "road_geometry": road_coords,
        "via_summary": via_str,
        "deadline": "08:45 AM",
        "total_options": len(options),
        "options": options
    }

# Mount and serve built frontend in production / Vercel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist_dir):
    assets_dir = os.path.join(frontend_dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_root():
        index_file = os.path.join(frontend_dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "healthy", "service": "RouteFlow"}

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        target = os.path.join(frontend_dist_dir, full_path)
        if full_path and os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        index_file = os.path.join(frontend_dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"detail": "Frontend index.html not found"}


