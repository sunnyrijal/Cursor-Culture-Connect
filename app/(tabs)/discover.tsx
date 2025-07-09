// project/app/(tabs)/discover.tsx

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, X, Users, Linkedin } from 'lucide-react-native';
import { ShareButton } from '@/components/ui/ShareButton';
import { FilterSystem } from '@/components/FilterSystem';
import { mockUsersByHeritage, MockUser } from '@/data/mockData';
import placeholderImg from '@/assets/images/icon.png';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#FAFAFA',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray900: '#111827',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: { country: '', state: '', city: '' },
    university: '',
    visibility: 'all' as const,
    heritage: [] as string[],
    categories: [] as string[]
  });

  const allUsers = useMemo(() => Object.values(mockUsersByHeritage).flat(), []);
  const [discoverUsers, setDiscoverUsers] = useState(allUsers);

  const filteredUsers = useMemo(() => {
    return discoverUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      return true;
    });
  }, [discoverUsers, searchQuery, filters]);

  const handleDismissUser = (userId: string) => {
    setDiscoverUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
  };
  
  const handleCardPress = (user: MockUser) => {
    router.push(`/profile/public/${user.id}`);
  };
  
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const generateUserShareContent = (user: MockUser) => {
    return {
      title: `${user.name} - Culture Connect`,
      message: `Connect with ${user.name} on Culture Connect!\n\n🎓 ${user.major} at ${user.university}\n🌍 Heritage: ${user.heritage.join(', ')}\n\nDiscover amazing people from diverse cultures!`,
      url: `https://cultureconnect.app/profile/${user.id}`
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grow Your Network</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.gray400}
          />
        </View>
      </View>

       <View style={styles.filtersContainer}>
        <FilterSystem
          onFiltersChange={handleFiltersChange}
          contentType="users"
          showPresets={true}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{paddingHorizontal: 20}} showsVerticalScrollIndicator={false}>
        <View style={styles.usersGrid}>
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <TouchableOpacity style={styles.dismissButton} onPress={() => handleDismissUser(user.id)}>
                <X size={16} color={theme.gray500} />
              </TouchableOpacity>
              
              <View style={styles.shareButtonContainer}>
                <ShareButton
                  {...generateUserShareContent(user)}
                  size={16}
                  color={theme.gray500}
                  style={styles.shareButton}
                />
              </View>
              
              <TouchableOpacity onPress={() => handleCardPress(user)}>
                <View style={styles.userCardContent}>
                  <Image source={{ uri: user.image || undefined }} defaultSource={placeholderImg} style={styles.userImage} />
                  <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                  <Text style={styles.userTitle} numberOfLines={2}>{user.title}</Text>
                   {user.mutualConnections > 0 && (
                    <View style={styles.mutualConnections}>
                      <Users size={14} color={theme.gray500} />
                      <Text style={styles.mutualConnectionsText}>
                        {user.mutualConnections} mutual connections
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.connectButton, user.isConnected && styles.connectedButton]} 
                onPress={() => handleCardPress(user)}
              >
                <Text style={[styles.connectButtonText, user.isConnected && styles.connectedButtonText]}>
                  {user.isConnected ? 'Message' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.gray100,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: theme.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.gray50,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.textPrimary,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  scrollView: {
    flex: 1,
  },
  usersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  userCard: {
    width: '48%',
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    position: 'relative',
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  shareButtonContainer: {
    position: 'absolute',
    top: 8,
    right: 32,
    zIndex: 2,
  },
  shareButton: {
    padding: 4,
  },
  userCardContent: {
    alignItems: 'center',
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 36, // To prevent layout shifts
  },
  mutualConnections: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  mutualConnectionsText: {
    fontSize: 12,
    color: theme.gray500,
  },
  connectButton: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.primary,
  },
  connectedButton: {
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  connectButtonText: {
    textAlign: 'center',
    color: theme.white,
    fontWeight: '600',
  },
  connectedButtonText: {
    color: theme.primary,
  },
});