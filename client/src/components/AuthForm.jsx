import React, { useState } from 'react';
import { login, signup } from '../api/authApi';

export default function AuthForm({ mode, onAuthSuccess }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        const data = await login(emailOrUsername, password);
        onAuthSuccess(data.token);
      } else {
        const data = await signup(emailOrUsername, password, username);
        onAuthSuccess(data.token);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>{mode === 'login' ? 'Login to MoodTune' : 'Sign Up for MoodTune'}</h2>

      <input
        type="text"
        value={emailOrUsername}
        onChange={(e) => setEmailOrUsername(e.target.value)}
        placeholder={mode === 'login' ? 'Email or Username' : 'Email'}
        required
        style={styles.input}
      />

      {mode === 'signup' && (
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          style={styles.input}
        />
      )}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        style={styles.input}
      />

      <button type="submit" style={styles.button}>
        {mode === 'login' ? 'Log In' : 'Sign Up'}
      </button>

      {error && <p style={styles.error}>{error}</p>}
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    fontFamily: '"Segoe UI", sans-serif',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#3b82f6',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    width: '100%',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: '0.3s ease',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
  },
};
