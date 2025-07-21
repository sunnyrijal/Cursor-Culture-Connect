# Culture Connect - Backend API

This is the backend API for the Culture Connect application, built with Node.js, Express, and PostgreSQL.

## Table of Contents
- [Setup](#setup)
- [Database](#database)
- [Running the Server](#running-the-server)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth-endpoints)
  - [Users](#user-endpoints)
  - [Groups](#group-endpoints)
  - [Events](#event-endpoints)
  - [Activities](#activity-endpoints)
  - [Chat](#chat-endpoints)
- [Data Migration](#data-migration)

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file in the `backend` directory with the following contents:
```
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
DB_USER=postgres
DB_PASS=postgres
DB_NAME=culture_connect
DB_HOST=localhost
```

## Database

The backend uses PostgreSQL with Sequelize ORM. Make sure you have PostgreSQL running before starting the server.

1. Start PostgreSQL using Docker:
```bash
docker-compose up -d
```

2. Sync the database models:
```bash
# The models are automatically synced when starting the server
npm run dev
```

3. Seed the database with activities and mock data:
```bash
npm run seed
```

## Running the Server

Start the development server:
```bash
npm run dev
```

The server will run on port 5000 by default. If port 5000 is in use, it will try ports 5001, 5002, etc.

## Authentication

Authentication is handled using JSON Web Tokens (JWT). 

- Register a new user: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Get current user: `GET /api/auth/me` (requires authentication token)

For protected endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Auth Endpoints

#### Register a new user
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe",
  "university": "Stanford University",
  "major": "Computer Science",
  "year": "Junior",
  "heritage": ["American", "Italian"],
  "languages": ["English", "Italian"]
}
```
- **Response**: 
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "university": "Stanford University",
    "major": "Computer Science",
    "year": "Junior",
    "heritage": ["American", "Italian"],
    "languages": ["English", "Italian"],
    "verified": false
  },
  "token": "jwt_token_here"
}
```

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**: 
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "university": "Stanford University",
    "major": "Computer Science",
    "year": "Junior",
    "heritage": ["American", "Italian"],
    "languages": ["English", "Italian"],
    "verified": false
  },
  "token": "jwt_token_here"
}
```

#### Get Current User
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "university": "Stanford University",
    "major": "Computer Science",
    "year": "Junior",
    "heritage": ["American", "Italian"],
    "languages": ["English", "Italian"],
    "verified": false,
    "connections": [...]
  }
}
```

### User Endpoints

#### Get all users
- **URL**: `/api/users`
- **Method**: `GET`
- **Query Parameters**:
  - `university`: Filter by university
  - `heritage`: Filter by heritage
  - `search`: Search by name, university, or bio
  - `limit`: Number of results (default: 10)
  - `offset`: Pagination offset (default: 0)
- **Response**:
```json
{
  "success": true,
  "count": 50,
  "users": [...]
}
```

#### Get user by ID
- **URL**: `/api/users/:id`
- **Method**: `GET`
- **Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "university": "Stanford University",
    "major": "Computer Science",
    "year": "Junior",
    "title": "Computer Science Student",
    "heritage": ["American", "Italian"],
    "languages": ["English", "Italian"],
    "bio": "Bio text here",
    "image": "https://example.com/avatar.jpg",
    "verified": false,
    "location": "Palo Alto, CA",
    "country": "United States",
    "state": "California",
    "isPublic": true,
    "groups": [...],
    "isConnected": true,
    "mutualConnections": 5,
    "joinedGroups": 3,
    "connections": 12,
    "eventsAttended": 8
  }
}
```

#### Update user profile
- **URL**: `/api/users/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "John Doe",
  "university": "Stanford University",
  "major": "Computer Science",
  "year": "Junior",
  "title": "Computer Science Student",
  "heritage": ["American", "Italian"],
  "languages": ["English", "Italian"],
  "bio": "Updated bio text",
  "image": "https://example.com/avatar.jpg",
  "location": "Palo Alto, CA",
  "country": "United States",
  "state": "California",
  "isPublic": true
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {...}
}
```

#### Connect with user
- **URL**: `/api/users/connect/:targetId`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Successfully connected with user"
}
```

#### Remove connection
- **URL**: `/api/users/connect/:targetId`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Successfully disconnected from user"
}
```

#### Get user connections
- **URL**: `/api/users/connections/all` or `/api/users/connections/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "connections": [...]
}
```

#### Get user groups
- **URL**: `/api/users/groups/all` or `/api/users/groups/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "groups": [...]
}
```

#### Get user events
- **URL**: `/api/users/events/all` or `/api/users/events/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "events": [...]
}
```

### Group Endpoints

#### Get all groups
- **URL**: `/api/groups`
- **Method**: `GET`
- **Query Parameters**:
  - `category`: Filter by category
  - `university`: Filter by university/location
  - `location`: Filter by location (partial match)
  - `isPublic`: Filter by public status
  - `search`: Search by name or description
  - `limit`: Number of results (default: 10)
  - `offset`: Pagination offset (default: 0)
- **Response**:
```json
{
  "success": true,
  "count": 50,
  "groups": [...]
}
```

#### Get group by ID
- **URL**: `/api/groups/:id`
- **Method**: `GET`
- **Response**:
```json
{
  "success": true,
  "group": {
    "id": "uuid",
    "name": "South Asian Student Alliance",
    "description": "Group description",
    "memberCount": 156,
    "category": "South Asian",
    "location": "Harvard University",
    "isPublic": true,
    "recentActivity": "2 hours ago",
    "image": "https://example.com/image.jpg",
    "upcomingEvents": 4,
    "president": {...},
    "officers": [...],
    "members": [...],
    "media": [...],
    "socialMedia": [...],
    "events": [...],
    "pastEvents": [...],
    "isJoined": true
  }
}
```

#### Create a group
- **URL**: `/api/groups`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "New Cultural Group",
  "description": "Group description",
  "category": "Cultural",
  "location": "Stanford University",
  "isPublic": true,
  "meetingTime": "7:00 PM",
  "meetingDate": "Wednesdays",
  "meetingLocation": "Student Center",
  "meetingDays": ["Wednesday"],
  "universityOnly": true,
  "allowedUniversity": "Stanford University",
  "image": "https://example.com/image.jpg",
  "socialMedia": [
    {
      "platform": "instagram",
      "link": "https://instagram.com/group"
    }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Group created successfully",
  "group": {...}
}
```

