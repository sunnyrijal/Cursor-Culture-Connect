import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as api from './api';
import { useAuth } from './authContext';

// Define Chat types
type Message = {
  id: string;
  text: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  sender?: any;
  attachments?: any[];
  [key: string]: any;
};

type Conversation = {
  id: string;
  type: 'direct' | 'group';
  participants: any[];
  lastMessage?: Message;
  unreadCount?: number;
  groupId?: string;
  groupName?: string;
  groupImage?: string;
  [key: string]: any;
};

type ChatContextType = {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string, attachments?: any[]) => Promise<void>;
  createConversation: (participants: string[]) => Promise<Conversation>;
  createGroupChat: (groupId: string) => Promise<Conversation>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  markAsRead: (conversationId: string) => Promise<void>;
};

// Create context with default values
const ChatContext = createContext<ChatContextType>({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  fetchConversations: async () => {},
  fetchMessages: async () => {},
  sendMessage: async () => {},
  createConversation: async () => ({ id: '', type: 'direct', participants: [] }),
  createGroupChat: async () => ({ id: '', type: 'group', participants: [] }),
  setCurrentConversation: () => {},
  markAsRead: async () => {},
});

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Provider component
export const ChatProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Fetch all conversations
  const fetchConversations = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.getConversations();
      setConversations(response.conversations);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getConversationMessages(conversationId);
      setMessages(response.messages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, text: string, attachments: any[] = []) => {
    setLoading(true);
    setError(null);
    try {
      const messageData = { text };
      if (attachments.length > 0) {
        messageData['attachments'] = attachments;
      }
      
      const response = await api.sendMessage(conversationId, messageData);
      
      // Optimistically add message to list
      const newMessage = {
        ...response.message,
        sender: user,
        pending: false,
      };
      
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      
      // Update conversations with last message
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: newMessage,
            };
          }
          return conv;
        });
      });
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new conversation
  const createConversation = async (participants: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.createConversation(participants);
      await fetchConversations();
      return response.conversation;
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation');
      console.error('Error creating conversation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a group chat
  const createGroupChat = async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.createGroupChat(groupId);
      await fetchConversations();
      return response.conversation;
    } catch (err: any) {
      setError(err.message || 'Failed to create group chat');
      console.error('Error creating group chat:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark conversation as read
  const markAsRead = async (conversationId: string) => {
    try {
      // This would typically call an API endpoint
      // For now we'll just update the local state
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unreadCount: 0,
            };
          }
          return conv;
        });
      });
    } catch (err: any) {
      console.error('Error marking as read:', err);
    }
  };

  // Load conversations when the component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [isAuthenticated]);

  // Fetch messages when the current conversation changes
  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation.id);
      markAsRead(currentConversation.id);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  const value = {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    createGroupChat,
    setCurrentConversation,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext; 