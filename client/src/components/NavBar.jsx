import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NavBar({ isAuthenticated, isGuest, onLogout, username }) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        {/* <Link to="/" style={styles.link}>Home</Link> */}
        <Link to="/" style={styles.link}><img src="/file.svg(2)" alt="Home" width="24" /></Link>
        {isAuthenticated && (
          <>
            <Link to="/search" style={styles.link}>Search</Link>
            <Link to="/history" style={styles.link}>History</Link>
          </>
        )}
        <Link to="/about" style={styles.link}>About</Link>
        <Link to="/contact" style={styles.link}>Contact</Link>
      </div>

      <div style={styles.right}>
        {isAuthenticated ? (
          <div style={styles.authGroup}>
            {isGuest ? (
              <span style={styles.guestLabel}>Guest Mode</span>
            ) : (
              username && <span style={styles.username}>Hi, {username}</span>
            )}
            <button style={styles.button} onClick={onLogout}>
              {isGuest ? 'Login' : 'Logout'}
            </button>
          </div>
        ) : (
          <button style={styles.button} onClick={handleLoginClick}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.8rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: '"Segoe UI", sans-serif',
    fontSize: '1.1rem',
    margin: 0,
    borderBottom: '2px solid #3b82f6',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500',
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  guestLabel: {
    fontSize: '0.95rem',
    fontStyle: 'italic',
    color: '#e5e7eb',
  },
  button: {
    padding: '0.5rem 1.1rem',
    fontSize: '1rem',
    color: 'white',
    backgroundColor: 'transparent',
    border: '2px solid white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  }
};