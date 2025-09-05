const express = require('express');
const spotifyService = require('../services/spotifyService');

const router = express.Router();

// Note: Playlist data is stored globally in the moodService
// This allows the OAuth callback to access the data from the mood processing

/**
 * @route   GET /create-playlist
 * @desc    Redirect user to Spotify authorization
 * @access  Public
 */
router.get('/create-playlist', (req, res) => {
  try {
    const authUrl = spotifyService.getAuthorizationUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error creating authorization URL:', error);
    res.status(500).send('Failed to create authorization URL');
  }
});

/**
 * @route   GET /callback
 * @desc    Handle Spotify OAuth callback and create playlist
 * @access  Public
 */
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }

    // Exchange code for access token
    const tokenData = await spotifyService.exchangeCodeForToken(code);
    const { access_token } = tokenData;

    // Get current user profile
    const spotifyUser = await spotifyService.getCurrentUser(access_token);
    const userId = spotifyUser.id;

    // Check if we have playlist data from previous mood request
    console.log('🔍 Checking global.lastPlaylistData:', global.lastPlaylistData);
    
    if (!global.lastPlaylistData) {
      console.error('❌ No playlist data available in global.lastPlaylistData');
      return res.status(400).send('No playlist data available. Please process a mood first.');
    }

    const { playlistMeta, validTrackInfo } = global.lastPlaylistData;

    // Debug logging
    console.log('🎵 Playlist data:', {
      playlistMeta,
      validTrackInfo: validTrackInfo ? `${validTrackInfo.length} tracks` : 'undefined',
      firstTrack: validTrackInfo && validTrackInfo[0] ? validTrackInfo[0] : 'none'
    });

    // Create playlist
    const playlist = await spotifyService.createPlaylist(
      userId, 
      playlistMeta.name, 
      playlistMeta.description, 
      access_token
    );

    console.log('✅ Playlist created:', playlist.id);

    // Add tracks to playlist
    if (validTrackInfo && validTrackInfo.length > 0) {
      console.log(`🎵 Adding ${validTrackInfo.length} tracks to playlist ${playlist.id}`);
      await spotifyService.addTracksToPlaylist(validTrackInfo, playlist.id, access_token);
      console.log('✅ Tracks added to playlist');
    } else {
      console.warn('⚠️ No tracks to add to playlist');
      console.warn('⚠️ validTrackInfo:', validTrackInfo);
      console.warn('⚠️ validTrackInfo type:', typeof validTrackInfo);
      console.warn('⚠️ validTrackInfo length:', validTrackInfo?.length);
    }

    // Clear the stored data only after successful completion
    global.lastPlaylistData = null;
    console.log('🧹 Cleared global playlist data');

    // Send success response with script to close popup
    res.send(`
      <script>
        window.opener.postMessage({ 
          playlistUrl: "${playlist.external_urls.spotify}",
          success: true 
        }, "*");
        window.close();
      </script>
    `);

  } catch (error) {
    console.error('Error during Spotify OAuth or playlist creation:', error);
    res.status(500).send(`
      <script>
        window.opener.postMessage({ 
          error: 'Failed to create playlist',
          success: false 
        }, "*");
        window.close();
      </script>
    `);
  }
});

/**
 * @route   POST /api/store-playlist-data
 * @desc    Store playlist data for later use in OAuth flow
 * @access  Public
 */
router.post('/store-playlist-data', (req, res) => {
  try {
    const { playlistMeta, validTrackInfo } = req.body;
    
    if (!playlistMeta || !validTrackInfo) {
      return res.status(400).json({ error: 'Playlist metadata and track info are required' });
    }
    
    // Store the data globally (in production, consider using Redis or similar)
    lastPlaylistData = { playlistMeta, validTrackInfo };
    
    res.json({ message: 'Playlist data stored successfully' });
  } catch (error) {
    console.error('Error storing playlist data:', error);
    res.status(500).json({ error: 'Failed to store playlist data' });
  }
});

/**
 * @route   GET /api/spotify-status
 * @desc    Check Spotify service status
 * @access  Public
 */
router.get('/spotify-status', async (req, res) => {
  try {
    // Try to get a Spotify access token to verify service is working
    await spotifyService.getAccessToken();
    res.json({ status: 'healthy', message: 'Spotify service is working' });
  } catch (error) {
    console.error('Spotify service check failed:', error);
    res.status(503).json({ status: 'unhealthy', message: 'Spotify service is not available' });
  }
});

/**
 * @route   GET /api/playlist-data
 * @desc    Check current playlist data (for debugging)
 * @access  Public
 */
router.get('/playlist-data', (req, res) => {
  try {
    const hasData = !!global.lastPlaylistData;
    const trackCount = global.lastPlaylistData?.validTrackInfo?.length || 0;
    const playlistName = global.lastPlaylistData?.playlistMeta?.name || 'none';
    
    res.json({
      success: true,
      hasData,
      trackCount,
      playlistName,
      data: global.lastPlaylistData
    });
  } catch (error) {
    console.error('Error checking playlist data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
