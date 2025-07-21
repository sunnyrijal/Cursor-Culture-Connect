#!/bin/bash

echo "Scanning and fixing all references to port 5002 to use port 5001 instead..."

# Find all files that contain port 5002
echo "Searching for files with port 5002 references..."
FILES=$(grep -r "5002" --include="*.js" --include="*.json" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.yml" --include="*.sh" --include="Dockerfile*" ./ 2>/dev/null | cut -d: -f1 | sort | uniq)

if [ -z "$FILES" ]; then
  echo "No files found with port 5002 references."
else
  echo "Found files containing port 5002:"
  echo "$FILES" | xargs -I{} echo " - {}"
  
  # Replace in each file
  echo "Replacing in found files..."
  echo "$FILES" | xargs -I{} sed -i 's/5002/5001/g' {}
  echo "Replacements completed."
fi

# Also check Docker files specifically
echo "Checking Docker files..."
DOCKER_FILES=$(grep -r "EXPOSE 5002\|port: 5002\|PORT=5002" --include="Dockerfile*" --include="docker-compose.yml" ./ 2>/dev/null | cut -d: -f1 | sort | uniq)

if [ -z "$DOCKER_FILES" ]; then
  echo "No Docker files found with port 5002 references."
else
  echo "Found Docker files containing port 5002:"
  echo "$DOCKER_FILES" | xargs -I{} echo " - {}"
  
  # Replace in each file
  echo "Replacing in Docker files..."
  echo "$DOCKER_FILES" | xargs -I{} sed -i 's/EXPOSE 5002/EXPOSE 5001/g; s/port: 5002/port: 5001/g; s/PORT=5002/PORT=5001/g' {}
  echo "Docker file replacements completed."
fi

echo "Updating Dockerfile.backend to ensure it uses port 5001..."
sed -i 's/EXPOSE 5002/EXPOSE 5001/g' Dockerfile.backend 2>/dev/null || true

echo "Fix process completed!"
echo "Now rebuild and restart the containers with:"
echo "./restart-docker.sh" 