import React, { createContext, useContext, useState } from "react";
import useApi from "./useAPI";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const api = useApi();
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    });

    const setAuthFromToken = (token, userData) => {
        localStorage.setItem("token", token);
        sessionStorage.setItem("auth_token", token); // matches axios fallback
        localStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const login = async (email, password) => {
        const { data } = await api.post("/api/login", { email, password });
        console.log("Login response:", data);
        setAuthFromToken(data.access_token, data.user);
        return data.user;
    };

    const logout = async () => {
        try {
            await api.post("/api/logout");
        } catch { }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, setAuthFromToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
