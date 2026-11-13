const API_BASE = '/api';
export async function fetchNetworkState() {
    const res = await fetch(`${API_BASE}/network`);
    if (!res.ok) {
        throw new Error(`Failed to fetch network state: ${res.statusText}`);
    }
    return res.json();
}
export async function triggerOptimization(forceReroute = false) {
    const res = await fetch(`${API_BASE}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_reroute: forceReroute })
    });
    if (!res.ok) {
        throw new Error(`Optimization failed: ${res.statusText}`);
    }
    return res.json();
}
export async function triggerSimulationScenario(scenarioType, params) {
    const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            scenario_type: scenarioType,
            vehicle_id: params?.vehicleId,
            road_id: params?.roadId,
            surge_percentage: params?.surgePct
        })
    });
    if (!res.ok) {
        throw new Error(`Simulation failed: ${res.statusText}`);
    }
    return res.json();
}
export async function sendChatMessage(message, studentId) {
    const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, student_id: studentId })
    });
    if (!res.ok) {
        throw new Error(`Chat error: ${res.statusText}`);
    }
    return res.json();
}
export async function toggleVehicle(vehicleId) {
    const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/toggle-status`, { method: 'POST' });
    return res.json();
}
export async function toggleRoad(roadId) {
    const res = await fetch(`${API_BASE}/roads/${roadId}/toggle-status`, { method: 'POST' });
    return res.json();
}
