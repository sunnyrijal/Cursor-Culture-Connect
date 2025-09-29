// Base types
export type ChatType = 'direct' | 'group';

export interface ChatUser {
  _id: string;
  id: string;
  name: string;
  profilePicture?: string;
  email: string;
}

// Request types
export interface CreateDirectChatRequest {
  otherUserId: string;
}

export interface CreateGroupChatRequest {
  groupId: string;
  name?: string;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
}

// Response types
export interface MessageResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  chat: any;
}

export interface ChatsResponse {
  success: boolean;
  message: string;
  chats: any[];
}

export interface ChatDetailsResponse {
  success: boolean;
  message: string;
  chat: any;
}

export interface MessagesResponse {
  success: boolean;
  message: string;
  messages: any[];
  pagination: any;
}

// Chat Request types
export interface ChatRequest {
  _id: string;
  sender: ChatUser;
  receiver: ChatUser;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequestsResponse {
  success: boolean;
  message: string;
  requests: ChatRequest[];
}