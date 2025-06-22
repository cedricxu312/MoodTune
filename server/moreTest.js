require('dotenv').config();
const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
let accessToken = null;
let refreshToken = null;

// GLOBAL CONFIG
const playlistName = 'Mood-Based PlaylistTESTTTT';
const playlistDescription = 'A playlist generated from your mood!';


const songData1 = {
    SZA: ['Good Days'],
    'Daniel Caesar': ['Get You (feat. Kali Uchis)'],
    'Brent Faiyaz': ['Dead Man Walking'],
    'Jorja Smith': ['Blue Lights'],
    'H.E.R.': ['Best Part (feat. Daniel Caesar)'],
    Lorde: ['Liability'],
    'The Japanese House': ['Something Has to Change'],
    Clairo: ['Bags'],
    'Phoebe Bridgers': ['Motion Sickness'],
    Shura: ['religion (u can lay your hands on me)'],
    'Elliott Smith': ['Between the Bars'],
    'Bright Eyes': ['Lua'],
    'The Antlers': ['Kettering'],
    'Julien Baker': ['Sprained Ankle'],
    'Sufjan Stevens': ['Fourth of July']
  };
  const songData = {
    Twice: [ 'TT', 'Likey', 'Cheer Up', 'What is Love?', 'Feel Special' ],
    EXO: [ 'Love Shot', 'Ko Ko Bop', 'Tempo', 'Power' ]
  }


async function addTracksToSpotify(songData, playlistId, access_token) {
  const trackUris = new Set(); // Prevent duplicates

  for (const artist in songData) {
    const songList = songData[artist];

    for (const trackName of songList) {
      const query = `track:${trackName} artist:${artist}`;
      try {
        const searchRes = await axios.get(`https://api.spotify.com/v1/search`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          params: {
            q: query,
            type: 'track',
            limit: 1,
          },
        });

        const foundTrack = searchRes.data.tracks.items[0];
        if (foundTrack) {
          trackUris.add(foundTrack.uri);
        } else {
          console.warn(`Not found on Spotify: ${artist} - ${trackName}`);
        }
      } catch (searchErr) {
        console.error(`Error searching for ${artist} - ${trackName}:`, searchErr.message);
      }
    }
  }

  if (trackUris.size > 0) {
    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: Array.from(trackUris) },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`✅ Added ${trackUris.size} unique track(s) to the playlist.`);
    } catch (err) {
      console.error('❌ Error adding tracks to playlist:', err.message);
    }
  } else {
    console.warn('⚠️ No valid track URIs to add.');
  }
}




// Step 1: User clicks "Create Playlist" button
app.get('/create-playlist', (req, res) => {
    const scope = 'playlist-modify-public playlist-modify-private';
    const queryParams = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope,
        redirect_uri: REDIRECT_URI,
    });
  
    res.redirect(`https://accounts.spotify.com/authorize?${queryParams.toString()}`);
  });
  
  // Step 2: After Spotify login → Redirect to /callback
  app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
  
    if (!code) return res.status(400).send('Missing code');
  
    try {
      // Step 3: Exchange code for tokens
      const tokenRes = await axios.post(
        'https://accounts.spotify.com/api/token',
        qs.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
  
      const { access_token } = tokenRes.data;
  
      // Step 4: Get user ID
      const userRes = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
  
      const userId = userRes.data.id;
  
      // Step 5: Create playlist
      const playlistRes = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
            name: playlistName,
            description: playlistDescription,
            public: false,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const playlistId = playlistRes.data.id;

    // Step 6: extract song info and then add to the playlist
    await addTracksToSpotify(songData, playlistId, access_token);
  
      res.send(`
        <h2>✅ Playlist Created Successfully!</h2>
        <p><a href="${playlistRes.data.external_urls.spotify}" target="_blank">🎵 Open in Spotify</a></p>
      `);
    } catch (err) {
      console.error('Error during Spotify auth or playlist creation:', err.response?.data || err.message);
      res.status(500).send('Something went wrong during authentication or playlist creation.');
    }
  });
  
  app.listen(3001, () => {
    console.log('Server running at http://127.0.0.1:3001');
  });