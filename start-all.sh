#!/bin/bash

# Start backend server
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start frontend server
echo "Starting frontend server..."
cd ..
npm start &
FRONTEND_PID=$!

# Setup trap to kill both processes on exit
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT

# Keep script running
wait 