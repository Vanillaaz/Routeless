import random
from typing import List, Dict, Tuple
from backend.models import (
    Location, LocationType, RoadSegment, RoadStatus,
    Student, StudentStatus, Vehicle, VehicleType, VehicleStatus, Disruption
)

# Realistic Karnataka rural corridor locations (Ramanagara / Channapatna / Kanakapura / Bidadi)
DEFAULT_LOCATIONS: List[Location] = [
    # Villages
    Location(id="V1", name="Doddamallur", type=LocationType.VILLAGE, lat=12.7214, lng=77.2023, taluk="Channapatna", student_demand=28, description="Historic silk hamlet on the riverbank"),
    Location(id="V2", name="Byramangala", type=LocationType.VILLAGE, lat=12.7932, lng=77.3887, taluk="Bidadi", student_demand=36, description="Agricultural & reservoir belt with dense student commutes"),
    Location(id="V3", name="Harohalli", type=LocationType.VILLAGE, lat=12.6841, lng=77.4529, taluk="Kanakapura", student_demand=30, description="Rural junction connecting southern forest pockets"),
    Location(id="V4", name="Kailancha", type=LocationType.VILLAGE, lat=12.6321, lng=77.2514, taluk="Ramanagara", student_demand=24, description="Hilly cluster accessed by narrow bridge road SH-17"),
    Location(id="V5", name="Akkur", type=LocationType.VILLAGE, lat=12.7689, lng=77.1643, taluk="Channapatna", student_demand=22, description="Sericulture community with high morning diploma traffic"),
    Location(id="V6", name="Vibhutikere", type=LocationType.VILLAGE, lat=12.7056, lng=77.2912, taluk="Ramanagara", student_demand=26, description="Central rural junction connecting to highway"),
    Location(id="V7", name="Sugganahalli", type=LocationType.VILLAGE, lat=12.8341, lng=77.2415, taluk="Magadi Border", student_demand=20, description="Northern dairy village with single daily bus service"),
    Location(id="V8", name="Maralawadi", type=LocationType.VILLAGE, lat=12.5982, lng=77.4112, taluk="Kanakapura", student_demand=24, description="Deep rural border village near Bananthimari Hills"),
    
    # Educational Institutions / Hubs
    Location(id="C1", name="Ramanagara Govt Polytechnic & Science College", type=LocationType.COLLEGE, lat=12.7208, lng=77.2789, taluk="Ramanagara", student_demand=0, description="Premier technical & pre-university institute"),
    Location(id="C2", name="Channapatna Govt First Grade College & ITI", type=LocationType.COLLEGE, lat=12.6518, lng=77.1982, taluk="Channapatna", student_demand=0, description="Regional degree college and industrial training center"),
    Location(id="C3", name="Bidadi Engineering & Technical Academy", type=LocationType.COLLEGE, lat=12.7964, lng=77.3781, taluk="Bidadi", student_demand=0, description="Engineering campus on the industrial expressway"),
    Location(id="C4", name="Kanakapura Rural Medical & Nursing Institute", type=LocationType.COLLEGE, lat=12.5512, lng=77.4190, taluk="Kanakapura", student_demand=0, description="Healthcare training center serving southern rural taluks"),
    
    # Key Road Junctions
    Location(id="J1", name="Iggalur Cross", type=LocationType.JUNCTION, lat=12.6710, lng=77.2280, taluk="Channapatna", student_demand=0, description="Tri-junction connecting Kailancha, Channapatna & Vibhutikere"),
    Location(id="J2", name="Bidadi Bypass Junction", type=LocationType.JUNCTION, lat=12.7880, lng=77.3650, taluk="Bidadi", student_demand=0, description="Highway flyover junction connecting Byramangala feeder"),
]

