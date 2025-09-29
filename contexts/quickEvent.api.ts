import api from './axiosConfig';
import { AxiosResponse } from 'axios';

export interface QuickEvent {
  id: string;
  name: string;
  description?: string;
  max?: string;
  userId: string;
  time?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuickEventData {
  name: string;
  description?: string;
  max?: string;
  time?: string;
  isPublic:boolean
  location?:string
}

export interface UpdateQuickEventData {
  name?: string;
  description?: string;
  max?: string;
  time?: string;
  location?:string
  isPublic:boolean
}

export const createQuickEvent = async (quickEventData: CreateQuickEventData) => {
  try {
    const response: AxiosResponse = await api.post(
      '/quickevents/create',
      quickEventData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating quick event:', error);
    throw error;
  }
};

export const getQuickEvents = async (params?: { includeNotInterested?: boolean }) => {
  try {
    const response: AxiosResponse = await api.get(
      `/quickevents/all?includeNotInterested=${!params?.includeNotInterested}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching quick events:', error);
    throw error;
  }
};

export const getQuickEventById = async (id: string) => {
  try {
    const response: AxiosResponse = await api.get(
      `/quickevents/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching quick event:', error);
    throw error;
  }
};

export const getQuickEventsByUserId = async (userId: string) => {
  try {
    const response: AxiosResponse = await api.get(
      `/quickevents/user/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user quick events:', error);
    throw error;
  }
};

export const updateQuickEvent = async (id: string, quickEventData: UpdateQuickEventData) => {
  console.log(quickEventData)
  try {
    const response: AxiosResponse = await api.put(
      `/quickevents/${id}`,
      quickEventData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating quick event:', error);
    throw error;
  }
};

export const deleteQuickEvent = async (id: string) => {
  try {
    const response: AxiosResponse = await api.delete(
      `/quickevents/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting quick event:', error);
    throw error;
  }
};

export const addInterestedUser = async (id: string) => {
  try {
    const response: AxiosResponse = await api.post(
      `/quickevents/add-interested-user/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error adding interested user:', error);
    throw error;
  }
};

export const removeInterestedUser = async (id: string) => {
  try {
    const response: AxiosResponse = await api.post(
      `/quickevents/remove-interested-user/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error removing interested user:', error);
    throw error;
  }
};

export const addNotInterestedUser = async (id: string) => {
  try {
    const response: AxiosResponse = await api.post(
      `/quickevents/add-not-interested-user/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error adding not interested user:', error);
    throw error;
  }
};