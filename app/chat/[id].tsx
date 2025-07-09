import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
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
        <Text>Loading chat...</Text>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Chat not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 16}}>
            <Text style={{color: theme.primary}}>Go Back</Text>
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
        {!isMyMessage && <Image source={{ uri: sender?.image }} style={styles.avatar} />}
        {/* This container View is now flexible, allowing the bubble to wrap */}
        <View style={styles.messageContentContainer}>
          {!isMyMessage && isGroupChat && <Text style={styles.senderName}>{sender?.name}</Text>}
          <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>{item.timestamp}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Image source={{ uri: chatImage }} style={styles.headerImage} />
        <Text style={styles.headerTitle}>{chatName}</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={conversation.messages.slice().reverse()} // Reverse the array for correct inverted display
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={{ paddingVertical: spacing.md }}
          inverted
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Send size={24} color={theme.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  backButton: { paddingRight: spacing.md },
  headerImage: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.md },
  headerTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.semiBold },
  messageList: { flex: 1, paddingHorizontal: spacing.md },
  messageRow: {
    flexDirection: 'row',
    marginVertical: spacing.sm,
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end'
  },
  theirMessageRow: {
    alignSelf: 'flex-start'
  },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: spacing.sm },
  messageContentContainer: {
    flexShrink: 1, // Allows the container to shrink and wrap text
  },
  messageBubble: { 
    padding: spacing.md, 
    borderRadius: borderRadius.lg, 
  },
  senderName: { 
    fontSize: typography.fontSize.xs, 
    color: theme.textSecondary, 
    fontFamily: typography.fontFamily.medium, 
    marginLeft: spacing.sm, 
    marginBottom: spacing.xs, 
  },
  myMessageBubble: { 
    backgroundColor: theme.primary, 
    borderBottomRightRadius: borderRadius.xs, 
  },
  theirMessageBubble: { 
    backgroundColor: theme.white, 
    borderWidth: 1, 
    borderColor: theme.border, 
    borderBottomLeftRadius: borderRadius.xs, 
  },
  messageText: { 
    fontSize: typography.fontSize.base, 
    lineHeight: typography.fontSize.base * 1.4, // Added for better readability
  },
  timestamp: { 
    fontSize: typography.fontSize.xs, 
    color: theme.textSecondary, 
    alignSelf: 'flex-end', 
    marginTop: spacing.xs, 
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.white,
  },
  input: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 8,
    fontSize: typography.fontSize.base,
    marginRight: spacing.md,
  },
  sendButton: {
    backgroundColor: theme.primary,
    padding: spacing.sm,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
