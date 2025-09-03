// import React from 'react';
// import { Link } from 'react-router-dom';
// import Lottie from 'lottie-react';
// import waveAnimation from '../components/waveAnimation.json';


// export default function Home({ username, isGuest }) {
//   const welcomeText = username
//     ? `MoodTune`
//     : isGuest
//     ? `MoodTune`
//     : `MoodTune`;
  
//     const tagline = username
//     ? `Hi ${username}, welcome back.`
//     : isGuest
//     ? `Your emotions, turned into sound.`
//     : `Your emotions, turned into sound.`;

//   return (
//     <div style={styles.container}>
//       <div style={styles.contentWrapper}>
//         <div style={styles.leftPane}>
//           <h1 style={styles.heading}>{welcomeText}</h1>
//           <p style={styles.tagline}>{tagline}</p>
//           <p style={styles.description}>
//             Whether you're heartbroken, inspired, or just vibing, MoodTune translates your feelings into Spotify playlists using AI-powered mood analysis.
//           </p>
//           <p style={styles.description}>
//             Simply tell us how you feel. We'll take care of the vibe. 🎶
//           </p>
//           <Link to="/search">
//             <button style={styles.ctaButton}>Find My Playlist</button>
//           </Link>
//         </div>
//         <div style={styles.rightPane}>
//   <Lottie 
//     animationData={waveAnimation}
//     loop
//     autoplay
//     style={styles.lottie}
//   />
// </div>


//       </div>
      
//     </div>
//   );
// }

// const styles = {
//   container: {
//     minHeight: 'calc(100vh - 64px)',
//     background: 'linear-gradient(135deg, #6bbcff, #a979ff)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: '2rem',
//     fontFamily: '"Segoe UI", sans-serif',
//     color: '#fff',
//   },
//   contentWrapper: {
//     maxWidth: '1200px',
//     width: '100%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: '2rem',
//     flexWrap: 'wrap',
//   },
//   leftPane: {
//     flex: 1,
//     minWidth: '300px',
//   },
//   heading: {
//     fontSize: '7rem',
//     fontWeight: '800',
//     lineHeight: 1.2,
//     marginBottom: '1rem',
//   },
//   tagline: {
//     fontSize: '1.3rem',
//     fontWeight: '600',
//     marginBottom: '1rem',
//   },
//   description: {
//     fontSize: '1rem',
//     lineHeight: 1.6,
//     marginBottom: '1rem',
//     maxWidth: '600px',
//   },
//   ctaButton: {
//     marginTop: '1.5rem',
//     fontSize: '1.1rem',
//     padding: '0.9rem 2rem',
//     backgroundColor: '#ffffff',
//     color: '#5c33ff',
//     border: 'none',
//     borderRadius: '12px',
//     cursor: 'pointer',
//     fontWeight: '600',
//     boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//     transition: 'transform 0.2s ease, background-color 0.2s ease',
//   },
//   heroImage: {
//     width: '100%',
//     maxWidth: '400px',
//     borderRadius: '16px',
//     boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
//   },
//   rightPane: {
//     flex: 1,
//     minWidth: '300px',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
  
//   lottie: {
//     width: '100%',
//     maxWidth: '400px',
//     height: 'auto',
//   },
  
// };


import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import waveAnimation from '../components/waveAnimation.json';

export default function Home({ username, isGuest }) {
  const welcomeText = username
    ? `MoodTune`
    : isGuest
    ? `MoodTune`
    : `MoodTune`;
  
  const tagline = username
    ? `Hey ${username}, welcome back.`
    : isGuest
    ? `Your emotions, turned into sound.`
    : `Your emotions, turned into sound.`;

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.leftPane}>
          <h1 style={styles.heading}>{welcomeText}</h1>
          <p style={styles.tagline}>{tagline}</p>
          <p style={styles.description}>
            Whether you're heartbroken, inspired, or just vibing, MoodTune translates your feelings into Spotify playlists using AI-powered mood analysis.
          </p>
          <p style={styles.description}>
            Simply tell us how you feel. We'll take care of the vibe. 🎶
          </p>
          <Link to="/search">
            <button style={styles.ctaButton}>Find My Playlist</button>
          </Link>
        </div>
        <div style={styles.rightPane}>
          <Lottie 
            animationData={waveAnimation}
            loop
            autoplay
            style={styles.lottie}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 64px)',
    background: 'linear-gradient(135deg, #6bbcff, #a979ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: '"Segoe UI", sans-serif',
    color: '#fff',
    boxSizing: 'border-box',
  },
  contentWrapper: {
    maxWidth: '1200px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  leftPane: {
    flex: 1,
    minWidth: '300px',
    order: 1,
    '@media (maxWidth: 768px)': {
      order: 2,
      textAlign: 'center',
    },
  },
  heading: {
    fontSize: '7rem',
    fontWeight: '800',
    lineHeight: 1.2,
    marginBottom: '1rem',
    '@media (maxWidth: 1024px)': {
      fontSize: '5rem',
    },
    '@media (maxWidth: 768px)': {
      fontSize: '3.5rem',
      textAlign: 'center',
    },
  },
  tagline: {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '1rem',
    '@media (maxWidth: 768px)': {
      fontSize: '1.1rem',
      textAlign: 'center',
    },
  },
  description: {
    fontSize: '1rem',
    lineHeight: 1.6,
    marginBottom: '1rem',
    maxWidth: '600px',
    '@media (maxWidth: 768px)': {
      fontSize: '0.95rem',
      textAlign: 'center',
      maxWidth: '100%',
    },
  },
  ctaButton: {
    marginTop: '1.5rem',
    fontSize: '1.1rem',
    padding: '0.9rem 2rem',
    backgroundColor: '#ffffff',
    color: '#5c33ff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
    '@media (maxWidth: 768px)': {
      width: '100%',
      padding: '0.8rem 1.5rem',
      fontSize: '1rem',
    },
    ':hover': {
      transform: 'translateY(-2px)',
      backgroundColor: '#f0f0f0',
    },
  },
  rightPane: {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    order: 2,
    '@media (maxWidth: 768px)': {
      order: 1,
      minWidth: '250px',
      marginBottom: '2rem',
    },
  },
  lottie: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    '@media (maxWidth: 768px)': {
      maxWidth: '300px',
    },
  },
};

// Convert the style object to use CSS-in-JS media queries properly
const processedStyles = {};
Object.keys(styles).forEach(key => {
  processedStyles[key] = styles[key];
  if (styles[key]['@media (max-width: 768px)']) {
    processedStyles[key]['@media (max-width: 768px)'] = styles[key]['@media (max-width: 768px)'];
  }
  if (styles[key]['@media (maxWidth: )']) {
    processedStyles[key]['@media (maxWidth: 1024px)'] = styles[key]['@media (max-width: 1024px)'];
  }
});