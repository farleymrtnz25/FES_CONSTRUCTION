import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Ruler, 
  CheckCircle2, 
  ArrowRight, 
  Flame 
} from 'lucide-react';
import heroMaterialsImg from '../assets/hero-materials.png';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-blueprint-grid pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-800/60">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Sales Copy & Primary CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Certifications Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-orange-500/30 text-xs font-semibold text-orange-300 shadow-inner">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>Directo de Horno • Calidad Sismorresistente NSR-10</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Materiales de Construcción de Alta Resistencia con{' '}
              <span className="text-gradient-orange">Cotización Precisa por IA</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Venta directa de fábrica en Cundinamarca y Boyacá. Ladrillo tolete, bloques estructurales, tejas y bloquelón. 
              <strong className="text-white font-semibold"> Calcula cantidades exactas por m² y presupuesto instantáneo</strong> con nuestro Asesor de Ingeniería.
            </p>

            {/* Primary Action Row (Requisito 20: Single Primary CTA) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a 
                href="#cotizador-ia" 
                className="btn-primary-cta w-full sm:w-auto text-base group"
              >
                <Sparkles className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
                <span>Cotizar Proyecto con IA</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a 
                href="#catalogo" 
                className="btn-secondary w-full sm:w-auto text-sm"
              >
                Ver Catálogo de Precios
              </a>
            </div>

            {/* Quick Guarantees (Trust Builders) */}
            <div className="pt-4 grid grid-cols-3 gap-2 border-t border-slate-800/80 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Rotura mínima &lt; 2%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Truck className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Despacho en obra</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Norma NSR-10</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative glowing ring */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              
              {/* Image Container with alt text (Requisito 10 & 11) */}
              <div className="relative glass-card overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-900/90">
                <img 
                  src={heroMaterialsImg} 
                  alt="Ladrillos y materiales de construcción de alta calidad en FES Construcción" 
                  className="w-full h-80 sm:h-96 object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                  width="600"
                  height="400"
                />

                {/* Engineering Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 glass-panel p-4 rounded-xl border border-slate-700/90 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold tracking-wider text-orange-400 uppercase">
                        Patio de Despacho
                      </span>
                      <h2 className="text-sm font-bold text-white font-heading">
                        Arcilla Cocida Tipo Tolete
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Resistencia</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">15 MPa</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating IA Floating Chip */}
              <div className="absolute -top-4 -right-4 glass-panel px-4 py-2.5 rounded-xl border border-orange-500/40 shadow-xl hidden sm:flex items-center gap-3 animate-pulse-subtle">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Asesor Inteligente</p>
                  <p className="text-xs font-bold text-white">Gemini Flash Activo</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
