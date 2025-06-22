require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const db = require('./db');
const qs = require('qs');
const OpenAI = require('openai');
const { createFirstPrompt, createSecondPrompt, createSecondPromptWithArtist } = require('./prompts');
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const scopes = [
  'playlist-modify-private',
  'playlist-modify-public',
  'user-read-private',
  'user-read-email'
];
let validTrackInfo;
let lastEntireInfoSaved = null;
let playlistName;
let playlistDescription;



const app = express();
app.use(cors());
// const allowedOrigins = [process.env.CLIENT_URL]; // e.g., your Render client URL
// app.use(cors({ origin: allowedOrigins }));

app.use(express.json());



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



let spotifyToken = null;
async function getSpotifyToken() {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const data = qs.stringify({ grant_type: 'client_credentials' });
  const headers = {
    Authorization:
      'Basic ' +
      Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'),
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const response = await axios.post(tokenUrl, data, { headers });
  spotifyToken = response.data.access_token;
  return spotifyToken;
}

async function searchValidTracks(songData, access_token) {
  const validTracks = [];

  for (const artist in songData) {
    const songList = songData[artist];

    for (const trackName of songList) {
      const query = `track:${trackName} artist:${artist}`;
      try {
        const searchRes = await axios.get('https://api.spotify.com/v1/search', {
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



function safeParseGPT(gptMessage) {
    let raw = gptMessage.trim();
  
    if (raw.startsWith("```json")) raw = raw.slice(7, -3).trim();
    else if (raw.startsWith("```")) raw = raw.slice(3, -3).trim();
    raw = raw.replace(/,\s*([}\]])/g, '$1');
  
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error("Invalid GPT output:", raw);
      throw new Error("Failed to parse GPT response as JSON");
    }
  }



  function normalizeSongData(input) {
    const result = {};
  
    for (const key in input) {
      const value = input[key];
  
      // Case 1: Flat artist → [songs]
      if (Array.isArray(value)) {
        result[key] = value;
      }
  
      // Case 2: Nested genre → artist → song
      else if (typeof value === 'object' && value !== null) {
        for (const artist in value) {
          const song = value[artist];
  
          // If already in result, append
          if (result[artist]) {
            if (Array.isArray(song)) {
              result[artist].push(...song);
            } else {
              result[artist].push(song);
            }
          } else {
            // If not in result, create new array
            result[artist] = Array.isArray(song) ? [...song] : [song];
          }
        }
      }
    }
  
    return result;
  }

function generatePlaylistMeta({ mood = '', themes = [], recommended_genres = [], artist = [] }) {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const moodTitle = mood.split(' ').map(capitalize).join(' ');
  const primaryTheme = capitalize(themes[0] || 'Mood');
  const fallbackGenre = recommended_genres[0] || 'Vibes';
  const themeList = themes.length ? themes.map(capitalize).join(', ') : moodTitle;
  const genreList = recommended_genres.join(', ');

  // Emoji keyword matching
  const pickEmoji = () => {
    const keywords = ['love', 'romantic', 'nostalgic', 'calm', 'joy', 'party', 'sad', 'reflect', 'night', 'dream', 'peace'];
    const emojiMap = {
      love: '💘', romantic: '💞', nostalgic: '📻', calm: '🌙',
      joy: '🌼', party: '🎉', sad: '🫧', reflect: '🧘', night: '🌌', dream: '💭', peace: '🍃'
    };
    const search = [mood, ...themes].join(' ').toLowerCase();
    for (const word of keywords) if (search.includes(word)) return emojiMap[word];
    return '🎶';
  };
  const emoji = pickEmoji();

  // Naming templates
  const nameTemplates = [
    `${emoji} Echoes of ${primaryTheme}`,
    `${emoji} ${capitalize(fallbackGenre)} Bloom`,
    `${emoji} Vibes for ${moodTitle}`,
    `🎧 Tunes for ${primaryTheme}`,
    `${emoji} The ${capitalize(fallbackGenre)} Tapes`,
    `${emoji} Wrapped in ${primaryTheme}`,
    `${capitalize(fallbackGenre)} ✦ ${primaryTheme} Flow`,
    `${emoji} Sounds Like ${capitalize(themes[1] || fallbackGenre)}`,
    `✨ ${primaryTheme} in ${capitalize(fallbackGenre)}`,
    `${emoji} ${capitalize(primaryTheme)} Radiowave`,
    `🌈 Curated for ${moodTitle}`,
    `${emoji} Soul of ${capitalize(fallbackGenre)}`
  ];
  
  const name = "MoodTune: " + nameTemplates[Math.floor(Math.random() * nameTemplates.length)];

  // Compact description
  const description = artist.length
    ? `A mood of ${mood}, featuring ${artist.join(', ')} in a blend of ${genreList}.`
    : `A mood of ${mood}, captured in ${genreList}.`;

  return { name, description };
}


app.post('/api/mood', async (req, res) => {
  const { mood } = req.body;
  console.log("Request Body:", mood);
  if (!mood) return res.status(400).json({ error: 'Mood is required' });

  try {

    //Based on the user input, send a welll-structured prompt to OpenAI to get the user's mood and song descriptions
    const promptFirst = createFirstPrompt(mood);
    const gptResponseFirst = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: promptFirst }],
    });
  

    //Safely parse the response and log it out moodDescriptions
    let moodDescriptions;
    try {
        moodDescriptions  = safeParseGPT(gptResponseFirst.choices[0].message.content);
        // console.log('Parsed GPT parameters First:', moodDescriptions);
    } catch (err) {
        throw new Error('Failed to parse GPT response as JSON');
    }


    const playlistMeta = generatePlaylistMeta(moodDescriptions);
    playlistName = playlistMeta.name;
    playlistDescription = playlistMeta.description;


    //Based on the reponse of the first prompt, send the second welll-structured prompt to OpenAI to get the songs
    let promptSec, numberOfArtist;
    if (!moodDescriptions.artist || moodDescriptions.artist.length === 0) {
        promptSec = createSecondPrompt(moodDescriptions);
        console.log("not using artist one");
    } else {
        numberOfArtist = moodDescriptions.artist.length;
        promptSec = createSecondPromptWithArtist(moodDescriptions, numberOfArtist);
        console.log("using artist one");
    }
      
    const gptResponseSec = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: promptSec }],
      });
      

    //Safely parse the response and log it out
    let parsedSec;
    try {
        parsedSec = safeParseGPT(gptResponseSec.choices[0].message.content);

    } catch (err) {
        throw new Error('Failed to parse GPT response as JSON');
    }
    
    const songData = normalizeSongData(parsedSec);
    spotifyToken = await getSpotifyToken();
    validTrackInfo = await searchValidTracks(songData, spotifyToken);


    //Store the mood and song data to global
    lastEntireInfoSaved = { moodDescriptions, validTrackInfo };
    console.log(lastEntireInfoSaved);
    res.json(lastEntireInfoSaved);

  } catch (err) {
    console.error('Error processing mood:', {
      message: err.message,
      url: err?.config?.url,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    
  }
});






async function addTracksToPlaylist(validTracks, playlistId, access_token) {
  const uniqueUris = [...new Set(validTracks.map(track => track.uri))];

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
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Added ${uniqueUris.length} unique track(s) to the playlist.`);
  } catch (err) {
    console.error('❌ Error adding tracks to playlist:', err.message);
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
    const validTracks = await lastEntireInfoSaved?.validTrackInfo;
    if (!validTracks || validTracks.length === 0) {
      return res.status(400).send('No valid tracks available to add to playlist.');
    }
  
    await addTracksToPlaylist(validTracks, playlistId, access_token);
  
    res.send(`
      <script>
        window.opener.postMessage({ playlistUrl: "${playlistRes.data.external_urls.spotify}" }, "*");
        window.close();
      </script>
    `);

    } catch (err) {
      console.error('Error during Spotify auth or playlist creation:', err.response?.data || err.message);
      res.status(500).send('Something went wrong during authentication or playlist creation.');
    }
  });




app.get('/api/history', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT moods.mood, moods.created_at, json_agg(json_build_object('name', tracks.name, 'artist', tracks.artist)) AS tracks
      FROM moods
      JOIN tracks ON tracks.mood_id = moods.id
      GROUP BY moods.id
      ORDER BY moods.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
