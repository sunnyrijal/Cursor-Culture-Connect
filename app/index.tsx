'use client';

import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
// import { LinearGradient } from 'expo-linear-gradient'; // REMOVED: No longer needed for solid background
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, withRepeat, Easing, interpolate, runOnJS } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const theme = {
  primary: '#6366F1',
  secondary: '#EC4899',
  accent: '#8B5CF6',
  white: '#FFFFFF',
  // Updated text colors for visibility on a white background
  darkText: '#1F2937', 
  textSecondary: 'rgba(0, 0, 0, 0.6)',
};

export default function Index() {
  const router = useRouter();
  const { authState } = useAuth();

  // Animation shared values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  // logoRotate is removed, as we no longer need spinning
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const particleScale = useSharedValue(0);
  const particleRotate = useSharedValue(0);
  const glowScale = useSharedValue(0.8);

  useEffect(() => {
    // Logo animation sequence
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    
    // Heartbeat Animation Logic: Initial scale-in followed by infinite pulse
    logoScale.value = withSequence(
      // Initial scale in
      withTiming(1.3, { duration: 600, easing: Easing.out(Easing.back(1.2)) }),
      withTiming(1.0, { duration: 300, easing: Easing.inOut(Easing.quad) }),
      // Heartbeat loop
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 400, easing: Easing.inOut(Easing.quad) }), // Pulse out
          withTiming(1.0, { duration: 400, easing: Easing.inOut(Easing.quad) }), // Pulse back
          withDelay(200, withTiming(1.0)) // Short pause
        ),
        -1, // infinite loop
        false // Do not reverse
      )
    );

    // logoRotate animation removed

    // Title animation
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    titleTranslateY.value = withDelay(400, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));

    // Subtitle animation
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    subtitleTranslateY.value = withDelay(600, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));

    // Particle animations
    particleScale.value = withDelay(800, withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    particleRotate.value = withDelay(800, withRepeat(withTiming(360, { duration: 15000, easing: Easing.linear }), -1, false));

    // Glow pulse
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [authState.authenticated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runOnJS(() => {
        router.replace(authState.authenticated ? '/(tabs)' : '/(auth)/login');
      })();
    }, 2000); // redirect after splash

    return () => clearTimeout(timer);
  }, [authState.authenticated, router]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      // { rotate: `${logoRotate.value}deg` } // Removed spinning rotation
    ],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const particleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: particleScale.value,
    transform: [
      { scale: particleScale.value },
      { rotate: `${particleRotate.value}deg` }
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: interpolate(glowScale.value, [0.8, 1.2], [0.3, 0.6]),
  }));

  return (
    // Set container background to white and remove the gradient wrapper
    <Animated.View style={[styles.container, { backgroundColor: theme.white }]}>
      {/* LinearGradient component removed */}

        <View style={styles.content}>
          {/* Glow behind logo */}
          {/* <Animated.View style={[styles.logoGlow, glowAnimatedStyle]} /> */}

          {/* Logo */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          {/* Text */}
          <Animated.View style={titleAnimatedStyle}>
            {/* Title color updated */}
            <Text style={[styles.title, { color: theme.darkText }]}>TRiVO</Text>
          </Animated.View>

          <Animated.View style={subtitleAnimatedStyle}>
            {/* Subtitle color updated */}
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Belong anywhere start here. More than an app. It’s your campus community</Text>
          </Animated.View>

          {/* Get Started Button */}
          {/* <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(auth)/login')}>
            <LinearGradient colors={[theme.primary, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Globe size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity> */}
        </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // gradient style removed
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  logoContainer: { marginBottom: 40 },
  logo: { width: 130, height: 130 },
  // Glow background updated for white background visibility
  logoGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -40, backgroundColor: 'rgba(200,200,200,0.4)' },
  // Text styles now reference the updated theme colors in the component (for flexibility), removing the old fixed colors
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  particleContainer: { position: 'absolute', width: '100%', height: '100%' },
  primaryButton: { marginTop: 20, borderRadius: 20, overflow: 'hidden' },
  buttonGradient: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
