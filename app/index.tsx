import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

const theme = {
  primary: '#6366F1',
  white: '#FFFFFF',
  textSecondary: '#9CA3AF',
  buttonBackground: 'rgba(255, 255, 255, 0.15)',
  buttonText: '#FFFFFF',
};

export default function Index() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const { isAuthenticated, isLoading } = useAuth();
  const hasNavigated = useRef(false);

  // Start animation and check authentication
  useEffect(() => {
    // Start logo animation
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 800 }),
      withTiming(1, { duration: 200 })
    );
    
    logoOpacity.value = withTiming(1, { duration: 800 });

    // Check auth status and show appropriate UI
    const checkStatus = async () => {
      try {
        if (!isLoading) {
          if (isAuthenticated && !hasNavigated.current) {
            // User is authenticated, navigate to the main tabs
            console.log("User is authenticated, navigating to tabs...");
            hasNavigated.current = true;
            
            // Use explicit tab name to avoid navigation loop
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 500);
          } else if (!isAuthenticated) {
            // User is not authenticated, show login/signup options
            setTimeout(() => {
              setIsPageLoading(false);
              contentOpacity.value = withTiming(1, { duration: 500 });
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error in welcome screen:', error);
        setIsPageLoading(false);
      }
    };

    checkStatus();
  }, [isAuthenticated, isLoading]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleGuestAccess = () => {
    // Use explicit tab name to avoid navigation loop
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
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

        {isPageLoading || isLoading ? (
          <ActivityIndicator size="large" color={theme.white} style={styles.loader} />
        ) : (
          <Animated.View style={[styles.buttonContainer, contentAnimatedStyle]}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSignup}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGuestAccess}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Continue as Guest</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>
    </View>
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
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.white,
  },
  subtitle: {
    fontSize: 16,
    color: theme.white,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    opacity: 0.8,
    maxWidth: 300,
  },
  loader: {
    marginTop: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: theme.buttonBackground,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButton: {
    backgroundColor: theme.primary,
  },
  buttonText: {
    color: theme.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    padding: 12,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
});