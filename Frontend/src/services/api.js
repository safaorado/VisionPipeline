import axios from 'axios';

// Inject values securely using Vite environment variables
// Fallback to localhost only if the environment variable is missing during local testing
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_KEY = import.meta.env.VITE_GATEWAY_API_KEY; 

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'X-API-Key': API_KEY,
  },
});

export const analyzeImage = (formData) => {
  // Axios handles the multipart boundary automatically for formData
  return apiClient.post('/analyze', formData);
};