import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';

export default function LogoutButton() {
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
              // Show loading indicator or disable button here if needed
              
              // Call the logout function from AuthContext
              // This will handle both server-side session destruction and client-side cleanup
              await logout();
              
              // Redirect to login page
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Logout Error', 'There was a problem logging out. Please try again.');
              
              // Even if there's an error, try to redirect to login
              router.replace('/login');
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={handleLogout}
      activeOpacity={0.7}
    >
      <LogOut size={22} color="#4F8EF7" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});