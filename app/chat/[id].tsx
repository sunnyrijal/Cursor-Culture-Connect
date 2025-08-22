import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { mockConversations, mockGroupConversations, findUserById, Message, currentUser } from '@/data/mockData';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [conversation, setConversation] = useState<any>(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (id) {
      // Check personal conversations first
      const personalConvo = mockConversations.find(c => c.user.id === id);
      if (personalConvo) {
        setConversation(personalConvo);
        setIsGroupChat(false);
      } else {
        // Then check group conversations
        const groupConvo = mockGroupConversations.find(gc => gc.id === id);
        if (groupConvo) {
          setConversation(groupConvo);
          setIsGroupChat(true);
        } else {
          // If no conversation exists, create a new one for personal chat
          const user = findUserById(id);
          if (user) {
            const newConversation = {
              id: user.id,
              user: user,
              messages: [],
              lastMessage: '',
              lastMessageTime: '',
              unreadCount: 0,
            };
            setConversation(newConversation);
            setIsGroupChat(false);
          }
        }
      }
    }
    setLoading(false);
  }, [id]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;
    const message: Message = {
      id: Math.random().toString(),
      text: newMessage.trim(),
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    // Update the conversation with the new message
    if (conversation) {
      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, message],
        lastMessage: message.text,
        lastMessageTime: message.timestamp,
      };
      setConversation(updatedConversation);
    }
    
    console.log("Sending message:", message);
    setNewMessage('');
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.loadingText}>Loading chat...</Text>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Chat not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const chatName = isGroupChat ? conversation.group.name : conversation.user.name;
  const chatImage = isGroupChat ? conversation.group.image : conversation.user.image;

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender === 'me';
    const sender = !isMyMessage ? findUserById(item.sender) : currentUser;
    
    return (
      <View style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.theirMessageRow]}>
        {!isMyMessage && (
          <View style={styles.avatarContainer}>
            <Image source={{ uri: sender?.image }} style={styles.avatar} />
          </View>
        )}
        <View style={styles.messageContentContainer}>
          {!isMyMessage && isGroupChat && (
            <Text style={styles.senderName}>{sender?.name}</Text>
          )}
          <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble]}>
            <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
              {item.text}
            </Text>
            <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
              {item.timestamp}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Enhanced Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.9)']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <ArrowLeft size={24} color={theme.gray700} />
                </TouchableOpacity>
                
                <View style={styles.chatInfo}>
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: chatImage }} style={styles.headerImage} />
                    {!isGroupChat && <View style={styles.onlineIndicator} />}
                  </View>
                  
                  <View style={styles.chatDetails}>
                    {isGroupChat ? (
                      <Text style={styles.headerTitle}>{chatName}</Text>
                    ) : (
                      <TouchableOpacity onPress={() => router.push(`/profile/public/${conversation.user.id}`)}>
                        <Text style={styles.headerTitle}>{chatName}</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={styles.headerSubtitle}>
                      {isGroupChat ? 'Group chat' : 'Online'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.headerActions}>
                {/* {!isGroupChat && (
                  <>
                    <TouchableOpacity style={styles.actionButton}>
                      <Phone size={20} color={theme.gray500} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Video size={20} color={theme.gray500} />
                    </TouchableOpacity>
                  </>
                )} */}
                <TouchableOpacity style={styles.actionButton}>
                  <MoreVertical size={20} color={theme.gray500} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardView} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages */}
          <View style={styles.messagesContainer}>
            <FlatList
              data={conversation.messages.slice().reverse()}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              inverted
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Input Container */}
          <View style={styles.inputWrapper}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.9)']}
              style={styles.inputGradient}
            >
              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.gray400}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    onSubmitEditing={handleSend}
                    blurOnSubmit={false}
                    multiline
                  />
                  <TouchableOpacity 
                    onPress={handleSend} 
                    style={[
                      styles.sendButton, 
                      newMessage.trim() && styles.sendButtonActive
                    ]}
                    disabled={!newMessage.trim()}
                  >
                    {newMessage.trim() ? (
                      <LinearGradient
                        colors={[theme.primary, '#8B5CF6']}
                        style={styles.sendButtonGradient}
                      >
                        <Send size={20} color={theme.white} />
                      </LinearGradient>
                    ) : (
                      <Send size={20} color={theme.gray400} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: theme.gray500,
    fontWeight: '500',
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: theme.error,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  backLink: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    color: theme.primary,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.gray200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: spacing.sm + 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  chatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: spacing.sm + 4,
  },
  headerImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.success,
    borderWidth: 2,
    borderColor: theme.white,
  },
  chatDetails: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: theme.gray800,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.gray500,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: spacing.sm + 4,
    backgroundColor: theme.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  messageListContent: {
    paddingVertical: spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: spacing.sm,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.white,
  },
  messageContentContainer: {
    flexShrink: 1,
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: 20,
    maxWidth: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  senderName: {
    fontSize: typography.fontSize.xs,
    color: theme.gray500,
    fontWeight: '600',
    marginLeft: spacing.md,
    marginBottom: 4,
  },
  myMessageBubble: {
    backgroundColor: theme.primary,
    borderBottomRightRadius: 6,
  },
  theirMessageBubble: {
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.gray200,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: 22,
    color: theme.gray700,
    fontWeight: '500',
  },
  myMessageText: {
    color: theme.white,
  },
  timestamp: {
    fontSize: 11,
    color: theme.gray400,
    alignSelf: 'flex-end',
    marginTop: 4,
    fontWeight: '500',
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: theme.gray200,
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: -2 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 4,
    //   },
    //   android: {
    //     elevation: 4,
    //   },
    // }),
  },
  inputGradient: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 4,
    paddingBottom: Platform.OS === 'ios' ? 32 : spacing.md,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.gray200,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: theme.gray800,
    fontWeight: '500',
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.gray100,
  },
  sendButtonActive: {
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});