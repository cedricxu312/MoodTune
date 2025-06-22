import api from './api.js';

export async function postMood(mood) {
  const response = await api.post('/mood', { mood });
  return response.data;
}

export async function getMoodHistory() {
  const response = await api.get('/history');
  return response.data; // [{ mood, created_at, tracks: [{ name, artist }] }]
}