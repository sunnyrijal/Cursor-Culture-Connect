import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Bell, User, BookOpen, LogIn, CheckCircle, X } from 'lucide-react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import LogoutButton from '../LogoutButton';
import { Shadow } from 'react-native-shadow-2';

import { Image } from 'react-native';
//@ts-ignore
import logo from '../../assets/logo.png';
import { getMyData } from '@/contexts/user.api';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import getDecodedToken from '@/utils/getMyData';
import { getNotificationCount } from '@/contexts/notification.api';

export const clayColors = {
  background: '#F0F3F7',
  lightShadow: '#FFFFFF',
  darkShadow: '#A3B1C6',
  shadowLight: 'rgba(255, 255, 255, 0.7)',
  shadowDark: 'rgba(163, 177, 198, 0.15)',
  purple: '#8B5FBF',
  pink: '#FF6B9D',
  blue: '#4A9EFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
};

const currentUser = { name: 'Alex' };

const Header = () => {
  const router = useRouter();
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [showProfileTooltip, setShowProfileTooltip] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const { verified } = useLocalSearchParams<{ verified?: string }>();

  const handlePressIn = (buttonId: string) => {
    setPressedButton(buttonId);
  };

  const handlePressOut = () => {
    setPressedButton(null);
  };

  const getButtonStyle = (buttonId: string) => {
    return pressedButton === buttonId
      ? styles.actionButtonPressed
      : styles.actionButton;
  };

  const { authState } = useAuth();

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const { data: notificationCount, isLoading, refetch } = useQuery({
    queryKey: ['notificationCount'],
    queryFn: () => getNotificationCount(),
  });

  // Show profile tooltip if verified param is present
  useEffect(() => {
    if (verified=='true' && myData) {
      // Small delay before showing tooltip
      const timer = setTimeout(() => {
        setShowProfileTooltip(true);
        
        // Fade in and scale animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);

      // Auto hide after 6 seconds
      const hideTimer = setTimeout(() => {
        hideTooltip();
      }, 6500);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [verified, myData]);

  const hideTooltip = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Remove the 'verified' query param from the URL so the tooltip doesn't show again
      if (verified) {
        router.setParams({ verified: undefined });
      }
      setShowProfileTooltip(false);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            style={styles.avatarButton}
            activeOpacity={1}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatarContainer}>
                <Image source={logo} style={styles.logo} resizeMode="contain" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.appTitleContainer}>
            <Text style={styles.appTitle}>TRiVO</Text>
            <Text style={styles.greeting}>Connect</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {myData ? (
            <>
              <View style={styles.profileButtonContainer}>
                <Shadow
                  distance={8}
                  startColor="rgba(163, 177, 198, 0.15)"
                  offset={[4, 4]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      hideTooltip();
                      router.push('/settings');
                    }}
                    onPressIn={() => handlePressIn('profile')}
                    onPressOut={handlePressOut}
                    style={[getButtonStyle('profile'), styles.profileButton]}
                    activeOpacity={1}
                  >
                    <User size={24} color="#8B5FBF" />
                  </TouchableOpacity>
                </Shadow>

                {/* Profile Tooltip */}
                {showProfileTooltip && (
                  <Animated.View
                    style={[
                      styles.tooltipContainer,
                      {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                      },
                    ]}
                  >
                    {/* Arrow pointing to profile button */}
                    <View style={styles.tooltipArrow} />
                    
                    <Shadow
                      distance={12}
                      startColor="rgba(99, 102, 241, 0.2)"
                      offset={[0, 8]}
                    >
                      <View style={styles.tooltip}>
                        <TouchableOpacity
                          onPress={hideTooltip}
                          style={styles.tooltipClose}
                        >
                          <X size={16} color="#6B7280" />
                        </TouchableOpacity>
                        
                        <View style={styles.tooltipHeader}>
                          <Text style={styles.tooltipTitle}>Your Hub</Text>
                        </View>
                        
                        <Text style={styles.tooltipText}>
                          <Text style={styles.tooltipBold}>Enhance your profile.</Text>
                          {'\n'}
                          Add a profile picture, interests, and bio to help your peers to discover you
                        </Text>
                      </View>
                    </Shadow>
                  </Animated.View>
                )}
              </View>
            </>
          ) : (
            <>
              <Shadow
                distance={8}
                startColor="rgba(163, 177, 198, 0.15)"
                offset={[4, 4]}
              >
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login')}
                  onPressOut={handlePressOut}
                  style={[getButtonStyle('profile'), styles.profileButton]}
                  activeOpacity={1}
                >
                  <LogIn size={24} color="#8B5FBF" />
                </TouchableOpacity>
              </Shadow>
            </>
          )}

          <Shadow
            distance={8}
            startColor="rgba(163, 177, 198, 0.15)"
            offset={[4, 4]}
          >
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              onPressIn={() => handlePressIn('notification')}
              onPressOut={handlePressOut}
              style={[
                getButtonStyle('notification'),
                styles.notificationButton,
              ]}
              activeOpacity={1}
            >
              <Bell size={24} color="#3B82F6" />
              {notificationCount && (notificationCount as any)?.data?.count > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{(notificationCount as any)?.data?.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Shadow>
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: clayColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: clayColors.background,
    minHeight: 80,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatarButton: {
    borderRadius: 18,
    padding: 6,
    marginRight: 20,
    backgroundColor: clayColors.background,
    ...Platform.select({
      ios: {
        shadowColor: clayColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logo: {
    width: 56,
    height: 56,
  },

  appTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: clayColors.textPrimary,
  },

  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    color: clayColors.textSecondary,
    marginBottom: 2,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  profileButtonContainer: {
    position: 'relative',
  },

  profileButton: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: 'rgba(139, 95, 191, 0.1)',
  },

  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: clayColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(163, 177, 198, 0.15)',

    ...Platform.select({
      web: {
        boxShadow:
          '4px 4px 8px rgba(163, 177, 198, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.7)',
      },
      ios: {
        shadowColor: clayColors.darkShadow || '#A3B1C6',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowPath: undefined,
      },
      android: {
        elevation: 6,
        shadowColor: clayColors.darkShadow || '#A3B1C6',
      },
    }),
  },

  actionButtonPressed: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#E5E9F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: clayColors.darkShadow,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
    borderWidth: 1,
    borderColor: clayColors.darkShadow,
  },

  cameraButton: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.1)',
  },

  notificationButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: clayColors.pink,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: clayColors.background,
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 2,
  },

  // Tooltip styles
  tooltipContainer: {
    position: 'absolute',
    top: 70,
    right: -10,
    width: 280,
    zIndex: 1000,
  },
  tooltipArrow: {
    position: 'absolute',
    top: -8,
    right: 24,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    zIndex: 1001,
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    position: 'relative',
  },
  tooltipClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: clayColors.textPrimary,
  },
  tooltipText: {
    fontSize: 14,
    lineHeight: 20,
    color: clayColors.textSecondary,
    marginBottom: 16,
  },
  tooltipBold: {
    fontWeight: '700',
    color: clayColors.textPrimary,
  },
  tooltipButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tooltipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});