import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  Flame, 
  Building2, 
  Layers, 
  CheckCircle2,
  PhoneCall,
  Ruler,
  MapPin,
  Award,
  Calculator
} from 'lucide-react';
import heroMaterialsImg from '../assets/hero-materials.png';
import ladrilleraImg from '../assets/ladrillera-san-luis.png';

const PRODUCT_LINES = [
  {
    title: 'Ladrillos Tolete y Prensados',
    category: 'Ladrillos',
    badge: '6 Referencias',
    specs: 'Medidas: 18x9x6 cm • 22x12x7 cm • 24.5x12x6 cm',
    desc: 'Ladrillo pequeño y grande (negro y rosado), prensado liviano Santafé, tolete #1 perforado y macizo para mampostería estructural.',
    priceFrom: '$260 COP'
  },
  {
    title: 'Bloques Estructurales y Bloquelón',
    category: 'Bloques',
    badge: '4 Referencias',
    specs: 'Medidas: Bloque #4 y #5 • Perf. Vert. 33x23x11.5 cm',
    desc: 'Bloques de arcilla de alta resistencia para muros divisorios, fachadas estructurales y bloquelón para placas fáciles.',
    priceFrom: '$1.050 COP'
  },
  {
    title: 'Fachadas, Tabletas y Adoquines',
    category: 'Fachadas',
    badge: '6 Referencias',
    specs: 'Medidas: 24x12x6 cm • 20x20 cm • 25x25 cm • 15x10x6 cm',
    desc: 'Ladrillo Prisma Gris y Cocoa, Tableta Arcilla Cúcuta y Rústica, y Adoquines de tráfico pesado y peatonal.',
    priceFrom: '$750 COP'
  },
  {
    title: 'Refractarios, Tejas y Agregados (m³)',
    category: 'Agregados',
    badge: '7 Referencias',
    specs: 'Medidas: 24x12.5x4 cm (1400°C) • Arena y Mixto por m³',
    desc: 'Ladrillo refractario para hornos y chimeneas, teja de barro tradicional, arena de río, arena amarilla y mixto de concreto.',
    priceFrom: '$700 COP'
  }
];