DEFAULT_ROADS: List[RoadSegment] = [
    # Doddamallur connections
    RoadSegment(id="R1", from_node="V1", to_node="C2", name="SH-92 Channapatna Silk Road", distance_km=8.2, travel_time_mins=14.0),
    RoadSegment(id="R2", from_node="V1", to_node="V6", name="Doddamallur-Vibhutikere Link", distance_km=9.5, travel_time_mins=18.0),
    RoadSegment(id="R3", from_node="V5", to_node="V1", name="Akkur Feeder Road", distance_km=6.8, travel_time_mins=13.0),
    
    # Vibhutikere & Ramanagara College connections
    RoadSegment(id="R4", from_node="V6", to_node="C1", name="Vibhutikere-Ramanagara Approach", distance_km=4.5, travel_time_mins=8.0),
    RoadSegment(id="R5", from_node="V6", to_node="J1", name="Iggalur District Link", distance_km=7.1, travel_time_mins=12.0),
    
    # Kailancha & Iggalur
    RoadSegment(id="R6", from_node="V4", to_node="J1", name="SH-17 Kailancha Bridge Road", distance_km=5.6, travel_time_mins=11.0),
    RoadSegment(id="R7", from_node="J1", to_node="C2", name="Channapatna Town Feeder", distance_km=4.8, travel_time_mins=9.0),
    
    # Byramangala & Bidadi
    RoadSegment(id="R8", from_node="V2", to_node="J2", name="Byramangala Reservoir Road", distance_km=4.2, travel_time_mins=8.0),
    RoadSegment(id="R9", from_node="J2", to_node="C3", name="Bidadi Tech Corridor Road", distance_km=3.1, travel_time_mins=6.0),
    RoadSegment(id="R10", from_node="V7", to_node="J2", name="Sugganahalli-Bidadi Rural Road", distance_km=14.2, travel_time_mins=26.0),
    RoadSegment(id="R11", from_node="V7", to_node="C1", name="Sugganahalli-Ramanagara Hill Road", distance_km=13.5, travel_time_mins=24.0),
    
    # Ramanagara to Bidadi / Channapatna inter-hub connections
    RoadSegment(id="R12", from_node="C1", to_node="J2", name="Bengaluru-Mysuru Old Highway Section", distance_km=12.0, travel_time_mins=19.0),
    RoadSegment(id="R13", from_node="C1", to_node="C2", name="Ramanagara-Channapatna Twin City Highway", distance_km=14.0, travel_time_mins=21.0),
    
    # Harohalli & Maralawadi to Kanakapura
    RoadSegment(id="R14", from_node="V3", to_node="C4", name="Kanakapura Main Road SH-84", distance_km=15.0, travel_time_mins=25.0),
    RoadSegment(id="R15", from_node="V8", to_node="C4", name="Maralawadi Ghat Feeder", distance_km=8.4, travel_time_mins=16.0),
    RoadSegment(id="R16", from_node="V8", to_node="V3", name="Maralawadi-Harohalli Crosslink", distance_km=11.2, travel_time_mins=20.0),
    RoadSegment(id="R17", from_node="V3", to_node="V2", name="Harohalli-Byramangala Rural Bypass", distance_km=16.5, travel_time_mins=28.0),
    RoadSegment(id="R18", from_node="V4", to_node="V8", name="Kailancha-Maralawadi Valley Path", distance_km=18.0, travel_time_mins=32.0),
]

