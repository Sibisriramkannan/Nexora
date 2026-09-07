import axios from 'axios';

// ✅ FIX 15: Fix API URL handling
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Remove trailing slash if present
const baseURL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

const api = axios.create({
    baseURL: `${baseURL}/api`,  // ✅ FIX 15: Don't double-add /api
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nexora_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('nexora_token');
            localStorage.removeItem('nexora_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;