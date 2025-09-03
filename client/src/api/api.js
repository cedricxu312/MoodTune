import axios from 'axios';

/**
 * Base API Configuration
 * 
 * Creates an axios instance with:
 * - Base URL configuration
 * - Request interceptors for authentication
 * - Error handling
 */
const api = axios.create({
  baseURL: (process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001') + '/api',
  timeout: 60000, // 60 second timeout - mood processing involves OpenAI API calls which can take time
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically adds JWT token to all requests if available
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common response scenarios and errors
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('Authentication failed, clearing token');
      localStorage.removeItem('token');
      // Optionally redirect to login or show auth modal
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    
    return Promise.reject(error);
  }
);

export default api;