# Culture Connect

Culture Connect is a mobile application that helps international students connect with others from different cultural backgrounds, join cultural events, and find activity buddies.

## Project Structure

The project is divided into two main parts:
- **Frontend**: React Native app built with Expo Router
- **Backend**: Node.js/Express API with PostgreSQL database

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for PostgreSQL database)
- Expo CLI (`npm install -g expo-cli`)

### Setting Up the Database

1. Start the PostgreSQL database using Docker:
```bash
docker-compose up -d
```

This will start a PostgreSQL database on port 5432.

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a .env file (you can copy from .env.example):
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The backend API will be running on http://localhost:5000.

### Frontend Setup

1. From the project root, install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npx expo start
```

3. Use the Expo Go app on your mobile device to scan the QR code, or run on a simulator/emulator.

## Authentication

The application has a complete authentication system:

- **User registration**: Create a new account with username, email, password, and optional fields
- **User login**: Authenticate with email and password
- **Protected routes**: Only authenticated users can access the main app tabs
- **JWT authentication**: Tokens are stored in AsyncStorage for persistent sessions

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login a user
- **GET /api/auth/me** - Get current user profile (protected)

## Development

### Backend Development

The backend follows a modular structure:
- `models/` - Database models using Sequelize ORM
- `controllers/` - Request handlers
- `routes/` - API route definitions
- `middlewares/` - Custom middleware functions

### Frontend Development

The frontend is built with Expo Router for navigation:
- `app/` - Main screens and navigation
- `components/` - Reusable UI components
- `context/` - React Context providers (Auth, etc.)

## License

[MIT License](LICENSE)
