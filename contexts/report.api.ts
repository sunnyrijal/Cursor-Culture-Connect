import api from './axiosConfig';

export enum ReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  HATE_SPEECH = 'HATE_SPEECH',
  OTHER = 'OTHER',
}

export interface ReportData {
  reason: ReportReason;
  description: string;
  eventId?: string;
  groupId?: string;
  quickEventId?: string;
  reportedUserId?: string;
}

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface GetMyReportsParams {
  status?: ReportStatus;
  reason?: ReportReason;
}

export interface Report {
  id: string;
  reason: ReportReason;
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
  // The following fields depend on what the backend returns for the entity
  event?: { id: string; name: string };
  group?: { id: string; name: string };
  quickEvent?: { id: string; title: string };
  reportedUser?: { id: string; name: string };
  activity?: { id: string; name: string };
}


/**
 * Submits a report for an entity (event, group, user, etc.).
 * @param reportData - The data for the report.
 * @returns The API response.
 */
export const submitReport = async (reportData: ReportData) => {
  try {
    console.log('Submitting report with data:', reportData);
    const response = await api.post('/reports', reportData);
    return response.data;
  } catch (error) {
    console.error('Error submitting report:', error);
    // It's better to throw the error so that react-query can handle it
    throw error;
  }
};

/**
 * Fetches the reports submitted by the current user.
 * @returns The API response containing the user's reports.
 */
export const getMyReports = async (
  params: GetMyReportsParams = {}
): Promise<{ data: Report[] }> => {
  try {
    const response = await api.get('/reports/my-reports', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my reports:', error);
    throw error;
  }
};

/**
 * Deletes a report submitted by the current user.
 * @param reportId - The ID of the report to delete.
 * @returns The API response.
 */
export const deleteMyReport = async (reportId: string) => {
  try {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};