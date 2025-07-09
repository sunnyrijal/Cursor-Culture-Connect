// project/app/my-university.tsx

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { ArrowLeft, Calendar, Users, User, MapPin, ChevronRight, GraduationCap } from 'lucide-react-native';
import { currentUser, mockEvents, mockGroups, mockUsersByHeritage, MockEvent, MockGroup, MockUser } from '@/data/mockData';

export default function MyUniversity() {
  const [activeTab, setActiveTab] = useState('events');
  const universityName = currentUser.university;
  const allUsers = useMemo(() => Object.values(mockUsersByHeritage).flat(), []);

  const universityEvents = useMemo(() => 
    mockEvents.filter(event => (event.allowedUniversity === universityName || !event.universityOnly)),
    [universityName]
  );
  
  const universityGroups = useMemo(() => 
    mockGroups.filter(group => group.location === universityName),
    [universityName]
  );
  
  const universityPeople = useMemo(() => 
    allUsers.filter(user => user.university === universityName && user.id !== currentUser.id),
    [universityName]
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return universityEvents.length > 0 ? (
          universityEvents.map(renderEventItem)
        ) : (
          <Text style={styles.emptyText}>No events found for {universityName}.</Text>
        );
      case 'groups':
        return universityGroups.length > 0 ? (
          universityGroups.map(renderGroupItem)
        ) : (
          <Text style={styles.emptyText}>No groups found for {universityName}.</Text>
        );
      case 'people':
        return universityPeople.length > 0 ? (
          universityPeople.map(renderConnectionItem)
        ) : (
          <Text style={styles.emptyText}>No other users found from {universityName}.</Text>
        );
      default:
        return null;
    }
  };

  const renderEventItem = (event: MockEvent) => (
    <TouchableOpacity key={event.id} onPress={() => router.push(`/event/${event.id}`)}>
      <Card style={styles.listItem}>
        <Image source={{ uri: event.image }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{event.title}</Text>
          <View style={styles.itemMeta}>
            <Calendar size={14} color={theme.gray500} />
            <Text style={styles.itemMetaText}>{event.date} at {event.time}</Text>
          </View>
        </View>
        <ChevronRight size={20} color={theme.gray400} />
      </Card>
    </TouchableOpacity>
  );

  const renderGroupItem = (group: MockGroup) => (
    <TouchableOpacity key={group.id} onPress={() => router.push(`/group/${group.id}`)}>
      <Card style={styles.listItem}>
        <Image source={{ uri: group.image }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{group.name}</Text>
          <View style={styles.itemMeta}>
            <Users size={14} color={theme.gray500} />
            <Text style={styles.itemMetaText}>{group.memberCount} members</Text>
          </View>
        </View>
        <ChevronRight size={20} color={theme.gray400} />
      </Card>
    </TouchableOpacity>
  );

  const renderConnectionItem = (user: MockUser) => (
    <TouchableOpacity key={user.id} onPress={() => router.push(`/profile/public/${user.id}`)}>
      <Card style={styles.listItem}>
        <Image source={{ uri: user.image }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{user.name}</Text>
          <View style={styles.itemMeta}>
            <User size={14} color={theme.gray500} />
            <Text style={styles.itemMetaText}>{user.major} - {user.year}</Text>
          </View>
        </View>
        <ChevronRight size={20} color={theme.gray400} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{universityName} Hub</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'people' && styles.activeTab]}
          onPress={() => setActiveTab('people')}
        >
          <Text style={[styles.tabText, activeTab === 'people' && styles.activeTabText]}>
            People
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {renderContent()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  tab: {
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: theme.textSecondary,
  },
  activeTabText: {
    color: theme.primary,
    fontFamily: typography.fontFamily.bold,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.xs,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemMetaText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  }
});
