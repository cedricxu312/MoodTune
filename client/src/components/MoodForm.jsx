import React, { useState, useEffect, useRef } from 'react';
import { postMood } from '../api/moodApi';

/**
 * MoodForm Component
 * 
 * A comprehensive form component that allows users to:
 * - Input their mood via text or voice
 * - Submit mood for AI analysis and song recommendations
 * - Create Spotify playlists from the recommendations
 * 
 * @param {Function} onMoodFetched - Callback when mood is processed and tracks are received
 * @param {Function} setShowCreateButton - Function to show/hide playlist creation button
 * @param {boolean} showCreateButton - Whether to show the playlist creation button
 * @param {string} suggestedMood - Pre-filled mood suggestion (optional)
 */
export default function MoodForm({ onMoodFetched, setShowCreateButton, showCreateButton, suggestedMood }) {
  // Form state
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Playlist creation state
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState(null);
  
  // Voice recognition state
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  /**
   * Initialize suggested mood if provided
   */
  useEffect(() => {
    if (suggestedMood) {
      setMood(suggestedMood);
    }
  }, [suggestedMood]);

  /**
   * Initialize speech recognition capabilities
   * Sets up Web Speech API for voice input
   */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMood((prev) => prev + (prev ? ' ' : '') + transcript);
        setListening(false);
      };
      
      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  /**
   * Handle microphone button click
   * Toggles voice recognition on/off
   */
  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setListening(!listening);
  };

  /**
   * Handle form submission
   * Sends mood to backend for AI analysis and song recommendations
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mood.trim()) {
      setError('Please enter a mood');
      return;
    }
    
    setLoading(true);
    setError(null);
    setPlaylistCreated(false);
    setPlaylistUrl(null);
    setShowCreateButton(false);
    
    try {
      const tracks = await postMood(mood.trim());
      onMoodFetched(tracks);
      setShowCreateButton(true);
      setMood('');
    } catch (error) {
      setError(error.message || 'Failed to fetch tracks, please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Spotify playlist creation
   * Opens OAuth popup and handles the response
   */
  const handleCreatePlaylist = () => {
    const popup = window.open(
      'http://localhost:3001/create-playlist', 
      'spotify-auth', 
      'width=500,height=600'
    );
    
    if (!popup) {
      alert('Popup blocked! Please allow popups and try again.');
      return;
    }
    
    const handleMessage = (event) => {
      if (event.data?.playlistUrl) {
        setPlaylistUrl(event.data.playlistUrl);
        setPlaylistCreated(true);
        window.removeEventListener('message', handleMessage);
        popup.close();
      }
    };
    
    window.addEventListener('message', handleMessage);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Mood Input Group */}
      <div style={styles.inputGroup}>
        <input
          type="text"
          placeholder="Describe your mood..."
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          disabled={loading}
          style={styles.input}
        />
        
        {/* Voice Input Button */}
        <button
          type="button"
          onClick={handleMicClick}
          style={{
            ...styles.primaryBtn,
            backgroundColor: listening ? '#f87171' : '#e0e7ff',
            color: listening ? 'white' : '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {listening ? (
            <>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                fill="currentColor" 
                viewBox="0 0 16 16"
              >
                <path d="M12.734 9.613A4.995 4.995 0 0 0 13 8V7a.5.5 0 0 0-1 0v1c0 .274-.027.54-.08.799l.814.814zm-2.522 1.72A4 4 0 0 1 4 8V7a.5.5 0 0 0-1 0v1a5 5 0 0 0 4.5 4.975V15h-3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-3v-2.025a4.973 4.973 0 0 0 2.43-.923l-.718-.719zM11 7.88V3a3 3 0 0 0-5.842-.963L11 7.879zM5 6.12l4.486 4.486A3 3 0 0 1 5 8V6.121zm8.646 7.234-12-12 .708-.708 12 12-.708.707z"/>
              </svg>
              Listening...
            </>
          ) : (
            <>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                fill="currentColor" 
                viewBox="0 0 16 16"
              >
                <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/>
                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
              </svg>
              Speak
            </>
          )}
        </button>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.primaryBtn,
            backgroundColor: loading ? '#a5b4fc' : '#6366f1',
            color: 'white',
          }}
        >
          {loading ? (
            <>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                fill="currentColor" 
                viewBox="0 0 16 16"
                style={{ marginRight: '8px' }}
                className="spinner"
              >
                <path d="M8 3a5 5 0 1 0 5 5H8V3z"/>
              </svg>
              Processing mood... This may take 15-20 seconds
            </>
          ) : (
            'Get Tracks'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Playlist Creation Section */}
      {showCreateButton && (
        <>
          <button
            type="button"
            onClick={handleCreatePlaylist}
            disabled={playlistCreated}
            style={{
              ...styles.spotifyBtn,
              backgroundColor: playlistCreated ? '#f8fafc' : '#1DB954',
              border: playlistCreated ? '1px solid #e2e8f0' : 'none',
              color: playlistCreated ? '#64748b' : 'white',
              cursor: playlistCreated ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              marginBottom: playlistCreated ? '0.5rem' : 0
            }}
          >
            {playlistCreated ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#10b981" viewBox="0 0 16 16">
                  <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z"/>
                  <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z"/>
                </svg>
                Playlist Created
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.669 11.538a.498.498 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686zm.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858zm.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 0 1-.764 1.288z"/>
                </svg>
                Create Spotify Playlist
              </>
            )}
          </button>

          {/* Playlist Success Message */}
          {playlistUrl && (
            <div style={{
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease-out',
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              marginTop: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#10b981" viewBox="0 0 16 16">
                  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
                </svg>
                <h4 style={{ margin: 0, color: '#166534', fontWeight: 600 }}>Playlist ready!</h4>
              </div>
              <a 
                href={playlistUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  color: '#1DB954',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Open in Spotify
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
                </svg>
              </a>
            </div>
          )}
        </>
      )}
    </form>
  );
}

// Component styles
const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    minWidth: '250px',
  },
  iconButton: {
    padding: '0.7rem 1.25rem',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  primaryBtn: {
    padding: '0.75rem 1.25rem',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '1rem',
  },
  spotifyBtn: {
    padding: '0.75rem 1.5rem',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    marginTop: '0.5rem',
  },
  result: {
    marginTop: '1rem',
    textAlign: 'center',
    fontSize: '1rem',
  },
  error: {
    color: 'red',
    fontWeight: '500',
    fontSize: '0.95rem',
  },
};
