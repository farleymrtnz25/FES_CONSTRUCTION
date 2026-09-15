import React, { createContext, useContext, useState, useCallback } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

const API = `${API_BASE_URL}/api/auth`;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('fes_user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('fes_token') || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const saveAuth = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('fes_user', JSON.stringify(userData));
        localStorage.setItem('fes_token', tokenData);
    };

    const login = useCallback(async (email, password) => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
            saveAuth(data.user, data.token);
            return { success: true, user: data.user };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally { setLoading(false); }
    }, []);

    const register = useCallback(async (nombre, email, password) => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al registrarse');
            saveAuth(data.user, data.token);
            return { success: true, user: data.user };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally { setLoading(false); }
    }, []);

    const logout = useCallback(() => {
        setUser(null); setToken(null);
        localStorage.removeItem('fes_user');
        localStorage.removeItem('fes_token');
    }, []);

    const authFetch = useCallback((url, options = {}) => {
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers || {}),
            },
        });
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, authFetch, isAdmin: user?.rol === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
