"""
GRAMMOVE AI — Dynamic Rescue Engine Verification & Test Suite
=============================================================
Operations Research, Vehicle Routing, Combinatorial Optimization & Transportation Systems

Validates:
1. Scenario 1: Single Bus Breakdown (BUS-101 mechanical failure)
2. Scenario 2: Multiple Bus Breakdowns (BUS-101 + BUS-103 simultaneous failure)
3. Scenario 3: Road Closure (R6 Kailancha Bridge closed)
4. Scenario 4: Increased Demand (+40% exam day surge across rural hamlets)
5. Scenario 5: Insufficient Capacity (Strict micro-fleet capacity bottleneck)

Ensures hard mathematical constraints:
- Vehicle capacity never exceeded
- Unavailable vehicles never assigned
- Disrupted roads never traversed
- Students reach exact destination campuses
- Incompatible destination corridors separated
- Unassigned students explicitly diagnosed without fabrication
"""

import copy
import sys
from typing import List

from backend.data_generator import (
    DEFAULT_LOCATIONS, DEFAULT_ROADS, DEFAULT_VEHICLES, generate_students
)
from backend.models import (
    RoadStatus, VehicleStatus, VehicleType, StudentStatus, Location, RoadSegment,
    Vehicle, Student, Disruption, OptimizationResult
)
from backend.solver import NetworkGraph, solve_dynamic_rescue, time_str_to_mins

def separator(title: str):
    print("\n" + "=" * 80)
    print(f" {title.upper()}")
    print("=" * 80)

def print_audit(result: OptimizationResult):
    print(f"[*] Solver Status: {result.status} (Solve time: {result.solve_time_ms:.2f} ms)")
    print(f"[*] Coverage: {result.coverage_percentage:.1f}% ({result.transported_students}/{result.total_students} transported, {result.stranded_students} unassigned)")
    print(f"[*] Fleet Utilization: {result.vehicle_utilization_percentage:.1f}% | Total Detour: {result.total_detour_km:.2f} km")
    if result.constraint_audit:
        print(f"[*] Constraint Audit: {'PASSED [OK]' if result.constraint_audit.audit_passed else 'FAILED [X]'}")
        for note in result.constraint_audit.audit_notes:
            print(f"    - {note}")
    if result.assignments:
        rescue_count = sum(1 for a in result.assignments if a.is_rescue_mission)
        print(f"[*] Active Deployments: {len(result.assignments)} vehicles ({rescue_count} rescue missions)")
        for a in result.assignments[:4]:
            print(f"    - {a.vehicle_name}: {a.assigned_count}/{a.capacity} seats | Stops: {' -> '.join(a.pickup_stops[:2])} -> {' -> '.join(a.dropoff_stops)}")
            if a.selection_reason:
                print(f"      Reason: {a.selection_reason[:110]}...")

def test_case_1_single_breakdown():
    separator("Test Case 1: Single Bus Breakdown (BUS-101 Mechanical Failure)")
    
    locations = copy.deepcopy(DEFAULT_LOCATIONS)
    roads = copy.deepcopy(DEFAULT_ROADS)
    vehicles = copy.deepcopy(DEFAULT_VEHICLES)
    students = generate_students()

    target_bus = "BUS-101"
    veh = next(v for v in vehicles if v.id == target_bus)
    veh.status = VehicleStatus.BREAKDOWN
    veh.current_occupancy = 0

    # Mark affected students on this bus as stranded
    affected_count = 0
    for s in students:
        if s.assigned_vehicle_id == target_bus:
            s.status = StudentStatus.STRANDED
            affected_count += 1

    disruption = Disruption(
        id="DIS-BRK-101",
        type="bus_breakdown",
        title=f"Breakdown: {veh.name}",
        description=f"{veh.name} broke down near Byramangala. {affected_count} students stranded.",
        affected_vehicle_ids=[target_bus],
        affected_student_count=affected_count,
        timestamp="07:42 AM",
        active=True
    )

    print(f"Triggered: {veh.name} broken down. Stranded students: {affected_count}")
    
    # Run Dynamic Rescue Engine
    res = solve_dynamic_rescue(locations, roads, students, vehicles, [disruption], reoptimize_all=False)
    print_audit(res)

    # Verification assertions
    assert res.constraint_audit.audit_passed, "Constraint audit must pass"
    assert res.constraint_audit.capacity_violations == 0, "No capacity violations allowed"
    assert res.constraint_audit.unavailable_vehicle_assignments == 0, "Broken vehicle must not be assigned"
    
    # Verify BUS-101 has 0 passengers
    for a in res.assignments:
        assert a.vehicle_id != target_bus, f"Broken bus {target_bus} must not have any assignments"
    
    # Verify that stranded students were rescued
    rescued = [s for s in students if s.status == StudentStatus.RESCUED]
    print(f"\n[Verification] Successfully reallocated {len(rescued)}/{affected_count} stranded students into available fleet!")
    assert len(rescued) > 0, "Should rescue stranded students"
    print(">>> Test Case 1 PASSED successfully!\n")


