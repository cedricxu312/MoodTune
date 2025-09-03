const OpenAI = require('openai');
const { OPENAI_CONFIG } = require('../config/constants');
const { createFirstPrompt, createSecondPrompt, createSecondPromptWithArtist } = require('../prompts');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: OPENAI_CONFIG.API_KEY
    });
  }

  /**
   * Safely parse GPT response as JSON
   * Handles common formatting issues in GPT responses
   * @param {string} gptMessage - Raw response from GPT
   * @returns {Object} Parsed JSON object
   */
  safeParseGPT(gptMessage) {
    let raw = gptMessage.trim();
  
    // Remove markdown code blocks if present
    if (raw.startsWith("```json")) {
      raw = raw.slice(7, -3).trim();
    } else if (raw.startsWith("```")) {
      raw = raw.slice(3, -3).trim();
    }
    
    // Fix trailing commas before closing brackets/braces
    raw = raw.replace(/,\s*([}\]])/g, '$1');
  
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error("Invalid GPT output:", raw);
      throw new Error("Failed to parse GPT response as JSON");
    }
  }

  /**
   * Normalize song data from GPT response
   * Converts nested structures to flat artist → songs mapping
   * @param {Object} input - Raw song data from GPT
   * @returns {Object} Normalized song data
   */
  normalizeSongData(input) {
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

  /**
   * Generate playlist metadata from mood descriptions
   * @param {Object} moodData - Mood data from GPT
   * @returns {Object} Playlist name and description
   */
  generatePlaylistMeta({ mood = '', themes = [], recommended_genres = [], artist = [] }) {
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

  /**
   * Get first mood analysis from GPT
   * @param {string} mood - User's mood input
   * @returns {Object} Parsed mood descriptions
   */
  async getMoodAnalysis(mood) {
    try {
      const promptFirst = createFirstPrompt(mood);
      const gptResponseFirst = await this.openai.chat.completions.create({
        model: OPENAI_CONFIG.MOOD_ANALYSIS_MODEL,
        messages: [{ role: 'user', content: promptFirst }],
      });

      return this.safeParseGPT(gptResponseFirst.choices[0].message.content);
    } catch (error) {
      console.error('Error getting mood analysis:', error.message);
      throw new Error('Failed to get mood analysis from GPT');
    }
  }

  /**
   * Get song recommendations from GPT
   * @param {Object} moodDescriptions - Mood analysis from first prompt
   * @returns {Object} Parsed song recommendations
   */
  async getSongRecommendations(moodDescriptions) {
    try {
      let promptSec;
      if (!moodDescriptions.artist || moodDescriptions.artist.length === 0) {
        promptSec = createSecondPrompt(moodDescriptions);
      } else {
        promptSec = createSecondPromptWithArtist(moodDescriptions, moodDescriptions.artist.length);
      }

      const gptResponseSec = await this.openai.chat.completions.create({
        model: OPENAI_CONFIG.SONG_RECOMMENDATIONS_MODEL,
        messages: [{ role: 'user', content: promptSec }],
      });

      return this.safeParseGPT(gptResponseSec.choices[0].message.content);
    } catch (error) {
      console.error('Error getting song recommendations:', error.message);
      throw new Error('Failed to get song recommendations from GPT');
    }
  }
}

module.exports = new OpenAIService();
