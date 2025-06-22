import React from 'react';

function generateMoodDescription({ mood = '', themes = [], recommended_genres = [], artist = [] }) {
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const moodTitle = mood
    .split(' ')
    .map(capitalize)
    .join(' ');

  const themeList = themes.length > 0
    ? themes.map(t => t.toLowerCase()).join(', ')
    : 'varied emotions';

  const genreList = recommended_genres.length > 0
    ? recommended_genres.map(g => g.toLowerCase()).join(', ')
    : 'diverse genres';

  const artistLine =
    artist && artist.length > 0
      ? `featuring ${artist.join(', ')}, `
      : '';

  return `A blend of ${genreList}, ${artistLine}tuned to the mood of "${moodTitle}" and themes of ${themeList}.`;
}

export default function TrackList({ tracks }) {
  if (!tracks || !tracks.moodDescriptions || !tracks.validTrackInfo) return null;

  const trackList = tracks.validTrackInfo;
  const moodSummary = generateMoodDescription(tracks.moodDescriptions);

  return (
    <div style={styles.container}>
      <div style={styles.summaryBox}>
        <h3 style={styles.summaryTitle}>Your Mood-Based Playlist 🎧</h3>
        <p style={styles.summaryText}>{moodSummary}</p>
        <br/>
        <p>Click the track block to play that song in Spotify.</p>
      </div>

      <div style={styles.grid}>
        {trackList.map((track, index) => (
          <a
            key={index}
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.card}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = styles.card.boxShadow;
            }}
          >
            <img
              src={track.image}
              alt={`${track.name} cover`}
              style={styles.image}
            />
            <div style={styles.cardText}>
              <div style={styles.trackName}>{track.name}</div>
              <div style={styles.artist}>{track.artist}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: '2rem',
    fontFamily: '"Segoe UI", sans-serif',
  },
  summaryBox: {
    backgroundColor: '#eef4ff',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  summaryTitle: {
    fontSize: '1.4rem',
    marginBottom: '0.75rem',
    color: '#1e3a8a',
  },
  summaryText: {
    fontSize: '1rem',
    color: '#374151',
    lineHeight: 1.5,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  card: {
    textDecoration: 'none',
    color: 'inherit',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  cardText: {
    padding: '0.75rem 1rem',
  },
  trackName: {
    fontWeight: '600',
    fontSize: '1rem',
    marginBottom: '0.25rem',
    color: '#111827',
  },
  artist: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
};