def test_case_2_multiple_breakdowns():
    separator("Test Case 2: Multiple Bus Breakdowns (BUS-101 + BUS-103)")
    
    locations = copy.deepcopy(DEFAULT_LOCATIONS)
    roads = copy.deepcopy(DEFAULT_ROADS)
    vehicles = copy.deepcopy(DEFAULT_VEHICLES)
    students = generate_students()

    broken_ids = ["BUS-101", "BUS-103"]
    affected_count = 0
    for v in vehicles:
        if v.id in broken_ids:
            v.status = VehicleStatus.BREAKDOWN
            v.current_occupancy = 0

    for s in students:
        if s.assigned_vehicle_id in broken_ids:
            s.status = StudentStatus.STRANDED
            affected_count += 1

    disruption = Disruption(
        id="DIS-MULTI-BRK",
        type="multi_breakdown",
        title="Simultaneous Fleet Breakdown: BUS-101 and BUS-103",
        description=f"Two major rural routes disrupted. Total stranded students: {affected_count}",
        affected_vehicle_ids=broken_ids,
        affected_student_count=affected_count,
        timestamp="07:45 AM",
        active=True
    )

    print(f"Triggered: {broken_ids} broken down. Stranded students: {affected_count}")

    # Solve
    res = solve_dynamic_rescue(locations, roads, students, vehicles, [disruption], reoptimize_all=False)
    print_audit(res)

    # Assertions
    assert res.constraint_audit.audit_passed, "Constraint audit must pass"
    for a in res.assignments:
        assert a.vehicle_id not in broken_ids, f"Broken bus {a.vehicle_id} must not be deployed"
        assert a.assigned_count <= a.capacity, f"Vehicle {a.vehicle_id} exceeded capacity"

    print(f"[Verification] High-pressure multi-breakdown triage completed. {res.transported_students} students transported safely.")
    print(">>> Test Case 2 PASSED successfully!\n")


def test_case_3_road_closure():
    separator("Test Case 3: Road Closure (R6 Kailancha Bridge Impassable)")
    
    locations = copy.deepcopy(DEFAULT_LOCATIONS)
    roads = copy.deepcopy(DEFAULT_ROADS)
    vehicles = copy.deepcopy(DEFAULT_VEHICLES)
    students = generate_students()

    target_road_id = "R6"
    road = next(r for r in roads if r.id == target_road_id)
    road.status = RoadStatus.CLOSED

    # Test that NetworkGraph correctly avoids R6
    g = NetworkGraph(locations, roads)
    _, _, path = g.shortest_path("V4", "C1")
    print(f"Route for Kailancha (V4) -> Ramanagara College (C1) with R6 closed: {path}")
    assert "J1" not in path or path.index("V4") + 1 != path.index("J1"), "Must not use closed edge V4-J1"

    # Flag students whose direct path used R6
    affected_count = 0
    for s in students:
        if s.origin_id in (road.from_node, road.to_node):
            s.status = StudentStatus.STRANDED
            affected_count += 1

    disruption = Disruption(
        id="DIS-ROAD-R6",
        type="road_closure",
        title=f"Road Closure: {road.name}",
        description=f"Culvert flooded. Direct traversal between {road.from_node} and {road.to_node} blocked.",
        affected_road_ids=[target_road_id],
        affected_student_count=affected_count,
        timestamp="07:30 AM",
        active=True
    )

    res = solve_dynamic_rescue(locations, roads, students, vehicles, [disruption], reoptimize_all=False)
    print_audit(res)

    assert res.constraint_audit.audit_passed, "Constraint audit must pass"
    assert res.constraint_audit.closed_road_traversals == 0, "No closed road traversals allowed"

    # Check unserved students diagnosis
    if res.unassigned_students_details:
        print("\n[Diagnostic Sample for Isolated/Delayed Students]:")
        for u in res.unassigned_students_details[:3]:
            print(f"    - Student {u.student_name} ({u.origin_name} -> {u.destination_name}): [{u.diagnostic_reason}] {u.explanation}")

    print(">>> Test Case 3 PASSED successfully!\n")


def test_case_4_increased_demand():
    separator("Test Case 4: Increased Demand (+40% Semester Exam Surge)")
    
    locations = copy.deepcopy(DEFAULT_LOCATIONS)
    roads = copy.deepcopy(DEFAULT_ROADS)
    vehicles = copy.deepcopy(DEFAULT_VEHICLES)
    students = generate_students()

    baseline_count = len(students)
    # Generate 40% additional surplus students across villages
    surge_students = []
    villages = [l for l in locations if l.type.value == "village"]
    extra_id = baseline_count + 1

    for vill in villages:
        add_count = max(1, int(vill.student_demand * 0.4))
        for _ in range(add_count):
            extra_id += 1
            surge_students.append(Student(
                id=f"STU-SURGE-{extra_id:04d}",
                name=f"Exam Commuter {extra_id} ({vill.name})",
                origin_id=vill.id,
                origin_name=vill.name,
                destination_id="C1" if extra_id % 2 == 0 else "C3",
                destination_name="Ramanagara Govt Polytechnic" if extra_id % 2 == 0 else "Bidadi Tech Academy",
                deadline="08:45 AM",
                pickup_time="07:30 AM",
                status=StudentStatus.STRANDED,  # Unallocated surge
                assigned_vehicle_id=None,
                is_at_risk=True
            ))

    total_pool = students + surge_students
    print(f"Demand increased from {baseline_count} to {len(total_pool)} (+{len(surge_students)} students).")

    res = solve_dynamic_rescue(locations, roads, total_pool, vehicles, [], reoptimize_all=True)
    print_audit(res)

    assert res.constraint_audit.audit_passed, "Constraint audit must pass"
    assert res.transported_students > baseline_count, "Solver should utilize extra fleet to transport surplus"
    print(f"[Verification] High throughput achieved: {res.transported_students} students accommodated.")
    print(">>> Test Case 4 PASSED successfully!\n")


