from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class VehicleType(str, Enum):
    GOVT_BUS = "govt_bus"
    MINIBUS = "minibus"
    SHARED_AUTO = "shared_auto"

class VehicleStatus(str, Enum):
    AVAILABLE = "available"
    EN_ROUTE = "en_route"
    BREAKDOWN = "breakdown"
    MAINTENANCE = "maintenance"
    ASSIGNED_RESCUE = "assigned_rescue"

class StudentStatus(str, Enum):
    ASSIGNED = "assigned"
    STRANDED = "stranded"
    RESCUED = "rescued"
    DELAYED = "delayed"
    UNSERVED = "unserved"

class RoadStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    CONGESTED = "congested"

class LocationType(str, Enum):
    VILLAGE = "village"
    COLLEGE = "college"
    JUNCTION = "junction"

class WaypointAction(str, Enum):
    START = "start"
    PICKUP = "pickup"
    DROPOFF = "dropoff"
    PASS_THROUGH = "pass_through"

class Location(BaseModel):
    id: str
    name: str
    type: LocationType
    lat: float
    lng: float
    taluk: str = "Ramanagara"
    student_demand: int = 0
    description: str = ""

class RoadSegment(BaseModel):
    id: str
    from_node: str
    to_node: str
    name: str
    distance_km: float
    travel_time_mins: float
    status: RoadStatus = RoadStatus.OPEN

class Student(BaseModel):
    id: str
    name: str
    origin_id: str
    origin_name: str
    destination_id: str
    destination_name: str
    deadline: str = "08:45 AM"
    pickup_time: str = "07:30 AM"
    status: StudentStatus = StudentStatus.ASSIGNED
    assigned_vehicle_id: Optional[str] = None
    is_at_risk: bool = False
    # Exam-Day crisis attributes
    exam_time: Optional[str] = None  # e.g. "09:00 AM"
    exam_priority: str = "P3"         # "P1" (<60m), "P2" (<120m), "P3" (regular)
    arrival_buffer_mins: int = 15     # required arrival cushion before exam
    latest_feasible_departure: Optional[str] = None

class Vehicle(BaseModel):
    id: str
    name: str
    type: VehicleType
    capacity: int
    current_occupancy: int = 0
    current_location_id: str
    current_location_name: str
    destination_id: Optional[str] = None
    status: VehicleStatus = VehicleStatus.AVAILABLE
    route_stops: List[str] = Field(default_factory=list)
    assigned_students: List[str] = Field(default_factory=list)
    speed_kmh: float = 35.0
    driver_name: str = "Driver"
    driver_phone: str = "+91 98450 XXXXX"

class Disruption(BaseModel):
    id: str
    type: str  # "bus_breakdown", "road_closure", "demand_surge", "multi_breakdown", "delay", "flooded_road"
    title: str
    description: str
    affected_vehicle_ids: List[str] = Field(default_factory=list)
    affected_road_ids: List[str] = Field(default_factory=list)
    affected_student_count: int = 0
    timestamp: str = "07:45 AM"
    active: bool = True

class RouteWaypoint(BaseModel):
    node_id: str
    node_name: str
    arrival_time: str
    departure_time: str
    action: WaypointAction
    students_boarding: List[str] = Field(default_factory=list)
    students_alighting: List[str] = Field(default_factory=list)
    cumulative_distance_km: float = 0.0
    cumulative_time_mins: float = 0.0

class StudentAssignmentDetail(BaseModel):
    student_id: str
    student_name: str
    origin_name: str
    destination_name: str
    assigned_vehicle_id: str
    assigned_vehicle_name: str
    pickup_time: str
    eta: str
    deadline: str
    is_on_time: bool
    travel_time_mins: float
    detour_mins: float
    assignment_reason: str
    exam_time: Optional[str] = None
    exam_priority: str = "P3"
    is_exam_on_time: bool = True

class UnassignedStudentDetail(BaseModel):
    student_id: str
    student_name: str
    origin_name: str
    destination_name: str
    deadline: str
    diagnostic_reason: str  # "CAPACITY_EXHAUSTED", "ROAD_IMPASSABLE", "DEADLINE_VIOLATION", "INCOMPATIBLE_CORRIDOR"
    explanation: str
    exam_time: Optional[str] = None
    exam_priority: str = "P3"
    is_at_risk: bool = True