#### Update a group
- **URL**: `/api/groups/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: (Same as create, fields are optional)
- **Response**:
```json
{
  "success": true,
  "message": "Group updated successfully",
  "group": {...}
}
```

#### Join a group
- **URL**: `/api/groups/:id/join`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Successfully joined the group"
}
```

#### Leave a group
- **URL**: `/api/groups/:id/leave`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Successfully left the group"
}
```

#### Add media to a group
- **URL**: `/api/groups/:id/media`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "type": "image",
  "url": "https://example.com/image.jpg",
  "caption": "Caption text"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Media added successfully",
  "media": {...}
}
```

### Event Endpoints

#### Get all events
- **URL**: `/api/events`
- **Method**: `GET`
- **Query Parameters**:
  - `category`: Filter by category
  - `university`: Filter by university
  - `location`: Filter by location (partial match)
  - `date`: Filter by specific date
  - `upcoming`: Show upcoming events (default: true)
  - `past`: Show past events (default: false)
  - `search`: Search by title or description
  - `limit`: Number of results (default: 10)
  - `offset`: Pagination offset (default: 0)
- **Response**:
```json
{
  "success": true,
  "count": 50,
  "events": [...]
}
```

#### Get event by ID
- **URL**: `/api/events/:id`
- **Method**: `GET`
- **Response**:
```json
{
  "success": true,
  "event": {
    "id": "uuid",
    "title": "Lunar New Year Festival",
    "name": "Lunar New Year Festival",
    "description": "Event description",
    "date": "Feb 10, 2024",
    "time": "6:00 PM",
    "location": "Student Center",
    "category": ["Chinese", "East Asian"],
    "organizer": "Chinese Students Association",
    "attendees": 156,
    "maxAttendees": 200,
    "image": "https://example.com/image.jpg",
    "price": "$7",
    "distance": "0.2 miles",
    "group": {...},
    "eventAttendees": [...],
    "isRSVPed": true,
    "isFavorited": false
  }
}
```

#### Create an event
- **URL**: `/api/events`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "title": "New Cultural Event",
  "description": "Event description",
  "date": "2024-03-15",
  "time": "7:00 PM",
  "location": "Student Center",
  "category": ["Cultural", "East Asian"],
  "groupId": "group-uuid",
  "maxAttendees": 100,
  "price": "Free",
  "image": "https://example.com/image.jpg",
  "universityOnly": false
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {...}
}
```

#### Update an event
- **URL**: `/api/events/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: (Same as create, fields are optional)
- **Response**:
```json
{
  "success": true,
  "message": "Event updated successfully",
  "event": {...}
}
```

#### RSVP to an event
- **URL**: `/api/events/:id/rsvp`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Successfully RSVPed to event"
}
```

#### Cancel RSVP
- **URL**: `/api/events/:id/cancel-rsvp`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Successfully canceled RSVP to event"
}
```