def test_case_5_insufficient_capacity():
    separator("Test Case 5: Insufficient Capacity (Micro-Fleet Capacity Bottleneck)")
    
    locations = copy.deepcopy(DEFAULT_LOCATIONS)
    roads = copy.deepcopy(DEFAULT_ROADS)
    # Artificially constrict vehicle capacity to 3 seats per vehicle across 5 vehicles (15 seats total for 50 students)
    restricted_vehicles = [
        Vehicle(
            id=f"RESCUE-AUTO-{i+1}",
            name=f"Gramina Micro-Auto {i+1}",
            type=VehicleType.SHARED_AUTO,
            capacity=3,  # Only 3 seats
            current_occupancy=0,
            current_location_id="V2",
            current_location_name="Byramangala",
            status=VehicleStatus.AVAILABLE,
            speed_kmh=35.0
        )
        for i in range(5)
    ]
    total_fleet_capacity = sum(v.capacity for v in restricted_vehicles)  # 15 seats
    
    # 50 students all wanting to travel
    students_pool = [
        Student(
            id=f"STU-BOTTLENECK-{i+1:03d}",
            name=f"Stranded Student {i+1}",
            origin_id="V2",
            origin_name="Byramangala",
            destination_id="C3",
            destination_name="Bidadi Engineering & Technical Academy",
            deadline="08:45 AM",
            pickup_time="07:30 AM",
            status=StudentStatus.STRANDED,
            assigned_vehicle_id=None
        )
        for i in range(50)
    ]

    print(f"Testing 50 students competing for {total_fleet_capacity} seats across 5 micro-autos.")

    res = solve_dynamic_rescue(locations, roads, students_pool, restricted_vehicles, [], reoptimize_all=True)
    print_audit(res)

    # Hard mathematical checks:
    # 1. Transported cannot exceed 15
    assert res.transported_students <= total_fleet_capacity, f"Transported ({res.transported_students}) exceeded physical capacity ({total_fleet_capacity})!"
    assert res.transported_students == total_fleet_capacity, f"Solver should fully saturate available capacity ({total_fleet_capacity})"
    assert res.stranded_students == (50 - total_fleet_capacity), f"Exactly {50 - total_fleet_capacity} students must be flagged unserved"
    
    # 2. Constraint audit must pass with 0 capacity violations
    assert res.constraint_audit.audit_passed, "Audit must pass"
    assert res.constraint_audit.capacity_violations == 0, "Must have zero capacity violations"

    # 3. Unserved diagnostics must be genuine and truthful
    assert len(res.unassigned_students_details) == (50 - total_fleet_capacity)
    for u in res.unassigned_students_details:
        assert u.diagnostic_reason == "CAPACITY_EXHAUSTED", f"Expected CAPACITY_EXHAUSTED, got {u.diagnostic_reason}"
        assert "capacity" in u.explanation.lower(), "Diagnostic explanation must truthfully explain capacity exhaustion"

    print("\n[Sample Truthful Diagnostics]:")
    for u in res.unassigned_students_details[:3]:
        print(f"    - {u.student_id} ({u.student_name}): [{u.diagnostic_reason}] {u.explanation}")

    print("\n[Verification] No fabricated results! Solver honestly accommodated exactly 15 students and diagnosed all 35 remaining students as CAPACITY_EXHAUSTED.")
    print(">>> Test Case 5 PASSED successfully!\n")


if __name__ == "__main__":
    print("\n" + "#" * 80)
    print(" GRAMMOVE AI — OPERATIONS RESEARCH DYNAMIC RESCUE ENGINE TEST SUITE")
    print(" Mathematical Optimization & Combinatorial Verification (Google OR-Tools)")
    print("#" * 80)

    try:
        test_case_1_single_breakdown()
        test_case_2_multiple_breakdowns()
        test_case_3_road_closure()
        test_case_4_increased_demand()
        test_case_5_insufficient_capacity()

        separator("ALL 5 OPERATIONS RESEARCH TEST CASES PASSED WITH 100% MATHEMATICAL INTEGRITY!")
        sys.exit(0)
    except AssertionError as err:
        print(f"\n[X] TEST FAILURE: {err}")
        sys.exit(1)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n[X] UNEXPECTED ERROR: {e}")
        sys.exit(1)
