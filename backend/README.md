# Culture Connect Backend

## Authentication System

The backend implements a robust session-based authentication system with JWT token fallback. This provides both security and flexibility for different client environments.

### Features

- Session-based authentication using Redis for session storage
- JWT token fallback for clients that don't support cookies
- Email domain validation (.edu emails only)
- Secure password hashing with bcrypt
- Protected routes with authentication middleware

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- Redis
- Docker and Docker Compose (optional, for containerized setup)

### Environment Variables

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

Update the following variables in the `.env` file:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `SESSION_SECRET`: Secret key for session encryption

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run db:seed
```

### Running with Docker

The easiest way to run the backend is using Docker Compose:

```bash
# From the project root directory
docker-compose up
```

This will start the PostgreSQL database, Redis server, and the backend API.

### Running Locally

```bash
# Start the development server
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/signup`: Register a new user (requires .edu email)
- `POST /api/auth/login`: Login and create a session
- `POST /api/auth/logout`: Logout and destroy the session
- `GET /api/auth/check-session`: Check if user has an active session

### User Profile

- `GET /api/users/profile`: Get the current user's profile
- `PUT /api/users/profile`: Update the current user's profile
- `GET /api/users/:id`: Get a user's public profile by ID

### Groups

- `GET /api/groups`: Get all groups
- `POST /api/groups`: Create a new group
- `GET /api/groups/:id`: Get a group by ID

### Events

- `GET /api/events`: Get all events
- `POST /api/events`: Create a new event
- `GET /api/events/:id`: Get an event by ID