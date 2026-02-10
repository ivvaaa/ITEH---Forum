import axios from 'axios';
import { useMemo } from 'react';


export default function useApi() {
const api = useMemo(() => {
const instance = axios.create({ baseURL: 'http://localhost:8000' });
 instance.interceptors.request.use((config) => {
 const token = localStorage.getItem('token') || sessionStorage.getItem('auth_token');
 if (token) config.headers.Authorization = `Bearer ${token}`;

    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
      // eslint-disable-next-line no-console
      console.log('REQ', config.method?.toUpperCase(), fullUrl, 'AUTH', !!config.headers.Authorization);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (process.env.NODE_ENV === 'development') {
        const cfg = error.config || {};
        const fullUrl = `${cfg.baseURL || ''}${cfg.url || ''}`;
        if (error.response?.status === 401) {
          // eslint-disable-next-line no-console
          console.log('RES 401', fullUrl, 'AUTH', cfg.headers?.Authorization || null);
        }
      }
      return Promise.reject(error);
    }
  );
return instance;
}, []);
return api;
}
