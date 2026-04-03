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

// Auto-logout on 401 + error toast for other errors
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.reload();
      return Promise.reject(err);
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
