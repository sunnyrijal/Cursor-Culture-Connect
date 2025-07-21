#!/bin/sh
set -e

echo "Starting Culture Connect Backend..."

# Fix database configuration with shell script
if [ -f "./fix-db-config.sh" ]; then
  echo "Running database configuration fix script..."
  chmod +x ./fix-db-config.sh
  ./fix-db-config.sh
else
  echo "Database configuration fix script not found."
fi

# Run Node.js database fix script if it exists
if [ -f "./fix-db-init.js" ]; then
  echo "Running Node.js database configuration fix script..."
  node ./fix-db-init.js
else
  echo "Node.js database configuration fix script not found."
fi

# Check bcrypt installation
if [ -f "./rebuild-bcrypt.js" ]; then
  echo "Checking bcrypt installation..."
  node ./rebuild-bcrypt.js
  if [ $? -ne 0 ]; then
    echo "Failed to fix bcrypt. Attempting manual fix..."
    # Fallback manual fix for bcrypt
    npm uninstall bcrypt
    npm install bcrypt --build-from-source
  fi
else
  echo "bcrypt check script not found. Checking if bcrypt needs rebuilding..."
  # Try to load bcrypt to see if it works
  node -e "try { require('bcrypt'); console.log('bcrypt is working.'); } catch(e) { console.error('bcrypt needs rebuilding.'); process.exit(1); }" || npm rebuild bcrypt --build-from-source
fi

# Direct DATABASE_URL override if provided
if [ ! -z "$DATABASE_URL" ]; then
  echo "Using provided DATABASE_URL from environment..."
  # Force the correct database name in the connection string
  export DATABASE_URL=$(echo $DATABASE_URL | sed 's/culture-connect/culture_connect/g')
  echo "Updated DATABASE_URL: $DATABASE_URL"
fi

# Create database if it doesn't exist
# Give Postgres time to start up
echo "Waiting for PostgreSQL to start..."
sleep 5

echo "Checking if database exists..."
pg_isready -h postgres -U postgres
if [ $? -ne 0 ]; then
  echo "Postgres is not ready yet, waiting longer..."
  sleep 10
fi

# Using PSQL to check if the database exists and create it if needed
echo "Creating database if not exists..."
PGPASSWORD=postgres psql -h postgres -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'culture_connect'" | grep -q 1 || PGPASSWORD=postgres psql -h postgres -U postgres -c "CREATE DATABASE culture_connect"
echo "Database check complete."

# Drop the incorrect database if it exists
echo "Dropping incorrect database if it exists..."
PGPASSWORD=postgres psql -h postgres -U postgres -tc "DROP DATABASE IF EXISTS \"culture-connect\"" 
echo "Database cleanup complete."

# Start the application
echo "Starting Node.js application..."
exec "$@" 