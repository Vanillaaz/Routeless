import urllib.request
import json
import time

routes_to_fetch = {
    'BUS-101': [(12.7932, 77.3887), (12.7880, 77.3650), (12.7964, 77.3781)],
    'BUS-102': [(12.8341, 77.2415), (12.7208, 77.2789)],
    'BUS-103': [(12.7689, 77.1643), (12.7214, 77.2023), (12.6518, 77.1982)],
    'BUS-104': [(12.6321, 77.2514), (12.6710, 77.2280), (12.7056, 77.2912), (12.7208, 77.2789)],
    'MINI-201': [(12.7880, 77.3650), (12.7932, 77.3887), (12.7964, 77.3781)],
    'MINI-202': [(12.7056, 77.2912), (12.7214, 77.2023), (12.6518, 77.1982)],
    'MINI-203': [(12.6841, 77.4529), (12.5982, 77.4112), (12.5512, 77.4190)],
    'AUTO-301': [(12.7932, 77.3887), (12.7964, 77.3781)],
    'AUTO-302': [(12.7932, 77.3887), (12.7880, 77.3650)],
    'AUTO-303': [(12.7214, 77.2023), (12.7208, 77.2789)],
    'AUTO-304': [(12.7214, 77.2023), (12.6518, 77.1982)],
    'AUTO-305': [(12.7689, 77.1643), (12.7214, 77.2023)],
    'AUTO-306': [(12.6321, 77.2514), (12.5982, 77.4112)]
}

results = {}
for k, stops in routes_to_fetch.items():
    coords_str = ';'.join(f'{c[1]},{c[0]}' for c in stops)
    url = f'https://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'GRAMMOVE-AI-Rural-Transit/2.0'})
        with urllib.request.urlopen(req, timeout=6.0) as r:
            d = json.loads(r.read().decode('utf-8'))
            if d.get('code') == 'Ok' and d.get('routes'):
                coords = d['routes'][0]['geometry']['coordinates']
                results[k] = {
                    'coordinates': [[round(pt[1], 6), round(pt[0], 6)] for pt in coords],
                    'distance_km': round(d['routes'][0]['distance'] / 1000.0, 1),
                    'duration_mins': round(d['routes'][0]['duration'] / 60.0, 1)
                }
                print(f"{k}: {len(results[k]['coordinates'])} road points, {results[k]['distance_km']} km, {results[k]['duration_mins']} mins")
    except Exception as e:
        print(f"{k} error: {e}")
    time.sleep(0.4)

with open('backend/road_geometry_cache.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print(f"Successfully cached {len(results)} vehicle road network geometries to backend/road_geometry_cache.json")
