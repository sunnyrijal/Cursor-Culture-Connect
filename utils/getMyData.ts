import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  userId: string;
  name?: string;
  email?: string;
  exp?: number; // expiry timestamp
  iat?: number; // issued-at timestamp
}

async function getDecodedToken(): Promise<JwtPayload | null> {
  try {
    const token = await AsyncStorage.getItem("token");
    console.log(token)
    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);
    console.log(decoded)
    // optional: check if token expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.warn("Token expired");
      return null;
    }

    return decoded;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

export default getDecodedToken;
