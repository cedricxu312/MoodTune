import api from './api.js';

export async function login(emailOrUsername, password) {
  try {
    const response = await api.post('/login', { emailOrUsername, password });
    return response.data;
  } catch (err) {
    console.error('Auth error details:', err);
    if (err.response) {
      throw new Error(err.response.data?.error || 'Login failed');
    } else {
      throw new Error('Network error or server is unreachable');
    }
  }
}
export async function signup(email, password, username) {
    try {
      const response = await api.post('/signup', { email, password, username });
      return response.data;
    } catch (err) {
      console.error('Signup error:', err);
      throw new Error(err.response?.data?.error || 'Signup failed');
    }
  }
  

export function logout() {
  localStorage.removeItem('token');
}

export function getToken() {
  return localStorage.getItem('token');
}
