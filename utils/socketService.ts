import io, { Socket } from 'socket.io-client';
import { QueryClient } from '@tanstack/react-query';

// Types for socket events
interface UserData {
  userId: string;
  userName?: string;
}

interface MessageData {
  messageId?: string;
  chatId: string;
  content: string;
  senderId: string;
  senderName?: string;
  timestamp: string;
}

interface AuthenticatedData {
  success: boolean;
  userId: string;
  socketId: string;
}

interface ChatJoinedData {
  chatId: string;
  success: boolean;
}

interface SocketError {
  error: string;
  timestamp: string;
}

interface NotificationData {
  id: string;
  isRead: boolean;
  createdAt: string;
  type: string;
  title: string;
  content: string | null;
  data: any;
  recipientId: string;
  senderId: string | null;
  friendshipId: string | null;
  eventId: string | null;
  groupId: string | null;
  interestPingId: string | null;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
}

// Callback types
type MessageCallback = (message: MessageData) => void;
type NotificationCallback = (notification: NotificationData) => void;
type ConnectionCallback = () => void;
type ErrorCallback = (error: string) => void;
type AuthCallback = (data: AuthenticatedData) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private onNewMessage?: MessageCallback;
  private onNewNotification?: NotificationCallback;
  private onConnect?: ConnectionCallback;
  private onDisconnect?: ConnectionCallback;
  private onError?: ErrorCallback;
  private onAuthenticated?: AuthCallback;
  private queryClient: QueryClient | undefined;
  private currentUserId: string | null = null;
  private onNewUserMessageCallback: ((message: any) => void) | null = null;
  private onNewMessageReceivedCallback: ((message: any) => void) | null = null;

  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Set the QueryClient instance
  setQueryClient(queryClient: QueryClient): void {
    this.queryClient = queryClient;
  }

  connect(serverUrl: string, userId: string): void {
    if (this.socket?.connected) {
      console.log('✅ Already connected to server');
      return;
    }

    console.log('🔌 Initiating connection to:', serverUrl);
    this.currentUserId = userId;

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // CRITICAL: Handle connect event
    this.socket.on('connect', () => {
      console.log('🟢 Socket.IO connect event fired');
      console.log('📡 Socket ID:', this.socket?.id);
      this.isConnected = true;
      
      // Call the callback AFTER setting isConnected
      if (this.onConnect) {
        console.log('✅ Calling onConnect callback');
        this.onConnect();
      } else {
        console.warn('⚠️ No onConnect callback registered yet');
      }
      
      // Authenticate after connection
      if (this.currentUserId) {
        console.log('🔐 Authenticating with userId:', this.currentUserId);
        this.socket?.emit('authenticate', {
          userId: this.currentUserId,
        } as UserData);
      }
    });

    this.socket.on('authenticated', (data: AuthenticatedData) => {
      console.log('✅ Authenticated:', data);
      
      // Join user-specific room after authentication
      if (this.currentUserId) {
        console.log(`🏠 Joining user room: user_${this.currentUserId}`);
        this.socket?.emit('join_room', `user_${this.currentUserId}`);
      }
      
      if (this.onAuthenticated) {
        this.onAuthenticated(data);
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Disconnected from server:', reason);
      this.isConnected = false;
      if (this.onDisconnect) {
        this.onDisconnect();
      }
    });

    this.socket.on('new_message', (messageData: MessageData) => {
      console.log('💬 New message received:', messageData);
      this.handleNewMessage(messageData);
    });

    this.socket.on('new_notification', (notificationData: NotificationData) => {
      console.log('🔔 New notification received:', notificationData);
      this.handleNewNotification(notificationData);
    });

    // Listener for user-specific messages (old pattern)
    this.socket.on(`chat_${this.currentUserId}`, (message: MessageData) => {
      if (this.onNewUserMessageCallback) {
        this.onNewUserMessageCallback(message);
      }
    });

    // NEW: Global listener for new_message_received event
    this.socket.on('new_message_received', (messageData: any) => {
      console.log('📨 New message received (global listener):', messageData);
      
      // Invalidate queries
      if (this.queryClient) {
        console.log('🔄 Invalidating queries for new_message_received...');
        this.queryClient.invalidateQueries({ queryKey: ['chats'] });
        this.queryClient.invalidateQueries({ queryKey: ['messages'] });
        this.queryClient.invalidateQueries({ queryKey: ['chat'] });
      }
      
      // Call the callback if set
      if (this.onNewMessageReceivedCallback) {
        this.onNewMessageReceivedCallback(messageData);
      }
    });

    this.socket.on('chat_joined', (data: ChatJoinedData) => {
      console.log('🏠 Successfully joined chat:', data.chatId);
    });

    this.socket.on('chat_left', (data: ChatJoinedData) => {
      console.log('🚪 Successfully left chat:', data.chatId);
    });

    this.socket.on('socket_error', (error: SocketError) => {
      console.error('⚠️ Socket error:', error.error);
      if (this.onError) {
        this.onError(error.error);
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ Connection error:', error.message);
      this.isConnected = false;
      if (this.onError) {
        this.onError(error.message);
      }
    });
  }

  joinChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      console.log('🏠 Joining chat:', chatId);
      this.socket.emit('join_chat', chatId);
    } else {
      console.warn('⚠️ Socket not connected. Cannot join chat.');
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      console.log('🚪 Leaving chat:', chatId);
      this.socket.emit('leave_chat', chatId);
    } else {
      console.warn('⚠️ Socket not connected. Cannot leave chat.');
    }
  }

  private handleNewMessage(messageData: MessageData): void {
    if (this.queryClient) {
      console.log('🔄 Invalidating queries for new message...');
      this.queryClient.invalidateQueries({ queryKey: ['messages'] });
      this.queryClient.invalidateQueries({ queryKey: ['chats'] });
      this.queryClient.invalidateQueries({ queryKey: ['chat'] });
      this.queryClient.invalidateQueries({ queryKey: ['unreadChatCount'] });

    }
    if (this.onNewMessage) {
      this.onNewMessage(messageData);
    }
  }

  private handleNewNotification(notificationData: NotificationData): void {
    if (this.queryClient) {
      this.queryClient.invalidateQueries({ queryKey: ['notifications'] });
      this.queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    }
    if (this.onNewNotification) {
      this.onNewNotification(notificationData);
    }
  }

  // Callback setters
  setOnNewMessage(callback: MessageCallback): void {
    console.log('📝 Setting onNewMessage callback');
    this.onNewMessage = callback;
  }

  onNewUserMessage(callback: (message: any) => void): void {
    this.onNewUserMessageCallback = callback;
  }

  // NEW: Setter for new_message_received callback
  onNewMessageReceived(callback: (message: any) => void): void {
    console.log('📝 Setting onNewMessageReceived callback');
    this.onNewMessageReceivedCallback = callback;
  }

  // NEW: Remove new_message_received callback
  removeNewMessageReceivedListener(): void {
    console.log('🧹 Removing onNewMessageReceived callback');
    this.onNewMessageReceivedCallback = null;
  }

  setOnNewNotification(callback: NotificationCallback): void {
    console.log('📝 Setting onNewNotification callback');
    this.onNewNotification = callback;
  }

  setOnConnect(callback: ConnectionCallback): void {
    console.log('📝 Setting onConnect callback');
    this.onConnect = callback;
    
    // CRITICAL FIX: If already connected, call the callback immediately
    if (this.isConnected && this.socket?.connected) {
      console.log('🟢 Already connected! Calling callback immediately');
      callback();
    }
  }

  setOnDisconnect(callback: ConnectionCallback): void {
    console.log('📝 Setting onDisconnect callback');
    this.onDisconnect = callback;
  }

  setOnError(callback: ErrorCallback): void {
    console.log('📝 Setting onError callback');
    this.onError = callback;
  }

  setOnAuthenticated(callback: AuthCallback): void {
    console.log('📝 Setting onAuthenticated callback');
    this.onAuthenticated = callback;
  }

  getConnectionStatus(): boolean {
    const status = this.isConnected && this.socket?.connected === true;
    console.log('📊 Connection status check:', {
      isConnected: this.isConnected,
      socketConnected: this.socket?.connected,
      finalStatus: status
    });
    return status;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  reconnect(): void {
    console.log('🔄 Reconnecting socket...');
    if (this.socket) {
      this.socket.connect();
    } else {
      console.warn('⚠️ No socket instance to reconnect');
    }
  }

  disconnect(): void {
    console.log('🔌 Disconnecting socket...');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  removeAllListeners(): void {
    console.log('🧹 Removing all listeners');
    this.onNewMessage = undefined;
    this.onNewNotification = undefined;
    this.onConnect = undefined;
    this.onDisconnect = undefined;
    this.onError = undefined;
    this.onAuthenticated = undefined;
    this.onNewUserMessageCallback = null;
    this.onNewMessageReceivedCallback = null;
  }
}

export default new SocketService();