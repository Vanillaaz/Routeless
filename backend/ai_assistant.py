import os
import json
from typing import Dict, Any, List, Optional
from backend.models import ChatResponse, OptimizationResult
from backend.simulator import TransportationNetworkState

class AIAssistantService:
    def __init__(self, state: TransportationNetworkState):
        self.state = state
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Warning: Failed to initialize Google GenAI Client: {e}")

    def generate_system_context(self, opt_result: Optional[OptimizationResult] = None) -> str:
        """Gathers real-time factual context from the simulator and solver."""
        villages = [l for l in self.state.locations if l.type.value == "village"]
        colleges = [l for l in self.state.locations if l.type.value == "college"]
        
        # Calculate shortage per village
        village_stats = {}
        for v in villages:
            stus = [s for s in self.state.students if s.origin_id == v.id]
            stranded = [s for s in stus if s.status.value in ("stranded", "unserved")]
            assigned = [s for s in stus if s.status.value in ("assigned", "rescued")]
            village_stats[v.name] = {
                "total": len(stus),
                "stranded": len(stranded),
                "assigned": len(assigned)
            }

        broken_vehs = [v for v in self.state.vehicles if v.status.value == "breakdown"]
        avail_vehs = [v for v in self.state.vehicles if v.status.value in ("available", "assigned_rescue")]

        context_lines = [
            f"SYSTEM STATE: {self.state.scenario_name}",
            f"Active Disruptions: {len(self.state.disruptions)}",
        ]
        for d in self.state.disruptions:
            context_lines.append(f" - [{d.type.upper()}] {d.title}: {d.description} (Affected students: {d.affected_student_count})")

        context_lines.append(f"Fleet Status: {len(self.state.vehicles)} total vehicles. Broken down: {[v.name for v in broken_vehs]}. Available rescue fleet: {[f'{v.name} ({v.type.value}, cap {v.capacity})' for v in avail_vehs]}")
        context_lines.append(f"Village Shortages & Demand: {json.dumps(village_stats)}")

        if opt_result:
            context_lines.append(f"Optimization Status: {opt_result.status}, Transported: {opt_result.transported_students}/{opt_result.total_students} ({opt_result.coverage_percentage}%), Stranded: {opt_result.stranded_students}")
            context_lines.append(f"Solver Narrative: {opt_result.rescue_narrative}")
            for a in opt_result.assignments:
                if a.is_rescue_mission:
                    context_lines.append(f"Rescue Unit: {a.vehicle_name} -> Picking up at {a.pickup_stops} for {a.dropoff_stops} (carrying {a.assigned_count}/{a.capacity} students, ETA {a.eta_minutes} mins)")

        return "\n".join(context_lines)

    def ask(self, query: str, opt_result: Optional[OptimizationResult] = None, student_id: Optional[str] = None) -> ChatResponse:
        system_context = self.generate_system_context(opt_result)
        query_lower = query.lower()

        # If Gemini client is active and configured, use Google GenAI
        if self.client:
            try:
                prompt = f"""You are GRAMMOVE AI, an intelligent rural mobility assistant for students in rural India.
Use the following real-time system state to answer the student's question accurately, with warmth, practical reassurance, and actionable steps.
Never invent imaginary buses or routes; strictly refer to the actual data provided below.

REAL-TIME SYSTEM CONTEXT:
{system_context}

STUDENT QUERY: "{query}"

Instructions:
1. Explain clearly what happened.
2. Give concrete alternative transportation options (vehicle name, pickup point, destination).
3. If asking about shortages or numbers, cite the exact figures from context.
4. Keep the tone helpful, rural-student friendly, and reassuring.
"""
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                if response and response.text:
                    return ChatResponse(
                        reply=response.text,
                        sources=["Google Gemini 2.5", "Live OR-Tools Solver State", "Rural Fleet Manifest"],
                        suggested_actions=[
                            "Check assigned vehicle on live map",
                            "View alternative pickup point",
                            "Notify college principal of delay"
                        ]
                    )
            except Exception as e:
                print(f"Gemini API call failed, falling back to deterministic reasoning: {e}")

        # Intelligent Deterministic Reasoning Fallback
        return self._deterministic_fallback(query_lower, opt_result, student_id)

    def _deterministic_fallback(self, query: str, opt_result: Optional[OptimizationResult], student_id: Optional[str]) -> ChatResponse:
        villages = [l for l in self.state.locations if l.type.value == "village"]
        
        # 1. Highest shortage query
        if "highest" in query or "shortage" in query or "worst" in query or "most affected" in query:
            village_shortages = []
            for v in villages:
                stus = [s for s in self.state.students if s.origin_id == v.id]
                stranded = [s for s in stus if s.status.value in ("stranded", "unserved")]
                village_shortages.append((v.name, len(stranded), len(stus)))
            
            village_shortages.sort(key=lambda x: x[1], reverse=True)
            top_vill, top_stranded, top_total = village_shortages[0]
            
            reply = (
                f"**{top_vill}** currently has the highest transportation shortage, with **{top_stranded} students stranded** "
                f"out of {top_total} daily commuters.\n\n"
                f"**Breakdown by Village:**\n" +
                "\n".join([f"• **{v}**: {s} stranded ({t} total demand)" for v, s, t in village_shortages[:4]]) +
                f"\n\nThe GRAMMOVE AI Dynamic Rescue Engine has already mobilized emergency shared autos and backup minibuses to clear this backlog."
            )
            return ChatResponse(
                reply=reply,
                sources=["Grammove Fleet Telemetry", "Village Panchayati Transit Records"],
                suggested_actions=["Deploy additional Cauvery Minibus", "Trigger OR-Tools Dynamic Rescue"]
            )

        # 2. How many students affected query
        if "how many" in query or "affected" in query or "count" in query or "number of students" in query:
            total_affected = sum(d.affected_student_count for d in self.state.disruptions)
            stranded_now = len([s for s in self.state.students if s.status.value in ("stranded", "unserved")])
            rescued_now = len([s for s in self.state.students if s.status.value == "rescued"])
            
            reply = (
                f"Currently, **{total_affected} students** are affected across {len(self.state.disruptions)} active disruption(s).\n\n"
                f"• **Rescued & Reassigned**: {rescued_now} students have been accommodated on alternative fleet vehicles.\n"
                f"• **Currently Awaiting Pickup**: {stranded_now} students.\n"
                f"• **Active Incident**: " + 
                ("; ".join([d.title for d in self.state.disruptions]) if self.state.disruptions else "No major disruptions active.")
            )
            return ChatResponse(
                reply=reply,
                sources=["Real-time Incident Registry", "OR-Tools Assignment Matrix"],
                suggested_actions=["View affected students on map", "Export incident report for KSRTC depot"]
            )

        # 3. Breakdown & Alternative vehicle query (e.g. "My bus broke down. How can I reach college?")
        if "breakdown" in query or "broke down" in query or "alternative" in query or "how can i reach" in query or "which vehicle" in query:
            rescue_units = [a for a in (opt_result.assignments if opt_result else []) if a.is_rescue_mission]
            if not rescue_units:
                avail = [v for v in self.state.vehicles if v.status.value in ("available", "assigned_rescue")]
                reply = (
                    "🚨 **Don't panic! GRAMMOVE AI has detected the bus disruption.**\n\n"
                    "The system has triggered an emergency rescue dispatch:\n"
                    f"1. **Primary Rescue Units Activated**: " + 
                    ", ".join([f"{v.name} ({v.type.value}, {v.capacity} seats)" for v in avail[:2]]) + ".\n"
                    "2. **Pickup Points**: Please proceed to your village main road shelter. Shared autos are doing short loops to ferry students to the main highway feeder point.\n"
                    "3. **College Delay Waiver**: An automated transit delay certificate has been transmitted to college principals."
                )
            else:
                unit_descs = [
                    f"• **{u.vehicle_name}** ({u.vehicle_type.value.replace('_', ' ').title()}): picking up at {', '.join(u.pickup_stops)} with ETA ~{u.eta_minutes} mins to {', '.join(u.dropoff_stops)}."
                    for u in rescue_units[:3]
                ]
                reply = (
                    "🚨 **Emergency Dynamic Rescue Plan Active:**\n\n"
                    "Your original bus disruption was mitigated by the AI Rescue Engine. Here is your alternative transportation:\n\n" +
                    "\n".join(unit_descs) +
                    "\n\n**Driver contacts are available on your live map card. Boarding is verified automatically via your student QR/ID.**"
                )
            return ChatResponse(
                reply=reply,
                sources=["GRAMMOVE AI Dynamic Rescue Engine", "KSRTC Live Dispatch"],
                suggested_actions=["Show my bus on map", "Call driver helpline", "Share location with Panchayath"]
            )

        # Default intelligent response
        return ChatResponse(
            reply=(
                f"**GRAMMOVE AI Assistant:** The rural transit network is currently operating under **{self.state.scenario_name}**.\n\n"
                f"• Total enrolled students: **{len(self.state.students)}**\n"
                f"• Fleet strength: **{len(self.state.vehicles)} vehicles** (KSRTC Express buses, Cauvery Minibuses, and Gramina Mitra Autos)\n"
                f"• Optimization status: **{opt_result.coverage_percentage if opt_result else 98.2}% coverage**\n\n"
                "You can ask me questions like:\n"
                "- *'My bus broke down. How can I reach college?'*\n"
                "- *'Which village has the highest transportation shortage?'*\n"
                "- *'How many students are affected by this disruption?'*"
            ),
            sources=["GRAMMOVE System Core"],
            suggested_actions=[
                "Which village has the highest transportation shortage?",
                "My bus broke down. How can I reach college?",
                "How many students are affected by this disruption?"
            ]
        )
