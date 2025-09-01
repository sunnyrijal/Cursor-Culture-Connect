import api from './axiosConfig'; // adjust path as needed
import type { 
  CreateDirectChatRequest,
  CreateGroupChatRequest,
  SendMessageRequest,
  ChatResponse,
  ChatsResponse,
  MessageResponse,
  MessagesResponse,
  ChatDetailsResponse
} from '../types/chat.types'; // adjust path as needed

// 1. GET USER CHATS
export const getUserChats = async () => {
  try {
    const response = await api.get('/chat');
    return response.data;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};

// 2. CREATE DIRECT CHAT
export const createDirectChat = async (data: CreateDirectChatRequest) => {
  try {
    const response = await api.post('/chat/direct', data);
    return response.data as ChatResponse;
  } catch (error) {
    console.error('Error creating direct chat:', error);
    throw error;
  }
};

// 3. CREATE GROUP CHAT
export const createGroupChat = async (data: CreateGroupChatRequest) => {
  try {
    const response = await api.post('/chat/group', data);
    return response.data as ChatResponse;
  } catch (error) {
    console.error('Error creating group chat:', error);
    throw error;
  }
};

// 4. SEND MESSAGE
export const sendMessage = async (data: SendMessageRequest) => {
  try {
    const response = await api.post('/chat/messages', data);
    return response.data as MessageResponse;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// 5. GET CHAT DETAILS
export const getChatDetails = async (chatId: string) => {
  try {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat details:', error);
    throw error;
  }
};

// 6. GET CHAT MESSAGES
export const getChatMessages = async (
  chatId: string, 
  page: number = 1, 
  limit: number = 20
) => {
  try {
    const response = await api.get(`/chat/${chatId}/messages`, {
      params: { page, limit }
    });
    return response.data as MessagesResponse;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};