#!/bin/bash

echo "Culture Connect Docker Clean Script"
echo "----------------------------------"

echo "WARNING: This will remove all Culture Connect Docker containers, volumes, and images."
echo "All database data will be lost. This cannot be undone."
read -p "Are you sure you want to continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Operation cancelled."
    exit 1
fi

echo "1. Stopping all running containers..."
docker-compose down

echo "2. Removing PostgreSQL volume..."
docker volume rm cursor-culture-connect_postgres_data || true

echo "3. Removing all related containers..."
docker rm -f culture_connect_frontend culture_connect_backend culture_connect_postgres || true

echo "4. Removing all related images..."
docker images | grep culture-connect | awk '{print $3}' | xargs docker rmi -f || true

echo "5. Pruning unused Docker volumes..."
docker volume prune -f

echo "6. Pruning unused Docker networks..."
docker network prune -f

echo "7. Cleanup complete!"
echo
echo "To rebuild and start fresh, run:"
echo "./restart-docker.sh" 