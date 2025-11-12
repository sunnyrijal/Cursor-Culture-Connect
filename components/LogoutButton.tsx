import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { useAlert } from '@/contexts/AlertContext';

export const neomorphColors = {
  background: '#F0F3F7',
  lightShadow: '#FFFFFF',
  darkShadow: '#CDD2D8',
  primary: '#6366F1',
};

export default function LogoutButton() {
  const { logout } = useAuth();
  const { showAlert } = useAlert();
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handleLogout = () => {
    showAlert({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Show loading indicator or disable button here if needed
              
              // Call the logout function from AuthContext
              // This will handle both server-side session destruction and client-side cleanup
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              showAlert({
                title: 'Logout Error',
                message: 'There was a problem logging out. Please try again.',
              });
            }
          }
        }
      ],
    });
  };

  const getButtonStyle = () => {
    return isPressed ? styles.actionButtonPressed : styles.actionButton;
  };

  return (
    <TouchableOpacity 
      style={getButtonStyle()}
      onPress={handleLogout}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <LogOut size={22} color="#FF4757" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Normal state - raised neumorphic button (matches header buttons)
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

  // Pressed state - inset neumorphic button (matches header buttons)
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