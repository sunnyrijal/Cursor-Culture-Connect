# Culture Connect Frontend-Backend Integration Guide

This guide explains how the frontend of Culture Connect integrates with the backend API.

## Architecture Overview

The frontend uses a context-based architecture to manage state and API interactions:

- **AuthContext** - Manages user authentication state and auth-related API calls
- **GroupContext** - Manages groups data and operations
- **EventContext** - Manages events data and operations
- **ActivityContext** - Manages activity buddy functionality
- **ChatContext** - Manages conversations and messaging

Each context provides methods to interact with the backend API and state variables to store and access the data.

## Getting Started

1. Make sure your backend server is running:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend application:
   ```
   npm run start
   # or for specific platforms
   npm run ios
   npm run android
   ```

3. Navigate to the API testing screen to verify that connections are working properly:
   - Log in to the app
   - Navigate to `/api-test` (you can add this path to your URL)

## Key Files

- **data/api.ts** - Contains all the API request functions
- **data/authContext.tsx** - Authentication context
- **data/groupContext.tsx** - Groups context
- **data/eventContext.tsx** - Events context
- **data/activityContext.tsx** - Activity buddy context
- **data/chatContext.tsx** - Chat and messaging context
- **app/_layout.tsx** - Configures the context providers
- **components/ApiTestScreen.tsx** - Component for testing API connections
- **API_TESTING.md** - Detailed guide for testing backend API endpoints

## Configuration

The backend API URL is configured in `data/api.ts`:

```typescript
// Base API URL - change this to your backend URL
const API_URL = 'http://localhost:3000/api';
```

Update this to match your backend server's address and port.

## Authentication Flow

1. User enters credentials in the login screen
2. The `login()` function from `authContext` is called
3. This calls the `login()` function from `api.ts`
4. On success, the JWT token is stored in AsyncStorage
5. The user object is stored in the auth context state
6. The `isAuthenticated` flag is updated, triggering navigation

## Using Contexts in Components

To use any context in your components, import the corresponding hook:

```typescript
import { useAuth } from '@/data/authContext';
import { useGroups } from '@/data/groupContext';
import { useEvents } from '@/data/eventContext';
import { useActivities } from '@/data/activityContext';
import { useChat } from '@/data/chatContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { groups, fetchGroups, joinGroup } = useGroups();
  // etc.
  
  // Example usage
  useEffect(() => {
    if (isAuthenticated) {
      fetchGroups();
    }
  }, [isAuthenticated]);
  
  return (
    // Component JSX
  );
}
```

## Error Handling

All contexts include error handling with consistent patterns:

1. API calls set a loading state while in progress
2. Errors are caught and stored in an error state variable
3. Loading and error states can be used in components for UI feedback

Example usage:

```typescript
const { events, loading, error, fetchEvents } = useEvents();

useEffect(() => {
  fetchEvents();
}, []);

if (loading) {
  return <ActivityIndicator />;
}

if (error) {
  return <Text>Error: {error}</Text>;
}

return (
  <FlatList
    data={events}
    renderItem={({ item }) => <EventCard event={item} />}
  />
);
```

## Working with Data

### Creating Data

```typescript
// Create a new group
const { createGroup } = useGroups();
const handleCreateGroup = async () => {
  try {
    const newGroup = await createGroup({
      name: "Korean Culture Club",
      description: "Learn about Korean culture",
      category: "Cultural Exchange",
      location: "Room 101"
    });
    // Do something with the new group
  } catch (error) {
    console.error("Failed to create group:", error);
  }
};
```

### Updating Data

```typescript
// Update an event
const { updateEvent } = useEvents();
const handleUpdateEvent = async () => {
  try {
    const updatedEvent = await updateEvent("event-id", {
      title: "Updated Event Title",
      description: "New description"
    });
    // Handle the updated event
  } catch (error) {
    console.error("Failed to update event:", error);
  }
};
```

### Deleting/Removing Data

```typescript
// Leave a group
const { leaveGroup } = useGroups();
const handleLeaveGroup = async () => {
  try {
    await leaveGroup("group-id");
    // Update UI or navigate away
  } catch (error) {
    console.error("Failed to leave group:", error);
  }
};
```

## Testing

The API Test Screen provides an easy way to verify that your frontend is properly connected to the backend API. To access it:

1. Navigate to `/api-test` in the app
2. Click individual test buttons to test specific API functions
3. Click "Run All Tests" to run all tests at once

If tests fail, check:
- Backend server is running
- API URL is correctly configured
- Network connection is working
- Authentication state (some tests require being logged in)

## Common Issues and Solutions

1. **Authentication errors**
   - Check that the token is being stored correctly
   - Verify that the token is being sent in API requests
   - Make sure your JWT secret matches between frontend and backend

2. **CORS errors**
   - Ensure CORS is properly configured in your backend

3. **Network errors**
   - Check that both frontend and backend are running
   - Verify the API URL is correct
   - Check for any network connectivity issues

4. **Data not updating**
   - Remember that context state updates might require component re-rendering
   - Use useEffect dependencies appropriately to trigger data fetching

5. **Performance issues**
   - Avoid unnecessary re-renders by optimizing context usage
   - Use memoization techniques where appropriate

## Next Steps

1. Implement real-time updates using WebSockets for chat functionality
2. Add offline support with data caching
3. Implement proper error handling UI components
4. Add comprehensive loading states and skeleton screens 