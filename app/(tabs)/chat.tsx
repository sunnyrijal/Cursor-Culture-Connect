import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { mockConversations, mockGroupConversations } from '@/data/mockData';

type FilterType = 'personal' | 'groups';

export default function ChatListScreen() {
  const [filter, setFilter] = useState<FilterType>('personal');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPersonal = mockConversations.filter(c => 
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = mockGroupConversations.filter(gc =>
    gc.group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderPersonalItem = ({ item }: { item: typeof mockConversations[0] }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => router.push(`/chat/${item.user.id}`)}>
      <Image source={{ uri: item.user.image }} style={styles.avatar} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.user.name}</Text>
          <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
        </View>
        <View style={styles.chatMessage}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGroupItem = ({ item }: { item: typeof mockGroupConversations[0] }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => router.push(`/chat/${item.id}`)}>
      <Image source={{ uri: item.group.image }} style={styles.avatar} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.group.name}</Text>
          <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
        </View>
        <View style={styles.chatMessage}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Search messages..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'personal' && styles.activeFilter]}
          onPress={() => setFilter('personal')}
        >
          <Text style={[styles.filterText, filter === 'personal' && styles.activeFilterText]}>Personal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'groups' && styles.activeFilter]}
          onPress={() => setFilter('groups')}
        >
          <Text style={[styles.filterText, filter === 'groups' && styles.activeFilterText]}>Groups</Text>
        </TouchableOpacity>
      </View>
      
      {filter === 'personal' ? (
        <FlatList
          data={filteredPersonal}
          renderItem={renderPersonalItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { fontSize: typography.fontSize['3xl'], fontFamily: typography.fontFamily.bold },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, height: 44, fontSize: typography.fontSize.base },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: theme.white,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeFilter: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterText: {
    fontFamily: typography.fontFamily.medium,
    color: theme.textPrimary,
  },
  activeFilterText: {
    color: theme.white,
  },
  list: { flex: 1, },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: spacing.md },
  chatContent: { flex: 1, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: spacing.md, },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  chatName: { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.semiBold },
  chatTime: { fontSize: typography.fontSize.sm, color: theme.textSecondary },
  chatMessage: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { color: theme.textSecondary, flex: 1, },
  unreadBadge: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  unreadText: { color: theme.white, fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.bold },
});
