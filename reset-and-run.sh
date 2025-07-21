#!/bin/bash

echo "Culture Connect Complete Reset & Setup"
echo "------------------------------------"

echo "This script will:"
echo "1. Fix all database name occurrences in the codebase"
echo "2. Clean all Docker containers, images and volumes"
echo "3. Rebuild and start the application"
echo ""

# Make all scripts executable
echo "Making scripts executable..."
chmod +x fix-all-db-names.sh docker-clean.sh restart-docker.sh backend/docker-entrypoint.sh backend/fix-db-config.sh

# Run the fix script first to update all files
echo "Fixing database names in all files..."
./fix-all-db-names.sh

# Run the Docker clean script
echo "Cleaning Docker environment..."
echo "y" | ./docker-clean.sh

# Create the database manually first to ensure it exists with correct name
echo "Creating database with correct name..."
docker run --rm -e POSTGRES_PASSWORD=postgres postgres:15-alpine sh -c "
  sleep 2;
  echo 'Creating PostgreSQL container to initialize database...';
  psql -h localhost -U postgres -c 'DROP DATABASE IF EXISTS \"culture-connect\";';
  psql -h localhost -U postgres -c 'CREATE DATABASE culture_connect;';
  echo 'Database initialized successfully.';
"

# Rebuild and restart the application
echo "Rebuilding and starting application..."
docker-compose up --build -d

# Show logs to help with debugging
echo "Showing logs... (Press Ctrl+C to exit logs)"
docker-compose logs -f 