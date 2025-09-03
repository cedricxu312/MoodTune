const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_CONFIG } = require('../config/constants');

class AuthService {
  /**
   * Register a new user
   * @param {string} email - User's email address
   * @param {string} password - User's password (will be hashed)
   * @param {string} username - User's username
   * @returns {Object} JWT token and user info
   */
  async registerUser(email, password, username) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert user into database
      const result = await db.query(
        'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, username',
        [email, hashedPassword, username]
      );
      
      const user = result.rows[0];
      
      // Generate JWT token
      const token = jwt.sign({ 
        userId: user.id, 
        username: user.username
      }, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.EXPIRES_IN });
      
      return { token, user: { id: user.id, username: user.username } };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle duplicate key errors
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        if (error.constraint === 'users_email_key') {
          throw new Error('Email already exists');
        } else if (error.constraint === 'users_username_key') {
          throw new Error('Username already exists');
        }
      }
      
      throw new Error('Registration failed');
    }
  }

  /**
   * Authenticate a user login
   * @param {string} emailOrUsername - User's email or username
   * @param {string} password - User's password
   * @returns {Object} JWT token and user info
   */
  async loginUser(emailOrUsername, password) {
    try {
      // Find user by email or username
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1 OR username = $1',
        [emailOrUsername]
      );
      
      const user = result.rows[0];
      
      // Check if user exists and password is correct
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
      }
      
      // Generate JWT token
      const token = jwt.sign({ 
        userId: user.id, 
        username: user.username
      }, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.EXPIRES_IN });
      
      return { 
        token, 
        user: { 
          id: user.id, 
          username: user.username,
          email: user.email 
        } 
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Verify a JWT token and return user data
   * @param {string} token - JWT token to verify
   * @returns {Object|null} User data if token is valid, null otherwise
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user profile by ID
   * @param {number} userId - User ID
   * @returns {Object|null} User profile or null if not found
   */
  async getUserProfile(userId) {
    try {
      const result = await db.query(
        'SELECT id, username, email, created_at FROM users WHERE id = $1',
        [userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} updates - Object containing fields to update
   * @returns {Object} Updated user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      const allowedFields = ['username', 'email'];
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      for (const [field, value] of Object.entries(updates)) {
        if (allowedFields.includes(field) && value !== undefined) {
          updateFields.push(`${field} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(userId);
      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING id, username, email, created_at, updated_at
      `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {boolean} True if password changed successfully
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get current user
      const userResult = await db.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );
      
      const user = userResult.rows[0];
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await db.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedNewPassword, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
