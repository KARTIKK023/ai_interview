import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header dynamically
API.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isSuperAdminRequest =
      url.startsWith('/admin') ||
      url.startsWith('/super-admin') ||
      url.includes('/admin/') ||
      url.includes('/super-admin/');

    const token = isSuperAdminRequest
      ? localStorage.getItem('superAdminToken')
      : (localStorage.getItem('studentToken') || localStorage.getItem('token') || localStorage.getItem('superAdminToken'));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const reqUrl = error.config?.url || '';
      const isSuperAdminRequest = reqUrl.includes('/admin') || reqUrl.includes('/super-admin');

      if (isSuperAdminRequest) {
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdminUser');
      } else {
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentUser');
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
