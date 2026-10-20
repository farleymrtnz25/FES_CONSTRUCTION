import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X } from 'lucide-react';

export const CookieBanner = ({ onOpenPrivacy }) => {
  const [show, setShow] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('fes_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('fes_cookie_consent', JSON.stringify({ technical: true, analytics: true }));
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('fes_cookie_consent', JSON.stringify({ technical: true, analytics: false }));
    setShow(false);
  };

  const handleSaveConfig = () => {
    localStorage.setItem('fes_cookie_consent', JSON.stringify({ technical: true, analytics: analyticsEnabled }));
    setShow(false);
    setShowConfig(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-fade-in">
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-900/95 text-xs text-slate-300 space-y-3">
        
        <div className="flex items-center gap-2.5 text-white font-bold font-heading">
          <Cookie className="w-5 h-5 text-orange-400" />
          <span>Privacidad y Uso de Cookies</span>
        </div>

        <p className="leading-relaxed text-slate-300 text-[11px]">
          Utilizamos cookies esenciales para el funcionamiento de la tienda y cookies de analítica para mejorar tu experiencia con el cotizador de IA. Conforme al RGPD y la Ley 1581.
        </p>

        {showConfig ? (
          <div className="p-3 bg-slate-950 rounded-xl space-y-2 border border-slate-800 text-[11px]">
            <label className="flex items-center justify-between text-slate-400">
              <span>Cookies Técnicas (Obligatorias)</span>
              <span className="text-emerald-400 font-bold">Activas</span>
            </label>
            <label className="flex items-center justify-between text-slate-200 cursor-pointer">
              <span>Cookies Analíticas y de IA</span>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded cursor-pointer"
              />
            </label>
            <button
              onClick={handleSaveConfig}
              className="w-full mt-1 py-1.5 bg-orange-600 text-white font-bold rounded-lg text-xs"
            >
              Guardar Preferencias
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Aceptar Todas
            </button>
            <button
              onClick={handleReject}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Rechazar
            </button>
            <button
              onClick={() => setShowConfig(true)}
              className="py-2 px-2 text-slate-400 hover:text-white underline text-[11px] cursor-pointer"
            >
              Configurar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
