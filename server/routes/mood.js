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

module.exports = router;
