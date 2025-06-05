import axios from 'axios';
import { User, Post } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const getUserProfile = async (id?: string): Promise<User> => {
  if (!id) throw new Error('User ID is required');
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getUserPosts = async (id?: string): Promise<Post[]> => {
  if (!id) throw new Error('User ID is required');
  const response = await api.get(`/users/${id}/posts`);
  return response.data;
}; 