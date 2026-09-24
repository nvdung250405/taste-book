import axios from 'axios';

// Get base URL from env if available, otherwise default to local backend
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token exists
axiosClient.interceptors.request.use(
  (config) => {
    // Note: Depends on how you store your token (localStorage, cookies, Zustand, etc.)
    // Assuming localStorage for this implementation
    const token = localStorage.getItem('token');
    
    // Some endpoints use multipart/form-data, we should not override it if already set
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle responses globally (e.g. 401 Unauthorized)
axiosClient.interceptors.response.use(
  (response) => {
    // API Spec says all responses have: { EC: 0, EM: "...", DT: ... }
    return response.data;
  },
  (error) => {
    // NOTE: Do NOT automatically clear token here on 401.
    // A 401 might come from a public endpoint (e.g., wrong login credentials)
    // and should NOT cause the current user session to be cleared.
    // Token clearing / logout should be handled explicitly by individual hooks or pages.

    // Return the response data if available so we can read the Error Code (EC) and Message (EM)
    if (error.response?.data) {
       return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
