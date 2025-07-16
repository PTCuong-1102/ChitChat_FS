// Configuration for API endpoints
const isDevelopment = import.meta.env.MODE === 'development';

export const API_CONFIG = {
  BASE_URL: isDevelopment ? 'http://localhost:8080' : '',
  API_PREFIX: '/api',
  TIMEOUT: 10000,
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
};
