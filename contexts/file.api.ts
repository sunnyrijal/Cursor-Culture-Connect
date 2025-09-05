import api from './axiosConfig';
import { AxiosResponse } from 'axios';

export interface FileUploadResponse {
  message: string;
  url: string;
}

export const uploadFile = async (asset: {
  uri: string;
  type?: string;
  mimeType?: string;
  fileName?: string;
}): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    
    // Create file object for React Native
    const fileObject = {
      uri: asset.uri,
      type: asset.mimeType || asset.type || 'image/jpeg',
      name: asset.fileName || `image_${Date.now()}.jpg`,
    };
    
    formData.append('file', fileObject as any);

    const response: AxiosResponse<FileUploadResponse> = await api.post(
      '/file/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // Add timeout
      }
    );
    
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};