import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  User,
  MapPin,
  ChevronRight
} from 'lucide-react-native';
import { currentUser, mockEvents, MockEvent, MockGroup, MockUser } from '@/data/mockData';

export default function MyHub() {
  const [activeTab, setActiveTab] = useState('connections');

  const upcomingEvents = useMemo(() => 
    mockEvents ? mockEvents.filter(event => event.isRSVPed) : [], 
    []
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(renderEventItem)
            ) : (
              <Text style={styles.emptyText}>You have no upcoming events.</Text>
            )}
            <Button
              title="Explore More Events"
              onPress={() => router.push('/(tabs)/events')}
              style={styles.exploreButton}
              variant="outline"
            />
          </>
        );
      case 'groups':
        return (
           <>
            {currentUser.groupsList && currentUser.groupsList.length > 0 ? (
              currentUser.groupsList.map(renderGroupItem)
            ) : (
              <Text style={styles.emptyText}>You haven't joined any groups yet.</Text>
            )}
             <Button
              title="Find More Groups"
              onPress={() => router.push('/(tabs)/groups')}
              style={styles.exploreButton}
              variant="outline"
            />
           </>
        );
      case 'connections':
        return (
          <>
            {currentUser.connectionsList && currentUser.connectionsList.length > 0 ? (
              currentUser.connectionsList.map(renderConnectionItem)
            ) : (
              <Text style={styles.emptyText}>You haven't made any connections yet.</Text>
            )}
            <Button
              title="Discover More Connections"
              onPress={() => router.push('/(tabs)/discover')}
              style={styles.exploreButton}
              variant="outline"
            />
          </>
        );
      default:
        return null;
    }
  };

  const renderEventItem = (event: MockEvent) => (
    <TouchableOpacity key={event.id} style={styles.listItemTouchable} onPress={() => router.push(`/event/${event.id}`)}>
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
    <TouchableOpacity key={group.id} style={styles.listItemTouchable} onPress={() => router.push(`/group/${group.id}`)}>
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
    <TouchableOpacity key={user.id} style={styles.listItemTouchable} onPress={() => router.push(`/profile/public/${user.id}`)}>
      <Card style={styles.listItem}>
        <Image source={{ uri: user.image }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{user.name}</Text>
          <View style={styles.itemMeta}>
            <User size={14} color={theme.gray500} />
            <Text style={styles.itemMetaText}>{user.university}</Text>
          </View>
          <Badge 
            label={user.heritage[0]}
            variant="secondary"
            size="sm"
            style={{ marginTop: spacing.xs }}
          />
        </View>
        <Button title="Message" size="sm" style={{ paddingHorizontal: spacing.sm }} onPress={(e) => {
            e.stopPropagation();
            router.push(`/chat/${user.id}`)
        }} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Hub</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            My Events ({upcomingEvents.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            My Groups ({currentUser.groupsList?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'connections' && styles.activeTab]}
          onPress={() => setActiveTab('connections')}
        >
          <Text style={[styles.tabText, activeTab === 'connections' && styles.activeTabText]}>
            Connections ({currentUser.connectionsList?.length || 0})
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
   listItemTouchable: {
    marginBottom: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
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
  },
  exploreButton: {
    marginTop: spacing.md,
  }
});
