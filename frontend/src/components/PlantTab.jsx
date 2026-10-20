import React from 'react';
import { 
  Building2, 
  Flame, 
  Truck, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Clock, 
  PhoneCall, 
  Layers,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import ladrilleraImg from '../assets/ladrillera-san-luis.png';

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Extracción y Selección de Arcilla',
    desc: 'Seleccionamos vetas de arcilla pura en nuestra cantera propia, libres de carbonatos e impurezas orgánicas para garantizar estabilidad química y cero eflorescencias.'
  },
  {
    step: '02',
    title: 'Molienda, Humectación y Extrusión',
    desc: 'Amasado homogéneo y extrusión al vacío de alta presión que elimina burbujas de aire internas, logrando aristas rectas y medidas exactas al milímetro.'
  },
  {
    step: '03',
    title: 'Secado Técnico Controlado',
    desc: 'Reposo en cámaras de secado previas al horno para retirar la humedad libre de forma gradual, evitando fisuras o alabeos dimensionales.'
  },
  {
    step: '04',
    title: 'Cocción de Alta Temperatura (950°C – 1400°C)',
    desc: 'Horneado continuo con control pirométrico para vitrificar la arcilla, obteniendo sonido metálico, baja absorción de agua (< 14%) y máxima resistencia mecánica.'
  }
];

const FLEET_CAPACITIES = [
  { vehicle: 'Volqueta Sencilla / Camión 600', capacity: '2.500 a 4.000 ladrillos / 7 m³', ideal: 'Obras urbanas, remodelaciones y calles estrechas' },
  { vehicle: 'Camión Doble Troque', capacity: '6.000 a 8.500 ladrillos / 14 m³', ideal: 'Proyectos residenciales, bodegas y condominios' },
  { vehicle: 'Tractomula Plataforma / Volco', capacity: '14.000 a 18.000 ladrillos / 28 m³', ideal: 'Grandes constructoras, licitaciones y despachos departamentales' }
];

export const PlantTab = ({ onNavigate }) => {
  return (
    <div className="space-y-10">
      
      {/* 1. Cabecera de Nuestra Planta */}
      <div className="fes-page-banner">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-xs font-extrabold text-orange-300 uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Complejo Industrial Ladrillera San Luis • Vereda Patio Bonito</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Nuestra Planta de Producción y Calidad NSR-10
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Conoce cómo transformamos las mejores arcillas de Cundinamarca en materiales estructurales de alta resistencia para la ingeniería colombiana.
          </p>
        </div>
      </div>

      {/* 2. Historia e Imagen Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <div className="lg:col-span-6 space-y-5">
          <div className="fes-card space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 block">
              De Raíces Fuertes a Innovación Constante
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              Tradición Ladrillera e Ingeniería Moderna
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              En <strong>F.E.S. Construcción y Ladrillera San Luis</strong> nacimos con el propósito de ofrecer al gremio constructor materiales de arcilla cocida y agregados pétreos directamente desde el patio de horno, eliminando sobrecostos de intermediación.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Nuestra planta cuenta con hornos de fuego continuo y patios de clasificación donde cada lote de toletes, bloques estructurales, tabletas y refractarios es inspeccionado bajo los parámetros de la <strong>Norma Sismorresistente Colombiana NSR-10 (NTC 4205)</strong>.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200">
                <span className="text-2xl font-black text-orange-700 font-heading block">+500.000</span>
                <span className="text-xs font-bold text-slate-700">Unidades horneadas / mes</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-2xl font-black text-emerald-700 font-heading block">&lt; 2%</span>
                <span className="text-xs font-bold text-slate-700">Índice de rotura en transporte</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigate('catalogo')}
                className="btn-primary-cta text-sm"
              >
                <Layers className="w-4 h-4" />
                <span>Ver Catálogo de Planta</span>
              </button>
              <a
                href="https://www.google.com/maps/place/Ladrillera+san+luis/@5.1356617,-73.9002196,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="fes-btn-secondary text-sm"
              >
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Ver Planta en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="fes-card !p-3 overflow-hidden">
            <img
              src={ladrilleraImg}
              alt="Planta de producción Ladrillera San Luis en Cundinamarca"
              className="w-full h-[380px] object-cover rounded-xl"
            />
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Complejo Ladrillera San Luis — Patio de Hornos y Despacho
                </h3>
                <p className="text-xs text-slate-500">
                  Atención directa en báscula y cargue mecanizado de lunes a sábado (7:00 AM – 5:30 PM)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold self-start sm:self-auto">
                Planta Verificada
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Las 4 Etapas del Proceso Industrial */}
      <div className="space-y-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 block mb-1">
            Trazabilidad de Calidad
          </span>
          <h2 className="fes-section-title">
            Las 4 Etapas de Nuestro Proceso de Fabricación
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((item, idx) => (
            <div key={idx} className="fes-card space-y-3 border-t-4 border-t-orange-600">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-orange-600">
                  ETAPA {item.step}
                </span>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Capacidad Logística y Flota de Despacho */}
      <div className="fes-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900">
                Logística y Capacidad de Cargue a Obra
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Despachamos desde viajes pequeños en volqueta sencilla hasta lotes completos en tractomula
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('contacto')}
            className="btn-primary-cta text-sm self-start md:self-auto"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Programar Despacho o Visita</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FLEET_CAPACITIES.map((fl, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 block">
                Modalidad {i + 1}
              </span>
              <h4 className="font-heading font-extrabold text-base text-slate-900">
                {fl.vehicle}
              </h4>
              <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded inline-block">
                Capacidad: {fl.capacity}
              </div>
              <p className="text-xs text-slate-600 pt-1">
                <strong>Ideal para:</strong> {fl.ideal}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
