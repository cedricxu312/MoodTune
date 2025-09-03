import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Component imports
import Modal from './components/Modal';
import NavBar from './components/NavBar';
import AuthForm from './components/AuthForm';

// Page imports
import Home from './pages/Home';
import MoodSearch from './pages/MoodSearch';
import Contact from './pages/Contact';
import About from './pages/About';
import MoodHistory from './components/MoodHistory';

/**
 * Main App Component
 * 
 * Handles:
 * - Authentication state management
 * - Routing between pages
 * - User session management
 * - Guest mode functionality
 */
export default function App() {
  // Authentication state
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [skipLogin, setSkipLogin] = useState(localStorage.getItem('skipLogin') === 'true');
  const [username, setUsername] = useState(null);
  
  // UI state
  const [modalMode, setModalMode] = useState(null);

  /**
   * Decode JWT token and extract username on component mount
   * Runs whenever token changes
   */
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
      } catch (error) {
        console.error("Failed to decode token:", error);
        setUsername(null);
        // Clear invalid token
        handleLogout();
      }
    }
  }, [token]);

  /**
   * Handle successful authentication
   * @param {string} token - JWT token from successful login/signup
   */
  const handleAuthSuccess = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    
    // Disable guest mode when user authenticates
    localStorage.setItem('skipLogin', 'false');
    setSkipLogin(false);
  
    // Extract and store username from token
    const decoded = jwtDecode(token);
    setUsername(decoded.username);
  
    // Close auth modal
    setModalMode(null);
  };

  /**
   * Enable guest mode - allows users to use app without account
   */
  const handleSkipLogin = () => {
    localStorage.setItem('skipLogin', 'true');
    setSkipLogin(true);
  };

  /**
   * Handle user logout
   * Clears all authentication data and resets state
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('skipLogin');
    setToken(null);
    setSkipLogin(false);
    setUsername(null);
  };

  // Computed authentication states
  const isAuthenticated = token || skipLogin;
  const isGuest = skipLogin && !token;

  // Landing page styles
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
      lineHeight: '1.6',
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
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
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
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
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
      '&:hover': {
        backgroundColor: '#e5e5e5',
        transform: 'translateY(-2px)',
      },
    },
  };

  return (
    <Router>
      {/* Navigation Bar - Only show when authenticated */}
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
          // Landing Page - Show when not authenticated
          <div style={styles.wrapper}>
            <h2 style={styles.title}>Welcome to MoodTune 🎵</h2>

            <p style={styles.subtitle}>
              Let's find the soundtrack to your mood — no account needed.
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

            {/* Authentication Modal */}
            <Modal isOpen={!!modalMode} onClose={() => setModalMode(null)}>
              <AuthForm mode={modalMode} onAuthSuccess={handleAuthSuccess} />
            </Modal>
          </div>
        ) : (
          // Main App Routes - Show when authenticated
          <Routes>
            <Route path="/" element={<Home username={username} isGuest={isGuest} />} />
            <Route path="/search" element={<MoodSearch token={token} />} />
            <Route 
              path="/history" 
              element={<MoodHistory isGuest={isGuest} />} 
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Catch-all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}
