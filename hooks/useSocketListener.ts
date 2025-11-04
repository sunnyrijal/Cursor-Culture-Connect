// hooks/useSocketListeners.ts
import { useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';

/**
 * Global socket event listeners hook
 * Handles all socket events and query invalidation
 */
export function useSocketListeners() {
  const queryClient = useQueryClient();
  const {
    isConnected,
    reconnect,
    onNewUserMessage,
    removeNewUserMessageListener,
    onNewMessageReceived,
    removeNewMessageReceivedListener,
  } = useSocket();

  const handleNewUserMessage = useCallback(() => {
    console.log('📬 New user message event received');
    queryClient.invalidateQueries({ queryKey: ['chats'] });
  }, [queryClient]);

  const handleNewMessageReceived = useCallback(
    (messageData: any) => {
      console.log('📨 NEW MESSAGE RECEIVED (GLOBAL):', messageData);

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['chat'] });
      queryClient.invalidateQueries({ queryKey: ['unreadChatCount'] });
    },
    [queryClient]
  );

  useEffect(() => {
    // Handle app state changes for reconnection
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !isConnected) {
        console.log('App became active, reconnecting socket...');
        reconnect();
      }
    });

    // Initial connection check
    if (!isConnected) {
      reconnect();
    }

    // Set up socket listeners when connected
    if (isConnected) {
      console.log('🔌 Setting up socket message listeners');
      
      onNewUserMessage(handleNewUserMessage);
      onNewMessageReceived(handleNewMessageReceived);
    }

    // Cleanup
    return () => {
      subscription.remove();
      removeNewUserMessageListener();
      removeNewMessageReceivedListener();
    };
  }, [
    isConnected,
    reconnect,
    onNewUserMessage,
    onNewMessageReceived,
    handleNewUserMessage,
    handleNewMessageReceived,
    removeNewUserMessageListener,
    removeNewMessageReceivedListener,
  ]);
}