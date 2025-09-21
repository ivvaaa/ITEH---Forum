import React, { createContext, useContext, useState } from "react";
import useApi from "./useAPI";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const api = useApi();
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    });

    const login = async (email, password) => {
        const { data } = await api.post("/api/login", { email, password });
        console.log("Login response:", data);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
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
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}