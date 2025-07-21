#!/bin/bash

echo "Starting Culture Connect Development Environment"

# Make sure Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Build and start the services
echo "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 5

echo "Development environment is now running!"
echo ""
echo "Frontend: http://localhost:19002 (Expo DevTools)"
echo "Backend: http://localhost:5001/health (Health Check)"
echo ""
echo "To stop the environment, run: docker-compose down"
echo "To view logs, run: docker-compose logs -f" 