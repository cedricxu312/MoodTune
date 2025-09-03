import api from './api';

/**
 * Mood API Service
 * 
 * Handles all mood-related API calls including:
 * - Submitting mood for analysis
 * - Getting mood history
 * - Managing mood data
 */

/**
 * Submit a mood for analysis and get song recommendations
 * @param {string} mood - User's mood description
 * @returns {Promise<Object>} Response containing mood analysis and track recommendations
 */
export const postMood = async (mood) => {
  try {
    const response = await api.post('/mood', { mood });
    return response.data;
  } catch (error) {
    console.error('Error posting mood:', error);
    
    // Provide user-friendly error messages
    if (error.response?.status === 400) {
      throw new Error('Invalid mood input. Please try again.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    } else {
      throw new Error('Failed to process mood. Please try again.');
    }
  }
};

/**
 * Get user's mood history
 * @returns {Promise<Array>} Array of mood objects with associated tracks
 */
export const getMoodHistory = async () => {
  try {
    const response = await api.get('/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching mood history:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to view your mood history.');
    } else {
      throw new Error('Failed to load mood history. Please try again.');
    }
  }
};

/**
 * Get a specific mood by ID
 * @param {number} moodId - ID of the mood to retrieve
 * @returns {Promise<Object>} Mood object with tracks
 */
export const getMoodById = async (moodId) => {
  try {
    const response = await api.get(`/mood/${moodId}`);
    return response.data.mood;
  } catch (error) {
    console.error('Error fetching mood:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Mood not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to view this mood.');
    } else {
      throw new Error('Failed to load mood. Please try again.');
    }
  }
};

/**
 * Delete a mood and all associated tracks
 * @param {number} moodId - ID of the mood to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
export const deleteMood = async (moodId) => {
  try {
    const response = await api.delete(`/mood/${moodId}`);
    return response.data.success;
  } catch (error) {
    console.error('Error deleting mood:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Mood not found or already deleted.');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to delete moods.');
    } else {
      throw new Error('Failed to delete mood. Please try again.');
    }
  }
};