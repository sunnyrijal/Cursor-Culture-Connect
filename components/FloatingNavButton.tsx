import React from 'react';
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import { Menu, LogOut, LucideIcon } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { useAlert } from '@/contexts/AlertContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FloatingButtonProps {
  onPress: () => void;
  icon: React.ReactElement;
  style?: object;
  accessibilityLabel: string;
}

function FloatingButton({ onPress, icon, style, accessibilityLabel }: FloatingButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: insets.bottom + 20, pointerEvents: "box-none" }]}>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        {icon}
      </TouchableOpacity>
    </View>
  );
}

export function FloatingLogoutButton() {
  const { logout } = useAuth();
  const { showAlert } = useAlert();
  const handleLogout = () => {
    showAlert({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
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
              showAlert({ title: 'Error', message: 'Failed to logout. Please try again.' });
            }
          },
        },
      ],
    });
  };

  return (
    <FloatingButton
      onPress={handleLogout}
      icon={<LogOut size={22} color="#EF4444" />}
      style={styles.logoutButton}
      accessibilityLabel="Logout"
    />
  );
}

export default function FloatingNavButton({ onPress }: { onPress: () => void }) {
  return <FloatingButton onPress={onPress} icon={<Menu size={22} color="#fff" />} accessibilityLabel="Show navigation bar" />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
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
    borderColor: '#EF4444',
  }
}); 