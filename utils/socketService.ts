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
      console.log('Already connected to server');
      return;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      
      if (this.onConnect) {
        this.onConnect();
      }
      
      this.socket?.emit('authenticate', {
        userId,
      } as UserData);
    });
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('authenticated', (data: AuthenticatedData) => {
      console.log('Authenticated:', data);
      if (this.onAuthenticated) {
        this.onAuthenticated(data);
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
      if (this.onDisconnect) {
        this.onDisconnect();
      }
    });

    this.socket.on('new_message', (messageData: MessageData) => {
      console.log('New message received:', messageData);
      this.handleNewMessage(messageData);
    });

    this.socket.on('new_notification', (notificationData: NotificationData) => {
      console.log('New notification received:', notificationData);
      this.handleNewNotification(notificationData);
    });

    this.socket.on('chat_joined', (data: ChatJoinedData) => {
      console.log('Successfully joined chat:', data.chatId);
    });

    this.socket.on('chat_left', (data: ChatJoinedData) => {
      console.log('Successfully left chat:', data.chatId);
    });

    this.socket.on('socket_error', (error: SocketError) => {
      console.error('Socket error:', error.error);
      if (this.onError) {
        this.onError(error.error);
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error.message);
      if (this.onError) {
        this.onError(error.message);
      }
    });
  }

  joinChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', chatId);
    } else {
      console.warn('Socket not connected. Cannot join chat.');
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_chat', chatId);
    } else {
      console.warn('Socket not connected. Cannot leave chat.');
    }
  }

  private handleNewMessage(messageData: MessageData): void {
    if (this.onNewMessage) {
      if (this.queryClient) {
        this.queryClient.invalidateQueries({ queryKey: ['messages', messageData.chatId] });
        this.queryClient.invalidateQueries({ queryKey: ['chats'] });
      }
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
    this.onNewMessage = callback;
  }

  setOnNewNotification(callback: NotificationCallback): void {
    this.onNewNotification = callback;
  }

  setOnConnect(callback: ConnectionCallback): void {
    this.onConnect = callback;
  }

  setOnDisconnect(callback: ConnectionCallback): void {
    this.onDisconnect = callback;
  }

  setOnError(callback: ErrorCallback): void {
    this.onError = callback;
  }

  setOnAuthenticated(callback: AuthCallback): void {
    this.onAuthenticated = callback;
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  removeAllListeners(): void {
    this.onNewMessage = undefined;
    this.onNewNotification = undefined;
    this.onConnect = undefined;
    this.onDisconnect = undefined;
    this.onError = undefined;
    this.onAuthenticated = undefined;
  }
}

export default new SocketService();