import axios from 'axios';
import { useMemo } from 'react';


export default function useApi() {
const api = useMemo(() => {
const instance = axios.create({ baseURL: 'http://localhost:8000' });
instance.interceptors.request.use((config) => {
const token = localStorage.getItem('token');
if (token) config.headers.Authorization = `Bearer ${token}`;
return config;
});
return instance;
}, []);
return api;
}