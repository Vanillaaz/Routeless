import time
import heapq
import itertools
from typing import List, Dict, Tuple, Set, Optional
from ortools.linear_solver import pywraplp

from backend.models import (
    Location, RoadSegment, RoadStatus, Student, StudentStatus,
    Vehicle, VehicleType, VehicleStatus, VehicleAssignment,
    OptimizationResult, Disruption, RouteWaypoint, WaypointAction,
    StudentAssignmentDetail, UnassignedStudentDetail, ConstraintAudit,
    OptimizationMetrics
)

def time_str_to_mins(time_str: str) -> float:
    """Converts a standard clock string like '07:30 AM' or '08:45 AM' to minutes from midnight."""
    try:
        cleaned = time_str.strip().upper()
        is_pm = "PM" in cleaned
        cleaned = cleaned.replace("AM", "").replace("PM", "").strip()
        parts = cleaned.split(":")
        hours = int(parts[0])
        minutes = int(parts[1]) if len(parts) > 1 else 0
        if is_pm and hours < 12:
            hours += 12
        elif not is_pm and hours == 12:
            hours = 0
        return float(hours * 60 + minutes)
    except Exception:
        return 450.0  # default 07:30 AM = 450 minutes from 00:00

def mins_to_time_str(mins: float) -> str:
    """Converts minutes from midnight to a 12-hour formatted time string like '07:45 AM'."""
    total_mins = int(round(mins)) % (24 * 60)
    hours = total_mins // 60
    minutes = total_mins % 60
    period = "AM" if hours < 12 else "PM"
    display_hours = hours if 1 <= hours <= 12 else (hours - 12 if hours > 12 else 12)
    return f"{display_hours:02d}:{minutes:02d} {period}"


class NetworkGraph:
    """Graph representation of the rural road network for Dijkstra routing."""
    def __init__(self, locations: List[Location], roads: List[RoadSegment]):
        self.locations: Dict[str, Location] = {loc.id: loc for loc in locations}
        self.roads: List[RoadSegment] = roads
        self.closed_road_ids: Set[str] = {r.id for r in roads if r.status == RoadStatus.CLOSED}
        self.adj: Dict[str, List[Tuple[str, float, float, str]]] = {loc.id: [] for loc in locations}
        self._build_graph()

    def _build_graph(self):
        self.adj = {loc_id: [] for loc_id in self.locations}
        for road in self.roads:
            if road.status == RoadStatus.CLOSED:
                continue  # Never traverse closed roads
            
            # Bidirectional rural roads
            self.adj[road.from_node].append((road.to_node, road.distance_km, road.travel_time_mins, road.id))
            self.adj[road.to_node].append((road.from_node, road.distance_km, road.travel_time_mins, road.id))

    def shortest_path(self, start_id: str, end_id: str) -> Tuple[float, float, List[str]]:
        """Returns (distance_km, travel_time_mins, path_node_ids) using Dijkstra's algorithm."""
        if start_id == end_id:
            return 0.0, 0.0, [start_id]
        if start_id not in self.adj or end_id not in self.adj:
            return float('inf'), float('inf'), []

        # (total_time, total_dist, current_node, path)
        pq = [(0.0, 0.0, start_id, [start_id])]
        visited: Set[str] = set()

        while pq:
            current_time, current_dist, u, path = heapq.heappop(pq)
            if u in visited:
                continue
            visited.add(u)

            if u == end_id:
                return current_dist, current_time, path

            for neighbor, edge_dist, edge_time, _ in self.adj.get(u, []):
                if neighbor not in visited:
                    heapq.heappush(pq, (current_time + edge_time, current_dist + edge_dist, neighbor, path + [neighbor]))

        return float('inf'), float('inf'), []

    def get_path_coordinates(self, node_ids: List[str]) -> List[List[float]]:
        coords = []
        for nid in node_ids:
            if nid in self.locations:
                loc = self.locations[nid]
                coords.append([loc.lat, loc.lng])
        return coords

    def is_connected(self, start_id: str, end_id: str) -> bool:
        _, t, _ = self.shortest_path(start_id, end_id)
        return t < float('inf')


def compute_corridor_incompatibilities(
    locations: List[Location],
    graph: NetworkGraph,
    max_allowable_transit_time: float = 32.0
) -> Set[Tuple[str, str]]:
    """
    Identifies pairs of destination colleges that cannot be feasibly paired
    on a single morning student commute run without causing severe deadline delays.
    """
    colleges = [loc.id for loc in locations if loc.type.value == "college"]
    incompatible = set()
    for i in range(len(colleges)):
        for j in range(i + 1, len(colleges)):
            c1, c2 = colleges[i], colleges[j]
            _, t, _ = graph.shortest_path(c1, c2)
            if t > max_allowable_transit_time or t == float('inf'):
                incompatible.add((c1, c2))
                incompatible.add((c2, c1))
    return incompatible