#### Favorite or unfavorite an event
- **URL**: `/api/events/:id/favorite`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "favorite": true
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Event added to favorites"
}
```

### Activity Endpoints

#### Get all activities
- **URL**: `/api/activities`
- **Method**: `GET`
- **Query Parameters**:
  - `category`: Filter by category
  - `indoor`: Filter by indoor status
  - `outdoor`: Filter by outdoor status
- **Response**:
```json
{
  "success": true,
  "activities": [...]
}
```

#### Get activity by ID
- **URL**: `/api/activities/:id`
- **Method**: `GET`
- **Response**:
```json
{
  "success": true,
  "activity": {
    "id": "uuid",
    "name": "Basketball",
    "category": "sports",
    "icon": "🏀",
    "description": "Play basketball at local courts or gyms",
    "equipment": ["Basketball"],
    "transportation": true,
    "indoor": true,
    "outdoor": true,
    "skillLevel": "beginner",
    "maxParticipants": 10,
    "duration": 120
  }
}
```

#### Get user's activity preferences
- **URL**: `/api/activities/user/preferences`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "preferences": [...]
}
```

#### Create or update activity preference
- **URL**: `/api/activities/preference/:activityId`
- **Method**: `POST` or `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "isOpen": true,
  "locationRadius": 10,
  "equipment": "have",
  "transportation": "have_car",
  "skillLevel": "intermediate",
  "notes": "Prefer evenings",
  "availability": [
    {
      "day": "monday",
      "timeSlots": [
        {
          "startTime": "18:00",
          "endTime": "20:00"
        }
      ]
    },
    {
      "day": "wednesday",
      "timeSlots": [
        {
          "startTime": "17:00",
          "endTime": "19:00"
        }
      ]
    }
  ]
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Activity preference updated",
  "preference": {...}
}
```

#### Delete activity preference
- **URL**: `/api/activities/preference/:activityId`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Activity preference deleted"
}
```

#### Find activity buddies
- **URL**: `/api/activities/buddies/:activityId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "matches": [
    {
      "user": {...},
      "matchScore": 85,
      "commonAvailability": [...],
      "preference": {...}
    },
    ...
  ]
}
```

#### Create activity request
- **URL**: `/api/activities/request/:userId/:activityId`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "message": "Would you like to play basketball this weekend?",
  "proposedDateTime": "2024-03-15T18:00:00Z",
  "location": "University Gym"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Activity request sent",
  "request": {...}
}
```

#### Get received activity requests
- **URL**: `/api/activities/requests/received`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "requests": [...]
}
```

#### Get sent activity requests
- **URL**: `/api/activities/requests/sent`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "requests": [...]
}
```

#### Respond to activity request
- **URL**: `/api/activities/request/:requestId/respond`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "status": "accepted" // or "declined" or "cancelled"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Activity request accepted",
  "request": {...}
}
```

### Chat Endpoints

#### Get user conversations
- **URL**: `/api/chat/conversations`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "conversations": [...]
}
```

#### Create new conversation
- **URL**: `/api/chat/conversations`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
```json
{
  "recipientId": "user-uuid" // For direct conversations
}
```
or
```json
{
  "groupId": "group-uuid" // For group conversations
}
```
- **Response**:
```json
{
  "success": true,
  "conversation": {...}
}
```

#### Get conversation messages
- **URL**: `/api/chat/conversations/:conversationId/messages`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `limit`: Number of messages (default: 50)
  - `before`: Timestamp to get messages before
- **Response**:
```json
{
  "success": true,
  "messages": [...]
}
```

#### Send message
- **URL**: `/api/chat/conversations/:conversationId/messages`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "text": "Hello, how are you?"
}
```
- **Response**:
```json
{
  "success": true,
  "message": {...}
}
```

## Data Migration

To migrate your mock data from the frontend to the database, run:

```bash
npm run seed:mock
```

This will:
1. Read the mock data from the `data/mockData.ts` file
2. Create users, groups, and events in the database
3. Set up relationships between them (group membership, connections, etc.)

After running the seed script, you can modify your frontend to fetch data from the API instead of using the mock data directly.

### Migrating from Mock Data to API

In your frontend code, replace imports from `mockData.ts` with API calls using fetch or your preferred HTTP client:

```typescript
// Before
import { mockGroups } from '@/data/mockData';

// After
const fetchGroups = async () => {
  const response = await fetch('http://localhost:5000/api/groups');
  const data = await response.json();
  return data.groups;
};
```

Make sure to update your AuthContext to use the new API endpoints for login, registration, and profile management.

You'll also need to update components that rely on mock data to fetch from the API and handle loading states appropriately. 