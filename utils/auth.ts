import AsyncStorage from "@react-native-async-storage/async-storage"
import { jwtDecode } from "jwt-decode"
import { Platform } from "react-native"
interface DecodedToken {
  exp: number
  iat: number
  [key: string]: any
}

export const decodeJWT = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decoding JWT:", error)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) {
    return true
  }

  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}



export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      const currentTime = Date.now() / 1000; // in seconds

      if (decodedToken.exp < currentTime) {
        // Token is expired
        await AsyncStorage.multiRemove(['token', 'userId']);
        return false;
      }

      return true; // Token is valid
    } catch (decodeError) {
      console.error('Invalid token:', decodeError);
      return false;
    }
  } catch (storageError) {
    console.error('Error checking auth status:', storageError);
    return false;
  }
};
