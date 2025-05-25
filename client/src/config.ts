// Get the API URL from environment variables or use default
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:3003'
      : 'https://api.studlink.com' // Replace with your production API URL
  }
  return 'http://localhost:3003' // Default for SSR
}

export const API_URL = getApiUrl()

import axios from 'axios';

export const setupAxiosInterceptors = (token: string) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}; 