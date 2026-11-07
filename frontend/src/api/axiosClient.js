import axios from 'axios';
import { isAdminPath } from '../lib/navigation';
import { connectionError } from '../lib/networkErrors';
import { apiCooldownSeconds, pauseApiRequests, rateLimitError } from '../lib/apiRateLimit';

// Get base URL from env if available, otherwise default to local backend
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const axiosClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token exists
axiosClient.interceptors.request.use(
  (config) => {
    const seconds = apiCooldownSeconds();
    if (seconds) return Promise.reject(rateLimitError(seconds));
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return Promise.reject(connectionError());
    }
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
    if (typeof response.data?.EC === 'number' && response.data.EC !== 0) {
      return Promise.reject(response.data);
    }
    return response.data;
  },
  (error) => {
    // Tự động chuyển hướng về trang login khi có lỗi 401 Unauthorized (Hết token)
    if (axios.isCancel(error)) return Promise.reject(error);
    if (error.httpStatus === 429) return Promise.reject(error);
    if (error.isNetworkError) return Promise.reject(error);
    if (!error.response) return Promise.reject(connectionError(error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'));
    if (error.response.status === 429) {
      const rawRetryAfter = error.response.headers?.['retry-after'];
      const seconds = Number.isFinite(Number(rawRetryAfter)) ? Number(rawRetryAfter)
        : Math.ceil((Date.parse(rawRetryAfter) - Date.now()) / 1000);
      const policy = error.response.headers?.['x-ratelimit-policy'];
      // An auth-specific limiter must not pause the rest of the website.
      if (policy === 'api' || (!policy && !error.config?.url?.startsWith('/auth/'))) pauseApiRequests(seconds);
      return Promise.reject({
        ...error.response.data,
        httpStatus: 429,
        ...(Number.isFinite(seconds) && seconds > 0 ? { retryAfterSeconds: seconds } : {}),
        EM: Number.isFinite(seconds) && seconds > 0
          ? `Máy chủ đang giới hạn yêu cầu. Vui lòng thử lại sau ${Math.ceil(seconds)} giây.`
          : 'Máy chủ đang giới hạn yêu cầu. Vui lòng chờ một lúc rồi thử lại.',
      });
    }
    if (error.response?.status === 403 && isAdminPath(window.location.pathname)) {
      window.dispatchEvent(new Event('forbidden'));
    }
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      // Không chuyển hướng nếu đang ở trang login hoặc register (để tránh loop khi đăng nhập sai pass)
      if (currentPath !== '/login' && currentPath !== '/register') {
        // Thay vì reload bằng window.location.href, ta phát một sự kiện để React Router xử lý chuyển trang mượt mà
        window.dispatchEvent(new Event('unauthorized'));
        return Promise.reject(error.response.data || error);
      }
    }

    // Return the response data if available so we can read the Error Code (EC) and Message (EM)
    if (error.response?.data) {
       return Promise.reject({ ...error.response.data, httpStatus: error.response.status });
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
