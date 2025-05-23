// Get the API URL from environment variables or use default
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:3001'
      : 'https://api.studlink.com' // Replace with your production API URL
  }
  return 'http://localhost:3001' // Default for SSR
}

export const API_URL = getApiUrl() 