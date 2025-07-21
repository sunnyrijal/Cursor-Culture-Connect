# Culture Connect Docker Development Setup

This guide explains how to run the Culture Connect application in a Docker development environment.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine

## Services

The Docker setup includes the following services:

1. **PostgreSQL** - Database server
2. **Backend** - Node.js Express API server
3. **Frontend** - Expo React Native application

## Getting Started

### Quick Start

Run the provided script to start all services:

```bash
# Make the script executable
chmod +x start-docker-dev.sh

# Run the script
./start-docker-dev.sh
```

### Manual Setup

If you prefer to run the commands manually:

1. Build and start all services:

```bash
docker-compose up --build -d
```

2. Check the logs:

```bash
docker-compose logs -f
```

3. Stop all services:

```bash
docker-compose down
```

## Access the Application

- **Frontend Expo DevTools**: http://localhost:19002
- **Backend API**: http://localhost:5001/api
- **Backend Health Check**: http://localhost:5001/health

## Using Expo

After starting the services:

1. Open http://localhost:19002 in your browser
2. From the Expo DevTools interface, you can:
   - Run on Web
   - Run on iOS Simulator (requires macOS)
   - Run on Android Emulator
   - Scan the QR code with the Expo Go app to run on a physical device

## Development Workflow

The Docker setup is configured for development mode:

- Changes to the frontend code will trigger hot-reloading
- Changes to the backend code will restart the server
- Database data is persisted in a Docker volume

## Troubleshooting

### General Issues

If you encounter issues:

1. Check the logs:

```bash
docker-compose logs -f
```

2. Restart a specific service:

```bash
docker-compose restart backend
```

3. Rebuild a specific service:

```bash
docker-compose up -d --build backend
```

4. Reset everything (including database):

```bash
docker-compose down -v
docker-compose up --build -d
```

### React Native Dependency Issues

If you're encountering React Native dependency conflicts (especially with @react-native-async-storage/async-storage):

1. Run the dependency fix script:

```bash
chmod +x fix-dependencies.sh
./fix-dependencies.sh
```

2. Or manually fix by adding a .npmrc file with:

```
legacy-peer-deps=true
strict-peer-dependencies=false
```

3. If using Node.js 22 (which is newer than what most React Native packages expect), add this to your package.json:

```json
"overrides": {
  "react-native": "0.72.6"
}
```

4. Rebuild the frontend container:

```bash
docker-compose up -d --build frontend
```

## Notes for Development

- The frontend container exposes ports 19000-19002 and 8081-8082 for Expo and React Native
- The backend container exposes port 5002
- Database data is stored in a Docker volume for persistence
- Environment variables are configured for development use only
- All services communicate on the `culture_connect_network` bridge network 