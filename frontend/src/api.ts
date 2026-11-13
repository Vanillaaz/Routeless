import type { NetworkStateResponse, OptimizationResult, ChatMessage } from './types';

const API_BASE = '/api';

export async function fetchNetworkState(): Promise<NetworkStateResponse> {
  const res = await fetch(`${API_BASE}/network`);
  if (!res.ok) {
    throw new Error(`Failed to fetch network state: ${res.statusText}`);
  }
  return res.json();
}

export async function trackBusByNumber(busQuery: string): Promise<any> {
  const res = await fetch(`${API_BASE}/track/${encodeURIComponent(busQuery)}`);
  if (!res.ok) {
    throw new Error(`Bus not found: ${res.statusText}`);
  }
  return res.json();
}

export async function planTripOptions(originId: string, destinationId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/plan-trip?origin=${encodeURIComponent(originId)}&destination=${encodeURIComponent(destinationId)}`);
  if (!res.ok) {
    throw new Error(`Failed to plan trip: ${res.statusText}`);
  }
  return res.json();
}

export async function sendChatMessage(message: string, studentId?: string): Promise<{
  reply: string;
  sources: string[];
  suggested_actions: string[];
}> {
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