export const HomeTab = ({ onNavigate, onSelectCategory }) => {
  const handleCategoryGo = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    onNavigate('catalogo');
  };

  return (
    <div className="space-y-12">
      
      {/* 1. HERO EJECUTIVO DE INGENIERÍA */}
      <section className="fes-page-banner !p-6 sm:!p-10 lg:!p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-xs font-extrabold text-orange-300 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Ladrillera San Luis • Venta Directa de Planta</span>
            </div>

            <h1 className="fes-hero-title">
              Materiales Estructurales de Arcilla y{' '}
              <span className="text-orange-400">Cotización Inteligente con IA</span>
            </h1>

            <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl">
              Fabricamos y despachamos ladrillos tolete, bloques estructurales, tabletas, adoquines, refractarios y agregados por m³ desde nuestra planta en la <strong>Vereda Patio Bonito (Ladrillera San Luis)</strong>. Calcula las cantidades exactas para tu obra en segundos.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('cotizador')}
                className="btn-primary-cta text-base py-3.5 px-6"
              >
                <Sparkles className="w-5 h-5" />
                <span>Cotizar mi Obra con IA</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('catalogo')}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-heading font-bold text-base transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Layers className="w-5 h-5 text-orange-400" />
                <span>Ver Catálogo (23 Productos)</span>
              </button>
            </div>

            {/* Indicadores Rápidos */}
            <div className="pt-6 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white font-heading block">23</span>
                <span className="text-xs text-slate-300 font-medium">Referencias en Patio</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-orange-400 font-heading block">NSR-10</span>
                <span className="text-xs text-slate-300 font-medium">Norma Sismorresistente</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white font-heading block">1400°C</span>
                <span className="text-xs text-slate-300 font-medium">Hornos de Alta Cocción</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-heading block">100%</span>
                <span className="text-xs text-slate-300 font-medium">Precios de Fábrica</span>
              </div>
            </div>
          </div>

          {/* Imagen Principal Derecha */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-900 relative">
              <img
                src={heroMaterialsImg}
                alt="Materiales de construcción de arcilla cocida FES Construcción"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block">
                    Despacho Directo a Pie de Obra
                  </span>
                  <strong className="text-sm text-white font-heading">
                    Cundinamarca, Sabana Norte, Bogotá y Boyacá
                  </strong>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold">
                  Stock Activo
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. LÍNEAS DE PRODUCTOS (ACCESO DIRECTO AL CATÁLOGO) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 block mb-1">
              Portafolio Industrial Completo
            </span>
            <h2 className="fes-section-title">
              Líneas de Materiales y Especificaciones
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalogo')}
            className="fes-btn-secondary text-sm self-start sm:self-auto"
          >
            <span>Explorar las 23 Referencias</span>
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRODUCT_LINES.map((line, i) => (
            <div
              key={i}
              onClick={() => handleCategoryGo(line.category)}
              className="fes-card fes-card-interactive cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-extrabold text-xs">
                    {line.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Desde <strong className="text-slate-900 text-sm font-mono">{line.priceFrom}</strong>
                  </span>
                </div>

                <h3 className="font-heading text-xl font-extrabold text-slate-900">
                  {line.title}
                </h3>

                <div className="fes-medidas-badge">
                  <Ruler className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{line.specs}</span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {line.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-orange-600">
                <span>Ver precios, medidas y stock en el catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ACCESO A LAS PESTAÑAS ESPECIALIZADAS DE LA PLATAFORMA */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 block mb-1">
            Herramientas y Respaldo Corporativo
          </span>
          <h2 className="fes-section-title">
            Explora Nuestras Secciones Especializadas
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tarjeta 1: Cotizador IA */}
          <div className="fes-card fes-card-interactive bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-lg">
                <Calculator className="w-6 h-6" />
              </div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-orange-400">
                Pestaña: Cotizador IA
              </span>
              <h3 className="font-heading text-xl font-extrabold text-white">
                Asesor Ing. FES (Cálculo por m²)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                ¿Necesitas saber cuántos ladrillos, bloques o metros cúbicos de arena requiere tu obra? Nuestro asistente con Inteligencia Artificial calcula unidades + desperdicio y arma tu carrito en 1 clic.
              </p>
            </div>
            <button
              onClick={() => onNavigate('cotizador')}
              className="btn-primary-cta w-full justify-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>Abrir Cotizador con IA</span>
            </button>
          </div>

          {/* Tarjeta 2: Nuestra Planta */}
          <div className="fes-card fes-card-interactive flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <img 
                src={ladrilleraImg} 
                alt="Planta Ladrillera San Luis" 
                className="w-full h-40 object-cover rounded-xl border border-slate-200"
              />
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-orange-600">
                Pestaña: Nuestra Planta
              </span>
              <h3 className="font-heading text-xl font-extrabold text-slate-900">
                Hornos y Proceso Industrial
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Conoce la historia de Ladrillera San Luis, nuestras 4 etapas de producción (extracción, moldeo, secado y cocción a 950°C–1400°C) y nuestra flota de despacho.
              </p>
            </div>
            <button
              onClick={() => onNavigate('planta')}
              className="fes-btn-secondary w-full justify-center"
            >
              <Building2 className="w-4 h-4 text-orange-600" />
              <span>Conocer Nuestra Planta</span>
            </button>
          </div>

          {/* Tarjeta 3: Ficha Google & Contacto */}
          <div className="fes-card fes-card-interactive flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-orange-600">
                Pestañas: Ficha Google & Contacto
              </span>
              <h3 className="font-heading text-xl font-extrabold text-slate-900">
                Ubicación Verificada y Ventas
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Comparte tu experiencia dejando una reseña, abre la ubicación exacta en Google Maps o Waze y coordina tu pedido por WhatsApp o factura PDF.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
                <div><strong>WhatsApp Ventas:</strong> +57 320 821 6369</div>
                <div><strong>Correo:</strong> frlmrtnz@gmail.com</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('resenas')}
                className="fes-btn-secondary text-xs py-2.5 px-3"
              >
                <span>Dejar Reseña</span>
              </button>
              <button
                onClick={() => onNavigate('contacto')}
                className="fes-btn-primary text-xs py-2.5 px-3"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Contacto</span>
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
