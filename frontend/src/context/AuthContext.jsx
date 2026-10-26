import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const GOOGLE_CLIENT_ID =
  '1010266205782-rnq8nuhi6j01asp52lflqiihgf3160mp.apps.googleusercontent.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fes_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('fes_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('fes_token', token);
    } else {
      localStorage.removeItem('fes_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fes_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fes_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

      setToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nombre, email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el registro');

      setToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async ({ credential, access_token }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, access_token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión con Google');

      setToken(data.token);
      setUser(data.user);

      // Guardar nombre en el perfil rápido si aún no existe
      try {
        const extra = JSON.parse(localStorage.getItem('fes_profile_extra') || '{}');
        if (!extra.nombre && data.user?.nombre) {
          extra.nombre = data.user.nombre;
          localStorage.setItem('fes_profile_extra', JSON.stringify(extra));
        }
      } catch {
        // ignore
      }

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('fes_token');
    localStorage.removeItem('fes_user');
  };

  const isAdmin = user && user.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
