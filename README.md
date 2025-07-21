# Culture Connect

Culture Connect is a mobile application designed to help international students connect with others who share their cultural background, as well as to explore and learn about different cultures. The app facilitates community building through events, groups, and activity buddy matching.

## Features

- **Authentication System**: Secure login/registration with JWT
- **User Profiles**: Create and customize your profile with cultural information
- **Groups**: Join and create cultural and interest-based groups
- **Events**: Discover, create, and RSVP to cultural events
- **Activity Buddy**: Find partners for activities based on preferences and availability
- **Chat System**: Direct messaging and group conversations
- **Cultural Stories**: Share and explore stories from different cultures

## Technology Stack

### Frontend
- React Native with Expo
- TypeScript
- Context API for state management
- Lucide React Native for icons
- React Navigation for routing

### Backend
- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- PostgreSQL database

### Backend Setup
1. Clone the repository:
   ```
   git clone https://github.com/your-username/culture-connect.git
   cd culture-connect
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `backend` directory with:
   ```
   PORT=3000
   DATABASE_URL=postgres://username:password@localhost:5432/culture_connect
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Initialize the database and seed data:
   ```
   npm run sync:db
   npm run seed:activities
   npm run seed:mock
   ```

5. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Install frontend dependencies:
   ```
   cd ..  # Return to project root
   npm install
   ```

2. Configure the API URL:
   Update the API URL in `data/api.ts` to match your backend server address.

3. Start the frontend:
   ```
   npm start
   ```

4. Use Expo Go to run the app on your device or emulator.

## Testing the API

We've included a comprehensive API testing guide and tools to verify the backend functionality:

1. Follow the instructions in `API_TESTING.md` to test individual API endpoints
2. Use the built-in API Test screen in the app to test the API connections

## Project Structure

- `/app` - Main application screens and navigation
- `/components` - Reusable UI components
- `/data` - API and context providers
- `/backend` - Server-side code
  - `/src/controllers` - API endpoint controllers
  - `/src/models` - Database models
  - `/src/routes` - API route definitions
  - `/src/middleware` - Custom middleware functions
  - `/src/scripts` - Database initialization and seeding scripts

## Frontend-Backend Integration

The frontend communicates with the backend using RESTful API calls. The integration is handled through:

1. **API Helper Functions** (`data/api.ts`): Centralized functions for API calls
2. **Context Providers**: State management and API interaction abstraction
   - `authContext.tsx` - Authentication
   - `groupContext.tsx` - Groups
   - `eventContext.tsx` - Events
   - `activityContext.tsx` - Activity buddy
   - `chatContext.tsx` - Messaging

For detailed information on the integration, see `FRONTEND_API_INTEGRATION.md`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
