import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.models import (
    OptimizationRequest, OptimizationResult, ChatRequest, ChatResponse,
    SimulationScenarioRequest, VehicleStatus, RoadStatus
)
from backend.simulator import network_state
from backend.solver import solve_dynamic_rescue
from backend.ai_assistant import AIAssistantService

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
    result = solve_dynamic_rescue(
        locations=network_state.locations,
        roads=network_state.roads,
        students=network_state.students,
        vehicles=network_state.vehicles,
        disruptions=network_state.disruptions,
        reoptimize_all=reopt
    )
    last_optimization_result = result
    return result

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
        reoptimize_all=False
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
