import { api } from '../api';

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  duration: number;
  meetingId: string;
  password?: string;
  joinUrl: string;
  courseId?: string;
  courseName?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  startTime: string;
  duration: number;
  courseId?: string;
}

export interface UpdateMeetingData {
  title?: string;
  description?: string;
  startTime?: string;
  duration?: number;
}

export const meetingService = {
  // Get all meetings
  getMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get('/meetings');
    return response.data;
  },

  // Get meetings by course
  getMeetingsByCourse: async (courseId: string): Promise<Meeting[]> => {
    const response = await api.get(`/meetings/course/${courseId}`);
    return response.data;
  },

  // Create a new meeting
  createMeeting: async (data: CreateMeetingData): Promise<Meeting> => {
    const response = await api.post('/meetings', data);
    return response.data;
  },

  // Update a meeting
  updateMeeting: async (id: string, data: UpdateMeetingData): Promise<Meeting> => {
    const response = await api.put(`/meetings/${id}`, data);
    return response.data;
  },

  // Delete a meeting
  deleteMeeting: async (id: string): Promise<void> => {
    await api.delete(`/meetings/${id}`);
  },

  joinMeeting: async (meetingId: string) => {
    const response = await api.post(`/meetings/${meetingId}/join`);
    return response.data;
  },
}; 