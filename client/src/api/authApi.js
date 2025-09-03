import api from './api';

/**
 * Authentication API Service
 * 
 * Handles all authentication-related API calls including:
 * - User login
 * - User registration
 * - Token management
 * - Logout functionality
 */

/**
 * Authenticate user with email/username and password
 * @param {string} emailOrUsername - User's email or username
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response containing JWT token and user info
 */
export const login = async (emailOrUsername, password) => {
  try {
    const response = await api.post('/login', { emailOrUsername, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // Provide user-friendly error messages
    if (error.response?.status === 400) {
      throw new Error('Please provide both email/username and password.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid credentials. Please check your email/username and password.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    } else {
      throw new Error('Login failed. Please try again.');
    }
  }
};

/**
 * Register a new user account
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} username - User's desired username
 * @returns {Promise<Object>} Response containing JWT token and user info
 */
export const signup = async (email, password, username) => {
  try {
    const response = await api.post('/signup', { email, password, username });
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    
    // Provide user-friendly error messages
    if (error.response?.status === 400) {
      throw new Error('Please provide all required fields: email, password, and username.');
    } else if (error.response?.status === 409) {
      const errorMessage = error.response.data?.error;
      if (errorMessage === 'Email already exists') {
        throw new Error('An account with this email already exists. Please use a different email or try logging in.');
      } else if (errorMessage === 'Username already exists') {
        throw new Error('This username is already taken. Please choose a different username.');
      } else {
        throw new Error(errorMessage || 'Account already exists. Please try a different email or username.');
      }
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    } else {
      throw new Error('Registration failed. Please try again.');
    }
  }
};

/**
 * Logout user by clearing stored authentication data
 * Note: This is a client-side logout. For server-side logout, you might want to call an API endpoint.
 */
export const logout = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('skipLogin');
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

/**
 * Get stored JWT token from localStorage
 * @returns {string|null} JWT token if available, null otherwise
 */
export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get user profile information
 * @returns {Promise<Object>} User profile data
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data.user;
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to view your profile.');
    } else {
      throw new Error('Failed to load profile. Please try again.');
    }
  }
};
