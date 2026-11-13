@echo off
echo Starting GRAMMOVE AI Backend (FastAPI + OR-Tools)...
.\venv\Scripts\python.exe -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
pause