# Initial baseline vehicles
DEFAULT_VEHICLES: List[Vehicle] = [
    Vehicle(
        id="BUS-101",
        name="KSRTC Rural Express KA-42-F-1024",
        type=VehicleType.GOVT_BUS,
        capacity=55,
        current_occupancy=48,
        current_location_id="V2",
        current_location_name="Byramangala",
        destination_id="C3",
        status=VehicleStatus.EN_ROUTE,
        route_stops=["V2", "J2", "C3"],
        assigned_students=[],
        speed_kmh=40.0,
        driver_name="Basavaraju M.",
        driver_phone="+91 94480 23114"
    ),
    Vehicle(
        id="BUS-102",
        name="KSRTC North Feeder KA-42-F-2180",
        type=VehicleType.GOVT_BUS,
        capacity=50,
        current_occupancy=38,
        current_location_id="V7",
        current_location_name="Sugganahalli",
        destination_id="C1",
        status=VehicleStatus.EN_ROUTE,
        route_stops=["V7", "C1"],
        assigned_students=[],
        speed_kmh=38.0,
        driver_name="Nagaraju K.",
        driver_phone="+91 94480 44521"
    ),
    Vehicle(
        id="BUS-103",
        name="KSRTC Silk Route Express KA-42-F-3011",
        type=VehicleType.GOVT_BUS,
        capacity=52,
        current_occupancy=42,
        current_location_id="V1",
        current_location_name="Doddamallur",
        destination_id="C2",
        status=VehicleStatus.EN_ROUTE,
        route_stops=["V5", "V1", "C2"],
        assigned_students=[],
        speed_kmh=42.0,
        driver_name="Shivanna P.",
        driver_phone="+91 94481 99012"
    ),
    Vehicle(
        id="BUS-104",
        name="KSRTC Taluk Connector KA-42-F-4105",
        type=VehicleType.GOVT_BUS,
        capacity=50,
        current_occupancy=35,
        current_location_id="V4",
        current_location_name="Kailancha",
        destination_id="C1",
        status=VehicleStatus.EN_ROUTE,
        route_stops=["V4", "J1", "V6", "C1"],
        assigned_students=[],
        speed_kmh=36.0,
        driver_name="Venkatesh Murthy",
        driver_phone="+91 94483 11209"
    ),
    # Minibuses (Flexible secondary fleet)
    Vehicle(
        id="MINI-201",
        name="Cauvery Rural MiniBus KA-42-M-4412",
        type=VehicleType.MINIBUS,
        capacity=24,
        current_occupancy=0,
        current_location_id="J2",
        current_location_name="Bidadi Bypass Junction",
        destination_id=None,
        status=VehicleStatus.AVAILABLE,
        route_stops=[],
        assigned_students=[],
        speed_kmh=45.0,
        driver_name="Anand Kumar",
        driver_phone="+91 98452 87103"
    ),
    Vehicle(
        id="MINI-202",
        name="Gramina Seva MiniBus KA-42-M-5590",
        type=VehicleType.MINIBUS,
        capacity=22,
        current_occupancy=0,
        current_location_id="V6",
        current_location_name="Vibhutikere",
        destination_id=None,
        status=VehicleStatus.AVAILABLE,
        route_stops=[],
        assigned_students=[],
        speed_kmh=42.0,
        driver_name="Ravi Chandra",
        driver_phone="+91 97410 33819"
    ),
    Vehicle(
        id="MINI-203",
        name="Shree Basaveshwara MaxiCab KA-42-M-7701",
        type=VehicleType.MINIBUS,
        capacity=20,
        current_occupancy=18,
        current_location_id="V3",
        current_location_name="Harohalli",
        destination_id="C4",
        status=VehicleStatus.EN_ROUTE,
        route_stops=["V3", "C4"],
        assigned_students=[],
        speed_kmh=44.0,
        driver_name="Mahadevaswamy",
        driver_phone="+91 99001 54321"
    ),
    # Shared Autos & Cruisers (Crucial last-mile rescue units)
    Vehicle(
        id="AUTO-301",
        name="Gramina Mitra Auto-1 KA-42-A-1102",
        type=VehicleType.SHARED_AUTO,
        capacity=8,
        current_occupancy=0,
        current_location_id="V2",
        current_location_name="Byramangala",
        destination_id=None,
        status=VehicleStatus.AVAILABLE,
        route_stops=[],
        assigned_students=[],
        speed_kmh=35.0,
        driver_name="Syed Imran",
        driver_phone="+91 96112 04891"
    ),
    Vehicle(
        id="AUTO-302",
        name="Gramina Mitra Auto-2 KA-42-A-1105",
        type=VehicleType.SHARED_AUTO,
        capacity=8,
        current_occupancy=0,
        current_location_id="V2",
        current_location_name="Byramangala",
        destination_id=None,
        status=VehicleStatus.AVAILABLE,
        route_stops=[],
        assigned_students=[],
        speed_kmh=35.0,
        driver_name="Prakash G.",
        driver_phone="+91 97318 44021"
    ),
    Vehicle(
        id="AUTO-303",
        name="Arkavathi Cruiser Auto KA-42-A-2210",
        type=VehicleType.SHARED_AUTO,
        capacity=8,
        current_occupancy=0,
        current_location_id="V6",
        current_location_name="Vibhutikere",
        destination_id=None,
        status=VehicleStatus.AVAILABLE,
        route_stops=[],
        assigned_students=[],
        speed_kmh=35.0,
        driver_name="Kumaraswamy B.",
        driver_phone="+91 98860 11983"
    ),
    Vehicle(
        id="AUTO-304",
        name="Kailancha Hills Auto KA-42-A-1199",
        type=VehicleType.SHARED_AUTO,
        capacity=8,
        current_occupancy=0,
        current_location_id="V4",
        current_location_name="Kailancha",
        destination_id=None,
        status=VehicleStatus.AVAILABLE,
        route_stops=[],
        assigned_students=[],
        speed_kmh=32.0,
        driver_name="Girish Gowda",
        driver_phone="+91 99451 88720"
    ),
    Vehicle(
        id="AUTO-305",
        name="Sugganahalli Rural Auto KA-42-A-3341",
        type=VehicleType.SHARED_AUTO,
        capacity=8,
        current_occupancy=0,
        current_location_id="V7",
        current_location_name="Sugganahalli",
        destination_id=None,
        status=VehicleStatus.AVAILABLE,
        route_stops=[],
        assigned_students=[],
        speed_kmh=35.0,
        driver_name="Lokesh M.",
        driver_phone="+91 96200 45512"
    ),
    Vehicle(
        id="AUTO-306",
        name="Maralawadi Forest Auto KA-42-A-4490",
        type=VehicleType.SHARED_AUTO,
        capacity=8,
        current_occupancy=0,
        current_location_id="V8",
        current_location_name="Maralawadi",
        destination_id=None,
        status=VehicleStatus.AVAILABLE,
        route_stops=[],
        assigned_students=[],
        speed_kmh=32.0,
        driver_name="Manjunatha C.",
        driver_phone="+91 97401 22934"
    ),
]

