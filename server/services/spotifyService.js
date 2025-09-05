const axios = require('axios');
const qs = require('qs');
const { SPOTIFY_CONFIG } = require('../config/constants');

class SpotifyService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get a valid Spotify access token
   * Uses client credentials flow for server-to-server requests
   */
  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const tokenUrl = 'https://accounts.spotify.com/api/token';
      const data = qs.stringify({ grant_type: 'client_credentials' });
      const headers = {
        Authorization: 'Basic ' + Buffer.from(
          SPOTIFY_CONFIG.CLIENT_ID + ':' + SPOTIFY_CONFIG.CLIENT_SECRET
        ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const response = await axios.post(tokenUrl, data, { headers });
      this.accessToken = response.data.access_token;
      // Set expiry to 50 minutes (tokens typically last 1 hour)
      this.tokenExpiry = Date.now() + (50 * 60 * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify token:', error.message);
      throw new Error('Failed to get Spotify access token');
    }
  }

  /**
   * Search for tracks on Spotify
   * @param {Object} songData - Object with artist names as keys and arrays of song names as values
   * @returns {Array} Array of valid track objects
   */
  async searchValidTracks(songData) {
    const accessToken = await this.getAccessToken();
    const validTracks = [];

    for (const artist in songData) {
      const songList = songData[artist];

      for (const trackName of songList) {
        const query = `track:${trackName} artist:${artist}`;
        
        try {
          const searchRes = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              q: query,
              type: 'track',
              limit: 1,
            },
          });

          const foundTrack = searchRes.data.tracks.items[0];
          if (foundTrack) {
            validTracks.push({
              name: foundTrack.name,
              artist: foundTrack.artists.map(a => a.name).join(', '),
              uri: foundTrack.uri,
              image: foundTrack.album?.images?.[0]?.url || null,
              spotifyUrl: foundTrack.external_urls?.spotify || null
            });
          } else {
            console.warn(`❌ Not found on Spotify: ${artist} - ${trackName}`);
          }
        } catch (err) {
          console.error(`❌ Error searching for ${artist} - ${trackName}:`, err.message);
        }
      }
    }

    return validTracks;
  }

  /**
   * Add tracks to a Spotify playlist
   * @param {Array} validTracks - Array of track objects with uri property
   * @param {string} playlistId - Spotify playlist ID
   * @param {string} accessToken - User's Spotify access token
   */
  async addTracksToPlaylist(validTracks, playlistId, accessToken) {
    // Validate input parameters
    if (!validTracks || !Array.isArray(validTracks)) {
      console.error('❌ Invalid validTracks parameter:', validTracks);
      throw new Error('validTracks must be a valid array');
    }

    if (!playlistId) {
      console.error('❌ Missing playlistId parameter');
      throw new Error('playlistId is required');
    }

    if (!accessToken) {
      console.error('❌ Missing accessToken parameter');
      throw new Error('accessToken is required');
    }

    // Filter out tracks without URIs and create unique list
    const tracksWithUris = validTracks.filter(track => track && track.uri);
    const uniqueUris = [...new Set(tracksWithUris.map(track => track.uri))];

    console.log(`📊 Processing ${validTracks.length} tracks, ${tracksWithUris.length} with URIs, ${uniqueUris.length} unique URIs`);

    if (uniqueUris.length === 0) {
      console.warn('⚠️ No valid track URIs to add.');
      return;
    }

    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: uniqueUris },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`✅ Added ${uniqueUris.length} unique track(s) to the playlist.`);
    } catch (err) {
      console.error('❌ Error adding tracks to playlist:', err.message);
      throw err;
    }
  }

  /**
   * Get Spotify authorization URL for user login
   * @returns {string} Spotify authorization URL
   */
  getAuthorizationUrl() {
    const scope = SPOTIFY_CONFIG.SCOPES.join(' ');
    const queryParams = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      scope,
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
    });
    
    return `https://accounts.spotify.com/authorize?${queryParams.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from Spotify
   * @returns {Object} Token response with access_token
   */
  async exchangeCodeForToken(code) {
    try {
      const tokenRes = await axios.post(
        'https://accounts.spotify.com/api/token',
        qs.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
          client_id: SPOTIFY_CONFIG.CLIENT_ID,
          client_secret: SPOTIFY_CONFIG.CLIENT_SECRET,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return tokenRes.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error.message);
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  /**
   * Get current user's Spotify profile
   * @param {string} accessToken - User's Spotify access token
   * @returns {Object} User profile data
   */
  async getCurrentUser(accessToken) {
    try {
      const userRes = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return userRes.data;
    } catch (error) {
      console.error('Error getting current user:', error.message);
      throw new Error('Failed to get current user profile');
    }
  }

  /**
   * Create a new Spotify playlist
   * @param {string} userId - Spotify user ID
   * @param {string} name - Playlist name
   * @param {string} description - Playlist description
   * @param {string} accessToken - User's Spotify access token
   * @returns {Object} Created playlist data
   */
  async createPlaylist(userId, name, description, accessToken) {
    try {
      const playlistRes = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name,
          description,
          public: false,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return playlistRes.data;
    } catch (error) {
      console.error('Error creating playlist:', error.message);
      throw new Error('Failed to create Spotify playlist');
    }
  }
}

module.exports = new SpotifyService();
