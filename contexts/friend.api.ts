import api from './axiosConfig';
import { AxiosResponse } from 'axios';

// Interfaces
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  email?: string;
}

export interface Friendship {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  sender: User;
  receiver: User;
}

export interface SendFriendRequestData {
  receiverId: string;
  message?: string;
}

export interface CancelFriendRequestData {
  receiverId: string;
}

export interface RespondToFriendRequestData {
  friendshipId: string;
  action: 'accept' | 'decline';
}

export interface RemoveFriendData {
  friendId: string;
}

export interface BlockUserData {
  targetUserId: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Friend API functions
export const sendFriendRequest = async (requestData: SendFriendRequestData) => {
  try {
    const response= await api.post(
      '/friend/send',
      requestData
    );
    return response.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

export const cancelFriendRequest = async (requestData: CancelFriendRequestData) => {
  try {
    const response = await api.delete(
      '/friend/cancel',
      { data: requestData }
    );
    return response.data;
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    throw error;
  }
};

export const respondToFriendRequest = async (responseData: RespondToFriendRequestData) => {
  try {
    const response = await api.post(
      '/friend/respond',
      responseData
    );
    return response.data;
  } catch (error) {
    console.error('Error responding to friend request:', error);
    throw error;
  }
};

export const getFriends = async () => {
  try {
    const response= await api.get(
      '/friend'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

export const getPendingFriendRequests = async () => {
  try {
    const response = await api.get(
      '/friend/pending'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching pending friend requests:', error);
    throw error;
  }
};

export const removeFriend = async (removeData: RemoveFriendData) => {
  try {
    const response= await api.delete(
      '/friend/remove',
      { data: removeData }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

export const blockUser = async (blockData: BlockUserData) => {
  try {
    const response= await api.post(
      '/friend/block',
      blockData
    );
    return response.data;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

// Helper functions for easier usage
export const acceptFriendRequest = async (friendshipId: string) => {
  return await respondToFriendRequest({ friendshipId, action: 'accept' });
};

export const declineFriendRequest = async (friendshipId: string) => {
  return await respondToFriendRequest({ friendshipId, action: 'decline' });
};