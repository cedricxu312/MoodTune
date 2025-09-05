const express = require('express');
const moodService = require('../services/moodService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/mood
 * @desc    Process a mood and generate song recommendations
 * @access  Public (anonymous users can use this)
 */
router.post('/mood', async (req, res) => {
  try {
    const { mood } = req.body;
    const userId = req.user?.userId || null; // Can be null for anonymous users
    
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }
    
    const result = await moodService.processMood(mood, userId);
    
    res.json({
      message: 'Mood processed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error processing mood:', error);
    res.status(500).json({ error: 'Server error processing mood' });
  }
});

/**
 * @route   GET /api/history
 * @desc    Get mood history for authenticated user
 * @access  Private
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await moodService.getUserMoodHistory(userId);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * @route   GET /api/mood/:id
 * @desc    Get a specific mood by ID
 * @access  Private
 */
router.get('/mood/:id', requireAuth, async (req, res) => {
  try {
    const moodId = parseInt(req.params.id);
    const userId = req.user.userId;
    
    if (isNaN(moodId)) {
      return res.status(400).json({ error: 'Invalid mood ID' });
    }
    
    const mood = await moodService.getMoodById(moodId, userId);
    
    if (!mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }
    
    res.json({ mood });
  } catch (error) {
    console.error('Error fetching mood:', error);
    res.status(500).json({ error: 'Failed to fetch mood' });
  }
});

/**
 * @route   DELETE /api/mood/:id
 * @desc    Delete a mood and all associated tracks
 * @access  Private
 */
router.delete('/mood/:id', requireAuth, async (req, res) => {
  try {
    const moodId = parseInt(req.params.id);
    const userId = req.user.userId;
    
    if (isNaN(moodId)) {
      return res.status(400).json({ error: 'Invalid mood ID' });
    }
    
    const deleted = await moodService.deleteMood(moodId, userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Mood not found or access denied' });
    }
    
    res.json({ message: 'Mood deleted successfully' });
  } catch (error) {
    console.error('Error deleting mood:', error);
    res.status(500).json({ error: 'Failed to delete mood' });
  }
});

/**
 * @route   GET /api/stats
 * @desc    Get recommendation statistics for debugging
 * @access  Public
 */
router.get('/stats', (req, res) => {
  try {
    const stats = moodService.getRecommendationStats();
    res.json({
      success: true,
      message: 'Recommendation statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting recommendation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recommendation statistics',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/clear-history
 * @desc    Clear recommendation history (useful for testing)
 * @access  Public
 */
router.post('/clear-history', (req, res) => {
  try {
    moodService.clearRecommendationHistory();
    res.json({
      success: true,
      message: 'Recommendation history cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing recommendation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear recommendation history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/db-status
 * @desc    Check database connection status and pool health
 * @access  Public
 */
router.get('/db-status', async (req, res) => {
  try {
    const db = require('../db');
    const isConnected = await db.testConnection();
    const poolStatus = db.getPoolStatus();
    
    res.json({
      success: true,
      message: 'Database status retrieved successfully',
      data: {
        connected: isConnected,
        poolStatus,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check database status',
      error: error.message
    });
  }
});

module.exports = router;
