const db = require('../db');
const openaiService = require('./openaiService');
const spotifyService = require('./spotifyService');

// Simple in-memory cache to track recent recommendations (last 10 requests)
// In production, you might want to use Redis or database for persistence
const recentRecommendations = {
  tracks: new Set(),
  artists: new Set(),
  maxHistory: 50, // Keep track of last 50 tracks
  addRecommendations: function(tracks) {
    tracks.forEach(track => {
      this.tracks.add(track.name.toLowerCase() + '|' + track.artist.toLowerCase());
      this.artists.add(track.artist.toLowerCase());
      
      // Maintain size limit
      if (this.tracks.size > this.maxHistory) {
        const firstTrack = this.tracks.values().next().value;
        this.tracks.delete(firstTrack);
      }
      if (this.artists.size > this.maxHistory) {
        const firstArtist = this.artists.values().next().value;
        this.artists.delete(firstArtist);
      }
    });
  },
  isRecentlyRecommended: function(trackName, artistName) {
    const key = trackName.toLowerCase() + '|' + artistName.toLowerCase();
    return this.tracks.has(key);
  },
  isArtistRecentlyRecommended: function(artistName) {
    return this.artists.has(artistName.toLowerCase());
  }
};
class MoodService {
  /**
   * Process a mood and generate song recommendations
   * @param {string} mood - User's mood input
   * @param {number|null} userId - User ID (can be null for anonymous users)
   * @returns {Object} Mood analysis and track recommendations
   */
  async processMood(mood, userId = null) {
    try {
      if (!mood) {
        throw new Error('Mood is required');
      }

      // Step 1: Get mood analysis from GPT
      const moodDescriptions = await openaiService.getMoodAnalysis(mood);
      
      // Step 2: Save mood to database with error handling
      let moodId;
      try {
        const moodInsert = await db.query(
          'INSERT INTO moods (mood, user_id) VALUES ($1, $2) RETURNING id',
          [moodDescriptions.mood || mood, userId]
        );
        moodId = moodInsert.rows[0].id;
      } catch (dbError) {
        console.error('Database error saving mood:', dbError.message);
        // Continue without saving to database - we can still return recommendations
        moodId = null;
      }

      // Step 3: Generate playlist metadata
      const playlistMeta = openaiService.generatePlaylistMeta(moodDescriptions);
      
      // Step 4: Get song recommendations from GPT
      const parsedSec = await openaiService.getSongRecommendations(moodDescriptions);
      
      // Step 5: Normalize song data
      const songData = openaiService.normalizeSongData(parsedSec);
      
      // Step 6: Search for valid tracks on Spotify
      const validTrackInfo = await spotifyService.searchValidTracks(songData);
      
      // Step 6.5: Filter out recently recommended tracks to prevent repetition
      const filteredTrackInfo = validTrackInfo.filter(track => 
        !recentRecommendations.isRecentlyRecommended(track.name, track.artist)
      );
      
      console.log(`🔄 Anti-repetition: ${validTrackInfo.length} total tracks, ${filteredTrackInfo.length} after filtering`);
      
      // If we filtered out too many tracks, add some back but avoid both track and artist repetition
      let finalTrackInfo = filteredTrackInfo;
      if (filteredTrackInfo.length < 10) {
        const additionalTracks = validTrackInfo.filter(track => 
          !filteredTrackInfo.some(ft => ft.artist.toLowerCase() === track.artist.toLowerCase()) &&
          !recentRecommendations.isArtistRecentlyRecommended(track.artist) &&
          !recentRecommendations.isRecentlyRecommended(track.name, track.artist)
        ).slice(0, 15 - filteredTrackInfo.length);
        finalTrackInfo = [...filteredTrackInfo, ...additionalTracks];
        console.log(`🔄 Added ${additionalTracks.length} additional tracks to reach ${finalTrackInfo.length} total`);
      }
      
      // Step 7: Save tracks to database with error handling
      if (moodId) {
        for (const track of finalTrackInfo) {
          try {
            await db.query(
              'INSERT INTO tracks (mood_id, name, artist, url) VALUES ($1, $2, $3, $4)',
              [moodId, track.name, track.artist, track.spotifyUrl]
            );
          } catch (dbError) {
            console.error(`Database error saving track ${track.name}:`, dbError.message);
            // Continue saving other tracks
          }
        }
      } else {
        console.log('⚠️ Skipping track database save - no mood ID available');
      }
      
      // Step 7.5: Update recommendation history
      recentRecommendations.addRecommendations(finalTrackInfo);

            // Step 8: Store playlist data for Spotify OAuth flow
      // This will be used when the user creates a playlist
      global.lastPlaylistData = { playlistMeta, validTrackInfo: finalTrackInfo };
      console.log('💾 Stored playlist data globally:', {
        playlistMeta,
        trackCount: finalTrackInfo.length,
        firstTrack: finalTrackInfo[0]?.name || 'none'
      });
      
      // Step 9: Return complete mood data
      const result = { 
        moodDescriptions, 
        validTrackInfo: finalTrackInfo,
        playlistMeta 
      };

      console.log('Mood processed successfully:', result);
      return result;

    } catch (error) {
      console.error('Error processing mood:', error);
      throw error;
    }
  }

