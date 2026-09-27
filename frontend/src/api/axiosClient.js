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
    // Tự động chuyển hướng về trang login khi có lỗi 401 Unauthorized (Hết token)
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      // Không chuyển hướng nếu đang ở trang login hoặc register (để tránh loop khi đăng nhập sai pass)
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Xóa thông tin user nếu có
        window.location.href = '/login';
        return Promise.reject(error.response.data || error);
      }
    }

    // Return the response data if available so we can read the Error Code (EC) and Message (EM)
    if (error.response?.data) {
       return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
