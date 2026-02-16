import axios from 'axios';

// Get base URL and ensure /api prefix
const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  // If baseUrl exists and doesn't end with /api, add it
  if (baseUrl && !baseUrl.endsWith('/api')) {
    return `${baseUrl}/api`;
  }
  return baseUrl || '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb-access-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Rate Limits (Phase 3 Protection)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.error("⛔ Rate Limit Exceeded. Please slow down.");
      // Optional: Trigger a toast notification here
    }
    return Promise.reject(error);
  }
);

export default api;
