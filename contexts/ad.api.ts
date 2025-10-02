import api from './axiosConfig';
import { AxiosResponse } from 'axios';

export interface Advertisement {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category: AdCategory;
  contactInfo?: string;
  location: any; // JSON type
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  metrics?: AdMetrics;
}

export interface AdMetrics {
  id: number;
  advertisementId: string;
  views: number;
  clicks: number;
  clickThroughRate?: number;
}

export interface AdInteraction {
  id: number;
  advertisementId: string;
  interactionType: InteractionType;
  timestamp: string;
  userId?: string;
}

export enum AdCategory {
  Retail = 'Retail',
  Food = 'Food',
  Services = 'Services',
  Events = 'Events',
  Other = 'Other'
}

export enum InteractionType {
  Impression = 'Impression',
  Click = 'Click'
}

export interface CreateAdvertisementData {
  name: string;
  description?: string;
  imageUrl?: string;
  category: AdCategory;
  contactInfo?: string;
  location: any;
}

export interface UpdateAdvertisementData {
  name?: string;
  description?: string;
  imageUrl?: string;
  category?: AdCategory;
  contactInfo?: string;
  location?: any;
}

export interface GetAdvertisementsParams {
  category?: string;
  userId?: string;
}

// Create new advertisement
export const createAdvertisement = async (advertisementData: CreateAdvertisementData) => {
  try {
    const response: AxiosResponse = await api.post(
      '/ad/create',
      advertisementData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating advertisement:', error);
    throw error;
  }
};

// Get all advertisements with optional filtering
export const getAdvertisements = async (params?: GetAdvertisementsParams) => {
  console.log('Fetching ads with params: kamal', params);
  try {
    const response: AxiosResponse = await api.get(
      '/ad/all',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    throw error;
  }
};

// Get single advertisement by ID
export const getAdvertisementById = async (id: string) => {
  try {
    const response: AxiosResponse = await api.get(
      `/ad/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    throw error;
  }
};

// Update advertisement
export const updateAdvertisement = async (id: string, advertisementData: UpdateAdvertisementData) => {
  try {
    const response: AxiosResponse = await api.put(
      `/ad/${id}`,
      advertisementData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating advertisement:', error);
    throw error;
  }
};

// Delete advertisement
export const deleteAdvertisement = async (id: string) => {
  try {
    const response: AxiosResponse = await api.delete(
      `/ad/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    throw error;
  }
};




// Record advertisement impression
export const recordAdImpression = async (id: string) => {
  try {
    const response: AxiosResponse = await api.post(
      `/ad/${id}/impression`
    );
    return response.data;
  } catch (error) {
    console.error('Error recording impression:', error);
    throw error;
  }
};

// Record advertisement click
export const recordAdClick = async (id: string) => {
  try {
    const response: AxiosResponse = await api.post(
      `/ad/${id}/click`
    );
    return response.data;
  } catch (error) {
    console.error('Error recording click:', error);
    throw error;
  }
};

// Get advertisement metrics
export const getAdMetrics = async (id: string) => {
  try {
    const response: AxiosResponse = await api.get(
      `/ad/${id}/metrics`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

// Get advertisements by category
export const getAdvertisementsByCategory = async (category: AdCategory) => {
  try {
    const response: AxiosResponse = await api.get(
      '/ad/all',
      { params: { category } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching advertisements by category:', error);
    throw error;
  }
};

// Get user's advertisements
export const getUserAdvertisements = async (userId: string) => {
  try {
    const response: AxiosResponse = await api.get(
      '/ad/all',
      { params: { userId } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user advertisements:', error);
    throw error;
  }
};