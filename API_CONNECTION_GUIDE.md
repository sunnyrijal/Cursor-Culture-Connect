# API Connection Troubleshooting Guide

This guide will help you diagnose and fix common connection issues between the Culture Connect frontend and backend.

## Quick Start

1. Make sure the backend is running:
   ```bash
   cd backend
   npm run dev
   ```

2. Verify the API URL in `data/api.ts`:
   ```typescript
   const API_URL = 'http://localhost:5002/api';
   ```
   
   This should match the port your backend server is running on (check terminal output).

3. Test API connections:
   - Navigate to `/api-test` in the app to use the built-in API testing tool
   - Navigate to `/debug` to test user registration and login

## Common Issues and Solutions

### 1. "TypeError: XXX is not a function" errors

**Problem:** You're trying to call a function that doesn't exist in the context you're using.

**Solution:**
- Double check that you're using the correct function name from the context
- For example, `useAuth()` provides `register` (not `signup`)
- Console log the context object to see available functions: `console.log(useAuth())`

### 2. Authentication Issues

**Problem:** Getting logged out when refreshing the page or "Authentication required" errors.

**Solution:**
- Check that token storage is working properly:
  ```typescript
  // Debug token storage
  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('Token exists:', !!token);
  };
  checkToken();
  ```
- Ensure your backend is properly validating JWT tokens
- Check for CORS issues in browser developer tools (Network tab)

### 3. Network Errors

**Problem:** "Network request failed" or timeout errors.

**Solution:**
- Ensure backend is running (check terminal)
- Verify the API_URL in `data/api.ts` is correct
- For mobile testing: Use your local IP instead of localhost (e.g., `192.168.1.100:5002`)
- For Expo web: Ensure CORS is properly configured on the backend

### 4. "Cannot create events/groups" Issues

**Problem:** Event or group creation fails silently or with generic errors.

**Solution:**
- Enable debug mode in the API client to see detailed request/response data:
  ```typescript
  // In data/api.ts, modify the apiCall function:
  const apiCall = async (endpoint, method, data) => {
    // Log request details
    console.log(`API Request: ${method} ${API_URL}${endpoint}`, data);
    
    // Make the request...
    
    // Log response
    console.log(`API Response: ${method} ${endpoint}`, responseData);
    
    // Return data...
  };
  ```
- Check the shape of the data you're sending matches what the backend expects
- Verify the JWT token is being included in the request headers

### 5. CORS Issues

**Problem:** "Access to fetch at '...' has been blocked by CORS policy" errors in browser console.

**Solution:**
- Make sure the backend has proper CORS configuration:
  ```javascript
  // In your backend server.js or app.js:
  app.use(cors({
    origin: '*',  // In development - restrict this in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  ```

## Advanced Debugging

### Inspect Network Traffic

Use the browser's developer tools (Network tab) to inspect:
- Request headers (check if Authorization header is present)
- Request payload (check if data is formatted correctly)
- Response status codes and bodies

### Check API Routes

If you're getting 404 errors, ensure that the routes in `data/api.ts` match the routes defined in your backend:

| Frontend Route | Backend Route | Description |
|----------------|---------------|-------------|
| `/auth/login` | `POST /api/auth/login` | User login |
| `/auth/register` | `POST /api/auth/register` | User registration |
| `/users/me` | `GET /api/users/me` | Current user profile |
| `/groups` | `GET /api/groups` | List groups |
| `/events` | `GET /api/events` | List events |

### Logging Tips

Add detailed logging at critical points:

```typescript
// In your context files (e.g., data/authContext.tsx):
const register = async (userData) => {
  setIsLoading(true);
  try {
    console.log('Registration attempt with data:', { 
      ...userData, 
      password: '[REDACTED]' 
    });
    
    const response = await api.register(userData);
    console.log('Registration response:', response);
    
    // Rest of function...
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};
```

## Using the Debug Screen

The `/debug` screen provides direct access to API functions:

1. Navigate to `/debug` in the app
2. Enter test credentials
3. Click "Test Register" to attempt user registration
4. Click "Test Login" to attempt login
5. Click "Check API URL" to verify the API URL configuration

This screen is useful for isolating authentication issues from the rest of the app.

## Using the API Test Screen

The `/api-test` screen tests various API endpoints:

1. Navigate to `/api-test` in the app
2. Click individual test buttons to check specific API functionality
3. Click "Run All Tests" to test all API connections at once
4. Check the results for error messages and connection status

## Need More Help?

If you're still experiencing issues:

1. Run the database sync script to reset your database schema:
   ```bash
   cd backend
   npm run sync:db
   ```

2. Seed fresh data:
   ```bash
   npm run seed:activities
   npm run seed:mock
   ```

3. Restart both the backend server and frontend application 