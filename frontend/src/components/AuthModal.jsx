import React, { useState, useEffect, useRef } from 'react';
import { useAuth, GOOGLE_CLIENT_ID } from '../context/AuthContext';
import { X, Lock, Mail, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    let intervalId = null;

    const initGsi = () => {
      if (!window.google || !window.google.accounts) return false;
      setGoogleReady(true);

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (response && response.credential) {
              setLoading(true);
              setError(null);
              const res = await loginWithGoogle({ credential: response.credential });
              setLoading(false);
              if (res.success) {
                onClose();
              } else {
                setError(res.error || 'No se pudo iniciar sesión con Google');
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: isRegister ? 'signup_with' : 'continue_with',
            shape: 'pill',
            width: 320,
            logo_alignment: 'left'
          });
        }
      } catch (err) {
        console.warn('Aviso inicializando botón GSI:', err);
      }
      return true;
    };

    // Asegurar que el script de Google esté cargado
    if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    if (!initGsi()) {
      intervalId = setInterval(() => {
        if (initGsi()) {
          clearInterval(intervalId);
        }
      }, 300);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, isRegister]);

  if (!isOpen) return null;

  // Respaldo / Botón directo mediante OAuth2 TokenClient Popup
  const handleCustomGoogleClick = () => {
    setError(null);
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      setError('Cargando servicios de Google. Intenta de nuevo en un segundo.');
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            setLoading(true);
            const res = await loginWithGoogle({ access_token: tokenResponse.access_token });
            setLoading(false);
            if (res.success) {
              onClose();
            } else {
              setError(res.error || 'Error al autenticar con Google');
            }
          } else if (tokenResponse && tokenResponse.error) {
            setError('Inicio de sesión con Google cancelado');
          }
        }
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setError('No se pudo abrir la ventana de Google: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await register(nombre, email, password);
      } else {
        res = await login(email, password);
      }

      if (!res.success) {
        throw new Error(res.error);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 z-10 shadow-2xl">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-heading font-bold text-white text-base">
              {isRegister ? 'Crear Cuenta en FES' : 'Acceso a FES Construcción'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isRegister
                ? 'Regístrate con Google o tu correo para guardar tus recibos'
                : 'Inicia sesión con tu cuenta de Google o correo'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SECCIÓN DE ACCESO RÁPIDO CON GOOGLE */}
        <div className="mt-4 space-y-2.5">
          {/* Contenedor del botón oficial de Google Identity Services */}
          <div
            ref={googleButtonRef}
            className="w-full flex justify-center min-h-[42px]"
          />

          {/* Botón directo OAuth2 Popup (funciona incluso si el navegador bloquea iframes de terceros) */}
          <button
            type="button"
            onClick={handleCustomGoogleClick}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer border border-slate-200"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>{isRegister ? 'Registrarse con cuenta de Google' : 'Elegir cuenta de Google'}</span>
          </button>
        </div>

        {/* Separador */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] text-slate-400 font-semibold whitespace-nowrap">
            o usa tu correo y contraseña
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-cta w-full text-xs font-bold py-2.5 mt-2 justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRegister ? 'Registrarme con Correo' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-orange-400 hover:underline font-semibold cursor-pointer"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>

        {/* Info de Cuenta Google Admin */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[10px] text-slate-400 text-center leading-relaxed">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold mb-0.5">
            <CheckCircle2 className="w-3 h-3" /> Acceso Google Habilitado
          </span>
          <br />
          Si ingresas con <span className="text-orange-400 font-mono font-bold">frlmrtnz@gmail.com</span> en Google, entras automáticamente como <strong>Administrador</strong>.
        </div>
      </div>
    </div>
  );
};
