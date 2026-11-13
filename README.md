# Routeless / RouteFlow
### *Intelligent Rural Mobility, Dynamic Bus Allocation & Live Road GPS Tracking*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688.svg)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Tailwind%20CSS-38bdf8.svg)](https://react.dev)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet%20%7C%20OpenStreetMap%20%7C%20OSRM-16a34a.svg)](https://leafletjs.com)
[![OR-Tools](https://img.shields.io/badge/Optimization-Google%20OR--Tools%20(MILP)-4285F4.svg)](https://developers.google.com/optimization)
[![Google Gemini](https://img.shields.io/badge/AI%20Copilot-Google%20Gemini%202.5-f59e0b.svg)](https://ai.google.dev)

---

## 🌟 Overview

**Routeless / RouteFlow** (powered by **GRAMMOVE AI**) is an intelligent rural transportation command center and student-friendly mobility web application. It addresses the critical transportation challenges faced by rural students in India by combining:

1. **Google Maps-Style Real Road Live Bus Tracking**: High-precision GPS tracking snapped directly to real-world OpenStreetMap/OSRM road curves with continuous smooth marker animation, dynamic bearing rotation, speedometer, and turn-by-turn navigation HUD.
2. **Interactive Route Planner & Best Travel Recommendations**: Select origin villages and destination colleges to receive realistic road distances, travel durations, and smart comparison between Government Buses (KSRTC), Feeder MiniBuses, and Shared Autos.
3. **Operations Research Dynamic Rescue Engine**: Google OR-Tools Mixed-Integer Linear Programming (MILP) solver that re-optimizes the entire transit network during vehicle breakdowns, road closures, and demand surges.
4. **Exam-Day Emergency Crisis Mode**: Specialized triage system prioritizing students with imminent examination deadlines over secondary trips.
5. **AI Student Travel Assistant**: Plain-English and regional language query resolution powered by Google Gemini.

---

## 📸 Core Modules & User Interface

### 1. 🚌 Live GPS Bus Tracker (Google Maps Navigation Experience)
- **Real-World Road Snapping**: Uses OpenStreetMap OSRM geometries for actual roads (e.g. Byramangala reservoir curves, Bidadi highway corridor) rather than straight-line cuts.
- **Continuous Smooth Movement**: Dynamic animation along road waypoints with automatic bearing calculation, rotating the directional puck to align with curves.
- **Directional Flow Chevrons**: Subtle Google Maps arrows along the route polyline indicating direction of travel.
- **Turn-by-Turn Navigation HUD**: Floating dark HUD displaying upcoming turns, speed (`42 km/h`), cardinal compass heading, and next stop ETA.
- **Interactive Map Badges**: Pinned ETA pill (`14 min • 7.5 km`), start waypoint circle, and Google Maps red destination pin.
- **Full Fleet Dropdown**: Switch between all 13 fleet vehicles (KSRTC Express Buses, Feeder MiniBuses, Gramina Mitra Shared Autos).
- **Working Action Buttons**: Save Route (with persistent bookmarking), Notify Me / Set Reminder (5-min advance alert), Share Trip (clipboard link copy), and Call Driver (direct dialer modal).

### 2. 🗺️ Route Planner & Travel Options
- **Origin & Destination Selectors**: Real-time selection of boarding villages (Byramangala, Doddamallur, Sugganahalli, Akkur, etc.) and destination colleges (Ramanagara Govt Polytechnic, Bidadi Tech Academy, Channapatna ITI, etc.).
- **Swap Origin/Destination**: One-click corridor reversal with recalculated realistic road distance and duration.
- **Comparative Options**:
  - ⭐ **AI Recommended Best Choice**: Highlighted with rationale (guaranteed seating, zero transfers, arrives before 08:45 AM deadline).
  - **Feeder MiniBuses**: Point-to-point quick connectors.
  - **Shared Autos**: Last-mile micro-transit.
- **Filter & Sort**: Filter by vehicle type (Government Bus, MiniBus, Auto) and sort by soonest arrival, fastest travel time, or seat availability.

### 3. 🚨 Operations Research Dynamic Rescue Engine
- Mathematical optimization using **Google OR-Tools** (SCIP/CBC MIP solvers).
- **Objectives**:
  1. Maximize transported student count.
  2. Minimize total network travel time and detour distance.
  3. Minimize students arriving past their arrival deadlines.
  4. Maximize vehicle seating utilization.
- **Constraints**:
  - Vehicle capacity constraints ($c_v \le C_v$).
  - Vehicle availability constraints ($x_{v} = 0$ if broken down).
  - Road closure constraints (edges removed from path graph).
  - Destination compatibility (incompatible clusters separated).

### 4. ⚡ Exam-Day Emergency Crisis Mode
- Dedicated emergency control room activated with one click.
- Handles 4 simultaneous crises:
  1. Multiple bus breakdowns.
  2. +40% unexpected demand surge.
  3. Flooded road connection (SH-17 bridge blocked).
  4. Examination deadlines ($<60$ min Priority 1, $<120$ min Priority 2).
- Returns honest allocation diagnostics (e.g. `CAPACITY_EXHAUSTED` with exact seat shortage rather than fabricated results).

---

## 🛠️ Architecture & Tech Stack

```
PromptBattle/
├── backend/
│   ├── app.py                     # FastAPI REST API endpoints & CORS
│   ├── models.py                  # Pydantic v2 schemas (Student, Vehicle, Location, Route)
│   ├── simulator.py               # Live network state management & disruption triggers
│   ├── solver.py                  # Google OR-Tools MILP optimization engine
│   ├── data_generator.py          # Realistic Ramanagara synthetic student & fleet data
│   ├── ai_assistant.py            # Gemini 2.5 Flash assistant with local fallback
│   ├── fetch_cache.py             # OpenStreetMap OSRM street geometry pre-fetcher
│   └── road_geometry_cache.json   # High-precision road polylines for all 13 vehicles
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LiveBusTracker.tsx        # Google Maps navigation & animated bus puck
│   │   │   ├── SearchResultsView.tsx     # Origin/Dest selector & trip planner options
│   │   │   ├── HomeView.tsx              # Welcome dashboard & quick route suggestions
│   │   │   ├── SavedRoutesView.tsx       # Bookmarked routes & quick tracking
│   │   │   ├── NearbyStopsView.tsx       # Radius stop finder & interactive map
│   │   │   ├── NotificationsView.tsx     # Route alerts & delay notifications
│   │   │   ├── SettingsView.tsx          # Support, FAQs, emergency helplines
│   │   │   ├── ExamCrisisCommandCenter.tsx # Emergency OR-Tools crisis triage UI
│   │   │   ├── Sidebar.tsx               # RouteFlow navigation drawer
│   │   │   └── TopNav.tsx                # Universal search & status indicators
│   │   ├── api.ts                        # Axios API client
│   │   ├── types.ts                      # TypeScript interfaces
│   │   └── App.tsx                       # State coordination & view router
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.app.json
├── test_or_engine.py              # Automated test suite for OR-Tools optimization
├── test_system.py                 # End-to-end integration test suite
├── requirements.txt               # Backend Python dependencies
├── start.ps1                      # One-click startup script (PowerShell)
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vanillaaz/Routeless.git
   cd Routeless
   ```

2. **Set up Backend:**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt

   # (Optional) Add your Gemini API key in .env:
   # GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Set up Frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

**Option A: One-Click Startup (Windows PowerShell):**
```powershell
.\start.ps1
```

**Option B: Separate Terminals:**

- **Terminal 1 (Backend):**
  ```powershell
  .\venv\Scripts\activate
  uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
  ```

- **Terminal 2 (Frontend):**
  ```powershell
  cd frontend
  npm run dev
  ```

Access the frontend at: **`http://127.0.0.1:5173`**  
Access the backend API docs at: **`http://127.0.0.1:8000/docs`**

---

## 🧪 Verification & Testing

The repository includes comprehensive automated verification suites:

1. **Operations Research Test Suite:**
   ```bash
   python test_or_engine.py
   ```
   *Verifies single breakdown, multiple breakdowns, road closures, demand surge, bottleneck honesty, and exam-day crisis.*

2. **System Integration Test Suite:**
   ```bash
   python test_system.py
   ```
   *Verifies API endpoints, health check, baseline reset, and AI travel assistant responses.*

3. **Frontend Production Build:**
   ```bash
   cd frontend
   npm run build
   ```
   *Verifies clean TypeScript compilation and Vite minification with zero errors.*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check and Gemini status |
| `GET` | `/api/network` | Full network snapshot (stops, vehicles, active disruptions) |
| `GET` | `/api/track/{bus_query}` | Live bus GPS coordinates, speed, stops, and road geometry |
| `GET` | `/api/plan-trip?origin={id}&destination={id}` | Dijkstra/OSRM route planning with vehicle recommendations |
| `POST` | `/api/optimize` | Runs Google OR-Tools MILP optimization engine |
| `POST` | `/api/crisis/exam-day` | Triggers the 4-part emergency exam crisis simulation |
| `POST` | `/api/chat` | AI travel assistant query processing |
| `POST` | `/api/disruptions/reset` | Resets all disruptions back to standard morning operations |

---

## 📄 License
This project is licensed under the MIT License.
