#!/bin/bash

echo "Restarting Culture Connect Docker Environment"
echo "-------------------------------------------"

echo "1. Stopping all containers..."
docker-compose down

echo "2. Rebuilding all containers..."
docker-compose build --no-cache

echo "3. Starting all containers..."
docker-compose up -d

echo "4. Displaying container status..."
docker-compose ps

echo "5. Showing logs..."
echo "To exit logs, press CTRL+C"
docker-compose logs -f 