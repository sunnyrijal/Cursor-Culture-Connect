"use client"

import { useEffect } from "react"
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, Platform } from "react-native"
import { useRouter } from "expo-router"

import { LinearGradient } from "expo-linear-gradient"
import { Globe, GraduationCap, Sparkles } from "lucide-react-native"
import { useAuth } from "@/contexts/AuthContext"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
} from "react-native-reanimated"
import { checkAuthStatus } from "@/utils/auth"

const { width, height } = Dimensions.get("window")

const theme = {
  primary: "#6366F1",
  secondary: "#EC4899",
  accent: "#8B5CF6",
  white: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.8)",
  textLight: "rgba(255, 255, 255, 0.6)",
}

export default function Index() {
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const logoRotate = useSharedValue(0)
  const titleOpacity = useSharedValue(0)
  const titleTranslateY = useSharedValue(30)
  const subtitleOpacity = useSharedValue(0)
  const subtitleTranslateY = useSharedValue(30)
  const backgroundOpacity = useSharedValue(1)
  const particleScale = useSharedValue(0)
  const particleRotate = useSharedValue(0)
  const glowScale = useSharedValue(0.8)

  const router = useRouter()

  const { authState } = useAuth()

  useEffect(() => {
    // Logo animation sequence
    logoOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    })
    logoScale.value = withSequence(
      withTiming(1.3, { duration: 600, easing: Easing.out(Easing.back(1.2)) }),
      withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) }),
    )

    // Subtle logo rotation
    logoRotate.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1, false)

    // Title animation with delay
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }))
    titleTranslateY.value = withDelay(400, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }))

    // Subtitle animation with delay
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }))
    subtitleTranslateY.value = withDelay(600, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }))

    // Particle animations
    particleScale.value = withDelay(800, withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }))
    particleRotate.value = withDelay(
      800,
      withRepeat(withTiming(360, { duration: 15000, easing: Easing.linear }), -1, false),
    )

    // Glow pulse effect
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  }, [authState.authenticated])

  // useEffect(() => {
  //   const handleAuthCheck = async () => {
  //     try {
  //       const isAuthenticated = await checkAuthStatus()

  //       // Navigate after animation delay
  //       const timer = setTimeout(() => {
  //         backgroundOpacity.value = withTiming(0, { duration: 600, easing: Easing.in(Easing.cubic) }, () => {
  //           runOnJS(() => {
  //             if (isAuthenticated) {
  //               router.replace("/(tabs)")
  //             } else {
  //               router.replace("/(auth)/login")
  //             }
  //           })()
  //         })
  //       }, 2500)

  //       return () => clearTimeout(timer)
  //     } catch (error) {
  //       console.error("Auth check failed:", error)
  //       // Default to login on error
  //       setTimeout(() => {
  //         router.replace("/(auth)/login")
  //       }, 2500)
  //     }
  //   }

  //   handleAuthCheck()
  // }, [])

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }, { rotate: `${logoRotate.value}deg` }],
    opacity: logoOpacity.value,
  }))

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }))

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }))

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }))

  const particleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: particleScale.value,
    transform: [{ scale: particleScale.value }, { rotate: `${particleRotate.value}deg` }],
  }))

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: interpolate(glowScale.value, [0.8, 1.2], [0.3, 0.6]),
  }))

  return (
    <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated background particles */}
        <Animated.View style={[styles.particleContainer, particleAnimatedStyle]}>
          {[...Array(6)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.particle,
                {
                  top: (height * (0.2 + index * 0.15)) % height,
                  left: (width * (0.1 + index * 0.18)) % width,
                  transform: [{ rotate: `${index * 60}deg` }],
                },
              ]}
            >
              <Sparkles size={12 + (index % 3) * 4} color="rgba(255, 255, 255, 0.2)" />
            </View>
          ))}
        </Animated.View>

        <View style={styles.content}>
          {/* Glow effect behind logo */}
          <Animated.View style={[styles.logoGlow, glowAnimatedStyle]} />

          {/* Main logo container */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logo}>
              <LinearGradient
                colors={["#ffffff", "#f8fafc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <View style={styles.logoInner}>
                  <GraduationCap size={44} color={theme.primary} strokeWidth={2.5} />
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Animated.View style={titleAnimatedStyle}>
              <Text style={styles.title}>Culture Connect</Text>
              <View style={styles.titleUnderline} />
            </Animated.View>

            <Animated.View style={subtitleAnimatedStyle}>
              <Text style={styles.subtitle}>Discover amazing cultures and connect with events around the world</Text>
              {/* <View style={styles.dots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View> */}
            </Animated.View>
          </View>

          {/* Sweet Login Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.primaryButton}
            onPress={() => router.replace("/(auth)/login")}
          >
            <LinearGradient
              colors={[theme.primary, theme.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Globe size={20} color="#fff" style={styles.buttonIcon} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {/* Sweet Login Button */}

        {/* Bottom decorative element */}
        <View style={styles.bottomDecoration}>
          <LinearGradient
            colors={["transparent", "rgba(255, 255, 255, 0.1)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.decorationLine}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: "relative",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  particleContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  particle: {
    position: "absolute",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -40,
  },
  logo: {
    width: 130,
    height: 130,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  logoGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.15)",
  },
  textContainer: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.white,
    textAlign: "center",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: theme.white,
    borderRadius: 2,
    marginTop: 12,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 18,
    color: theme.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    marginTop: 24,
    maxWidth: 280,
    fontWeight: "500",
  },
  dots: {
    flexDirection: "row",
    marginTop: 32,
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dotActive: {
    backgroundColor: theme.white,
    width: 24,
  },
  bottomDecoration: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  decorationLine: {
    width: "60%",
    height: 2,
    borderRadius: 1,
  },
  primaryButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 24,
    height: 80,
    width: 200,
    ...Platform.select({
      ios: {
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  disabledButton: {
    ...Platform.select({
      ios: {
        shadowColor: "#9CA3AF",
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 4,
  },
})
