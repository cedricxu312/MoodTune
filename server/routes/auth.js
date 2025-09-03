const express = require('express');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({ 
        error: 'Email, password, and username are required' 
      });
    }
    
    const result = await authService.registerUser(email, password, username);
    
    res.json({ 
      message: 'User registered successfully',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.message === 'Email already exists' || error.message === 'Username already exists') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * @route   POST /api/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    // Validate required fields
    if (!emailOrUsername || !password) {
      return res.status(400).json({ 
        error: 'Email/username and password are required' 
      });
    }
    
    const result = await authService.loginUser(emailOrUsername, password);
    
    res.json({ 
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userProfile = await authService.getUserProfile(req.user.userId);
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json({ user: userProfile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { username, email } = req.body;
    const updates = {};
    
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const updatedProfile = await authService.updateUserProfile(req.user.userId, updates);
    
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * @route   POST /api/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }
    
    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
