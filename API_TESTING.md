# Culture Connect API Testing Guide

This guide will help you test the backend API endpoints for Culture Connect. Follow these steps to verify the functionality of the API and integrate it with the frontend.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Authentication](#authentication)
- [Users](#users)
- [Groups](#groups)
- [Events](#events)
- [Activities](#activities)
- [Chat](#chat)
- [Common Errors](#common-errors)

## Prerequisites

- Node.js (v14+)
- PostgreSQL database
- Postman or similar API testing tool
- Backend server running

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/Cursor-Culture-Connect.git
   cd Cursor-Culture-Connect
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

4. Start PostgreSQL server.

5. Sync the database and seed data:
   ```
   npm run sync:db
   npm run seed:activities
   npm run seed:mock
   ```

6. Start the backend server:
   ```
   npm run dev
   ```

7. The server should be running at http://localhost:3000

## Authentication

### Register a new user

**Request:**
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "university": "Test University",
  "nationality": "Test Nationality",
  "languagesSpoken": ["English"]
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "Test User",
    "email": "test@example.com",
    "university": "Test University",
    "nationality": "Test Nationality",
    "languagesSpoken": ["English"],
    "createdAt": "2023-08-28T10:00:00.000Z",
    "updatedAt": "2023-08-28T10:00:00.000Z"
  }
}
```

### Login

**Request:**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "Test User",
    "email": "test@example.com",
    "university": "Test University",
    "nationality": "Test Nationality"
  }
}
```

## Users

### Get current user profile

**Request:**
```
GET /api/users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "1",
    "name": "Test User",
    "email": "test@example.com",
    "university": "Test University",
    "nationality": "Test Nationality",
    "languagesSpoken": ["English"],
    "bio": null,
    "image": null
  }
}
```

### Update user profile

**Request:**
```
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "This is my bio",
  "interests": ["Cooking", "Movies"]
}
```

**Response:**
```json
{
  "user": {
    "id": "1",
    "name": "Test User",
    "email": "test@example.com",
    "bio": "This is my bio",
    "interests": ["Cooking", "Movies"]
  }
}
```

### Get user by ID

**Request:**
```
GET /api/users/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "2",
    "name": "Another User",
    "university": "Test University",
    "nationality": "Another Nationality",
    "bio": "Their bio"
  }
}
```

## Groups

### Get all groups

**Request:**
```
GET /api/groups
Authorization: Bearer <token>
```

**Response:**
```json
{
  "groups": [
    {
      "id": "1",
      "name": "Spanish Language Exchange",
      "description": "Practice speaking Spanish together",
      "category": "Language Exchange",
      "location": "Student Center",
      "memberCount": 15,
      "isJoined": false
    },
    {
      "id": "2",
      "name": "International Movie Club",
      "description": "Watch and discuss international films",
      "category": "Entertainment",
      "location": "Cinema Hall",
      "memberCount": 32,
      "isJoined": true
    }
  ]
}
```

### Get user's joined groups

**Request:**
```
GET /api/users/me/groups
Authorization: Bearer <token>
```

**Response:**
```json
{
  "groups": [
    {
      "id": "2",
      "name": "International Movie Club",
      "description": "Watch and discuss international films",
      "category": "Entertainment",
      "location": "Cinema Hall",
      "memberCount": 32
    }
  ]
}
```

### Create a new group

**Request:**
```
POST /api/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Korean Culture Club",
  "description": "Learn about Korean culture",
  "category": "Cultural Exchange",
  "location": "Room 101"
}
```

**Response:**
```json
{
  "group": {
    "id": "3",
    "name": "Korean Culture Club",
    "description": "Learn about Korean culture",
    "category": "Cultural Exchange",
    "location": "Room 101",
    "memberCount": 1,
    "createdAt": "2023-08-28T10:00:00.000Z",
    "updatedAt": "2023-08-28T10:00:00.000Z"
  }
}
```

### Join a group

**Request:**
```
POST /api/groups/:id/join
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Successfully joined the group"
}
```

### Leave a group

**Request:**
```
POST /api/groups/:id/leave
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Successfully left the group"
}
```

## Events

### Get all events

**Request:**
```
GET /api/events
Authorization: Bearer <token>
```

**Response:**
```json
{
  "events": [
    {
      "id": "1",
      "title": "Cultural Food Festival",
      "description": "Taste foods from around the world",
      "date": "2023-09-15",
      "time": "14:00",
      "location": "University Square",
      "category": ["Food", "Cultural"],
      "organizer": "International Student Association",
      "isRSVPed": false,
      "isFavorited": true
    },
    {
      "id": "2",
      "title": "Language Exchange Meetup",
      "description": "Practice different languages",
      "date": "2023-09-20",
      "time": "18:30",
      "location": "Student Center",
      "category": ["Education", "Social"],
      "organizer": "Language Club",
      "isRSVPed": true,
      "isFavorited": false
    }
  ]
}
```

### Get user's events

**Request:**
```
GET /api/users/me/events?type=attending
Authorization: Bearer <token>
```

**Response:**
```json
{
  "events": [
    {
      "id": "2",
      "title": "Language Exchange Meetup",
      "description": "Practice different languages",
      "date": "2023-09-20",
      "time": "18:30",
      "location": "Student Center",
      "category": ["Education", "Social"],
      "organizer": "Language Club"
    }
  ]
}
```

### Create a new event

**Request:**
```
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Bollywood Dance Workshop",
  "description": "Learn Bollywood dance moves",
  "date": "2023-10-05",
  "time": "16:00",
  "location": "Dance Studio",
  "category": ["Dance", "Cultural"],
  "groupId": "1"
}
```

**Response:**
```json
{
  "event": {
    "id": "3",
    "title": "Bollywood Dance Workshop",
    "description": "Learn Bollywood dance moves",
    "date": "2023-10-05",
    "time": "16:00",
    "location": "Dance Studio",
    "category": ["Dance", "Cultural"],
    "organizer": "Spanish Language Exchange",
    "createdAt": "2023-08-28T10:00:00.000Z",
    "updatedAt": "2023-08-28T10:00:00.000Z"
  }
}
```

### RSVP to an event

**Request:**
```
POST /api/events/:id/rsvp
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Successfully RSVPed to the event"
}
```

### Cancel RSVP

**Request:**
```
DELETE /api/events/:id/rsvp
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Successfully cancelled RSVP"
}
```

## Activities

### Get all activities

**Request:**
```
GET /api/activities
Authorization: Bearer <token>
```

**Response:**
```json
{
  "activities": [
    {
      "id": "1",
      "name": "Running",
      "category": "Sports",
      "icon": "running",
      "description": "Go for a run together",
      "indoor": false,
      "outdoor": true,
      "maxParticipants": 10
    },
    {
      "id": "2",
      "name": "Board Games",
      "category": "Entertainment",
      "icon": "dice",
      "description": "Play board games together",
      "indoor": true,
      "outdoor": false,
      "maxParticipants": 8
    }
  ]
}
```

### Update activity preference

**Request:**
```
PUT /api/activities/:id/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "isOpen": true,
  "locationRadius": 5,
  "skillLevel": "beginner",
  "notes": "I'm a beginner looking to improve",
  "availability": [
    {
      "day": "Monday",
      "startTime": "18:00",
      "endTime": "20:00"
    },
    {
      "day": "Wednesday",
      "startTime": "18:00",
      "endTime": "20:00"
    }
  ]
}
```

**Response:**
```json
{
  "preference": {
    "id": "1",
    "activityId": "1",
    "userId": "1",
    "isOpen": true,
    "locationRadius": 5,
    "skillLevel": "beginner",
    "notes": "I'm a beginner looking to improve",
    "availability": [
      {
        "day": "Monday",
        "startTime": "18:00",
        "endTime": "20:00"
      },
      {
        "day": "Wednesday",
        "startTime": "18:00",
        "endTime": "20:00"
      }
    ],
    "createdAt": "2023-08-28T10:00:00.000Z",
    "updatedAt": "2023-08-28T10:00:00.000Z"
  }
}
```

### Find activity buddies

**Request:**
```
GET /api/activities/:id/buddies
Authorization: Bearer <token>
```

**Response:**
```json
{
  "matches": [
    {
      "user": {
        "id": "2",
        "name": "Another User",
        "university": "Test University"
      },
      "matchScore": 85,
      "commonAvailability": [
        {
          "day": "Monday",
          "startTime": "18:00",
          "endTime": "20:00"
        }
      ]
    },
    {
      "user": {
        "id": "3",
        "name": "Third User",
        "university": "Test University"
      },
      "matchScore": 70,
      "commonAvailability": [
        {
          "day": "Wednesday",
          "startTime": "18:00",
          "endTime": "20:00"
        }
      ]
    }
  ]
}
```

### Send activity request

**Request:**
```
POST /api/users/:userId/activity-requests/:activityId
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Would you like to go for a run this Monday?",
  "proposedDateTime": "2023-09-04T18:00:00.000Z",
  "location": "Campus Track"
}
```

**Response:**
```json
{
  "request": {
    "id": "1",
    "message": "Would you like to go for a run this Monday?",
    "proposedDateTime": "2023-09-04T18:00:00.000Z",
    "location": "Campus Track",
    "status": "pending",
    "requesterId": "1",
    "recipientId": "2",
    "activityId": "1",
    "createdAt": "2023-08-28T10:00:00.000Z",
    "updatedAt": "2023-08-28T10:00:00.000Z"
  }
}
```

## Chat

### Get conversations

**Request:**
```
GET /api/chat/conversations
Authorization: Bearer <token>
```

**Response:**
```json
{
  "conversations": [
    {
      "id": "1",
      "type": "direct",
      "participants": [
        {
          "id": "1",
          "name": "Test User"
        },
        {
          "id": "2",
          "name": "Another User"
        }
      ],
      "lastMessage": {
        "id": "5",
        "text": "See you tomorrow!",
        "createdAt": "2023-08-28T10:00:00.000Z"
      },
      "unreadCount": 0
    },
    {
      "id": "2",
      "type": "group",
      "groupId": "1",
      "groupName": "Spanish Language Exchange",
      "participants": [
        {
          "id": "1",
          "name": "Test User"
        },
        {
          "id": "2",
          "name": "Another User"
        },
        {
          "id": "3",
          "name": "Third User"
        }
      ],
      "lastMessage": {
        "id": "10",
        "text": "Don't forget our meeting tomorrow",
        "createdAt": "2023-08-28T09:00:00.000Z"
      },
      "unreadCount": 2
    }
  ]
}
```

### Get conversation messages

**Request:**
```
GET /api/chat/conversations/:id/messages
Authorization: Bearer <token>
```

**Response:**
```json
{
  "messages": [
    {
      "id": "1",
      "text": "Hey, how are you?",
      "senderId": "1",
      "conversationId": "1",
      "createdAt": "2023-08-27T09:00:00.000Z",
      "sender": {
        "id": "1",
        "name": "Test User"
      }
    },
    {
      "id": "2",
      "text": "I'm good, thanks! How about you?",
      "senderId": "2",
      "conversationId": "1",
      "createdAt": "2023-08-27T09:05:00.000Z",
      "sender": {
        "id": "2",
        "name": "Another User"
      }
    }
  ]
}
```

### Send a message

**Request:**
```
POST /api/chat/conversations/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "I'm doing great, thanks for asking!"
}
```

**Response:**
```json
{
  "message": {
    "id": "3",
    "text": "I'm doing great, thanks for asking!",
    "senderId": "1",
    "conversationId": "1",
    "createdAt": "2023-08-28T10:00:00.000Z",
    "sender": {
      "id": "1",
      "name": "Test User"
    }
  }
}
```

### Create a new conversation

**Request:**
```
POST /api/chat/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "participants": ["3"]
}
```

**Response:**
```json
{
  "conversation": {
    "id": "3",
    "type": "direct",
    "participants": [
      {
        "id": "1",
        "name": "Test User"
      },
      {
        "id": "3",
        "name": "Third User"
      }
    ],
    "createdAt": "2023-08-28T10:00:00.000Z",
    "updatedAt": "2023-08-28T10:00:00.000Z"
  }
}
```

## Common Errors

### Authentication Errors

- **401 Unauthorized**
  ```json
  {
    "message": "Authentication required"
  }
  ```
  Solution: Ensure you're including a valid JWT token in the Authorization header.

- **403 Forbidden**
  ```json
  {
    "message": "Access denied"
  }
  ```
  Solution: The user doesn't have permission to access the resource. Check user roles.

### Validation Errors

- **400 Bad Request**
  ```json
  {
    "message": "Validation error",
    "errors": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
  ```
  Solution: Ensure all required fields are provided and in the correct format.

### Resource Errors

- **404 Not Found**
  ```json
  {
    "message": "Group not found"
  }
  ```
  Solution: Check that the resource ID exists.

- **409 Conflict**
  ```json
  {
    "message": "User already exists with this email"
  }
  ```
  Solution: Use a unique email for registration.

## Integration with Frontend

To integrate with the frontend, make sure to:

1. Install the required dependencies:
   ```
   npm install @react-native-async-storage/async-storage
   ```

2. Set up the API connection in your frontend code:
   - Update the API_URL in `data/api.ts` to match your backend URL (default is http://localhost:3000/api)
   - Make sure context providers are properly nested in `app/_layout.tsx`

3. Test the integration:
   - Start the backend server: `cd backend && npm run dev`
   - Start the frontend: `npm run start` or `npm run ios`/`npm run android`
   - Try logging in with one of the seeded user accounts or register a new one

4. Common frontend integration issues:
   - CORS errors: Ensure your backend has CORS configured properly
   - Network errors: Check that both frontend and backend are running on the correct ports
   - Token expiration: Implement token refresh mechanism for long sessions 