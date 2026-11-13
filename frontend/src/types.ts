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
}

export interface OptimizationResult {
  status: string;
  solve_time_ms: number;
  total_students: number;
  transported_students: number;
  stranded_students: number;
  coverage_percentage: number;
  vehicle_utilization_percentage: number;
  assignments: VehicleAssignment[];
  unserved_student_ids: string[];
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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  suggested_actions?: string[];
}
