// project/app/(tabs)/profile.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Mail, MapPin, GraduationCap, Globe, MessageCircle, Calendar, Users, CreditCard as Edit3, Share2 } from 'lucide-react-native';
import { currentUser } from '@/data/mockData';
import { router } from 'expo-router';

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

export default function Profile() {
  const [activeTab, setActiveTab] = useState('about');
  const userProfile = currentUser; // Use the imported current user data

  const culturalStories = [
    {
      id: 1,
      title: 'Mid-Autumn Festival Memories',
      excerpt: 'Growing up, the Mid-Autumn Festival was always a special time...',
      likes: 45,
      comments: 8,
      date: '2 days ago'
    },
    {
      id: 2,
      title: 'Traditional Tea Ceremony',
      excerpt: 'Learning the art of Chinese tea ceremony from my grandmother...',
      likes: 32,
      comments: 5,
      date: '1 week ago'
    }
  ];

  const recentActivity = [
    { type: 'joined', text: 'Joined Asian Student Alliance', date: '3 days ago' },
    { type: 'attended', text: 'Attended Lunar New Year Festival', date: '1 week ago' },
    { type: 'shared', text: 'Shared a cultural story', date: '2 weeks ago' },
    { type: 'connected', text: 'Connected with 3 new students', date: '3 weeks ago' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
          <Settings size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: userProfile.image }} style={styles.profileImage} />
            {userProfile.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <View style={styles.profileMeta}>
              <Mail size={14} color={theme.gray500} />
              <Text style={styles.profileMetaText}>{userProfile.email}</Text>
            </View>
            <View style={styles.profileMeta}>
              <GraduationCap size={14} color={theme.gray500} />
              <Text style={styles.profileMetaText}>
                {userProfile.major} • {userProfile.year}
              </Text>
            </View>
            <View style={styles.profileMeta}>
              <MapPin size={14} color={theme.gray500} />
              <Text style={styles.profileMetaText}>{userProfile.university}</Text>
            </View>
            <View style={styles.profileMeta}>
              <MapPin size={14} color={theme.primary} />
              <Text style={styles.profileMetaText}>{userProfile.location}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => router.push('/profile/edit')}>
            <Edit3 size={16} color={theme.white} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/my-hub')}>
            <Text style={styles.statNumber}>{userProfile.joinedGroups}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/my-hub')}>
            <Text style={styles.statNumber}>{userProfile.connections}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/my-hub')}>
            <Text style={styles.statNumber}>{userProfile.eventsAttended}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              About
            </Text>
          </TouchableOpacity>
          {culturalStories.length > 0 && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'stories' && styles.activeTab]}
              onPress={() => setActiveTab('stories')}
            >
              <Text style={[styles.tabText, activeTab === 'stories' && styles.activeTabText]}>
                Stories
              </Text>
            </TouchableOpacity>
          )}
          {recentActivity.length > 0 && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
              onPress={() => setActiveTab('activity')}
            >
              <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
                Activity
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <View style={styles.bioSection}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <Text style={styles.bioText}>{userProfile.bio}</Text>
            </View>

            <View style={styles.identitySection}>
              <Text style={styles.sectionTitle}>Cultural Identity</Text>
              
              <View style={styles.identityItem}>
                <View style={styles.identityHeader}>
                  <Globe size={16} color={theme.primary} />
                  <Text style={styles.identityLabel}>Heritage:</Text>
                </View>
                <View style={styles.tags}>
                  {userProfile.heritage.map((heritage, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: theme.primary }]}>
                      <Text style={styles.tagText}>{heritage}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.identityItem}>
                <View style={styles.identityHeader}>
                  <MessageCircle size={16} color={theme.accent} />
                  <Text style={styles.identityLabel}>Languages:</Text>
                </View>
                <View style={styles.tags}>
                  {userProfile.languages.map((language, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: theme.accent }]}>
                      <Text style={styles.tagText}>{language}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'stories' && (
          <View style={styles.tabContent}>
            {culturalStories.map((story) => (
              <View key={story.id} style={styles.storyCard}>
                <Text style={styles.storyTitle}>{story.title}</Text>
                <Text style={styles.storyExcerpt}>{story.excerpt}</Text>
                <View style={styles.storyStats}>
                  <Text style={styles.storyDate}>{story.date}</Text>
                  <View style={styles.storyEngagement}>
                    <Text style={styles.storyStatText}>{story.likes} likes</Text>
                    <Text style={styles.storyStatText}>{story.comments} comments</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.tabContent}>
            {recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.text}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.white,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  profileMetaText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  editButton: {
    backgroundColor: theme.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.white,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeTabText: {
    color: theme.white,
  },
  tabContent: {
    paddingBottom: 40,
  },
  bioSection: {
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 24,
  },
  identitySection: {
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  identityItem: {
    marginBottom: 16,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  identityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.white,
  },
  storyCard: {
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  storyExcerpt: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  storyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  storyEngagement: {
    flexDirection: 'row',
    gap: 12,
  },
  storyStatText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
});