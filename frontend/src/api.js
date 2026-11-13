const API_BASE = '/api';
export async function fetchNetworkState() {
    const res = await fetch(`${API_BASE}/network`);
    if (!res.ok) {
        throw new Error(`Failed to fetch network state: ${res.statusText}`);
    }
    return res.json();
}
export async function fetchExamCrisisState() {
    const res = await fetch(`${API_BASE}/crisis/exam-day`);
    if (!res.ok) {
        throw new Error(`Failed to fetch exam crisis state: ${res.statusText}`);
    }
    return res.json();
}
export async function triggerExamCrisis() {
    const res = await fetch(`${API_BASE}/crisis/exam-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
        throw new Error(`Failed to trigger exam crisis: ${res.statusText}`);
    }
    return res.json();
}
export async function resetCrisisToNormal() {
    const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_type: 'reset' })
    });
    if (!res.ok) {
        throw new Error(`Failed to reset scenario: ${res.statusText}`);
    }
    return res.json();
}
export async function trackBusByNumber(busQuery) {
    const res = await fetch(`${API_BASE}/track/${encodeURIComponent(busQuery)}`);
    if (!res.ok) {
        throw new Error(`Bus not found: ${res.statusText}`);
    }
    return res.json();
}
export async function planTripOptions(originId, destinationId) {
    const res = await fetch(`${API_BASE}/plan-trip?origin=${encodeURIComponent(originId)}&destination=${encodeURIComponent(destinationId)}`);
    if (!res.ok) {
        throw new Error(`Failed to plan trip: ${res.statusText}`);
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
