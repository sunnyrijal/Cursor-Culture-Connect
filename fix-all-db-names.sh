#!/bin/bash

echo "Scanning and fixing all occurrences of 'culture-connect' to 'culture_connect'..."

# Find all files that contain "culture-connect" in the backend directory
echo "Searching in backend directory..."
FILES=$(grep -r "culture-connect" --include="*.js" --include="*.json" --include="*.ts" ./backend 2>/dev/null | cut -d: -f1 | sort | uniq)

if [ -z "$FILES" ]; then
  echo "No files found with 'culture-connect' in backend directory."
else
  echo "Found files containing 'culture-connect':"
  echo "$FILES" | xargs -I{} echo " - {}"
  
  # Replace in each file
  echo "Replacing in found files..."
  echo "$FILES" | xargs -I{} sed -i 's/culture-connect/culture_connect/g' {}
  echo "Replacements completed."
fi

# Also look for environment variables or configuration files at the root
echo "Checking for environment files at the root..."
ROOT_FILES=$(grep -r "culture-connect" --include="*.env*" --include="*.json" --include="docker-compose.yml" ./ 2>/dev/null | cut -d: -f1 | sort | uniq)

if [ -z "$ROOT_FILES" ]; then
  echo "No environment files found with 'culture-connect'."
else
  echo "Found environment files containing 'culture-connect':"
  echo "$ROOT_FILES" | xargs -I{} echo " - {}"
  
  # Replace in each file
  echo "Replacing in found files..."
  echo "$ROOT_FILES" | xargs -I{} sed -i 's/culture-connect/culture_connect/g' {}
  echo "Replacements completed."
fi

# Manually check if any seeding scripts might be creating the wrong database
echo "Checking for database seeding scripts..."
SEED_FILES=$(grep -r "createDatabase\|CREATE DATABASE" --include="*.js" --include="*.sql" ./ 2>/dev/null | cut -d: -f1 | sort | uniq)

if [ -n "$SEED_FILES" ]; then
  echo "Found potential database creation scripts:"
  echo "$SEED_FILES" | xargs -I{} echo " - {}"
  echo "You may want to examine these files manually."
fi

echo "Fix process completed!"
echo "Next steps:"
echo "1. Completely remove all Docker volumes, containers, and images"
echo "2. Rebuild with: docker-compose up --build" 