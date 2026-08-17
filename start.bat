@echo off
echo Starting NeerAI Local Environment...

echo Starting Backend...
start cmd /k "cd backend && uvicorn main:app --reload"

echo Starting Dashboard...
start cmd /k "cd dashboard && npm run dev"

echo Environment started! Both backend and dashboard are running in separate windows.
