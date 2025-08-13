#!/bin/bash

# Create a .env file
echo "Creating .env file for the backend"
cat > backend/.env << EOF
# PostgreSQL connection URL
DATABASE_URL="postgresql://app_user:securepassword@localhost:5432/culture_connect"

# JWT Secret for auth
JWT_SECRET="yourSecretKeyHere"

# API Port
PORT=3001
EOF

# Start the database container
echo "Starting PostgreSQL container"
docker-compose up -d db

# Wait for the database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run migrations
echo "Running Prisma migrations"
cd backend && npx prisma migrate dev --name add_event_images_and_groups

echo "Setup completed successfully!" 