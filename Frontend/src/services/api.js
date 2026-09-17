import axios from 'axios';

// Ensure this matches the GATEWAY_API_KEY in your backend .env file
const API_KEY = "fe0d768ec2cc69b27e24b14fa99ec5e14123378a54d46984e310fd44990cffae"; 

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'X-API-Key': API_KEY,
  },
});

export const analyzeImage = (formData) => {
  // We don't set Content-Type manually; Axios handles the multipart boundary automatically
  return apiClient.post('/analyze', formData);
};