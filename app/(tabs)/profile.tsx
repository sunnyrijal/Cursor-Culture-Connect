import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/components/theme';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut, Settings, Edit, Heart, Users, Calendar } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    console.log('Logout button pressed');
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              console.log("Logging out user from profile screen");
              
              // Call the logout function from AuthContext
              await logout();
              
              // Explicitly navigate to login screen after logout completes
              setTimeout(() => {
                router.replace('/login');
              }, 100);
            } catch (error) {
              console.error("Logout failed:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
              setIsLoggingOut(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (isLoggingOut) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Logging out...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
        
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color={theme.textSecondary} />
              </View>
            )}
          </View>
          
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          {user.university && (
            <Text style={styles.universityText}>{user.university}</Text>
          )}
          
          {user.culturalBackground && (
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user.culturalBackground}</Text>
              </View>
            </View>
          )}
          
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Edit size={16} color={theme.white} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Users size={20} color={theme.primary} />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Calendar size={20} color={theme.primary} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Heart size={20} color={theme.primary} />
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
            <Settings size={20} color={theme.text} />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <LogOut size={20} color={theme.error} />
            <Text style={[styles.menuItemText, { color: theme.error }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.textSecondary
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  username: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  universityText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: theme.primaryLight,
    borderRadius: 16,
  },
  badgeText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  bio: {
    textAlign: 'center',
    color: theme.text,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 16,
  },
  editButtonText: {
    color: theme.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.border,
    height: '80%',
    alignSelf: 'center',
  },
  menuSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.text,
    marginLeft: 12,
  },
}); 