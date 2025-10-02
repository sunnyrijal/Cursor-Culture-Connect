"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Image,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle } from "lucide-react-native"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "expo-router"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  withRepeat,
} from "react-native-reanimated"

//@ts-ignore
import logo from "../assets/logo.png"

const { width, height } = Dimensions.get("window")

interface SignInFormProps {
  onSwitchToSignUp?: () => void
}

const SignInForm: React.FC<SignInFormProps> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fieldValidation, setFieldValidation] = useState<Record<string, boolean>>({})

  const { login } = useAuth()
  const router = useRouter()

  // Animation values
  const headerScale = useSharedValue(0)
  const headerOpacity = useSharedValue(0)
  const formOpacity = useSharedValue(0)
  const formTranslateY = useSharedValue(50)
  const buttonScale = useSharedValue(1)
  const switchScale = useSharedValue(0)
  const particleOpacity = useSharedValue(0)
  const backgroundRotation = useSharedValue(0)

  useEffect(() => {
    // Entry animations
    headerOpacity.value = withDelay(200, withTiming(1, { duration: 800 }))
    headerScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }))

    formOpacity.value = withDelay(600, withTiming(1, { duration: 800 }))
    formTranslateY.value = withDelay(600, withSpring(0, { damping: 15, stiffness: 120 }))

    switchScale.value = withDelay(1000, withSpring(1, { damping: 12, stiffness: 100 }))
    particleOpacity.value = withDelay(1200, withTiming(1, { duration: 1000 }))

    backgroundRotation.value = withRepeat(withTiming(360, { duration: 60000, easing: Easing.linear }), -1, false)
  }, [])

  const validateField = (field: string, value: any): boolean => {
    let isValid = false

    switch (field) {
      case "email":
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.includes(".edu")
        break
      case "password":
        isValid = value.length >= 8
        break
      default:
        isValid = true
    }

    setFieldValidation((prev) => ({ ...prev, [field]: isValid }))
    return isValid
  }

  const handleSubmit = async (): Promise<void> => {
    setError("")
    setLoading(true)

    buttonScale.value = withSequence(withTiming(0.95, { duration: 100 }), withTiming(1, { duration: 100 }))

    try {
      const loginData = { email, password }
      console.log("Login data:", loginData)
      await login(email, password)
      router.replace("/(tabs)")
    } catch (err: any) {
      console.log(err)
      setError(err.message || "Authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderAnimatedInput = useCallback(
    (
      icon: React.ElementType,
      label: string,
      value: string,
      onChangeText: (text: string) => void,
      placeholder: string,
      inputKey: string,
      options: object = {},
    ) => {
      const isValid = fieldValidation[inputKey]
      const isFocused = focusedInput === inputKey

      return (
        <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
          <Text style={styles.inputLabel}>{label}</Text>
          <View
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
              isValid === true && styles.inputWrapperValid,
              isValid === false && value && styles.inputWrapperInvalid,
            ]}
          >
            <View style={styles.inputIcon}>
              {React.createElement(icon, {
                size: 20,
                color: isFocused
                  ? "#6366F1"
                  : isValid === true
                    ? "#10B981"
                    : isValid === false && value
                      ? "#EF4444"
                      : "#9CA3AF",
              })}
            </View>

            <TextInput
              style={styles.input}
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText}
              editable={!loading}
              placeholderTextColor="#9CA3AF"
              {...options}
            />

            {inputKey === "password" && (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
              </TouchableOpacity>
            )}

            {isValid === true && value && (
              <View style={styles.validIcon}>
                <CheckCircle size={16} color="#10B981" />
              </View>
            )}

            {isValid === false && value && (
              <View style={styles.validIcon}>
                <AlertCircle size={16} color="#EF4444" />
              </View>
            )}
          </View>

          {isValid === false && value && (
            <Text style={styles.validationText}>
              {inputKey === "email" && "Please enter a valid college email address (.edu)"}
              {inputKey === "password" && "Password must be at least 8 characters"}
            </Text>
          )}
        </Animated.View>
      )
    },
    [fieldValidation, focusedInput, loading, showPassword, formOpacity],
  )

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }))

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }))

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  const switchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: switchScale.value }],
  }))

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Animated.View style={[styles.backgroundContainer]}>
        <View style={styles.backgroundGradient} />
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.title}>Welcome Back!</Text>
          </Animated.View>

          {/* Error Message */}
          {error ? (
            <Animated.View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Form */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <BlurView intensity={20} style={styles.formBlur}>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.95)", "rgba(248, 250, 252, 0.9)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.formGradient}
              >
                {renderAnimatedInput(Mail, "Email", email, setEmail, "Enter your email", "email", {
                  keyboardType: "email-address",
                  autoCapitalize: "none",
                  autoComplete: "email",
                  autoCorrect: false,
                })}

                {renderAnimatedInput(Lock, "Password", password, setPassword, "Enter your password", "password", {
                  secureTextEntry: !showPassword,
                  autoComplete: "password",
                  autoCorrect: false,
                })}

                <View style={styles.extraLinksContainer}>
                  <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Sign In Button */}
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ["#CBD5E1", "#94A3B8"] : ["#8B5CF6", "#6366F1", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                    <View style={styles.buttonIcon}>
                      <Sparkles size={16} color="white" />
                    </View>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Switch to Sign Up */}
          <Animated.View style={[styles.switchContainer, switchAnimatedStyle]}>
            <BlurView intensity={10} style={styles.switchBlur}>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.8)", "rgba(248, 250, 252, 0.6)"]}
                style={styles.switchGradient}
              >
                <Text style={styles.switchLabel}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/signup')}
                  disabled={loading}
                  style={styles.switchButton}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["rgba(99, 102, 241, 0.1)", "rgba(139, 92, 246, 0.1)"]}
                    style={styles.switchButtonGradient}
                  >
                    <Text style={styles.switchButtonText}>Sign Up</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1B4B",
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 20,
  },
  formBlur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  formGradient: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapperValid: {
    borderColor: "#10B981",
  },
  inputWrapperInvalid: {
    borderColor: "#EF4444",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  validIcon: {
    marginLeft: 8,
  },
  validationText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 4,
  },
  extraLinksContainer: {
    alignItems: "flex-end",
    gap: 8,
  },
  linkText: {
    color: "#6366F1",
    textDecorationLine: "underline",
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  switchContainer: {
    marginTop: 20,
  },
  switchBlur: {
    borderRadius: 16,
    overflow: "hidden",
  },
  switchGradient: {
    padding: 20,
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  switchButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  switchButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
})

export default SignInForm