  /**
   * Get recommendation statistics for debugging
   * @returns {Object} Statistics about recent recommendations
   */
  getRecommendationStats() {
    return {
      totalTracks: recentRecommendations.tracks.size,
      totalArtists: recentRecommendations.artists.size,
      maxHistory: recentRecommendations.maxHistory,
      recentTracks: Array.from(recentRecommendations.tracks).slice(-10),
      recentArtists: Array.from(recentRecommendations.artists).slice(-10)
    };
  }

  /**
   * Clear recommendation history (useful for testing)
   */
  clearRecommendationHistory() {
    recentRecommendations.tracks.clear();
    recentRecommendations.artists.clear();
  }

  /**
   * Get mood history for a specific user
   * @param {number} userId - User ID
   * @returns {Array} Array of mood objects with associated tracks
   */
  async getUserMoodHistory(userId) {
    try {
      const result = await db.query(`
        SELECT m.id as mood_id, m.mood, m.created_at, 
               t.id as track_id, t.name, t.artist, t.url
        FROM moods m
        LEFT JOIN tracks t ON t.mood_id = m.id
        WHERE m.user_id = $1
        ORDER BY m.created_at DESC, t.id ASC
      `, [userId]);

      // Group tracks by mood
      const grouped = {};
      result.rows.forEach(row => {
        if (!grouped[row.mood_id]) {
          grouped[row.mood_id] = {
            mood: row.mood,
            created_at: row.created_at,
            tracks: []
          };
        }
        if (row.track_id) { // Only add if track exists
          grouped[row.mood_id].tracks.push({
            name: row.name,
            artist: row.artist,
            url: row.url
          });
        }
      });

      return Object.values(grouped);
    } catch (error) {
      console.error('Error fetching mood history:', error);
      throw new Error('Failed to fetch mood history');
    }
  }

  /**
   * Get a specific mood by ID
   * @param {number} moodId - Mood ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Object|null} Mood object with tracks or null if not found
   */
  async getMoodById(moodId, userId) {
    try {
      const result = await db.query(`
        SELECT m.id, m.mood, m.created_at, m.user_id,
               t.id as track_id, t.name, t.artist, t.url
        FROM moods m
        LEFT JOIN tracks t ON t.mood_id = m.id
        WHERE m.id = $1 AND m.user_id = $2
        ORDER BY t.id ASC
      `, [moodId, userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const mood = {
        id: result.rows[0].id,
        mood: result.rows[0].mood,
        created_at: result.rows[0].created_at,
        user_id: result.rows[0].user_id,
        tracks: []
      };

      result.rows.forEach(row => {
        if (row.track_id) {
          mood.tracks.push({
            name: row.name,
            artist: row.artist,
            url: row.url
          });
        }
      });

      return mood;
    } catch (error) {
      console.error('Error fetching mood by ID:', error);
      throw new Error('Failed to fetch mood');
    }
  }

  /**
   * Delete a mood and all associated tracks
   * @param {number} moodId - Mood ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} True if deleted successfully
   */
  async deleteMood(moodId, userId) {
    try {
      // First verify ownership
      const moodCheck = await db.query(
        'SELECT id FROM moods WHERE id = $1 AND user_id = $2',
        [moodId, userId]
      );

      if (moodCheck.rows.length === 0) {
        return false;
      }

      // Delete tracks first (due to foreign key constraint)
      await db.query('DELETE FROM tracks WHERE mood_id = $1', [moodId]);
      
      // Delete mood
      await db.query('DELETE FROM moods WHERE id = $1', [moodId]);
      
      return true;
    } catch (error) {
      console.error('Error deleting mood:', error);
      throw new Error('Failed to delete mood');
    }
  }
}

module.exports = new MoodService();
