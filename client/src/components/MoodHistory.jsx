import React, { useEffect, useState } from 'react';
import { getMoodHistory } from '../api/moodApi';
import { useNavigate } from 'react-router-dom';

const formatMood = (mood) => {
  return mood
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function MoodHistory({ isGuest }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMoods, setExpandedMoods] = useState({});
  const navigate = useNavigate();
  console.log(isGuest);

  useEffect(() => {
    if (isGuest) {
      setLoading(false);
      return;
    }

    async function fetchHistory() {
      try {
        const data = await getMoodHistory();
        const sortedData = [...data].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setHistory(sortedData);
        const initialExpanded = {};
        sortedData.forEach((item, index) => {
          const key = item.mood_id || `mood-${index}`;
          initialExpanded[key] = false;
        });
        setExpandedMoods(initialExpanded);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [isGuest]);

  const toggleMood = (key) => {
    setExpandedMoods(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '4rem auto',
        padding: '2rem',
        backgroundColor: '#f0f8ff',
        border: '1px solid #cce4ff',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#333',
        fontFamily: 'Inter, sans-serif',
        fontSize: '1.2rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
      }}>
        ⏳ <strong>Loading your mood history...</strong>
      </div>
    );
  }
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (isGuest) {
    return (
      <div style={{ 
        maxWidth: '800px', 
        margin: '2rem auto', 
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#fff8e1',
        borderRadius: '8px',
        border: '1px solid #ffecb3'
      }}>
        <h2 style={{ marginTop: 0 }}>🔒 History Not Saved</h2>
        <p>You're browsing in guest mode. Log in to save your mood history permanently.</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '4rem auto',
        padding: '2rem',
        backgroundColor: '#fff9db',
        border: '1px solid #ffeaa7',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#444',
        fontFamily: 'Inter, sans-serif',
        fontSize: '1.2rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
      }}>
       <strong>No mood history yet.</strong><br />
        Try entering a mood to get started!
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{
        fontSize: '2.25rem',
        fontWeight: 700,
        marginBottom: '2rem',
        textAlign: 'center',
        color: '#333'
      }}>
        🎵 Your Mood History
      </h1>
  
      {history.map(({ mood, mood_id, created_at, tracks }, index) => {
        const moodKey = mood_id || `mood-${index}`;
        
        return (
          <div key={moodKey} style={{
            marginBottom: '1.75rem',
            border: '1px solid #ddd',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
            transition: 'box-shadow 0.2s ease',
          }}>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                backgroundColor: expandedMoods[moodKey] ? '#f0f4f8' : '#f9fbfc',
                borderBottom: expandedMoods[moodKey] ? '1px solid #ccc' : '1px solid #eee',
                transition: 'background-color 0.25s ease',
              }}
              onClick={() => toggleMood(moodKey)}
            >
              <h2 style={{
                margin: 0,
                fontSize: '1.25rem',
                color: '#333',
                fontWeight: 600
              }}>
                {formatMood(mood)} — <span style={{ color: '#888', fontSize: '1rem' }}>{formatDate(created_at)}</span>
              </h2>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{
                  transform: expandedMoods[moodKey] ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <path d="M5 7L10 12L15 7" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
  
            {expandedMoods[moodKey] && (
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{
                  display: 'grid',
                  gap: '1rem',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                }}>
                  {tracks.map((track, i) => (
                    <div key={`track-${moodKey}-${i}`} style={{
                      padding: '1rem',
                      backgroundColor: '#fafafa',
                      borderRadius: '10px',
                      border: '1px solid #eee',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#222'
                      }}>
                        {track.name}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#555' }}>
                        by {track.artist}
                      </div>
                      {track.url ? (
                        <a
                          href={track.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            marginTop: '0.5rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#1DB954',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                          }}
                        >
                          Play on Spotify
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="#1DB954">
                            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.669 11.538a.498.498 0 01-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 01-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 01.166.686zm.979-2.178a.624.624 0 01-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 01-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 01.206.858zm.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 11-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 01-.764 1.288z"/>
                          </svg>
                        </a>
                      ) : (
                        <span style={{
                          color: '#999',
                          fontStyle: 'italic',
                          fontSize: '0.85rem'
                        }}>
                          No Spotify link available
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
  
}
