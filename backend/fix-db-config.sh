#!/bin/sh

echo "Fixing database configuration for Docker environment..."

# Check if the config file exists
if [ -f "./src/config/config.js" ]; then
  echo "Found config.js file, updating database name..."
  # Replace any instance of "culture-connect" with "culture_connect" in the config file
  sed -i 's/culture-connect/culture_connect/g' ./src/config/config.js
  echo "Updated config.js"
fi

# Also check for .env files
if [ -f ".env" ]; then
  echo "Found .env file, updating database URL..."
  # Replace in .env file
  sed -i 's/culture-connect/culture_connect/g' .env
  echo "Updated .env file"
fi

# Check if there's a direct database URL in the environment variables
if [ -f "./src/index.js" ]; then
  echo "Checking index.js for DATABASE_URL..."
  sed -i 's/culture-connect/culture_connect/g' ./src/index.js
  echo "Updated index.js"
fi

echo "Database configuration fix completed!"
echo "Now you can restart your containers to apply the changes." 