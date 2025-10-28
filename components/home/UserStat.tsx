import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { theme, spacing, typography } from '../theme';
import { useQuery } from '@tanstack/react-query';
import { getCounts } from '@/contexts/user.api';

const UserStat = ({ currentUser }: { currentUser: any }) => {
  const router = useRouter();

  const {data} = useQuery({
    queryFn: getCounts,
    queryKey:["counts"]
  })


  return (
    <TouchableOpacity
      onPress={() => router.push('/hub-details')}
      style={styles.card}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Hub</Text>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => router.push('/hub-details?tab=events')}
          activeOpacity={0.7}
        >
          <Text style={styles.statNumber}>{data?.data?.eventsCount || 0}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => router.push('/hub-details?tab=groups')}
          activeOpacity={0.7}
        >
          <Text style={styles.statNumber}>{data?.data?.groupsCount || 0}</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => router.push('/hub-details?tab=friends')}
          activeOpacity={0.7}
        >
          <Text style={styles.statNumber}>{data?.data?.friendsCount || 0}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default UserStat;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: spacing.md,
    marginHorizontal: spacing.sm,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: typography.fontFamily.bold,
  },
  viewDetails: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecf1f7ff',
    borderRadius: 16,
    paddingVertical: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#b6b6b6ff',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.primary,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
  },
});
