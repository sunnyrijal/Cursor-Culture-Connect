import React, { createContext, useContext, useEffect, useRef, ReactNode, useState, useCallback } from 'react';
import SocketService from '../utils/socketService';

// Types
interface MessageData {
  messageId?: string;
  chatId: string;
  content: string;
  senderId: string;
  senderName?: string;
  timestamp: string;
}

interface SocketContextType {
  isConnected: boolean;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  socketId?: string;
  onNewMessage: (callback: (message: MessageData) => void) => void;
  removeNewMessageListener: () => void;
}

interface SocketProviderProps {
  children: ReactNode;
  serverUrl: string;
  userId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  onAuthenticated?: (data: { success: boolean; userId: string; socketId: string }) => void;
}

// Create context
const SocketContext = createContext<SocketContextType | null>(null);

// Socket Provider Component
export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  serverUrl,
  userId,
  onConnect,
  onDisconnect,
  onError,
  onAuthenticated,
}) => {
  const messageCallbackRef = useRef<((message: MessageData) => void) | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Use refs for callbacks to avoid dependency issues
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);
  const onAuthenticatedRef = useRef(onAuthenticated);

  // Update refs when callbacks change
  useEffect(() => {
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
    onAuthenticatedRef.current = onAuthenticated;
  }, [onConnect, onDisconnect, onError, onAuthenticated]);

  useEffect(() => {
    console.log('🔧 Setting up socket connection...');

    const globalMessageHandler = (message: MessageData) => {
      if (messageCallbackRef.current) {
        messageCallbackRef.current(message);
      }
    };

    SocketService.setOnNewMessage(globalMessageHandler);

    const handleConnect = () => {
      console.log('✅ Socket connected in context');
      setIsConnected(true);
      if (onConnectRef.current) onConnectRef.current();
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected in context');
      setIsConnected(false);
      if (onDisconnectRef.current) onDisconnectRef.current();
    };

    const handleError = (error: string) => {
      console.error('⚠️ Socket error:', error);
      if (onErrorRef.current) onErrorRef.current(error);
    };

    const handleAuthenticated = (data: { success: boolean; userId: string; socketId: string }) => {
      console.log('🔐 Socket authenticated:', data);
      if (onAuthenticatedRef.current) onAuthenticatedRef.current(data);
    };

    // Set up all socket event handlers
    SocketService.setOnConnect(handleConnect);
    SocketService.setOnDisconnect(handleDisconnect);
    SocketService.setOnError(handleError);
    SocketService.setOnAuthenticated(handleAuthenticated);

    // Initial connection
    SocketService.connect(serverUrl, userId);

    // Check initial connection status
    const initialStatus = SocketService.getConnectionStatus();
    console.log('📡 Initial connection status:', initialStatus);
    setIsConnected(initialStatus);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket connection...');
      SocketService.removeAllListeners();
      SocketService.disconnect();
      setIsConnected(false);
    };
  }, [serverUrl, userId]); // Only depend on serverUrl and userId

  // Monitor connection status changes
  useEffect(() => {
    console.log('🔵 Connection status changed to:', isConnected);
  }, [isConnected]);

  const reconnect = useCallback(() => {
    console.log('🔄 Reconnecting socket...');
    setIsConnected(false);
    const response = SocketService.reconnect();
    console.log(response)
    // The handleConnect callback will update isConnected to true
  }, []);

  const contextValue: SocketContextType = {
    isConnected: isConnected,
    joinChat: (chatId: string) => SocketService.joinChat(chatId),
    leaveChat: (chatId: string) => SocketService.leaveChat(chatId),
    disconnect: () => {
      SocketService.disconnect();
    },
    reconnect: reconnect,
    socketId: SocketService.getSocketId(),
    onNewMessage: (callback: (message: MessageData) => void) => {
      messageCallbackRef.current = callback;
    },
    removeNewMessageListener: () => {
      messageCallbackRef.current = null;
    },
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default useSocket;