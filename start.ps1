# GRAMMOVE AI Unified Startup Script
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "  GRAMMOVE AI — Rural Student Mobility Network  " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Green

Write-Host "`n1. Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath ".\venv\Scripts\python.exe" -ArgumentList "-m uvicorn backend.app:app --host 127.0.0.1 --port 8000" -PassThru

Start-Sleep -Seconds 2

Write-Host "2. Launching React + Vite Frontend on http://127.0.0.1:5173..." -ForegroundColor Yellow
Set-Location frontend
npm run dev
