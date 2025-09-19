// project/components/university/PeopleList.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/components/theme';
import {
  User,
  MessageCircle,
  UserPlus,
  ChevronRight,
  UserCheck,
  UserX,
} from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendFriendRequest } from '@/contexts/friend.api';

const FriendshipStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  BLOCKED: 'BLOCKED',
};

interface Person {
  id: string;
  name: string;
  profilePicture: string | null;
  classYear: string;
  friendshipStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED' | null;
  isFriendRequestSender: boolean;
  chatId: string | null;
}

interface PeopleListProps {
  people: Person[];
}

const PeopleList: React.FC<PeopleListProps> = ({ people }) => {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [message, setMessage] = useState('');


  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (data, variables) => {
      console.log('Friend request sent successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['myUniversity'] });
      Alert.alert('Success', 'Friend request sent successfully!');
    },
    onError: (error: any) => {
      console.error('Error sending friend request:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send friend request. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  const handleSendRequest = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setModalVisible(true);
  };

  const handleSendWithMessageHandler = () => {
    if (!selectedUser) return;
    sendRequestMutation.mutate({
      receiverId: selectedUser.id,
      message: message.trim(),
    });
    setModalVisible(false);
    setMessage('');
    setSelectedUser(null);
  };

  const getActionButton = (person: Person) => {
    const { friendshipStatus, isFriendRequestSender, chatId, id, name } =
      person;

    if (chatId || friendshipStatus === FriendshipStatus.ACCEPTED) {
      return (
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => router.push(`/chat/${chatId}`)}
        >
          <MessageCircle size={18} color={theme.primary} />
        </TouchableOpacity>
      );
    }

    if (friendshipStatus === FriendshipStatus.PENDING) {
      return (
        <TouchableOpacity style={styles.requestSentButton} disabled>
          <UserCheck size={18} color={theme.gray500} />
          <Text style={styles.requestSentText}>Sent</Text>
        </TouchableOpacity>
      );
    }

    if (friendshipStatus === null) {
      return (
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => handleSendRequest(id, name)}
          disabled={sendRequestMutation.isPending}
        >
          <UserPlus size={18} color={theme.white} />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.connectButton}
        onPress={() => handleSendRequest(id, name)}
        disabled={sendRequestMutation.isPending}
      >
        <UserPlus size={18} color={theme.white} />
        <Text style={styles.connectButtonText}>Add</Text>
      </TouchableOpacity>
    );
  };

  if (people.length === 0) {
    return (
      <View style={styles.emptyState}>
        <User size={48} color={theme.gray400} />
        <Text style={styles.emptyStateTitle}>No People Found</Text>
        <Text style={styles.emptyStateText}>
          There are currently no other students from your university on the platform. 
          Invite your friends to join!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.peopleList}>
      {people.map((person) => (
        <TouchableOpacity
          key={person.id}
          onPress={() => router.push(`/public/profile/${person.id}`)}
          style={styles.personCard}
        >
          <Image
            source={{
              uri:
                person.profilePicture ||
                'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
            }}
            style={styles.personImage}
          />
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.personDetails}>{person.classYear}</Text>
          </View>
          <View style={styles.personActions}>{getActionButton(person)}</View>
          <ChevronRight size={20} color={theme.gray400} />
        </TouchableOpacity>
      ))}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Send a friend request to {selectedUser?.name}?</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Add an optional message..."
              placeholderTextColor={theme.gray400}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.textStyle, { color: theme.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonSend]} onPress={handleSendWithMessageHandler}>
                <Text style={styles.textStyle}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  peopleList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  personImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  personDetails: {
    fontSize: 13,
    color: theme.gray500,
    marginBottom: 1,
  },
  personActions: {
    marginRight: 8,
  },
  messageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.gray100,
    borderWidth: 1,
    borderColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: theme.gray200,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  connectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    backgroundColor: theme.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.gray200,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  connectButtonText: {
    color: theme.white,
    fontWeight: '600',
    fontSize: 13,
  },
  requestSentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.gray200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: theme.gray200,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  requestSentText: {
    color: theme.gray500,
    fontWeight: '600',
    fontSize: 13,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  messageInput: {
    width: '100%',
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: theme.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: theme.gray200,
  },
  buttonSend: {
    backgroundColor: theme.primary,
  },
  textStyle: {
    color: theme.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PeopleList;
