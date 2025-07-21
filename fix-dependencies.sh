#!/bin/bash

echo "Culture Connect Dependency Fixer"
echo "-------------------------------"

echo "1. Updating @react-native-async-storage/async-storage to latest compatible version"
npm install @react-native-async-storage/async-storage@latest --legacy-peer-deps

echo "2. Forcing resolution of React Native dependencies"
# Create or update .npmrc file
cat > .npmrc << EOL
legacy-peer-deps=true
strict-peer-dependencies=false
EOL

echo "3. Cleaning npm cache"
npm cache clean --force

echo "4. Removing node_modules and package-lock.json"
rm -rf node_modules package-lock.json

echo "5. Reinstalling dependencies with --legacy-peer-deps"
npm install --legacy-peer-deps

echo "6. Completed dependency fixes"
echo "You can now try building the Docker containers again with:"
echo "docker-compose up --build" 