// app/index.tsx
'use client';

import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Globe } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, withRepeat, Easing, interpolate, runOnJS } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const theme = {
  primary: '#6366F1',
  secondary: '#EC4899',
  accent: '#8B5CF6',
  white: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
};

export default function Index() {
  const router = useRouter();
  const { authState } = useAuth();

  // Animation shared values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(0);
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
    logoScale.value = withSequence(
      withTiming(1.3, { duration: 600, easing: Easing.out(Easing.back(1.2)) }),
      withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) })
    );
    logoRotate.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1, false);

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
      { rotate: `${logoRotate.value}deg` }
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
    <Animated.View style={[styles.container]}>
      <LinearGradient colors={['#4F46E5', '#87CEEB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        {/* Particles */}
        <Animated.View style={[styles.particleContainer, particleAnimatedStyle]}>
          {[...Array(6)].map((_, i) => (
            <Sparkles key={i} size={12 + (i % 3) * 4} color="rgba(255,255,255,0.2)" />
          ))}
        </Animated.View>

        <View style={styles.content}>
          {/* Glow behind logo */}
          <Animated.View style={[styles.logoGlow, glowAnimatedStyle]} />

          {/* Logo */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          {/* Text */}
          <Animated.View style={titleAnimatedStyle}>
            <Text style={styles.title}>TRiVO</Text>
          </Animated.View>

          <Animated.View style={subtitleAnimatedStyle}>
            <Text style={styles.subtitle}>Discover amazing people and connect with events around the world</Text>
          </Animated.View>

          {/* Get Started Button */}
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(auth)/login')}>
            <LinearGradient colors={[theme.primary, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Globe size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  logoContainer: { marginBottom: 40 },
  logo: { width: 130, height: 130 },
  logoGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -40, backgroundColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 20 },
  particleContainer: { position: 'absolute', width: '100%', height: '100%' },
  primaryButton: { marginTop: 20, borderRadius: 20, overflow: 'hidden' },
  buttonGradient: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
