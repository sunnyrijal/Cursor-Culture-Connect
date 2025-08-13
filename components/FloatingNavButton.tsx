import React from 'react';
import { TouchableOpacity, StyleSheet, View, Platform, Alert } from 'react-native';
import { Menu, LogOut } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';

export default function FloatingNavButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={{...styles.container, pointerEvents: "box-none"}}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityLabel="Show navigation bar"
        accessibilityRole="button"
      >
        <Menu size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export function FloatingLogoutButton() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{...styles.container, pointerEvents: "box-none"}}>
      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
        activeOpacity={0.85}
        accessibilityLabel="Logout"
        accessibilityRole="button"
      >
        <LogOut size={22} color="#4F8EF7" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    zIndex: 100,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4F8EF7',
  }
}); 