FIRST_NAMES = [
    "Ramesh", "Sneha", "Manoj", "Divya", "Chandan", "Pooja", "Tejaswini", "Varun",
    "Keerthi", "Bhavya", "Anitha", "Chethan", "Darshan", "Kavya", "Suresh", "Pavithra",
    "Naveen", "Deepa", "Kiran", "Shilpa", "Prashanth", "Roopa", "Girish", "Meghana",
    "Vinay", "Sowmya", "Harish", "Vidya", "Sandeep", "Swathi", "Ashok", "Kusuma"
]

LAST_NAMES = [
    "Gowda", "Patil", "Kumar", "B.", "H.M.", "N.", "K.", "Swamy",
    "Murthy", "R.", "S.", "Raj", "M.", "Shetty", "Nayaka", "Reddy",
    "Prasad", "P.", "Chari", "Bhat", "Desai", "Yadav", "Devi", "Acharya"
]

def generate_students() -> List[Student]:
    """Generates realistic synthetic rural student records with destinations and schedules."""
    random.seed(42)  # Deterministic generation for reproducibility
    students: List[Student] = []
    
    # Destination mapping preferences based on proximity
    village_dest_distribution: Dict[str, List[Tuple[str, float]]] = {
        "V1": [("C2", 0.70), ("C1", 0.30)],           # Doddamallur -> Channapatna ITI / Ramanagara Polytechnic
        "V2": [("C3", 0.75), ("C1", 0.25)],           # Byramangala -> Bidadi Tech Academy / Ramanagara Polytechnic
        "V3": [("C4", 0.80), ("C3", 0.20)],           # Harohalli -> Kanakapura Medical / Bidadi Tech
        "V4": [("C1", 0.60), ("C2", 0.40)],           # Kailancha -> Ramanagara / Channapatna
        "V5": [("C2", 0.75), ("C1", 0.25)],           # Akkur -> Channapatna / Ramanagara
        "V6": [("C1", 0.85), ("C2", 0.15)],           # Vibhutikere -> Ramanagara / Channapatna
        "V7": [("C1", 0.65), ("C3", 0.35)],           # Sugganahalli -> Ramanagara / Bidadi
        "V8": [("C4", 0.85), ("C1", 0.15)],           # Maralawadi -> Kanakapura / Ramanagara
    }
    
    location_map = {loc.id: loc for loc in DEFAULT_LOCATIONS}
    student_counter = 1
    
    for loc in DEFAULT_LOCATIONS:
        if loc.type != LocationType.VILLAGE:
            continue
            
        count = loc.student_demand
        dest_choices = village_dest_distribution.get(loc.id, [("C1", 1.0)])
        
        for i in range(count):
            r = random.random()
            cum = 0.0
            chosen_dest_id = dest_choices[0][0]
            for dest_id, prob in dest_choices:
                cum += prob
                if r <= cum:
                    chosen_dest_id = dest_id
                    break
                    
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            dest_loc = location_map[chosen_dest_id]
            
            # Staggered pickup time and deadline
            pickup_mins = random.choice([0, 15, 30])
            pickup_time = f"07:{pickup_mins:02d} AM"
            deadline = "08:45 AM" if random.random() > 0.3 else "09:00 AM"
            
            # Baseline vehicle assignment
            assigned_veh_id = None
            if loc.id == "V2" and chosen_dest_id == "C3":
                assigned_veh_id = "BUS-101"
            elif loc.id == "V7" and chosen_dest_id == "C1":
                assigned_veh_id = "BUS-102"
            elif loc.id in ("V1", "V5") and chosen_dest_id == "C2":
                assigned_veh_id = "BUS-103"
            elif loc.id == "V4" and chosen_dest_id == "C1":
                assigned_veh_id = "BUS-104"
            elif loc.id == "V3" and chosen_dest_id == "C4":
                assigned_veh_id = "MINI-203"
            else:
                assigned_veh_id = "BUS-101" if random.random() > 0.5 else "BUS-104"
                
            student = Student(
                id=f"STU-{student_counter:04d}",
                name=name,
                origin_id=loc.id,
                origin_name=loc.name,
                destination_id=chosen_dest_id,
                destination_name=dest_loc.name,
                deadline=deadline,
                pickup_time=pickup_time,
                status=StudentStatus.ASSIGNED,
                assigned_vehicle_id=assigned_veh_id,
                is_at_risk=False
            )
            students.append(student)
            student_counter += 1
            
    return students
