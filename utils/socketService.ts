import io, { Socket } from 'socket.io-client';

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

// Callback types
type MessageCallback = (message: MessageData) => void;
type ConnectionCallback = () => void;
type ErrorCallback = (error: string) => void;
type AuthCallback = (data: AuthenticatedData) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private onNewMessage?: MessageCallback;
  private onConnect?: ConnectionCallback;
  private onDisconnect?: ConnectionCallback;
  private onError?: ErrorCallback;
  private onAuthenticated?: AuthCallback;

  constructor() {
    this.socket = null;
    this.isConnected = false;
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

    // Authenticate user after connection
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      
      if (this.onConnect) {
        this.onConnect();
      }
      
      // Authenticate user
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

    // Listen for new messages
    this.socket.on('new_message', (messageData: MessageData) => {
      console.log('New message received:', messageData);
      this.handleNewMessage(messageData);
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

  // Join a specific chat room
  joinChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', chatId);
    } else {
      console.warn('Socket not connected. Cannot join chat.');
    }
  }

  // Leave a specific chat room
  leaveChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_chat', chatId);
    } else {
      console.warn('Socket not connected. Cannot leave chat.');
    }
  }

  // Handle new message (update your app state)
  private handleNewMessage(messageData: MessageData): void {
    if (this.onNewMessage) {
      this.onNewMessage(messageData);
    }
  }

  // Callback setters
  setOnNewMessage(callback: MessageCallback): void {
    this.onNewMessage = callback;
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

  // Getters
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Reconnect manually
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Remove all listeners
  removeAllListeners(): void {
    this.onNewMessage = undefined;
    this.onConnect = undefined;
    this.onDisconnect = undefined;
    this.onError = undefined;
    this.onAuthenticated = undefined;
  }
}

export default new SocketService();