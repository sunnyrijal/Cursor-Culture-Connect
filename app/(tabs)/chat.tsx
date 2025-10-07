'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import {
  Search,
  MessageCircle,
  Users,
  ArrowRight,
  UserPlus,
  MailPlus,
  X,
  WifiOff,
  Trash2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '@/components/theme';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDirectChat, getUserChats } from '@/contexts/chat.api';
import getDecodedToken from '@/utils/getMyData';
import {  getUsers } from '@/contexts/user.api';
import useSocket from '@/hooks/useSocket';

type FilterType = 'DIRECT' | 'GROUP';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  city: string | null;
  classYear: string | null;
  university: {
    id: string;
    name: string;
  };
}

interface Participant {
  id: string;
  chatId: string;
  userId: string;
  user: User;
}

interface Group {
  id: string;
  name: string;
  imageUrl: string;
}

interface Message {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}

interface Chat {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name: string | null;
  createdAt: string;
  updatedAt: string;
  groupId: string | null;
  participants: Participant[];
  group: Group | null;
  messages: Message[];
  isActive: boolean;
}

export default function ChatListScreen() {
  const [filter, setFilter] = useState<FilterType>('DIRECT');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const {
    data: chatResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chats', filter],
    queryFn: () => getUserChats(),
  });

  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  const users = usersResponse?.users || [];

  const deleteChatMutation = useMutation({
    mutationFn: (chatId: string) => createDirectChat({ otherUserId: chatId }), // Assuming deleteChat is in chat.api
    onSuccess: () => {
      console.log('✅ Chat Deleted');
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  console.log(chatResponse)

  // Get socket connection and methods
  const {
    isConnected,
    onNewMessage,
    removeNewMessageListener,
    joinChat,
    leaveChat,
    reconnect,
  } = useSocket();

  const processedChats = useMemo(() => {
    if (!chatResponse?.data || !myData?.userId) return [];

    return chatResponse.data
      .filter((chat: Chat) => chat.type === filter)
      .map((chat: Chat) => {
        const lastMessage = chat.messages[0];
        const isMyMessage = lastMessage?.senderId === myData.userId;
        const messageContent = lastMessage?.content || 'No messages yet';
        const displayMessage =
          lastMessage && isMyMessage
            ? `You: ${messageContent}`
            : messageContent;

        if (chat.type === 'GROUP') {
          return {
            id: chat.id,
            name: chat.group?.name || 'Unnamed Group',
            image:
              chat.group?.imageUrl ||
              'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
            lastMessage: displayMessage,
            lastMessageTime: lastMessage
              ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
            unreadCount: 0, // You might want to calculate this based on your data
            type: 'GROUP' as const,
            isMyLastMessage: isMyMessage,
            isActive: true, // Always active for now
          };
        } else {
          const otherParticipant = chat.participants.find(
            (p) => p.userId !== myData.userId
          );
          return {
            id: chat.id,
            name: otherParticipant?.user.name || 'Unknown User',
            image:
              'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
            lastMessage: displayMessage,
            lastMessageTime: lastMessage
              ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
            unreadCount: 0, // You might want to calculate this based on your data
            type: 'DIRECT' as const,
            isMyLastMessage: isMyMessage,
            isActive: chat.isActive,
          };
        }
      });
  }, [chatResponse, myData, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => {
      setRefreshing(false);
    });
  }, [refetch, isConnected, reconnect]);

  const handleNewMessage = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    try {
      onNewMessage(handleNewMessage);
      console.log('✅ Message listener set up successfully');
    } catch (error) {
      console.error('❌ Error setting up message listener:', error);
    }

    return () => {
      console.log('🧹 Removing message listener from chat list');
      try {
        removeNewMessageListener();
        console.log('✅ Message listener removed successfully');
      } catch (error) {
        console.error('❌ Error removing message listener:', error);
      }
    };
  }, [isConnected, onNewMessage, removeNewMessageListener, handleNewMessage]);

  // Join all chats when connected and chats are loaded with better error handling
  useEffect(() => {
    if (!isConnected) {
      console.log('⚠️ Socket not connected, cannot join chats');
      reconnect();
      return;
    }

    if (!processedChats.length) {
      console.log('⚠️ No chats to join');
      return;
    }

    console.log('🏠 Joining all chats:', processedChats.length);

    // Loop through all chats and join each one
    processedChats.forEach((chat: any) => {
      console.log('🏠 Attempting to join chat:', chat.id);
      try {
        joinChat(chat.id);
        console.log('✅ Successfully joined chat:', chat.id);
      } catch (error) {
        console.error('❌ Error joining chat:', chat.id, error);
      }
    });

    // Leave all chats when component unmounts or chats change
    return () => {
      if (processedChats.length > 0) {
        console.log('🚪 Leaving all chats...');
        processedChats.forEach((chat: any) => {
          console.log('🚪 Attempting to leave chat:', chat.id);
          try {
            leaveChat(chat.id);
            console.log('✅ Successfully left chat:', chat.id);
          } catch (error) {
            console.error('❌ Error leaving chat:', chat.id, error);
          }
        });
      }
    };
  }, [isConnected, processedChats, joinChat, leaveChat, reconnect]);

  const { mutate: createDirectChatMutate, isPending: isCreatingChat } =
    useMutation({
      mutationFn: (userId: string) => createDirectChat({ otherUserId: userId }),
      onSuccess: (data) => {
        console.log('✅ Chat Created:', data);
        setShowUserModal(false);
        refetch();
      },
      onError: (error) => {
        console.error('❌ Error creating chat:', error);
      },
    });

  const filteredChats = processedChats.filter((chat: any) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = useMemo(() => {
    if (!users || !myData?.userId) return [];

    return users
      .filter((user: User) => user.id !== myData.userId)
      .filter(
        (user: User) =>
          userSearchQuery === '' ||
          user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          user.university.name
            .toLowerCase()
            .includes(userSearchQuery.toLowerCase())
      );
  }, [users, myData?.userId, userSearchQuery]);

  const handleUserSelect = (userId: string) => {
    createDirectChatMutate(userId);
  };

  const renderChatItem = ({
    item,
    index,
  }: {
    item: (typeof processedChats)[number];
    index: number;
  }) => (
    <TouchableOpacity
      style={[styles.chatItem, { marginTop: index === 0 ? 8 : 0 }]}
      onPress={item.isActive ? () => router.push(`/chat/${item.id}`) : undefined}
      activeOpacity={item.isActive ? 0.7 : 1}
    >
      <BlurView intensity={10} style={styles.chatItemBlur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']}
          style={styles.chatItemGradient}
        >
          <View style={{ opacity: item.isActive ? 1 : 0.5, flexDirection: 'row', flex: 1, alignItems: 'center' }}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  item.image
                    ? { uri: item.image }
                    : require('../../assets/user.png')
                }
                style={styles.avatar}
              />

              {item.type === 'GROUP' ? (
                <View style={styles.groupBadge}>
                  <Users size={12} color="#FFFFFF" />
                </View>
              ) : (
                <></>
              )}
            </View>

            <View style={styles.chatContent}>
              <Text style={styles.chatName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.bottomRow}>
                <Text
                  style={[styles.lastMessage, { fontWeight: '500' }]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
                <View style={styles.bottomRight}>
                  <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
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
            </View>
          </View>
          {!item.isActive && item.type !== 'GROUP' && (
            <TouchableOpacity
              style={styles.deleteButtonSmall}
              onPress={() => deleteChatMutation.mutate(item.id)}
              disabled={deleteChatMutation.isPending}
            >
              {deleteChatMutation.isPending && deleteChatMutation.variables === item.id ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Trash2 size={16} color="#DC2626" />
              )}
            </TouchableOpacity>
          )}

          <View style={styles.chatArrow}>
            {/* <ArrowRight size={16} color="#94A3B8" /> */}
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  // Rest of your component code remains the same...
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366F1" />
      <Text style={styles.loadingText}>Loading chats...</Text>
    </View>
  );

  const renderUserSelectionModal = () => (
    <Modal
      visible={showUserModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowUserModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select User to Message</Text>
          <TouchableOpacity
            onPress={() => setShowUserModal(false)}
            style={styles.closeButton}
          >
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalSearchWrapper}>
          <View style={styles.modalSearchContainer}>
            <Search size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              placeholder="Search users..."
              placeholderTextColor="#94A3B8"
              style={styles.modalSearchInput}
              value={userSearchQuery}
              onChangeText={setUserSearchQuery}
            />
          </View>
        </View>

        <ScrollView
          style={styles.usersList}
          showsVerticalScrollIndicator={false}
        >
          {filteredUsers.map((user: User) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userItem}
              onPress={() => handleUserSelect(user.id)}
              disabled={isCreatingChat}
            >
              <View style={styles.userAvatarContainer}>
                <Image
                  source={{
                    uri:
                      user.profilePicture ||
                      'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
                  }}
                  style={styles.userAvatar}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                {user?.university?.name && <Text style={styles.userUniversity}>
                  {user.university.name}
                </Text>}
              </View>
              <View style={styles.userArrow}>
                <ArrowRight size={16} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          ))}
          {filteredUsers.length === 0 && (
            <Text style={styles.noUsersText}>
              {userSearchQuery
                ? 'No users found matching your search'
                : 'No users available'}
            </Text>
          )}
        </ScrollView>

        {isCreatingChat && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Creating chat...</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* {!isConnected && (
        <View style={[styles.offlineBanner, { paddingTop: insets.top }]}>
          <LinearGradient
            colors={['#FCA5A5', '#F87171']}
            style={styles.offlineBannerGradient}
          >
            <WifiOff size={16} color="#7F1D1D" />
            <Text style={styles.offlineText}>
              You are offline. Reconnecting...
            </Text>
          </LinearGradient>
        </View>
      )} */}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <MessageCircle size={28} color={theme.primary} />
              <Text style={styles.headerTitle}>Messages</Text>
              {/* Connection status indicator dot */}
              <View
                style={[
                  styles.connectionDot,
                  { backgroundColor: isConnected ? theme.success : "red" },
                ]}
              />
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => setShowUserModal(true)}
                style={styles.userPlusButton}
                activeOpacity={0.7}
              >
                <UserPlus size={24} color={theme.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/message-requests')}
                style={styles.mailPlusButton}
              >
                <MailPlus size={24} color={theme.primary} />
                {chatResponse?.chatRequestsCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {chatResponse.chatRequestsCount}
                    </Text>
                  </View>
                )}
                </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          <BlurView intensity={20} style={styles.searchBlur}>
            <View
              style={[
                styles.searchContainer,
                searchFocused && styles.searchContainerFocused,
              ]}
            >
              <Search
                size={20}
                color={searchFocused ? '#6366F1' : '#94A3B8'}
                style={styles.searchIcon}
              />
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

        <View style={styles.filterWrapper}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'DIRECT' && styles.activeFilter,
              ]}
              onPress={() => setFilter('DIRECT')}
              activeOpacity={0.8}
            >
              {filter === 'DIRECT' ? (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.filterButtonGradient}
                >
                  <MessageCircle size={16} color="#FFFFFF" />
                  <Text style={[styles.filterText, styles.activeFilterText]}>
                    Direct
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterButtonContent}>
                  <MessageCircle size={16} color="#64748B" />
                  <Text style={styles.filterText}>Direct</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'GROUP' && styles.activeFilter,
              ]}
              onPress={() => setFilter('GROUP')}
              activeOpacity={0.8}
            >
              {filter === 'GROUP' ? (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.filterButtonGradient}
                >
                  <Users size={16} color="#FFFFFF" />
                  <Text style={[styles.filterText, styles.activeFilterText]}>
                    Groups
                  </Text>
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

        <View style={styles.listContainer}>
          {isLoading ? (
            renderLoading()
          ) : (
            <FlatList
              data={filteredChats}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>
      </SafeAreaView>

      {renderUserSelectionModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7',
  },
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  offlineBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 8,
  },
  offlineText: {
    color: '#7F1D1D',
    fontSize: 14,
    fontWeight: '600',
  },
  safeArea: {
    flex: 1,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  header: {
    marginHorizontal: 20,
    paddingHorizontal: 4,
    marginTop: 20,
    marginBottom: 16,
    overflow: 'hidden',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: theme.textPrimary,
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
    backgroundColor: 'white',
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
    padding: 2,
  },
  chatItemBlur: {
    borderRadius: 20,
    backgroundColor: 'white',
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
    flex: 1,
    marginBottom: 6,
  },
  chatTime: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lastMessage: {
    color: '#64748B',
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  userPlusButton: {
    padding: 4,
  },
  mailPlusButton: {
    padding: 4,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444', // A bright red for notifications
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F3F7',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F0F3F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
  },
  modalSearchWrapper: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 52,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 12,
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
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
  userAvatarContainer: {
    marginRight: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  userUniversity: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  userArrow: {
    marginLeft: 12,
    padding: 4,
  },
  noUsersText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
    padding: 32,
    fontStyle: 'italic',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonSmall: {
    backgroundColor: '#FECACA',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
