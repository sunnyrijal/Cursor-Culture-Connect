import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import React, { useState } from 'react';
import { Camera, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import LogoutButton from '../LogoutButton';

export const neomorphColors = {
  background: '#F0F3F7',
  lightShadow: '#FFFFFF',
  darkShadow: '#CDD2D8',
  primary: '#6366F1',
};

const currentUser = { name: 'Prasanna' };

const Header = ({ setShowStoriesModal }: { setShowStoriesModal: (value: boolean) => void }) => {
  const router = useRouter();
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const handlePressIn = (buttonId: string) => {
    setPressedButton(buttonId);
  };

  const handlePressOut = () => {
    setPressedButton(null);
  };

  const getButtonStyle = (buttonId: string) => {
    return pressedButton === buttonId ? styles.actionButtonPressed : styles.actionButton;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>P</Text>
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{currentUser.name}!</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          {/* Camera/Story Icon */}
          <TouchableOpacity
            onPress={() => setShowStoriesModal(true)}
            onPressIn={() => handlePressIn('camera')}
            onPressOut={handlePressOut}
            style={getButtonStyle('camera')}
            activeOpacity={1}
          >
            <Camera size={22} color="#FF6B9D" />
          </TouchableOpacity>

          {/* Notification Icon */}
          <TouchableOpacity 
            onPress={() => router.push('/notifications')}
            onPressIn={() => handlePressIn('notification')}
            onPressOut={handlePressOut}
            style={getButtonStyle('notification')}
            activeOpacity={1}
          >
            <Bell size={22} color="#4A9EFF" />
          </TouchableOpacity>

          <LogoutButton />
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: neomorphColors.background,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: neomorphColors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: neomorphColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // Neumorphic effect for avatar
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
    // Inner content styling
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B5FBF',
    textShadowColor: neomorphColors.lightShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  // Normal state - raised neumorphic button
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: neomorphColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },

  actionButtonPressed: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: neomorphColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
    borderWidth: 0.5,
    borderColor: neomorphColors.darkShadow,
  },
});