import { useState } from 'react';
import useApi from '';


export default function useAuth() {
const api = useApi();
const [user, setUser] = useState(() => {
const raw = localStorage.getItem('user');
return raw ? JSON.parse(raw) : null;
});


const login = async (email, password) => {
const { data } = await api.post('/api/login', { email, password });
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
setUser(data.user);
return data.user;
};


const logout = async () => {
try { await api.post('/api/logout'); } catch {}
localStorage.removeItem('token');
localStorage.removeItem('user');
setUser(null);
};


return { user, login, logout };
}