import React, { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react';
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
  const [isConnected, setIsConnected] = useState(SocketService.getConnectionStatus());

  useEffect(() => {
    const globalMessageHandler = (message: MessageData) => {
      if (messageCallbackRef.current) {
        messageCallbackRef.current(message);
      }
    };

    SocketService.setOnNewMessage(globalMessageHandler);

    const handleConnect = () => {
      setIsConnected(true);
      if (onConnect) onConnect();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      if (onDisconnect) onDisconnect();
    };

    const handleError = (error: string) => {
      if (onError) onError(error);
    };

    const handleAuthenticated = (data: { success: boolean; userId: string; socketId: string }) => {
      if (onAuthenticated) onAuthenticated(data);
    };

    // Set up all socket event handlers
    SocketService.setOnConnect(handleConnect);
    SocketService.setOnDisconnect(handleDisconnect);
    SocketService.setOnError(handleError);
    SocketService.setOnAuthenticated(handleAuthenticated);

    // Initial connection
    SocketService.connect(serverUrl, userId);

    // Cleanup function
    return () => {
      SocketService.removeAllListeners();
      SocketService.disconnect();
      setIsConnected(false);
    };
  }, [serverUrl, userId, onConnect, onDisconnect, onError, onAuthenticated]);

  const contextValue: SocketContextType = {
    isConnected: isConnected,
    joinChat: (chatId: string) => SocketService.joinChat(chatId),
    leaveChat: (chatId: string) => SocketService.leaveChat(chatId),
    disconnect: () => {
      SocketService.disconnect()
    },
    reconnect: () => SocketService.reconnect(),
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