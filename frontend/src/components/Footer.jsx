import React from 'react';
import { HardHat, Sparkles, ShieldCheck, Scale, Shield, MapPin, Phone, Mail } from 'lucide-react';

export const Footer = ({ onOpenLegal, onNavigate }) => {
  const goTab = (e, tab) => {
    e.preventDefault();
    if (onNavigate) onNavigate(tab);
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs mt-auto">
      
      {/* Banner Superior de Llamada a la Acción (Requisito 20) */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-8 px-4">
        <div className="fes-container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-heading font-black text-2xl text-white">
              ¿Listo para calcular y despachar los materiales de tu obra?
            </h3>
            <p className="text-orange-100 text-sm">
              Precios directos de Ladrillera San Luis y cubicación exacta por m² con Inteligencia Artificial.
            </p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('cotizador')}
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white font-heading font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-xl transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Abrir Cotizador con IA</span>
          </button>
        </div>
      </div>

      <div className="fes-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Columna 1: Marca */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-white text-base block">
                  F.E.S. CONSTRUCCIÓN
                </span>
                <span className="text-[10px] text-orange-400 tracking-wider font-bold uppercase">
                  Ladrillera San Luis
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Producción directa de materiales de arcilla cocida sismorresistentes NSR-10: ladrillo tolete, bloques estructurales, fachadas, tabletas, adoquines, refractarios y agregados.
            </p>
            <div className="space-y-1 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                <span>+57 320 821 6369</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                <span>frlmrtnz@gmail.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>Vereda Patio Bonito — Ladrillera San Luis</span>
              </div>
            </div>
          </div>

          {/* Columna 2: Pestañas del Sitio */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white uppercase tracking-wider text-xs">
              Navegación por Pestañas
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" onClick={(e) => goTab(e, 'home')} className="hover:text-orange-400 transition-colors">Inicio / Resumen Ejecutivo</a></li>
              <li><a href="#catalogo" onClick={(e) => goTab(e, 'catalogo')} className="hover:text-orange-400 transition-colors">Catálogo Oficial (23 Productos)</a></li>
              <li><a href="#cotizador" onClick={(e) => goTab(e, 'cotizador')} className="hover:text-orange-400 transition-colors">Cotizador de Obra con IA</a></li>
              <li><a href="#planta" onClick={(e) => goTab(e, 'planta')} className="hover:text-orange-400 transition-colors">Nuestra Planta Industrial</a></li>
              <li><a href="#resenas" onClick={(e) => goTab(e, 'resenas')} className="hover:text-orange-400 transition-colors">Ficha Google & Reseñas</a></li>
              <li><a href="#contacto" onClick={(e) => goTab(e, 'contacto')} className="hover:text-orange-400 transition-colors">Contacto y Despachos</a></li>
            </ul>
          </div>

          {/* Columna 3: Líneas de Materiales */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white uppercase tracking-wider text-xs">
              Principales Referencias
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#catalogo" onClick={(e) => goTab(e, 'catalogo')} className="hover:text-orange-400 transition-colors">Ladrillo Pequeño y Grande (18x9x6 / 22x12x7)</a></li>
              <li><a href="#catalogo" onClick={(e) => goTab(e, 'catalogo')} className="hover:text-orange-400 transition-colors">Ladrillo Prensado Santafé (24.5x12x6 cm)</a></li>
              <li><a href="#catalogo" onClick={(e) => goTab(e, 'catalogo')} className="hover:text-orange-400 transition-colors">Bloque #4, #5 y Perf. Vertical DP</a></li>
              <li><a href="#catalogo" onClick={(e) => goTab(e, 'catalogo')} className="hover:text-orange-400 transition-colors">Tableta Cúcuta 20x20 y Rústica 25x25</a></li>
              <li><a href="#catalogo" onClick={(e) => goTab(e, 'catalogo')} className="hover:text-orange-400 transition-colors">Ladrillo Refractario 1400°C y Arenas (m³)</a></li>
            </ul>
          </div>

          {/* Columna 4: Legal & Seguridad */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white uppercase tracking-wider text-xs">
              Cumplimiento Legal y Seguridad
            </h4>
            <div className="space-y-2.5 text-xs">
              <button
                onClick={() => onOpenLegal('aviso-legal')}
                className="flex items-center gap-2 hover:text-orange-400 text-left transition-colors cursor-pointer bg-transparent border-0 text-slate-300"
              >
                <Scale className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Aviso Legal y Mercantil</span>
              </button>
              <button
                onClick={() => onOpenLegal('privacidad')}
                className="flex items-center gap-2 hover:text-orange-400 text-left transition-colors cursor-pointer bg-transparent border-0 text-slate-300"
              >
                <Shield className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Política de Privacidad (Ley 1581)</span>
              </button>
              <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Certificación Web 20 de 20 • Protección SSL</span>
              </div>
            </div>
          </div>

        </div>

        {/* Barra Inferior */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} F.E.S. Construcción — Ladrillera San Luis. Todos los derechos reservados.</p>
          <p>Ingeniería Civil, Catálogo en Tiempo Real e Inteligencia Artificial</p>
        </div>
      </div>
    </footer>
  );
};
