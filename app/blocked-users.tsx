'use client';

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBlockedUsers, unblockUser } from '@/contexts/friend.api';
import { useAlert } from '@/contexts/AlertContext';
import { theme, spacing, typography } from '@/components/theme';
import { ArrowLeft, UserX, ShieldOff } from 'lucide-react-native';
import { router } from 'expo-router';

interface BlockedUser {
  id: string;
  name: string;
  profilePicture?: string | null;
}

export default function BlockedUsersScreen() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  const {
    data: blockedUsersResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['blockedUsers'],
    queryFn: getBlockedUsers,
  });

  const blockedUsers = blockedUsersResponse?.data || [];

  const unblockUserMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      showAlert({ title: 'Success', message: 'User has been unblocked.' });
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (err: any) => {
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to unblock user.',
      });
    },
  });

  const handleUnblockUser = (targetUserId: string, userName: string) => {
    showAlert({
      title: 'Unblock User',
      message: `Are you sure you want to unblock ${userName}?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: () => unblockUserMutation.mutate({ targetUserId }),
        },
      ],
    });
  };

  const renderUserItem = ({ item }: { item: BlockedUser }) => (
    <TouchableOpacity style={styles.userCard}>
      <Image
        source={
          item.profilePicture
            ? { uri: item.profilePicture }
            : require('../assets/user.png')
        }
        style={styles.userImage}
        defaultSource={require('../assets/user.png')}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
      </View>
      <TouchableOpacity

        style={styles.unblockButton}
        onPress={() => handleUnblockUser(item.id, item.name)}
        disabled={unblockUserMutation.isPending}
      >
        <ShieldOff size={18} color={theme.black} />
        <Text style={styles.unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load blocked users.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={blockedUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <UserX size={48} color={theme.textSecondary} />
            <Text style={styles.emptyText}>You haven't blocked anyone.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  unblockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  unblockButtonText: {
    color: theme.black,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.error,
    fontSize: typography.fontSize.base,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
  },
});