#!/bin/bash

echo "Culture Connect Native Modules Fix"
echo "================================="

echo "This script will enter the backend container and fix native modules like bcrypt"
echo "that may have been compiled for the wrong architecture."

# Check if backend container is running
echo "Checking if backend container is running..."
if ! docker ps | grep -q culture_connect_backend; then
  echo "Backend container is not running. Please start it first."
  exit 1
fi

echo "Backend container is running."

# Execute commands in the backend container
echo "Entering backend container to fix native modules..."
docker exec -it culture_connect_backend sh -c "
  echo 'Inside backend container...'
  
  echo 'Removing bcrypt...'
  npm uninstall bcrypt
  
  echo 'Installing build dependencies...'
  apk add --no-cache make gcc g++ python3 build-base
  
  echo 'Reinstalling bcrypt with --build-from-source...'
  npm install bcrypt --build-from-source
  
  echo 'Rebuilding all native modules...'
  npm rebuild
  
  echo 'Native module fix completed.'
"

echo ""
echo "Fix completed. Please restart the backend container with:"
echo "docker-compose restart backend" 