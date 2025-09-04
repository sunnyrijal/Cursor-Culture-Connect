import { SignupData } from '@/types/user';
import { API_URL } from './axiosConfig';

// Helper function to check if a string is a valid .edu email
export const isValidEduEmail = (email: string) => {
  if (!email || typeof email !== 'string') return false;
  return email.endsWith('.edu');
};

// Helper functions for API calls
export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  try {
    // Get token from AsyncStorage (implementation in AuthContext)
    // We'll use credentials: 'include' to send cookies for session auth

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Important for session cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
};

// API endpoints by resource
export const endpoints = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
  },
  users: {
    profile: '/users/profile',
    byId: (id: number | string) => `/users/${id}`,
  },
  events: {
    list: '/events',
    byId: (id: number | string) => `/events/${id}`,
    rsvp: (id: number | string) => `/events/${id}/rsvp`,
  },
  groups: {
    list: '/groups',
    byId: (id: number | string) => `/groups/${id}`,
  },
};


// API client for authentication
export const apiClient = {
  async login(email: string, password: string) {
    try {
      // // Validate email domain
      // if (!isValidEduEmail(email)) {
      //   throw new Error('Only .edu email addresses are allowed');
      // }
      console.log(email, password);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async signup(signupData:SignupData) {
    try {
      // // Validate email domain
      // if (!isValidEduEmail(signupData.email)) {
      //   throw new Error('Only .edu email addresses are allowed');
      // }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify({
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          email: signupData.email,
          password: signupData.password,
          confirmPassword: signupData.confirmPassword,
          dateOfBirth: signupData.dateOfBirth,
          classYear: signupData.classYear,
          university: signupData.university,
          profilePicture: signupData.profilePicture,
          pronouns: signupData.pronouns,
          ethnicity: signupData.ethnicity,
          countryOfOrigin: signupData.countryOfOrigin,
          city: signupData.city,
          state: signupData.state,
          languagesSpoken: signupData.languagesSpoken,
          interests: signupData.interests,
          termsAccepted: signupData.termsAccepted,
          privacyAccepted: signupData.privacyAccepted,
          marketingOptIn: signupData.marketingOptIn,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
      console.log(response);
      return await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
};
