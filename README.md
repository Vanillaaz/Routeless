# GRAMMOVE AI
### *Smart Bus Allocation & Live Bus Tracking for Rural Students*

[![Built for Students](https://img.shields.io/badge/Designed%20For-Rural%20Students-emerald.svg)](https://github.com)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-blue.svg)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Tailwind%20CSS-teal.svg)](https://react.dev)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet%20%7C%20OpenStreetMap-green.svg)](https://leafletjs.com)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5-orange.svg)](https://ai.google.dev)

---

## 1. What is GRAMMOVE AI?
**GRAMMOVE AI** is a simple, student-friendly web application designed to help rural college students in India travel safely and reach their educational institutions on time.

Instead of cluttered admin simulators or confusing control panels, **GRAMMOVE AI** focuses 100% on what students actually need:
1. **Live Bus Tracking**: Enter your bus number (e.g. `KA-42-F-1024` or `BUS-101`) to see its live movement on the map, current speed, available seats, and next stop.
2. **Bus Stops & Timestamps**: View all stops along the route with scheduled departure and estimated arrival times.
3. **Smart Route Finder & Best Travel Recommendation**: Select your village and your college; the system compares all options (Government Buses, Minibuses, and Shared Autos) and **recommends the best option** (fastest, direct, guaranteed seats before college deadlines).
4. **Friendly AI Student Assistant**: An attractive, welcoming AI copilot that answers student questions in plain English or Kannada transliteration.

---

## 2. Core Student Features

### 🚌 A. Live Bus Tracker
- **Search by Bus Number or Route**:
  Enter your bus number (e.g., `KA-42-F-1024`, `BUS-101`, `KA-42-F-2180`, `KA-42-M-4412`) or tap any popular route pill.
- **Real-Time Telemetry & Movement**:
  - Live bus location with animated pulsating marker moving along the route corridor.
  - Live speed indicator (e.g., `38 km/h`).
  - Next stop alert with arrival timestamp (e.g., `Next: Vibhutikere Cross at 07:48 AM`).
  - Seat availability counter (e.g., `12 Seats Available`).
- **Route Stops & Timestamps Stepper**:
  - Step-by-step visual vertical timeline showing all scheduled stops with arrival timestamps and status (`Departed ✓`, `Approaching Now`, `Upcoming`).
- **Driver Telemetry**:
  - Assigned driver name and one-click call button.

### 🗺️ B. Smart Route Finder & Travel Recommendations
- **Simple 2-Step Trip Planner**:
  - Step 1: Select your starting village (e.g., `Doddamallur`, `Byramangala`, `Harohalli`, `Kailancha`, `Akkur`, `Vibhutikere`, `Sugganahalli`, `Maralawadi`).
  - Step 2: Select your destination college (e.g., `Ramanagara Govt Polytechnic`, `Channapatna First Grade College & ITI`, `Bidadi Tech Academy`, `Kanakapura Medical Institute`).
- **Compares All Travel Options**:
  - **Option 1 (⭐ AI RECOMMENDED BEST ROUTE)**: Highlighted with an emerald card and verified badge explaining why it's the best (e.g. *Direct ride, zero transfers, arrives at 08:15 AM well before 08:45 AM deadline, free with student bus pass*).
  - **Option 2 (Cauvery Rural Minibus)**: Quick ride, ₹10 subsidized fare, comfortable seating.
  - **Option 3 (Gramina Mitra Shared Auto)**: Earliest arrival option for morning diploma practicals.
- **One-Click Live Tracking**:
  - Every option has a **"Track This Bus Live"** button that instantly transitions to the live map tracker for that specific vehicle.

### 📍 C. Bus Stops & Timetable Directory
- **Interactive Map**: Displays all designated village bus shelters and higher education campus stops across the Ramanagara taluk cluster.
- **Stop Timetables**: Click any stop to see all morning buses passing through with their scheduled departure times (07:15 AM – 09:00 AM window).
- Filter between *Village Shelters* and *College Campuses*.

### 🤖 D. Attractive Student AI Assistant
- Friendly, cheerful AI travel copilot powered by Google Gemini (with real-time fallback).
- Quick questions:
  - *"Which bus goes to Ramanagara Govt Polytechnic?"*
  - *"Is bus KA-42-F-1024 on time?"*
  - *"What is the best route from Byramangala?"*
  - *"My bus broke down. How can I reach college?"*
- Clear, student-friendly recommendations with bus numbers, pickup shelters, and timings.

---

## 3. Quick Start & Execution

### Prerequisites
- Python 3.11 or 3.12
- Node.js v18+ and npm

### Run with One Command:
```powershell
.\start.ps1
```

Or run backend and frontend separately:

**Backend (Terminal 1):**
```powershell
.\venv\Scripts\activate
uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

**Frontend (Terminal 2):**
```powershell
cd frontend
npm run dev
```

Open your browser at: **`http://localhost:5173/`**

---

## 4. API Endpoints for Student Travel

- `GET /api/track/{bus_query}`: Real-time tracking telemetry, current stop, next stop ETA, and stop timetable for any bus number.
- `GET /api/plan-trip?origin={village}&destination={college}`: Evaluates all available travel options and flags the best recommended choice.
- `GET /api/network`: Returns all village bus shelters, colleges, and active fleet vehicles.
- `POST /api/chat`: AI student travel assistant query.
