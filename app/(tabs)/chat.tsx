import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, MessageCircle, Users, Sparkles, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { mockConversations, mockGroupConversations } from '@/data/mockData';

type FilterType = 'personal' | 'groups';

export default function ChatListScreen() {
  const [filter, setFilter] = useState<FilterType>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredPersonal = mockConversations.filter(c => 
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = mockGroupConversations.filter(gc =>
    gc.group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderPersonalItem = ({ item, index }: { item: typeof mockConversations[0], index: number }) => (
    <TouchableOpacity 
      style={[styles.chatItem, { marginTop: index === 0 ? 8 : 0 }]} 
      onPress={() => router.push(`/chat/${item.user.id}`)}
      activeOpacity={0.7}
    >
      <BlurView intensity={10} style={styles.chatItemBlur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']}
          style={styles.chatItemGradient}
        >
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.user.image }} style={styles.avatar} />
            <View style={styles.onlineIndicator} />
          </View>
          
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName}>{item.user.name}</Text>
              <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
            </View>
            <View style={styles.chatMessage}>
              <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
              {item.unreadCount > 0 && (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.unreadBadge}
                >
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </LinearGradient>
              )}
            </View>
          </View>
          
          <View style={styles.chatArrow}>
            <ArrowRight size={16} color="#94A3B8" />
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  const renderGroupItem = ({ item, index }: { item: typeof mockGroupConversations[0], index: number }) => (
    <TouchableOpacity 
      style={[styles.chatItem, { marginTop: index === 0 ? 8 : 0 }]} 
      onPress={() => router.push(`/chat/${item.id}`)}
      activeOpacity={0.7}
    >
      <BlurView intensity={10} style={styles.chatItemBlur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']}
          style={styles.chatItemGradient}
        >
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.group.image }} style={styles.avatar} />
            <View style={styles.groupBadge}>
              <Users size={12} color="#FFFFFF" />
            </View>
          </View>
          
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName}>{item.group.name}</Text>
              <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
            </View>
            <View style={styles.chatMessage}>
              <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
              {item.unreadCount > 0 && (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.unreadBadge}
                >
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </LinearGradient>
              )}
            </View>
          </View>
          
          <View style={styles.chatArrow}>
            <ArrowRight size={16} color="#94A3B8" />
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {/* <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.headerGradient}
          > */}
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <MessageCircle size={28}  color={theme.primary}/>
                <Text style={styles.headerTitle}>Messages</Text>
              </View>
              <View style={styles.headerRight}>
                <Sparkles size={24}  color={theme.primary}/>
              </View>
            </View>
          {/* </LinearGradient> */}
        </View>

        {/* Search Container */}
        <View style={styles.searchWrapper}>
          <BlurView intensity={20} style={styles.searchBlur}>
            <View style={[
              styles.searchContainer,
              searchFocused && styles.searchContainerFocused
            ]}>
              <Search size={20} color={searchFocused ? "#6366F1" : "#94A3B8"} style={styles.searchIcon} />
              <TextInput
                placeholder="Search conversations..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </View>

        {/* Filter Container */}
        <View style={styles.filterWrapper}>
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                filter === 'personal' && styles.activeFilter
              ]}
              onPress={() => setFilter('personal')}
              activeOpacity={0.8}
            >
              {filter === 'personal' ? (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.filterButtonGradient}
                >
                  <MessageCircle size={16} color="#FFFFFF" />
                  <Text style={[styles.filterText, styles.activeFilterText]}>Personal</Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterButtonContent}>
                  <MessageCircle size={16} color="#64748B" />
                  <Text style={styles.filterText}>Personal</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.filterButton, 
                filter === 'groups' && styles.activeFilter
              ]}
              onPress={() => setFilter('groups')}
              activeOpacity={0.8}
            >
              {filter === 'groups' ? (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.filterButtonGradient}
                >
                  <Users size={16} color="#FFFFFF" />
                  <Text style={[styles.filterText, styles.activeFilterText]}>Groups</Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterButtonContent}>
                  <Users size={16} color="#64748B" />
                  <Text style={styles.filterText}>Groups</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Chat List */}
        <View style={styles.listContainer}>
          {filter === 'personal' ? (
            <FlatList
              data={filteredPersonal}
              renderItem={renderPersonalItem}
              keyExtractor={item => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <FlatList
              data={filteredGroups}
              renderItem={renderGroupItem}
              keyExtractor={item => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#6366F1',
    //     shadowOffset: { width: 0, height: 8 },
    //     shadowOpacity: 0.3,
    //     shadowRadius: 16,
    //   },
    //   android: {
    //     elevation: 12,
    //   },
    // }),
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    // color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  searchWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchContainerFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 12,
  },
  clearButton: {
    fontSize: 16,
    color: '#94A3B8',
    padding: 4,
  },
  filterWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor:'white',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  activeFilter: {
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  filterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    // backgroundColor:'white',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  chatItem: {
    marginBottom: 4,
    padding:4,

  },
  chatItemBlur: {
    borderRadius: 20,
    backgroundColor:'white',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chatItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,

  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  groupBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  chatTime: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  chatMessage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    color: '#64748B',
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  unreadBadge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chatArrow: {
    marginLeft: 12,
    padding: 4,
  },
});