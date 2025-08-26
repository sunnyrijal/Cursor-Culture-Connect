import AsyncStorage from "@react-native-async-storage/async-storage"

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
    const token = await AsyncStorage.getItem("token")
    console.log(token)
    if (!token) {
      return false
    }

    if (isTokenExpired(token)) {
      // Remove expired token
      await AsyncStorage.removeItem("token")
      return false
    }

    return true
  } catch (error) {
    console.error("Error checking auth status:", error)
    return false
  }
}
