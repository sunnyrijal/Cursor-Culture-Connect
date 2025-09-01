import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { Camera, Bell, GraduationCap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import LogoutButton from '../LogoutButton';
import { Shadow } from 'react-native-shadow-2';

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

const Header = ({
  setShowStoriesModal,
}: {
  setShowStoriesModal: (value: boolean) => void;
}) => {
  const router = useRouter();
  const [pressedButton, setPressedButton] = useState<string | null>(null);

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
              {/* <Text style={styles.avatarText}>
                {currentUser.name.charAt(0)}
              </Text> */}
              <GraduationCap size={24} color="#7C3AED" />
            </View>
          </TouchableOpacity>

          <View style={styles.appTitleContainer}>
            <Text style={styles.appTitle}>TRiVO</Text>
            {/* <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{currentUser.name}!</Text> */}
          </View>
        </View>

        <View style={styles.headerActions}>
          <Shadow
            distance={8}
            startColor="rgba(163, 177, 198, 0.15)"
            offset={[4, 4]}
          >
            <TouchableOpacity
              onPress={() => setShowStoriesModal(true)}
              onPressIn={() => handlePressIn('camera')}
              onPressOut={handlePressOut}
              style={[getButtonStyle('camera'), styles.cameraButton]}
              activeOpacity={1}
            >
              <Camera size={20} color="#EC4899" />
            </TouchableOpacity>
          </Shadow>
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
              <Bell size={20} color="#3B82F6" />
            </TouchableOpacity>
          </Shadow>
          {/* <LogoutButton /> */}
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: clayColors.background,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: clayColors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatarButton: {
    borderRadius: 16,
    padding: 4,
    marginRight: 16,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fadaffff', // Pink gradient simulation
    justifyContent: 'center',
    alignItems: 'center',
    // Inner shadow effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Commented out avatar text style
  // avatarText: {
  //   fontSize: 24,
  //   fontWeight: '600',
  //   color: '#7C3AED', // Purple text
  // },

  // New app title styles
  appTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: clayColors.textPrimary,
  },

  // Commented out greeting styles
  // greetingContainer: {
  //   flex: 1,
  // },
  // greeting: {
  //   fontSize: 14,
  //   fontWeight: '500',
  //   color: clayColors.textSecondary,
  //   marginBottom: 2,
  // },
  // userName: {
  //   fontSize: 20,
  //   fontWeight: '700',
  //   color: clayColors.textPrimary,
  // },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
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
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E5E9F0', // Slightly darker for pressed state
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
    backgroundColor: '#FDF2F8', // Light pink background
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.1)',
  },

  notificationButton: {
    backgroundColor: '#EFF6FF', // Light blue background
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
});