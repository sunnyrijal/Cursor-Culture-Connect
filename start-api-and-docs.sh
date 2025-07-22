#!/bin/bash

# Start the backend server
echo "Starting the backend API server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start the Swagger UI
echo "Starting the Swagger UI server..."
cd ../swagger
npm start &
SWAGGER_PID=$!

# Function to handle termination
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $SWAGGER_PID
    exit 0
}

# Trap signals to call cleanup function
trap cleanup INT TERM

echo "Services started:"
echo "- Backend API: http://localhost:5002"
echo "- Swagger UI: http://localhost:3000"
echo "Press Ctrl+C to stop both servers."

# Keep script running
wait 