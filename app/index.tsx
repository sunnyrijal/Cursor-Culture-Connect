import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';

const theme = {
  primary: '#6366F1',
  white: '#FFFFFF',
  textSecondary: '#9CA3AF',
};

export default function Index() {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);
  const { authState } = useAuth();

  useEffect(() => {
    // Start logo animation
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 800 }),
      withTiming(1, { duration: 200 })
    );
    
    logoOpacity.value = withTiming(1, { duration: 800 });

    // Navigate to main app after animation
    const timer = setTimeout(() => {
      backgroundOpacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(() => {
          // Check authentication status and redirect accordingly
          if (authState.authenticated) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(auth)/login');
          }
        })();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [authState.authenticated]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logo}>
            <View style={styles.logoInner}>
              <Globe size={40} color={theme.primary} />
            </View>
          </View>
        </Animated.View>
        <View style={styles.header}>
          <Text style={styles.title}>Culture Connect</Text>
          <Text style={styles.subtitle}>Connect with different cultures and events wherever you are.</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: theme.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.white,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
});