import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Platform 
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquarePlus, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { getChatRequests } from '@/contexts/chat.api';
import getDecodedToken from '@/utils/getMyData';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

interface Participant {
  id: string;
  chatId: string;
  userId: string;
  user: User;
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

interface ChatRequest {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name: string | null;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  messages: Message[];
}

const MessageRequestsScreen = () => {
  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const { 
    data: chatRequestsResponse, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['chatRequests'],
    queryFn: getChatRequests,
  });

  const processedRequests = useMemo(() => {
    if (!chatRequestsResponse?.data || !myData?.userId) return [];

    return chatRequestsResponse.data.map((chat: ChatRequest) => {
      const otherParticipant = chat.participants.find(
        (p) => p.userId !== myData.userId
      );
      
      const lastMessage = chat.messages[0];
      const messageContent = lastMessage?.content || 'Wants to connect with you';
      
      return {
        id: chat.id,
        name: otherParticipant?.user.name || 'Unknown User',
        email: otherParticipant?.user.email || '',
        profilePicture: otherParticipant?.user.profilePicture || '',
        lastMessage: messageContent,
        lastMessageTime: lastMessage
          ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : new Date(chat.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
        createdAt: chat.createdAt,
      };
    });
  }, [chatRequestsResponse, myData]);

  console.log("Chat Requests", processedRequests);

  const handleRequestPress = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MessageSquarePlus size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Message Requests</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any pending connection requests right now.
      </Text>
    </View>
  );

  const renderRequestItem = (item: typeof processedRequests[0], index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.requestItem, { marginTop: index === 0 ? 8 : 0 }]}
      onPress={() => handleRequestPress(item.id)}
      activeOpacity={0.7}
    >
      <BlurView intensity={10} style={styles.requestItemBlur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']}
          style={styles.requestItemGradient}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={
                item.profilePicture
                  ? { uri: item.profilePicture }
                  : require('../assets/user.png')
              }
              style={styles.avatar}
            />
          </View>

          <View style={styles.requestContent}>
            <View style={styles.requestHeader}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.requestTime}>{item.lastMessageTime}</Text>
            </View>
            <View style={styles.requestMessage}>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
          </View>

          <View style={styles.requestArrow}>
            <ArrowRight size={16} color="#94A3B8" />
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Message Requests</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
          ) : isError ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.errorText}>
                Error: {error?.message || 'Failed to load requests'}
              </Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.retryButtonGradient}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : processedRequests.length === 0 ? (
            renderEmptyState()
          ) : (
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {processedRequests.map((item:any, index:number) => renderRequestItem(item, index))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40, // Same width as back button for centering
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  requestItem: {
    marginBottom: 4,
    padding: 4,
  },
  requestItemBlur: {
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
  requestItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  requestContent: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
    flex: 1,
  },
  requestTime: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  requestMessage: {
    marginBottom: 4,
  },
  lastMessage: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  userEmail: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  requestArrow: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: 25,
    overflow: 'hidden',
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
  retryButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MessageRequestsScreen;