import api from './axiosConfig';
import { AxiosResponse } from 'axios';

export interface University {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUniversityData {
  name: string;
}


export const createUniversity = async (universityData: CreateUniversityData) => {
  try {
    const response: AxiosResponse = await api.post(
      '/university/create',
      universityData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating university:', error);
    throw error;
  }
};

export const getUniversities = async () => {
  try {
    const response: AxiosResponse= await api.get(
      '/university/all'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching universities:', error);
    throw error;
  }
};

export const getMyUniversity = async () => {
  try {
    const response: AxiosResponse= await api.get(
      '/university/me'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching universities:', error);
    throw error;
  }
};
