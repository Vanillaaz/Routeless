export type VehicleType = 'govt_bus' | 'minibus' | 'shared_auto';
export const VehicleType = {
  GOVT_BUS: 'govt_bus' as VehicleType,
  MINIBUS: 'minibus' as VehicleType,
  SHARED_AUTO: 'shared_auto' as VehicleType,
};

export type VehicleStatus = 'available' | 'en_route' | 'breakdown' | 'maintenance' | 'assigned_rescue';
export const VehicleStatus = {
  AVAILABLE: 'available' as VehicleStatus,
  EN_ROUTE: 'en_route' as VehicleStatus,
  BREAKDOWN: 'breakdown' as VehicleStatus,
  MAINTENANCE: 'maintenance' as VehicleStatus,
  ASSIGNED_RESCUE: 'assigned_rescue' as VehicleStatus,
};

export type StudentStatus = 'assigned' | 'stranded' | 'rescued' | 'delayed' | 'unserved';
export const StudentStatus = {
  ASSIGNED: 'assigned' as StudentStatus,
  STRANDED: 'stranded' as StudentStatus,
  RESCUED: 'rescued' as StudentStatus,
  DELAYED: 'delayed' as StudentStatus,
  UNSERVED: 'unserved' as StudentStatus,
};

export type RoadStatus = 'open' | 'closed' | 'congested';
export const RoadStatus = {
  OPEN: 'open' as RoadStatus,
  CLOSED: 'closed' as RoadStatus,
  CONGESTED: 'congested' as RoadStatus,
};

export type LocationType = 'village' | 'college' | 'junction';
export const LocationType = {
  VILLAGE: 'village' as LocationType,
  COLLEGE: 'college' as LocationType,
  JUNCTION: 'junction' as LocationType,
};

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  lat: number;
  lng: number;
  taluk: string;
  student_demand: number;
  description: string;
}

export interface RoadSegment {
  id: string;
  from_node: string;
  to_node: string;
  name: string;
  distance_km: number;
  travel_time_mins: number;
  status: RoadStatus;
}

export interface Student {
  id: string;
  name: string;
  origin_id: string;
  origin_name: string;
  destination_id: string;
  destination_name: string;
  deadline: string;
  pickup_time: string;
  status: StudentStatus;
  assigned_vehicle_id: string | null;
  is_at_risk: boolean;
  exam_time?: string;
  exam_priority?: string;
  arrival_buffer_mins?: number;
  latest_feasible_departure?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  capacity: number;
  current_occupancy: number;
  current_location_id: string;
  current_location_name: string;
  destination_id: string | null;
  status: VehicleStatus;
  route_stops: string[];
  assigned_students: string[];
  speed_kmh: number;
  driver_name: string;
  driver_phone: string;
}

export interface Disruption {
  id: string;
  type: string;
  title: string;
  description: string;
  affected_vehicle_ids: string[];
  affected_road_ids: string[];
  affected_student_count: number;
  timestamp: string;
  active: boolean;
}

export interface RouteWaypoint {
  node_id: string;
  node_name: string;
  arrival_time: string;
  departure_time: string;
  action: 'start' | 'pickup' | 'dropoff' | 'pass_through';
  students_boarding: string[];
  students_alighting: string[];
  cumulative_distance_km: number;
  cumulative_time_mins: number;
}

export interface StudentAssignmentDetail {
  student_id: string;
  student_name: string;
  origin_name: string;
  destination_name: string;
  assigned_vehicle_id: string;
  assigned_vehicle_name: string;
  pickup_time: string;
  eta: string;
  deadline: string;
  is_on_time: boolean;
  travel_time_mins: number;
  detour_mins: number;
  assignment_reason: string;
  exam_time?: string | null;
  exam_priority?: 'P1' | 'P2' | 'P3' | string;
  is_exam_on_time?: boolean;
}

export interface UnassignedStudentDetail {
  student_id: string;
  student_name: string;
  origin_name: string;
  destination_name: string;
  deadline: string;
  diagnostic_reason: string;
  explanation: string;
  exam_time?: string | null;
  exam_priority?: 'P1' | 'P2' | 'P3' | string;
  is_at_risk?: boolean;
}

export interface ConstraintAudit {
  capacity_violations: number;
  unavailable_vehicle_assignments: number;
  closed_road_traversals: number;
  incompatible_destinations: number;
  unassigned_students_count: number;
  audit_passed: boolean;
  audit_notes: string[];
}

export interface OptimizationMetrics {
  solver_name: string;
  solver_status: string;
  solve_time_ms: number;
  objective_value: number;
  total_students: number;
  transported_count: number;
  unassigned_count: number;
  coverage_percentage: number;
  fleet_utilization_percentage: number;
  total_travel_time_mins: number;
  total_detour_km: number;
  on_time_percentage: number;
}

export interface VehicleAssignment {
  vehicle_id: string;
  vehicle_name: string;
  vehicle_type: VehicleType;
  capacity: number;
  assigned_count: number;
  origin_stop: string;
  pickup_stops: string[];
  dropoff_stops: string[];
  student_ids: string[];
  eta_minutes: number;
  is_rescue_mission: boolean;
  route_path_coordinates: [number, number][];
  ordered_waypoints?: RouteWaypoint[];
  detour_distance_km?: number;
  vehicle_utilization_percentage?: number;
  selection_reason?: string;
}

export interface OptimizationResult {
  status: string;
  solve_time_ms: number;
  total_students: number;
  transported_students: number;
  stranded_students: number;
  coverage_percentage: number;
  vehicle_utilization_percentage: number;
  total_travel_time_mins?: number;
  total_detour_km?: number;
  assignments: VehicleAssignment[];
  student_assignments?: StudentAssignmentDetail[];
  unassigned_students_details?: UnassignedStudentDetail[];
  unserved_student_ids: string[];
  constraint_audit?: ConstraintAudit;
  optimization_metrics?: OptimizationMetrics;
  rescue_narrative: string;
  active_disruptions: Disruption[];
}

export interface NetworkStateResponse {
  scenario_name: string;
  locations: Location[];
  roads: RoadSegment[];
  vehicles: Vehicle[];
  students: Student[];
  disruptions: Disruption[];
  last_optimization: OptimizationResult | null;
}

export interface ExamCrisisMetrics {
  crisis_active: boolean;
  status_text: string;
  failed_buses_count: number;
  failed_bus_names: string[];
  demand_surge_pct: number;
  flooded_road_id: string;
  flooded_road_name: string;
  total_students_requiring_transport: number;
  students_with_exams: number;
  p1_count: number;
  p2_count: number;
  p3_count: number;
  available_vehicles_count: number;
  remaining_seating_capacity: number;
  students_assigned: number;
  students_on_time: number;
  students_at_risk: number;
  students_unassigned: number;
  coverage_percentage: number;
  before_transported: number;
  after_transported: number;
  before_capacity: number;
  after_capacity: number;
  before_coverage_pct: number;
  after_coverage_pct: number;
  before_travel_time_mins: number;
  after_travel_time_mins: number;
}

export interface ExamCrisisResponse {
  active: boolean;
  scenario_name: string;
  metrics: ExamCrisisMetrics;
  optimization: OptimizationResult;
  disruptions: Disruption[];
  gemini_report: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  suggested_actions?: string[];
}