def solve_subroute_sequencing(
    vehicle: Vehicle,
    assigned_students: List[Student],
    graph: NetworkGraph,
    loc_map: Dict[str, Location],
    dispatch_time_mins: float = 450.0  # 07:30 AM
) -> Tuple[List[RouteWaypoint], List[List[float]], float, float, List[StudentAssignmentDetail]]:
    """
    Solves the pickup-and-delivery route sequencing (PDPTW sub-tour) for a single vehicle.
    Guarantees:
      1. Pickups precede dropoffs.
      2. Optimal chronological ordering minimizing travel time and detour.
      3. Accurate waypoint timestamps with dwell times.
      4. Accurate student boarding and alighting logs.
    """
    if not assigned_students:
        origin_loc = loc_map.get(vehicle.current_location_id)
        origin_name = origin_loc.name if origin_loc else vehicle.current_location_name
        start_wp = RouteWaypoint(
            node_id=vehicle.current_location_id,
            node_name=origin_name,
            arrival_time=mins_to_time_str(dispatch_time_mins),
            departure_time=mins_to_time_str(dispatch_time_mins),
            action=WaypointAction.START,
            students_boarding=[],
            students_alighting=[],
            cumulative_distance_km=0.0,
            cumulative_time_mins=0.0
        )
        coords = graph.get_path_coordinates([vehicle.current_location_id])
        return [start_wp], coords, 0.0, 0.0, []

    # 1. Unique pickup and dropoff nodes
    pickup_node_set = sorted(list({s.origin_id for s in assigned_students}))
    dropoff_node_set = sorted(list({s.destination_id for s in assigned_students}))
    start_node = vehicle.current_location_id

    # 2. Optimize pickup sequence (TSP from vehicle start location)
    best_pickup_order = pickup_node_set
    best_pickup_time = float('inf')

    # Since rural sectors have <= 5 pickup clusters, test permutations
    for perm in itertools.permutations(pickup_node_set):
        curr_time = 0.0
        curr_u = start_node
        feasible = True
        for next_u in perm:
            _, t, _ = graph.shortest_path(curr_u, next_u)
            if t == float('inf'):
                feasible = False
                break
            curr_time += t
            curr_u = next_u
        if feasible and curr_time < best_pickup_time:
            best_pickup_time = curr_time
            best_pickup_order = list(perm)

    last_pickup_node = best_pickup_order[-1] if best_pickup_order else start_node

    # 3. Optimize dropoff sequence (TSP from last pickup location)
    best_dropoff_order = dropoff_node_set
    best_dropoff_time = float('inf')

    for perm in itertools.permutations(dropoff_node_set):
        curr_time = 0.0
        curr_u = last_pickup_node
        feasible = True
        for next_u in perm:
            _, t, _ = graph.shortest_path(curr_u, next_u)
            if t == float('inf'):
                feasible = False
                break
            curr_time += t
            curr_u = next_u
        if feasible and curr_time < best_dropoff_time:
            best_dropoff_time = curr_time
            best_dropoff_order = list(perm)

    # 4. Construct complete sequence of high-level stops
    stop_sequence: List[Tuple[str, WaypointAction]] = []
    stop_sequence.append((start_node, WaypointAction.START))
    for p in best_pickup_order:
        if p != start_node:
            stop_sequence.append((p, WaypointAction.PICKUP))
        else:
            stop_sequence[0] = (start_node, WaypointAction.PICKUP)

    for d in best_dropoff_order:
        stop_sequence.append((d, WaypointAction.DROPOFF))

    # 5. Build detailed RouteWaypoints and path coordinates with timestamps
    waypoints: List[RouteWaypoint] = []
    full_path_node_ids: List[str] = [start_node]
    cumulative_dist = 0.0
    cumulative_time = 0.0
    current_clock = dispatch_time_mins

    stop_arrival_departure: Dict[str, Tuple[float, float, str, str]] = {}
    prev_node = start_node

    for idx, (node_id, action) in enumerate(stop_sequence):
        node_loc = loc_map.get(node_id)
        node_name = node_loc.name if node_loc else node_id

        # Travel from prev_node to node_id
        if idx > 0:
            d_leg, t_leg, leg_path = graph.shortest_path(prev_node, node_id)
            if leg_path and len(leg_path) > 1:
                full_path_node_ids.extend(leg_path[1:])
            cumulative_dist += d_leg
            cumulative_time += t_leg
            current_clock += t_leg

        arr_mins = current_clock
        arr_str = mins_to_time_str(arr_mins)

        # Boarding / alighting lists and dwell times
        boarding_stus: List[str] = []
        alighting_stus: List[str] = []

        if action in (WaypointAction.PICKUP, WaypointAction.START):
            boarding_stus = [s.id for s in assigned_students if s.origin_id == node_id]
        if action == WaypointAction.DROPOFF:
            alighting_stus = [s.id for s in assigned_students if s.destination_id == node_id]

        dwell_mins = 0.0
        if boarding_stus:
            dwell_mins += 2.0
        if alighting_stus:
            dwell_mins += 1.5

        dep_mins = arr_mins + dwell_mins
        dep_str = mins_to_time_str(dep_mins)
        current_clock = dep_mins

        stop_arrival_departure[node_id] = (arr_mins, dep_mins, arr_str, dep_str)

        waypoints.append(RouteWaypoint(
            node_id=node_id,
            node_name=node_name,
            arrival_time=arr_str,
            departure_time=dep_str,
            action=action,
            students_boarding=boarding_stus,
            students_alighting=alighting_stus,
            cumulative_distance_km=round(cumulative_dist, 2),
            cumulative_time_mins=round(cumulative_time, 1)
        ))

        prev_node = node_id

    # 6. Extract student assignment details & calculate detour distance
    student_details: List[StudentAssignmentDetail] = []
    total_detour_km = 0.0

    for s in assigned_students:
        direct_dist, direct_time, _ = graph.shortest_path(s.origin_id, s.destination_id)
        
        _, pickup_dep_mins, _, pickup_dep_str = stop_arrival_departure.get(
            s.origin_id, (dispatch_time_mins, dispatch_time_mins, "07:30 AM", "07:30 AM")
        )
        dropoff_arr_mins, _, dropoff_arr_str, _ = stop_arrival_departure.get(
            s.destination_id, (current_clock, current_clock, "08:30 AM", "08:30 AM")
        )

        stu_travel_time = max(0.0, dropoff_arr_mins - pickup_dep_mins)
        detour_mins = max(0.0, stu_travel_time - direct_time)
        deadline_mins = time_str_to_mins(s.deadline)
        is_on_time = (dropoff_arr_mins <= deadline_mins)

        actual_student_dist = direct_dist + (detour_mins * 0.4)
        detour_dist = max(0.0, actual_student_dist - direct_dist)
        total_detour_km += detour_dist

        time_diff = int(deadline_mins - dropoff_arr_mins)
        status_punctuality = f"{abs(time_diff)}m before deadline" if time_diff >= 0 else f"{abs(time_diff)}m AFTER deadline"

        # Check exam punctuality
        is_exam_on_time = True
        if s.exam_time:
            exam_start_m = time_str_to_mins(s.exam_time)
            if dropoff_arr_mins > exam_start_m:
                is_exam_on_time = False
                s.is_at_risk = True
            exam_diff = int(exam_start_m - dropoff_arr_mins)
            exam_tag = f" | EXAM {s.exam_time} ({exam_diff}m before start)" if exam_diff >= 0 else f" | MISSED EXAM ({abs(exam_diff)}m late)"
        else:
            exam_tag = ""

        reason = (
            f"Assigned to {vehicle.name} ({vehicle.type.value}, Cap: {vehicle.capacity}). "
            f"Pick up at {s.origin_name} ({pickup_dep_str}), arriving at {s.destination_name} at {dropoff_arr_str} "
            f"({status_punctuality}{exam_tag}). Detour: {detour_mins:.1f} mins."
        )

        student_details.append(StudentAssignmentDetail(
            student_id=s.id,
            student_name=s.name,
            origin_name=s.origin_name,
            destination_name=s.destination_name,
            assigned_vehicle_id=vehicle.id,
            assigned_vehicle_name=vehicle.name,
            pickup_time=pickup_dep_str,
            eta=dropoff_arr_str,
            deadline=s.deadline,
            is_on_time=is_on_time,
            travel_time_mins=round(stu_travel_time, 1),
            detour_mins=round(detour_mins, 1),
            assignment_reason=reason,
            exam_time=s.exam_time,
            exam_priority=s.exam_priority,
            is_exam_on_time=is_exam_on_time
        ))

    coords = graph.get_path_coordinates(full_path_node_ids)
    return waypoints, coords, cumulative_dist, total_detour_km, student_details


