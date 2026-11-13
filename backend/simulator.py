import copy
from typing import List, Dict, Any, Tuple
from backend.models import (
    Location, RoadSegment, RoadStatus, Student, StudentStatus,
    Vehicle, VehicleType, VehicleStatus, Disruption
)
from backend.data_generator import (
    DEFAULT_LOCATIONS, DEFAULT_ROADS, DEFAULT_VEHICLES, generate_students
)

class TransportationNetworkState:
    """Singleton-style state manager for the live rural mobility network."""
    def __init__(self):
        self.reset_to_baseline()

    def reset_to_baseline(self):
        self.locations: List[Location] = copy.deepcopy(DEFAULT_LOCATIONS)
        self.roads: List[RoadSegment] = copy.deepcopy(DEFAULT_ROADS)
        self.vehicles: List[Vehicle] = copy.deepcopy(DEFAULT_VEHICLES)
        self.students: List[Student] = generate_students()
        self.disruptions: List[Disruption] = []
        self.scenario_name: str = "Baseline Morning Operations"

    def apply_bus_breakdown(self, vehicle_id: str = "BUS-101") -> Disruption:
        """Simulates breakdown of a critical rural route bus."""
        veh = next((v for v in self.vehicles if v.id == vehicle_id), None)
        if not veh:
            veh = self.vehicles[0]
            vehicle_id = veh.id

        veh.status = VehicleStatus.BREAKDOWN
        veh.current_occupancy = 0
        
        # Mark all students on this bus as stranded
        affected_count = 0
        for s in self.students:
            if s.assigned_vehicle_id == vehicle_id:
                s.status = StudentStatus.STRANDED
                s.is_at_risk = True
                affected_count += 1

        disruption = Disruption(
            id=f"DIS-BRK-{vehicle_id}",
            type="bus_breakdown",
            title=f"Vehicle Breakdown: {veh.name}",
            description=f"{veh.name} suffered mechanical failure near {veh.current_location_name}. {affected_count} rural students stranded.",
            affected_vehicle_ids=[vehicle_id],
            affected_road_ids=[],
            affected_student_count=affected_count,
            timestamp="07:42 AM",
            active=True
        )
        self.disruptions = [d for d in self.disruptions if d.id != disruption.id] + [disruption]
        self.scenario_name = f"Breakdown ({veh.name})"
        return disruption

    def apply_road_closure(self, road_id: str = "R6") -> Disruption:
        """Simulates rural road closure (e.g. culvert waterlogging or bridge repair)."""
        road = next((r for r in self.roads if r.id == road_id), None)
        if not road:
            road = self.roads[5]  # R6 Kailancha bridge
            road_id = road.id

        road.status = RoadStatus.CLOSED
        
        # Check affected students traveling from or through this road's nodes
        affected_count = 0
        for s in self.students:
            if s.origin_id in (road.from_node, road.to_node):
                s.status = StudentStatus.STRANDED
                s.is_at_risk = True
                affected_count += 1

        disruption = Disruption(
            id=f"DIS-ROAD-{road_id}",
            type="road_closure",
            title=f"Road Closure: {road.name}",
            description=f"{road.name} is blocked due to culvert damage. Direct passage between {road.from_node} and {road.to_node} is impassable.",
            affected_vehicle_ids=[],
            affected_road_ids=[road_id],
            affected_student_count=affected_count,
            timestamp="07:35 AM",
            active=True
        )
        self.disruptions = [d for d in self.disruptions if d.id != disruption.id] + [disruption]
        self.scenario_name = f"Road Closure ({road.name})"
        return disruption

    def apply_demand_surge(self, surge_percentage: int = 40) -> Disruption:
        """Simulates sudden demand increase (e.g. semester exam or campus job fair)."""
        surge_ratio = surge_percentage / 100.0
        new_students: List[Student] = []
        start_idx = len(self.students) + 1

        feeder_villages = [l for l in self.locations if l.type.value == "village"]
        total_added = 0

        for vill in feeder_villages:
            add_count = max(1, int(vill.student_demand * surge_ratio))
            vill.student_demand += add_count

            for i in range(add_count):
                total_added += 1
                stu = Student(
                    id=f"STU-SRG-{start_idx + total_added:04d}",
                    name=f"Extra Student {total_added} ({vill.name})",
                    origin_id=vill.id,
                    origin_name=vill.name,
                    destination_id="C1" if i % 2 == 0 else "C3",
                    destination_name="Ramanagara Govt Polytechnic" if i % 2 == 0 else "Bidadi Tech Academy",
                    deadline="08:45 AM",
                    pickup_time="07:35 AM",
                    status=StudentStatus.STRANDED,  # Unassigned surplus
                    assigned_vehicle_id=None,
                    is_at_risk=True
                )
                new_students.append(stu)

        self.students.extend(new_students)

        disruption = Disruption(
            id="DIS-SURGE-40",
            type="demand_surge",
            title=f"Sudden +{surge_percentage}% Student Demand Surge",
            description=f"District semester exam day triggered an unexpected +{surge_percentage}% surge ({len(new_students)} extra students) at village bus stops.",
            affected_vehicle_ids=[],
            affected_road_ids=[],
            affected_student_count=len(new_students),
            timestamp="07:25 AM",
            active=True
        )
        self.disruptions.append(disruption)
        self.scenario_name = f"+{surge_percentage}% Demand Surge"
        return disruption

    def apply_multiple_breakdowns(self) -> Disruption:
        """Simulates simultaneous breakdowns of multiple core fleet buses."""
        v1 = self.apply_bus_breakdown("BUS-101")
        v2 = self.apply_bus_breakdown("BUS-103")

        multi_disruption = Disruption(
            id="DIS-MULTI-BRK",
            type="multi_breakdown",
            title="Multi-Vehicle Fleet Emergency",
            description="Two primary KSRTC buses (KA-42-F-1024 at Byramangala and KA-42-F-3011 at Doddamallur) suffered engine overheating.",
            affected_vehicle_ids=["BUS-101", "BUS-103"],
            affected_road_ids=[],
            affected_student_count=v1.affected_student_count + v2.affected_student_count,
            timestamp="07:48 AM",
            active=True
        )
        self.disruptions.append(multi_disruption)
        self.scenario_name = "Multi-Vehicle Breakdown Crisis"
        return multi_disruption

    def apply_unexpected_delay(self, road_id: str = "R12") -> Disruption:
        """Simulates heavy traffic or obstacle causing cascading delay."""
        road = next((r for r in self.roads if r.id == road_id), None)
        if not road:
            road = self.roads[11]  # R12
        road.travel_time_mins += 35.0  # Massive delay
        road.status = RoadStatus.CONGESTED

        affected_count = 0
        for s in self.students:
            if s.assigned_vehicle_id in ("BUS-101", "BUS-102"):
                s.status = StudentStatus.DELAYED
                s.is_at_risk = True
                affected_count += 1

        disruption = Disruption(
            id=f"DIS-DELAY-{road.id}",
            type="delay",
            title=f"Severe Congestion Delay: {road.name}",
            description=f"Highway construction gridlock on {road.name} adding +35 mins delay, jeopardizing college arrival deadlines.",
            affected_vehicle_ids=["BUS-101", "BUS-102"],
            affected_road_ids=[road.id],
            affected_student_count=affected_count,
            timestamp="07:50 AM",
            active=True
        )
        self.disruptions.append(disruption)
        self.scenario_name = f"Severe Route Delay ({road.name})"
        return disruption


# Global singleton instance
network_state = TransportationNetworkState()
