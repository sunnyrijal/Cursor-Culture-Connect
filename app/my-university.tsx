// project/app/my-university.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme, spacing, typography } from '@/components/theme';
import { ArrowLeft } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getMyUniversity } from '@/contexts/university.api';

import PeopleList from '@/components/university/PeopleList';
import EventsList from '@/components/university/EventList';
import GroupsList from '@/components/university/GroupList';

export default function MyUniversity() {
  const [activeTab, setActiveTab] = useState('events');

  const { data: res, isLoading, error } = useQuery({
    queryKey: ['myUniversity'],
    queryFn: () => getMyUniversity(),
  });

  
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading university data...</Text>
        </View>
      );
    }

    if (error || !res?.data) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load university data</Text>
        </View>
      );
    }

    const { events, groups, people } = res.data;

    console.log(people)

    switch (activeTab) {
      case 'events':
        return <EventsList events={events || []} />;
      case 'groups':
        return <GroupsList groups={groups || []} />;
      case 'people':
        return <PeopleList people={people || []} />;
      default:
        return null;
    }
  };

  const getTabCount = () => {
    if (!res?.data) return '';
    
    switch (activeTab) {
      case 'events':
        return res.data.events?.length || 0;
      case 'groups':
        return res.data.groups?.length || 0;
      case 'people':
        return res.data.people?.length || 0;
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {res?.data?.university?.name || 'University'} Hub
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.headerContainer}>
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {getTabCount()} {activeTab}
          </Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'people' && styles.activeTab]}
          onPress={() => setActiveTab('people')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'people' && styles.activeTabText]}>
            People
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
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
  headerContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  countText: {
    fontSize: 15,
    color: theme.gray500,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F0F3F7', // Claymorphism background
    marginHorizontal: spacing.md,
    borderRadius: 16,
    padding: 4,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#A3B1C6',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: theme.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textSecondary,
  },
  activeTabText: {
    color: theme.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 16,
    color: theme.gray500,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  errorText: {
    fontSize: 16,
    color: theme.gray500,
  },
});