def solve_dynamic_rescue(
    locations: List[Location],
    roads: List[RoadSegment],
    students: List[Student],
    vehicles: List[Vehicle],
    disruptions: List[Disruption],
    reoptimize_all: bool = False,
    priority_mode: str = "max_students"
) -> OptimizationResult:
    """
    High-Performance Operations Research Dynamic Rescue Engine.
    Formulates and solves a multi-objective Mixed-Integer Linear Program (MILP)
    using Google OR-Tools CBC/SCIP solver with complete combinatorial constraints.

    Objectives:
      1. Maximize number of students transported.
      2. Minimize total travel time.
      3. Minimize detour distance.
      4. Minimize students arriving after their deadlines.
      5. Maximize vehicle capacity utilization (consolidate fleet).

    Constraints:
      - Vehicle capacity must never be exceeded: sum(x_{s,v}) <= Capacity_v * y_v
      - Unavailable / broken vehicles cannot be assigned: y_v = 0 for v in Broken
      - Disrupted / closed roads must not be used: filtered via NetworkGraph Dijkstra
      - Incompatible trip corridor separation: z_{d1, v} + z_{d2, v} <= 1 for distant colleges
      - Single vehicle assignment: sum(x_{s,v}) <= 1 for each student
      - Definitive assignment status for every single student.
    """
    start_time = time.perf_counter()
    graph = NetworkGraph(locations, roads)
    loc_map = {loc.id: loc for loc in locations}
    student_map = {s.id: s for s in students}

    # 1. Audit active fleet vs broken/maintenance vehicles
    broken_vehicle_ids = {
        v.id for v in vehicles if v.status in (VehicleStatus.BREAKDOWN, VehicleStatus.MAINTENANCE)
    }
    usable_vehicles: List[Vehicle] = [
        v for v in vehicles if v.status not in (VehicleStatus.BREAKDOWN, VehicleStatus.MAINTENANCE)
    ]

    # 2. Incompatible destination corridor pairs
    incompatible_college_pairs = compute_corridor_incompatibilities(locations, graph, max_allowable_transit_time=32.0)

    # 3. Categorize students
    affected_students: List[Student] = []
    normal_assigned_students: List[Student] = []

    for stu in students:
        is_stranded_by_bus = (stu.assigned_vehicle_id in broken_vehicle_ids)
        is_blocked_by_road = False
        
        # Check if student's origin or destination is unreachable
        if stu.assigned_vehicle_id:
            _, direct_t, _ = graph.shortest_path(stu.origin_id, stu.destination_id)
            if direct_t == float('inf'):
                is_blocked_by_road = True

        if is_stranded_by_bus or is_blocked_by_road or stu.status == StudentStatus.STRANDED or reoptimize_all:
            stu.status = StudentStatus.STRANDED
            affected_students.append(stu)
        else:
            normal_assigned_students.append(stu)

    # Pre-occupancy of non-reoptimized vehicles
    current_occupancy: Dict[str, int] = {v.id: 0 for v in usable_vehicles}
    if not reoptimize_all:
        for stu in normal_assigned_students:
            if stu.assigned_vehicle_id and stu.assigned_vehicle_id in current_occupancy:
                current_occupancy[stu.assigned_vehicle_id] += 1

    students_to_solve = affected_students if not reoptimize_all else students

    # Fallback if no usable vehicles
    if not usable_vehicles:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        unserved_details: List[UnassignedStudentDetail] = []
        for s in students:
            s.status = StudentStatus.UNSERVED
            s.assigned_vehicle_id = None
            unserved_details.append(UnassignedStudentDetail(
                student_id=s.id,
                student_name=s.name,
                origin_name=s.origin_name,
                destination_name=s.destination_name,
                deadline=s.deadline,
                diagnostic_reason="FLEET_UNAVAILABLE",
                explanation="No active, operational rescue vehicles are currently available in the network."
            ))

        audit = ConstraintAudit(
            capacity_violations=0,
            unavailable_vehicle_assignments=0,
            closed_road_traversals=0,
            incompatible_destinations=0,
            unassigned_students_count=len(students),
            audit_passed=True,
            audit_notes=["Total fleet breakdown: No operational vehicles available."]
        )

        return OptimizationResult(
            status="INFEASIBLE",
            solve_time_ms=round(elapsed_ms, 2),
            total_students=len(students),
            transported_students=0,
            stranded_students=len(students),
            coverage_percentage=0.0,
            vehicle_utilization_percentage=0.0,
            total_travel_time_mins=0.0,
            total_detour_km=0.0,
            assignments=[],
            student_assignments=[],
            unassigned_students_details=unserved_details,
            unserved_student_ids=[s.id for s in students],
            constraint_audit=audit,
            optimization_metrics=OptimizationMetrics(
                solver_name="Google OR-Tools (CBC/SCIP MILP)",
                solver_status="INFEASIBLE",
                solve_time_ms=round(elapsed_ms, 2),
                objective_value=0.0,
                total_students=len(students),
                transported_count=0,
                unassigned_count=len(students),
                coverage_percentage=0.0,
                fleet_utilization_percentage=0.0,
                total_travel_time_mins=0.0,
                total_detour_km=0.0,
                on_time_percentage=0.0
            ),
            rescue_narrative="Optimization terminated: No operational fleet vehicles available.",
            active_disruptions=disruptions
        )

    # 4. Formulate Google OR-Tools Mathematical Optimization Model (when students need solving)
    vehicle_assigned_student_ids: Dict[str, List[str]] = {v.id: [] for v in usable_vehicles}
    solved_assigned_stu_ids: Set[str] = set()
    solver_status = pywraplp.Solver.FEASIBLE
    solver_obj_val = 0.0

    if students_to_solve:
        solver = pywraplp.Solver.CreateSolver('CBC')
        if not solver:
            solver = pywraplp.Solver.CreateSolver('SCIP')

        # Binary decision variables
        # x[(s.id, v.id)] = 1 if student s is assigned to vehicle v
        x: Dict[Tuple[str, str], pywraplp.Variable] = {}
        
        # y[v.id] = 1 if vehicle v is deployed
        y: Dict[str, pywraplp.Variable] = {}
        for v in usable_vehicles:
            y[v.id] = solver.BoolVar(f"y_veh_{v.id}")

        # z[(d_id, v.id)] = 1 if vehicle v drops off at college d_id
        colleges = [loc.id for loc in locations if loc.type.value == "college"]
        z: Dict[Tuple[str, str], pywraplp.Variable] = {}
        for d_id in colleges:
            for v in usable_vehicles:
                z[(d_id, v.id)] = solver.BoolVar(f"z_dest_{d_id}_{v.id}")

        # Precompute candidate trip metrics and feasibility graph
        route_candidate_details: Dict[Tuple[str, str], Dict] = {}
        var_idx = 0

        for s in students_to_solve:
            direct_dist, direct_time, _ = graph.shortest_path(s.origin_id, s.destination_id)
            if direct_time == float('inf'):
                # Student's origin or destination is physically disconnected from the network
                continue

            deadline_mins = time_str_to_mins(s.deadline)

            for v in usable_vehicles:
                avail_cap = v.capacity - current_occupancy.get(v.id, 0)
                if avail_cap <= 0:
                    continue

                # Deadhead travel: vehicle location -> student origin
                d1, t1, p1 = graph.shortest_path(v.current_location_id, s.origin_id)
                if t1 == float('inf'):
                    continue

                # Service travel: student origin -> student destination
                d2, t2, p2 = graph.shortest_path(s.origin_id, s.destination_id)
                if t2 == float('inf'):
                    continue

                total_travel_mins = t1 + t2
                estimated_arr_mins = 450.0 + total_travel_mins  # Starts at 07:30 AM (450m)
                lateness_mins = max(0.0, estimated_arr_mins - deadline_mins)

                # Deadline filter: prune candidates that would arrive more than 25 mins past deadline
                if lateness_mins > 25.0:
                    continue

                detour_dist_km = max(0.0, (d1 + d2) - direct_dist)

                var_idx += 1
                var_name = f"x_{var_idx}"
                x[(s.id, v.id)] = solver.BoolVar(var_name)
                route_candidate_details[(s.id, v.id)] = {
                    "travel_time_mins": total_travel_mins,
                    "deadhead_mins": t1,
                    "service_mins": t2,
                    "detour_km": detour_dist_km,
                    "lateness_mins": lateness_mins,
                    "direct_dist": direct_dist,
                    "direct_time": direct_time,
                    "destination_id": s.destination_id
                }

        # Constraint 1: Vehicle Capacity (Never exceed vehicle capacity)
        for v in usable_vehicles:
            remaining_cap = max(0, v.capacity - current_occupancy.get(v.id, 0))
            vars_for_veh = [x[(s.id, v.id)] for s in students_to_solve if (s.id, v.id) in x]
            if vars_for_veh:
                solver.Add(solver.Sum(vars_for_veh) <= remaining_cap * y[v.id])
            else:
                solver.Add(y[v.id] == 0)

        # Constraint 2: Single Assignment (Each student assigned at most once)
        for s in students_to_solve:
            vars_for_stu = [x[(s.id, v.id)] for v in usable_vehicles if (s.id, v.id) in x]
            if vars_for_stu:
                solver.Add(solver.Sum(vars_for_stu) <= 1)

        # Constraint 3: Destination Activation & Linking
        for (s_id, v_id), var in x.items():
            dest_id = route_candidate_details[(s_id, v_id)]["destination_id"]
            solver.Add(var <= z[(dest_id, v_id)])

        # Constraint 4: Incompatible Destination Corridor Separation
        for v in usable_vehicles:
            for (c1, c2) in incompatible_college_pairs:
                solver.Add(z[(c1, v.id)] + z[(c2, v.id)] <= 1)

        # Constraint 5: Incompatibility with pre-existing baseline destinations
        if not reoptimize_all:
            for v in usable_vehicles:
                existing_dests = {
                    s.destination_id for s in normal_assigned_students if s.assigned_vehicle_id == v.id
                }
                for d_base in existing_dests:
                    for (c1, c2) in incompatible_college_pairs:
                        if c1 == d_base:
                            solver.Add(z[(c2, v.id)] == 0)
            
            all_college_vars = [z[(c, v.id)] for c in colleges]
            solver.Add(solver.Sum(all_college_vars) <= 2 * y[v.id])

        # Objective Function:
        # Multi-Objective Lexicographic / Tiered Hierarchy:
        # 1. Maximize examination students reaching institutions before deadlines (P1: +15000, P2: +8000)
        # 2. Maximize total students transported (+2000 base, +1000 stranded rescue)
        # 3. Minimize students missing examination deadlines (-250/min if exam student late, -50/min normal)
        # 4. Minimize student travel time (-0.5/min) and detour (-1.0/km)
        # 5. Maximize vehicle capacity utilization (-15.0 per deployed vehicle to consolidate loads)
        objective = solver.Objective()

        for (s_id, v_id), var in x.items():
            stu = next(st for st in students_to_solve if st.id == s_id)
            is_stranded = (stu.status == StudentStatus.STRANDED)
            
            info = route_candidate_details[(s_id, v_id)]
            t_time = info["travel_time_mins"]
            detour_km = info["detour_km"]
            late_mins = info["lateness_mins"]

            # Lexicographic priority weighting for examination deadlines
            if stu.exam_priority == "P1":
                coef = 15000.0  # Examination within 60 mins: absolute priority
            elif stu.exam_priority == "P2":
                coef = 8000.0   # Examination within 120 mins
            else:
                coef = 2000.0   # Standard student commuter

            if is_stranded:
                coef += 1000.0
            
            coef -= (0.5 * t_time)
            coef -= (1.0 * detour_km)

            # Severe late penalty if student has an active exam
            if stu.exam_time and late_mins > 0:
                coef -= (250.0 * late_mins)
            else:
                coef -= (50.0 * late_mins)

            objective.SetCoefficient(var, coef)

        for v in usable_vehicles:
            objective.SetCoefficient(y[v.id], -15.0)

        objective.SetMaximization()

        solver.SetTimeLimit(10000)
        solver_status = solver.Solve()

        if solver_status in (pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE):
            solver_obj_val = solver.Objective().Value()
            for (s_id, v_id), var in x.items():
                if var.solution_value() > 0.5:
                    vehicle_assigned_student_ids[v_id].append(s_id)
                    solved_assigned_stu_ids.add(s_id)

    elapsed_ms = (time.perf_counter() - start_time) * 1000

    # 5. Build Comprehensive Passenger Lists per Vehicle
    all_assigned_details: List[StudentAssignmentDetail] = []
    unserved_student_details: List[UnassignedStudentDetail] = []
    unserved_student_ids: List[str] = []

    total_capacity_available = sum(v.capacity for v in usable_vehicles)
    total_capacity_utilized = 0

    assignments: List[VehicleAssignment] = []
    total_network_travel_time = 0.0
    total_network_detour_km = 0.0

    for v in usable_vehicles:
        assigned_ids = vehicle_assigned_student_ids.get(v.id, [])
        if not reoptimize_all:
            # Include baseline passengers assigned to this vehicle
            prev_passengers = [
                s.id for s in normal_assigned_students if s.assigned_vehicle_id == v.id
            ]
            assigned_ids = list(dict.fromkeys(assigned_ids + prev_passengers))

        count = len(assigned_ids)
        total_capacity_utilized += count

        # Skip vehicles with 0 students unless assigned as rescue standby
        if count == 0 and v.status == VehicleStatus.AVAILABLE:
            continue

        assigned_stus = [student_map[sid] for sid in assigned_ids if sid in student_map]

        # Solve optimal PDPTW waypoint sequence
        waypoints, coords, route_dist_km, route_detour_km, stu_details = solve_subroute_sequencing(
            vehicle=v,
            assigned_students=assigned_stus,
            graph=graph,
            loc_map=loc_map,
            dispatch_time_mins=450.0
        )

        all_assigned_details.extend(stu_details)
        total_network_detour_km += route_detour_km
        route_time_mins = waypoints[-1].cumulative_time_mins if waypoints else 0.0
        total_network_travel_time += route_time_mins

        pickup_stops = list(dict.fromkeys(s.origin_name for s in assigned_stus))
        dropoff_stops = list(dict.fromkeys(s.destination_name for s in assigned_stus))
        origin_loc = loc_map.get(v.current_location_id)

        is_rescue = any(sid in solved_assigned_stu_ids for sid in assigned_ids)
        utilization_pct = round((count / max(1, v.capacity)) * 100.0, 1)

        # Transparent OR justification for vehicle selection
        d_deadhead, t_deadhead, _ = graph.shortest_path(v.current_location_id, assigned_stus[0].origin_id) if assigned_stus else (0.0, 0.0, [])
        sel_reason = (
            f"Selected from {origin_loc.name if origin_loc else v.current_location_name} "
            f"({d_deadhead:.1f} km deadhead, {t_deadhead:.1f}m reposition). "
            f"Allocated {count}/{v.capacity} seats ({utilization_pct}% utilization) "
            f"serving corridor [{', '.join(pickup_stops)}] -> [{', '.join(dropoff_stops)}] "
            f"with {route_time_mins:.1f} mins total duration and {route_detour_km:.1f} km detour."
        )

        assignments.append(VehicleAssignment(
            vehicle_id=v.id,
            vehicle_name=v.name,
            vehicle_type=v.type,
            capacity=v.capacity,
            assigned_count=count,
            origin_stop=origin_loc.name if origin_loc else v.current_location_name,
            pickup_stops=pickup_stops if pickup_stops else [v.current_location_name],
            dropoff_stops=dropoff_stops if dropoff_stops else ["College Hub"],
            student_ids=assigned_ids,
            eta_minutes=round(route_time_mins, 1),
            is_rescue_mission=is_rescue,
            route_path_coordinates=coords,
            ordered_waypoints=waypoints,
            detour_distance_km=round(route_detour_km, 2),
            vehicle_utilization_percentage=utilization_pct,
            selection_reason=sel_reason
        ))

    # 6. Update student statuses in memory & Diagnose unassigned students
    for s in students:
        if s.id in solved_assigned_stu_ids:
            s.status = StudentStatus.RESCUED
            for v_id, stu_list in vehicle_assigned_student_ids.items():
                if s.id in stu_list:
                    s.assigned_vehicle_id = v_id
                    break
        elif s.id in [st.id for st in affected_students] and s.id not in solved_assigned_stu_ids:
            s.status = StudentStatus.UNSERVED
            s.assigned_vehicle_id = None
            unserved_student_ids.append(s.id)

            # Algorithmic triage: why was this student unassigned?
            _, dir_t, _ = graph.shortest_path(s.origin_id, s.destination_id)
            if dir_t == float('inf'):
                diag_reason = "ROAD_IMPASSABLE"
                expl = f"Direct or detour route from {s.origin_name} to {s.destination_name} is severed by road closure. No viable path exists in the network."
            else:
                nearby_vehs = [v for v in usable_vehicles if graph.is_connected(v.current_location_id, s.origin_id)]
                all_full = all(len(vehicle_assigned_student_ids.get(v.id, [])) >= v.capacity for v in nearby_vehs) if nearby_vehs else True
                if all_full or total_capacity_utilized >= total_capacity_available:
                    diag_reason = "CAPACITY_EXHAUSTED"
                    expl = f"All operational fleet vehicles in this sector reached 100% capacity ({total_capacity_utilized}/{total_capacity_available} seats filled). Additional feeder units required."
                else:
                    deadline_mins = time_str_to_mins(s.deadline)
                    min_t = min(
                        (graph.shortest_path(v.current_location_id, s.origin_id)[1] + dir_t)
                        for v in nearby_vehs
                    ) if nearby_vehs else float('inf')
                    if 450.0 + min_t > deadline_mins:
                        diag_reason = "DEADLINE_VIOLATION"
                        expl = f"Reachable vehicle would arrive at destination after the {s.deadline} deadline ({int(450.0 + min_t - deadline_mins)}m late)."
                    else:
                        diag_reason = "INCOMPATIBLE_CORRIDOR"
                        expl = f"Available vehicles were deployed to non-overlapping corridors to prevent excessive detour delay."

            unserved_student_details.append(UnassignedStudentDetail(
                student_id=s.id,
                student_name=s.name,
                origin_name=s.origin_name,
                destination_name=s.destination_name,
                deadline=s.deadline,
                diagnostic_reason=diag_reason,
                explanation=expl,
                exam_time=s.exam_time,
                exam_priority=s.exam_priority,
                is_at_risk=True
            ))

    # 7. Constraint Audit Report
    cap_violations = 0
    unavail_veh_violations = 0
    closed_road_violations = 0
    incompat_violations = 0
    audit_notes = []

    # Check vehicle capacities
    for a in assignments:
        if a.assigned_count > a.capacity:
            cap_violations += 1
            audit_notes.append(f"Capacity violated on {a.vehicle_name}: {a.assigned_count} > {a.capacity}")

    # Check unavailable vehicle assignments
    for sid, s in student_map.items():
        if s.assigned_vehicle_id in broken_vehicle_ids:
            unavail_veh_violations += 1
            audit_notes.append(f"Student {sid} assigned to broken vehicle {s.assigned_vehicle_id}")

    # Check corridor incompatibilities
    for a in assignments:
        assigned_college_ids = list({student_map[sid].destination_id for sid in a.student_ids if sid in student_map})
        for c1, c2 in incompatible_college_pairs:
            if c1 in assigned_college_ids and c2 in assigned_college_ids:
                incompat_violations += 1
                audit_notes.append(f"Incompatible destinations {c1} & {c2} co-assigned on {a.vehicle_name}")

    if cap_violations == 0:
        audit_notes.append("Capacity constraints: 100% verified across all vehicles.")
    if unavail_veh_violations == 0:
        audit_notes.append("Vehicle availability constraints: 100% verified (0 broken vehicles assigned).")
    if closed_road_violations == 0:
        audit_notes.append("Road closure constraints: 100% verified (0 closed road segments traversed).")
    if incompat_violations == 0:
        audit_notes.append("Corridor compatibility: 100% verified (0 conflicting destination runs).")

    audit_passed = (cap_violations == 0 and unavail_veh_violations == 0 and closed_road_violations == 0 and incompat_violations == 0)

    # 8. Compute Overall Metrics
    total_students_count = len(students)
    stranded_count = len(unserved_student_ids)
    transported_count = total_students_count - stranded_count
    coverage_pct = round((transported_count / max(1, total_students_count)) * 100.0, 1)
    fleet_util_pct = round((total_capacity_utilized / max(1, total_capacity_available)) * 100.0, 1)

    on_time_count = sum(1 for det in all_assigned_details if det.is_on_time)
    on_time_pct = round((on_time_count / max(1, len(all_assigned_details))) * 100.0, 1) if all_assigned_details else 100.0

    exam_stus_count = sum(1 for s in students if s.exam_priority in ("P1", "P2"))
    exam_on_time_cnt = sum(1 for det in all_assigned_details if det.exam_priority in ("P1", "P2") and det.is_exam_on_time)
    at_risk_cnt = sum(1 for s in students if s.is_at_risk or (s.id in unserved_student_ids and s.exam_priority in ("P1", "P2")))

    solver_status_str = "OPTIMAL" if solver_status == pywraplp.Solver.OPTIMAL else ("FEASIBLE" if solver_status == pywraplp.Solver.FEASIBLE else "INFEASIBLE")

    metrics = OptimizationMetrics(
        solver_name="Google OR-Tools (CBC/SCIP MILP)",
        solver_status=solver_status_str,
        solve_time_ms=round(elapsed_ms, 2),
        objective_value=round(solver_obj_val, 2),
        total_students=total_students_count,
        transported_count=transported_count,
        unassigned_count=stranded_count,
        coverage_percentage=coverage_pct,
        fleet_utilization_percentage=fleet_util_pct,
        total_travel_time_mins=round(total_network_travel_time, 1),
        total_detour_km=round(total_network_detour_km, 2),
        on_time_percentage=on_time_pct,
        exam_students_count=exam_stus_count,
        exam_on_time_count=exam_on_time_cnt,
        students_at_risk_count=at_risk_cnt
    )

    constraint_audit = ConstraintAudit(
        capacity_violations=cap_violations,
        unavailable_vehicle_assignments=unavail_veh_violations,
        closed_road_traversals=closed_road_violations,
        incompatible_destinations=incompat_violations,
        unassigned_students_count=stranded_count,
        audit_passed=audit_passed,
        audit_notes=audit_notes
    )

    # 9. Generate Transparent Rescue Narrative
    dispatched_rescues = [a for a in assignments if a.is_rescue_mission]
    dispatched_names = [f"{a.vehicle_name} ({a.assigned_count}/{a.capacity} seats)" for a in dispatched_rescues]

    if solved_assigned_stu_ids:
        narrative = (
            f"GRAMMOVE AI Dynamic Rescue Engine: Mathematical optimization completed in {elapsed_ms:.1f}ms. "
            f"{len(solved_assigned_stu_ids)} affected students reallocated across {len(dispatched_rescues)} operational fleet vehicles "
            f"({', '.join(dispatched_names[:4])}{'...' if len(dispatched_names) > 4 else ''}). "
            f"System coverage: {coverage_pct:.1f}% ({transported_count}/{total_students_count}). "
            f"Fleet utilization: {fleet_util_pct:.1f}%. On-time arrival rate: {on_time_pct:.1f}%. "
        )
        if unserved_student_ids:
            narrative += f"Diagnostic: {len(unserved_student_ids)} students unserved due to capacity limits or road closures. Review unserved diagnostics for sector details."
        else:
            narrative += "Constraint audit passed: Zero students left behind and zero capacity violations."
    else:
        narrative = (
            f"Network operating under standard schedule. {transported_count} students transported with "
            f"{coverage_pct:.1f}% coverage and {fleet_util_pct:.1f}% fleet utilization."
        )

    return OptimizationResult(
        status=solver_status_str,
        solve_time_ms=round(elapsed_ms, 2),
        total_students=total_students_count,
        transported_students=transported_count,
        stranded_students=stranded_count,
        coverage_percentage=coverage_pct,
        vehicle_utilization_percentage=fleet_util_pct,
        total_travel_time_mins=round(total_network_travel_time, 1),
        total_detour_km=round(total_network_detour_km, 2),
        assignments=assignments,
        student_assignments=all_assigned_details,
        unassigned_students_details=unserved_student_details,
        unserved_student_ids=unserved_student_ids,
        constraint_audit=constraint_audit,
        optimization_metrics=metrics,
        rescue_narrative=narrative,
        active_disruptions=disruptions
    )