class ConstraintAudit(BaseModel):
    capacity_violations: int = 0
    unavailable_vehicle_assignments: int = 0
    closed_road_traversals: int = 0
    incompatible_destinations: int = 0
    unassigned_students_count: int = 0
    audit_passed: bool = True
    audit_notes: List[str] = Field(default_factory=list)

class OptimizationMetrics(BaseModel):
    solver_name: str = "Google OR-Tools (CBC/SCIP MILP)"
    solver_status: str
    solve_time_ms: float
    objective_value: float
    total_students: int
    transported_count: int
    unassigned_count: int
    coverage_percentage: float
    fleet_utilization_percentage: float
    total_travel_time_mins: float
    total_detour_km: float
    on_time_percentage: float
    exam_students_count: int = 0
    exam_on_time_count: int = 0
    students_at_risk_count: int = 0

class VehicleAssignment(BaseModel):
    vehicle_id: str
    vehicle_name: str
    vehicle_type: VehicleType
    capacity: int
    assigned_count: int
    origin_stop: str
    pickup_stops: List[str]
    dropoff_stops: List[str]
    student_ids: List[str]
    eta_minutes: float
    is_rescue_mission: bool = False
    route_path_coordinates: List[List[float]] = Field(default_factory=list)
    ordered_waypoints: List[RouteWaypoint] = Field(default_factory=list)
    detour_distance_km: float = 0.0
    vehicle_utilization_percentage: float = 0.0
    selection_reason: str = ""

class OptimizationRequest(BaseModel):
    students: Optional[List[Student]] = None
    vehicles: Optional[List[Vehicle]] = None
    roads: Optional[List[RoadSegment]] = None
    disruptions: Optional[List[Disruption]] = None
    disruption_id: Optional[str] = None
    force_reroute: bool = False
    allow_shared_autos: bool = True
    priority_mode: str = "exam_priority"  # "max_students" or "exam_priority"

class OptimizationResult(BaseModel):
    status: str
    solve_time_ms: float
    total_students: int
    transported_students: int
    stranded_students: int
    coverage_percentage: float
    vehicle_utilization_percentage: float
    total_travel_time_mins: float = 0.0
    total_detour_km: float = 0.0
    assignments: List[VehicleAssignment]
    student_assignments: List[StudentAssignmentDetail] = Field(default_factory=list)
    unassigned_students_details: List[UnassignedStudentDetail] = Field(default_factory=list)
    unserved_student_ids: List[str]
    constraint_audit: Optional[ConstraintAudit] = None
    optimization_metrics: Optional[OptimizationMetrics] = None
    rescue_narrative: str
    active_disruptions: List[Disruption] = Field(default_factory=list)

class ExamCrisisMetrics(BaseModel):
    crisis_active: bool
    status_text: str
    failed_buses_count: int
    failed_bus_names: List[str]
    demand_surge_pct: int
    flooded_road_id: str
    flooded_road_name: str
    total_students_requiring_transport: int
    students_with_exams: int
    p1_count: int
    p2_count: int
    p3_count: int
    available_vehicles_count: int
    remaining_seating_capacity: int
    students_assigned: int
    students_on_time: int
    students_at_risk: int
    students_unassigned: int
    coverage_percentage: float
    # Before vs After Analytics
    before_transported: int
    after_transported: int
    before_capacity: int
    after_capacity: int
    before_coverage_pct: float
    after_coverage_pct: float
    before_travel_time_mins: float
    after_travel_time_mins: float

class ExamCrisisResponse(BaseModel):
    active: bool
    scenario_name: str
    metrics: ExamCrisisMetrics
    optimization: OptimizationResult
    disruptions: List[Disruption]
    gemini_report: str
    timestamp: str = "07:55 AM"

class ChatRequest(BaseModel):
    message: str
    student_id: Optional[str] = None
    current_state_summary: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    sources: List[str] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)
    affected_student_context: Optional[Dict[str, Any]] = None

class SimulationScenarioRequest(BaseModel):
    scenario_type: str  # "breakdown", "road_closure", "surge", "multi_breakdown", "delay", "reset", "exam_crisis"
    vehicle_id: Optional[str] = None
    road_id: Optional[str] = None
    surge_percentage: Optional[int] = 40
