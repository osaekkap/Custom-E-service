import axios from 'axios';

// In dev: Vite proxies /api → localhost:3000 (vite.config.js)
// In production: set VITE_API_URL=https://your-backend.com
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const client = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15s request timeout
});

// Attach JWT token on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Toast bridge ─────────────────────────────────────────────────
// Allows the axios interceptor (outside React tree) to trigger toasts.
let _toastFn = null;
export function registerToastHandler(fn) { _toastFn = fn; }

const ERROR_MESSAGES = {
  400: 'ข้อมูลไม่ถูกต้อง',
  403: 'ไม่มีสิทธิ์ดำเนินการนี้',
  404: 'ไม่พบข้อมูลที่ร้องขอ',
  409: 'ข้อมูลซ้ำกัน กรุณาตรวจสอบอีกครั้ง',
  422: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  429: 'คำขอมากเกินไป กรุณารอสักครู่',
  500: 'เกิดข้อผิดพลาดภายในระบบ',
};

// Track whether a token refresh is in progress to avoid parallel refresh calls
let _isRefreshing = false;
let _refreshSubscribers = [];

function onRefreshed(newToken) {
  _refreshSubscribers.forEach((cb) => cb(newToken));
  _refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  _refreshSubscribers.push(cb);
}

// Auto-refresh on 401, fallback to logout if refresh fails
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    const originalRequest = err.config;

    if (status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token');

      // No refresh token available — force logout
      if (!refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.reload();
        return Promise.reject(err);
      }

      if (_isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        client.defaults.headers.Authorization = `Bearer ${data.access_token}`;
        onRefreshed(data.access_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return client(originalRequest);
      } catch (refreshErr) {
        // Refresh failed — force logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.reload();
        return Promise.reject(refreshErr);
      } finally {
        _isRefreshing = false;
      }
    }

    // Show toast for API errors (skip network errors without response)
    if (_toastFn && status) {
      const serverMsg = err.response?.data?.message;
      const msg = Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg;
      _toastFn('error', msg || ERROR_MESSAGES[status] || `Error ${status}`);
    } else if (_toastFn && err.code === 'ECONNABORTED') {
      _toastFn('error', 'การเชื่อมต่อหมดเวลา กรุณาลองอีกครั้ง');
    }

    return Promise.reject(err);
  },
);

export default client;
