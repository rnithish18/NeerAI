#!/bin/bash
echo "Starting NeerAI Local Environment..."

(cd backend && uvicorn main:app --reload) &
BACKEND_PID=$!

(cd dashboard && npm run dev) &
FRONTEND_PID=$!

echo "Environment started! Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT
wait
