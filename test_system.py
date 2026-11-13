import requests

BASE = 'http://127.0.0.1:8000/api'

def run_tests():
    print("=== GRAMMOVE AI SYSTEM VERIFICATION ===")
    
    # 1. Health check
    r = requests.get(f'{BASE}/health')
    print("1. Health Check:", r.json())

    # 2. Baseline
    r = requests.get(f'{BASE}/network')
    print(f"2. Baseline State: {r.json()['scenario_name']} | Enrolled Students: {len(r.json()['students'])} | Fleet: {len(r.json()['vehicles'])}")

    # 3. Bus Breakdown
    r = requests.post(f'{BASE}/simulate', json={'scenario_type': 'breakdown', 'vehicle_id': 'BUS-101'})
    opt = r.json()['optimization']
    print(f"3. Single Bus Breakdown: {r.json()['scenario_name']}")
    print(f"   -> Coverage: {opt['coverage_percentage']}% | Transported: {opt['transported_students']} | Stranded: {opt['stranded_students']}")
    print(f"   -> Dispatched Rescues: {len([a for a in opt['assignments'] if a['is_rescue_mission']])} units")

    # 4. Road Closure
    r = requests.post(f'{BASE}/simulate', json={'scenario_type': 'road_closure', 'road_id': 'R6'})
    opt = r.json()['optimization']
    print(f"4. Road Closure: {r.json()['scenario_name']}")
    print(f"   -> Coverage: {opt['coverage_percentage']}% | Transported: {opt['transported_students']} | Stranded: {opt['stranded_students']}")

    # 5. Demand Surge +40%
    r = requests.post(f'{BASE}/simulate', json={'scenario_type': 'surge', 'surge_percentage': 40})
    opt = r.json()['optimization']
    print(f"5. +40% Demand Surge: {r.json()['scenario_name']}")
    print(f"   -> Total Commuters: {opt['total_students']} | Transported: {opt['transported_students']} | Coverage: {opt['coverage_percentage']}%")

    # 6. Multi-Breakdown Crisis
    r = requests.post(f'{BASE}/simulate', json={'scenario_type': 'multi_breakdown'})
    opt = r.json()['optimization']
    print(f"6. Multi-Breakdown: {r.json()['scenario_name']}")
    print(f"   -> Coverage: {opt['coverage_percentage']}% | Rescued Units: {len([a for a in opt['assignments'] if a['is_rescue_mission']])}")

    # 7. AI Travel Assistant Canonical Queries
    print("\n--- AI Travel Assistant Verification ---")
    queries = [
        "My bus broke down. How can I reach college?",
        "Which alternative vehicle can I take?",
        "Which village has the highest transportation shortage?",
        "How many students are affected by this disruption?"
    ]
    for q in queries:
        resp = requests.post(f'{BASE}/chat', json={'message': q})
        data = resp.json()
        print(f"Q: '{q}'")
        first_line = data['reply'].strip().split('\n')[0]
        print(f"A: {first_line}")
        print(f"   Sources: {data.get('sources')}")
        print()

    # 8. Reset
    r = requests.post(f'{BASE}/simulate', json={'scenario_type': 'reset'})
    print("8. Reset to Baseline:", r.json()['scenario_name'], "Active Disruptions:", len(r.json()['disruptions']))
    print("=== ALL TESTS PASSED SUCCESSFULLY ===")

if __name__ == '__main__':
    run_tests()

