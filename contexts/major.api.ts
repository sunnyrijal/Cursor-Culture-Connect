import api from './axiosConfig';

export interface Major {
  id: string;
  name: string;
}

/**
 * Fetches a list of majors.
 * @param query - Optional search query.
 * @returns The API response containing the list of majors.
 */
export const getMajors = async (query?: string): Promise<{ data: Major[] }> => {
  try {
    const response = await api.get('/majors/all', {
      params: { search: query },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching majors:', error);
    throw error;
  }
};

/**
 * Creates a new major.
 * @param name - The name of the major to create.
 * @returns The API response containing the newly created major.
 */
export const createMajor = async (name: string): Promise<{ data: Major }> => {
  try {
    const response = await api.post('/majors', { name });
    return response.data;
  } catch (error) {
    console.error('Error creating major:', error);
    throw error;
  }
};