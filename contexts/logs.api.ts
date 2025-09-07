import api from './axiosConfig';
import { AxiosResponse } from 'axios';

export interface UserActionLog {
  id: string;
  action: string;
  description: string | null;
  metadata: any;
  timestamp: string;
}

export interface UserLogsResponse {
  logs: UserActionLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface GetUserLogsParams {
  page?: number;
  limit?: number;
  action?: string;
}

export const getUserLogs = async (params?: GetUserLogsParams) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    if (params?.action) {
      queryParams.append('action', params.action);
    }

    const queryString = queryParams.toString();
    const url = `/logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching user logs:', error);
    throw error;
  }
};