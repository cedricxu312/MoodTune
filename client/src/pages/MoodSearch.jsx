import React, { useState } from 'react';
import MoodForm from '../components/MoodForm';
import TrackList from '../components/TrackList';
import { postMood } from '../api/moodApi';

const allMoodSuggestions = [
  "I'm feeling nostalgic about my childhood summers.",
  "I need background music for deep focus.",
  "Just got dumped. Need something emotional.",
  "It's raining. I want something cozy.",
  "Good songs for a late-night drive?",
  "Hit me with some songs by the Kpop group NewJeans.",
  "Hyped for the gym—give me energy.",
  "Need lo-fi beats for working quietly.",
  "Cooking dinner and sipping wine.",
  "Longing for home. Play something warm.",
  "Songs for a sunny afternoon walk.",
  "Woke up feeling blissfully calm.",
  "Feeling rebellious and fired up.",
  "Craving ambient soundscapes to relax.",
  "Feeling like dancing around alone.",
  "Got the blues. I need something moody.",
  "Give me chill music for sunset.",
  "What would match a fantasy novel mood?",
  "Soft sounds for writing late at night.",
  "Songs that sound like ocean waves.",
  "I just went to Ed Sheeren's concert, I want more of his songs!",
  "I just met a korean girl and I think I have a crush on her.",
  "I've been hearing the Kpop band Enhypen a lot. Let me try some their music",
  "I want some classical violin songs.",
];

export default function MoodSearch() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateButton, setShowCreateButton] = useState(false);
  const [suggestedMood, setSuggestedMood] = useState('');

  const getRandomSuggestions = (count = 5) => {
    const shuffled = [...allMoodSuggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const [suggestions, setSuggestions] = useState(getRandomSuggestions());
  const shuffleSuggestions = () => setSuggestions(getRandomSuggestions());

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <h2 style={styles.title}>What’s your vibe today?</h2>
        <p style={styles.subtitle}>Tell me how do you feel or pick an example to get a personalized playlist.</p>

        <div style={styles.suggestionContainer}>
          {suggestions.map((sentence, index) => (
            <button
              key={index}
              onClick={() => setSuggestedMood(sentence)}
              style={styles.suggestionButton}
            >
              {sentence}
            </button>
          ))}
          <button onClick={shuffleSuggestions} style={styles.shuffleButton}>
            New Suggestions
          </button>
        </div>

        <MoodForm
          onMoodFetched={(tracks) => setTracks(tracks)}
          setShowCreateButton={setShowCreateButton}
          showCreateButton={showCreateButton}
          suggestedMood={suggestedMood}
        />

        {loading && <p style={styles.status}>Loading...</p>}
        {error && <p style={{ ...styles.status, color: 'red' }}>{error}</p>}

        {!loading && tracks.validTrackInfo?.length > 0 && (
          <>
            <h3 style={styles.trackHeader}>Recommended Tracks</h3>
            <TrackList tracks={tracks} />
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #6bbcff, #a979ff)',
    padding: '3rem 1rem',
    fontFamily: '"Segoe UI", sans-serif',
  },
  inner: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    textAlign: 'center',
    color: '#555',
    marginBottom: '1.5rem',
  },
  suggestionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  suggestionButton: {
    fontSize: '1rem',
    padding: '0.9rem 1.25rem',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#f0f4ff',
    color: '#333',
    textAlign: 'left',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  shuffleButton: {
    fontSize: '1rem',
    padding: '0.6rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    alignSelf: 'center',
    marginTop: '1rem',
    cursor: 'pointer',
  },
  trackHeader: {
    marginTop: '2rem',
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  status: {
    textAlign: 'center',
    marginTop: '1rem',
  },
};