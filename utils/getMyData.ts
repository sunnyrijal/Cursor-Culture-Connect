import { jwtDecode } from "jwt-decode";
import * as SecureStore from 'expo-secure-store';

interface JwtPayload {
  userId: string;
  name?: string;
  email?: string;
  exp?: number; // expiry timestamp
  iat?: number; // issued-at timestamp
}

async function getDecodedToken(): Promise<JwtPayload | null> {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);
    // optional: check if token expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.warn("Token expired");
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('userId');
      return null;
    }

    return decoded;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

export default getDecodedToken;
