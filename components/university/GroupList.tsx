// project/components/university/GroupsList.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { theme, spacing, typography } from '@/components/theme';
import { Users, Lock, Globe, ChevronRight, MapPin } from 'lucide-react-native';

interface GroupCreator {
  id: string;
  name: string;
}

interface GroupCount {
  members: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  meetingLocation: string | null;
  meetingDetails: string;
  creator: GroupCreator;
  _count: GroupCount;
}

interface GroupsListProps {
  groups: Group[];
}

const GroupsList: React.FC<GroupsListProps> = ({ groups }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (groups.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Users size={48} color={theme.gray400} />
        <Text style={styles.emptyStateTitle}>No Groups Found</Text>
        <Text style={styles.emptyStateText}>
          There are currently no groups available at your university. Be the
          first to create one!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.groupsList}>
      {groups.map((group) => (
        <TouchableOpacity
          key={group.id}
          onPress={() => router.push(`/group/${group.id}`)}
          style={styles.groupCard}
        >
          <Image
            source={
              group.imageUrl
                ? { uri: group.imageUrl }
                : require('../../assets/logo.png')
            }
            style={styles.groupImage}
            defaultSource={require('../../assets/logo.png')}
          />

          <View style={styles.groupInfo}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupName}>{group.name}</Text>
              {group.isPrivate ? (
                <Lock size={16} color={theme.gray500} />
              ) : (
                <Globe size={16} color={theme.gray500} />
              )}
            </View>
            <Text style={styles.groupDescription} numberOfLines={2}>
              {group.description}
            </Text>
            <View style={styles.groupMeta}>
              <View style={styles.metaRow}>
                <Users size={14} color={theme.gray500} />
                <Text style={styles.metaText}>
                  {group._count.members} member
                  {group._count.members !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.creatorText}>
                  Created by {group.creator.name}
                </Text>
              </View>
              {group.meetingLocation && (
                <View style={styles.metaRow}>
                  <MapPin size={14} color={theme.gray500} />
                  <Text style={styles.metaText}>{group.meetingLocation}</Text>
                </View>
              )}
              <View style={styles.metaRow}>
                <Text style={styles.dateText}>
                  Created {formatDate(group.createdAt)}
                </Text>
              </View>
            </View>
          </View>
          <ChevronRight size={20} color={theme.gray400} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  groupsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  groupImage: {
    width: 100,
    height: '100%',
    borderRadius: 12,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    flex: 1,
  },
  groupDescription: {
    fontSize: 14,
    color: theme.gray600,
    marginBottom: 8,
    lineHeight: 20,
  },
  groupMeta: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: theme.gray500,
  },
  creatorText: {
    fontSize: 13,
    color: theme.gray500,
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 12,
    color: theme.gray400,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 15,
    color: theme.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default GroupsList;
