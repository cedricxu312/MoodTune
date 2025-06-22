import Modal from './components/Modal';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import MoodSearch from './pages/MoodSearch';
import Contact from './pages/Contact';
import MoodHistory from './components/MoodHistory';
import About from './pages/About';
import AuthForm from './components/AuthForm';
import { jwtDecode } from 'jwt-decode';



export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [skipLogin, setSkipLogin] = useState(localStorage.getItem('skipLogin') === 'true');
  const [modalMode, setModalMode] = useState(null);
  const [username, setUsername] = useState(null);
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username); // 👈 Save username
      } catch (e) {
        console.error("Failed to decode token:", e);
        setUsername(null);
      }
    }
  }, [token]);

  const handleAuthSuccess = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    localStorage.setItem('skipLogin', 'false');
    setSkipLogin(false);
  
    const decoded = jwtDecode(token);
    setUsername(decoded.username); // 👈 Set username from token
  
    setModalMode(null);
  };

  const handleSkipLogin = () => {
    localStorage.setItem('skipLogin', 'true');
    setSkipLogin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('skipLogin');
    setToken(null);
    setSkipLogin(false);
    setUsername(null);
  };

  const isAuthenticated = token || skipLogin;
  const isGuest = skipLogin && !token;

  const styles = {
    wrapper: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6bbcff, #a979ff)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem 1rem',
      fontFamily: '"Segoe UI", sans-serif',
      textAlign: 'center',
      color: 'white',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '1rem',
    },
    subtitle: {
      fontSize: '1.2rem',
      maxWidth: '600px',
      marginBottom: '2rem',
    },
    skipButton: {
      backgroundColor: 'transparent',
      color: '#fff',
      border: '2px solid white',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      marginBottom: '1.5rem',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.3s ease',
    },
    authButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    primaryBtn: {
      backgroundColor: '#ffffff',
      color: '#5c33ff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: '0.3s ease',
    },
    secondaryBtn: {
      backgroundColor: '#f4f4f4',
      color: '#5c33ff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: '0.3s ease',
    },
  };
  

  return (
    <Router>
      {isAuthenticated && (
        <NavBar 
          isAuthenticated={isAuthenticated}
          isGuest={isGuest}
          onLogout={handleLogout}
          username={username}
        />
      )}
      <div>
        {!isAuthenticated ? (
          <div style={styles.wrapper}>
  <h2 style={styles.title}>Welcome to MoodTune 🎵</h2>

  <p style={styles.subtitle}>
    Let’s find the soundtrack to your mood — no account needed.
  </p>

  <button onClick={handleSkipLogin} style={styles.skipButton}>
    Continue without logging in
  </button>

  <div style={styles.authButtons}>
    <button onClick={() => setModalMode('login')} style={styles.primaryBtn}>
      Login
    </button>
    <button onClick={() => setModalMode('signup')} style={styles.secondaryBtn}>
      Sign Up
    </button>
  </div>

  <Modal isOpen={!!modalMode} onClose={() => setModalMode(null)}>
    <AuthForm mode={modalMode} onAuthSuccess={handleAuthSuccess} />
  </Modal>
</div>

        ) : (
          <Routes>
            <Route path="/" element={<Home username={username} isGuest={isGuest} />} />
            <Route path="/search" element={<MoodSearch token={token} />} />
            <Route 
              path="/history" 
              element={<MoodHistory isGuest={isGuest} />} 
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}
