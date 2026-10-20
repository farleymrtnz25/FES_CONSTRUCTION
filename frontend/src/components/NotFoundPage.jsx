import React from 'react';
import { HardHat, Home, Sparkles, ArrowLeft } from 'lucide-react';

export const NotFoundPage = ({ onGoHome }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-blueprint-grid">
      <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-slate-800 text-center space-y-6 bg-slate-900/90 shadow-2xl">
        
        <div className="w-20 h-20 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/30">
          <HardHat className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-5xl font-black text-orange-500 font-mono">404</span>
          <h2 className="text-2xl font-black text-white font-heading">
            Zona de Obra No Encontrada
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            La página o recurso que buscas no existe o fue reubicada en nuestro patio digital de materiales.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="btn-primary-cta w-full sm:w-auto text-xs py-3 px-5 justify-center"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>

          <a
            href="#cotizador-ia"
            onClick={onGoHome}
            className="btn-secondary w-full sm:w-auto text-xs py-3 px-5 justify-center"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Cotizador IA</span>
          </a>
        </div>

      </div>
    </div>
  );
};
