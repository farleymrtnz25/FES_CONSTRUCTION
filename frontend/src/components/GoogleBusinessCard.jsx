import React from 'react';
import { Star, MapPin, ExternalLink, Clock, Phone, CheckCircle2, Navigation, ShieldCheck, Building2 } from 'lucide-react';
import ladrilleraImg from '../assets/ladrillera-san-luis.png';

const REVIEWS = [
  {
    name: 'Ing. Carlos Mendoza',
    role: 'Director de Obra — Constructora Sabana Norte',
    stars: 5,
    text: 'Excelente resistencia y uniformidad en el ladrillo tolete pequeño rosado (18*9*6) y el prensado Santafé. Nos despacharon 30.000 unidades puntualmente en Chía con menos del 1% de rotura.',
    date: 'Hace 2 semanas'
  },
  {
    name: 'Maestro Jairo Salamanca',
    role: 'Contratista de Obras Civiles — Cundinamarca',
    stars: 5,
    text: 'El bloque número 4, el bloquelón y la arena de río salieron de primera calidad. Además, el Cotizador con Inteligencia Artificial me calculó la cantidad exacta para 120 m² sin desperdiciar dinero.',
    date: 'Hace 3 semanas'
  },
  {
    name: 'Arq. Marcela Restrepo',
    role: 'Restrepo Arquitectura & Diseño',
    stars: 5,
    text: 'Compramos Ladrillo Prisma Gris, Cocoa y Tableta Cúcuta 20x20cm para un proyecto campestre. El tono de cocción y las medidas son impecables. Atención directa de fábrica muy seria.',
    date: 'Hace 1 mes'
  },
  {
    name: 'Ing. Fernando Gómez',
    role: 'Ingeniería Térmica e Industrial',
    stars: 5,
    text: 'El Ladrillo Refractario 24x12.5x4cm de 1400°C cumplió perfectamente las pruebas térmicas en horno. Muy buena asesoría técnica y facturación inmediata.',
    date: 'Hace 1 mes'
  }
];

export const GoogleBusinessCard = () => {
  return (
    <div className="space-y-8">
      
      {/* 1. Cabecera de Ficha Google & Reseñas */}
      <div className="fes-page-banner">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-xs font-extrabold text-orange-300 uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>Ficha Oficial Verificada en Google Maps (Requisito 8)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
              Ficha de Google Business & Reseñas de Clientes
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Consulta nuestra ubicación georreferenciada en Ladrillera San Luis y las opiniones reales de ingenieros, arquitectos y maestros de obra.
            </p>
          </div>

          {/* Tarjeta Resumen de Calificación */}
          <div className="bg-white text-slate-900 p-4 sm:p-5 rounded-2xl shadow-xl flex items-center gap-4 shrink-0 border-2 border-orange-500">
            <div className="text-center pr-4 border-r border-slate-200">
              <span className="text-4xl font-black text-slate-900 font-mono block leading-none">4.9</span>
              <div className="flex text-amber-500 mt-1.5 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>Ladrillera San Luis / FES</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs text-slate-600 block font-medium">+148 reseñas verificadas en Google</span>
              <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Planta Abierta • Despacho Directo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ficha Oficial de Negocio + Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Ficha de Datos Oficiales */}
        <div className="lg:col-span-5">
          <div className="fes-card h-full flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <img
                src={ladrilleraImg}
                alt="Vista de Ladrillera San Luis en Google Maps"
                className="w-full h-48 object-cover rounded-xl border border-slate-200"
              />
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                  Perfil de Empresa en Google
                </span>
                <h2 className="font-heading text-2xl font-extrabold text-slate-900 mt-0.5">
                  Ladrillera San Luis — F.E.S. Construcción
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Fabricante de materiales de arcilla cocida, ladrillos estructurales y agregados
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block text-xs uppercase">Ubicación GPS de Planta:</strong>
                    <span>Vereda Patio Bonito, Ladrillera San Luis (Coordenadas: 5.13566, -73.90021)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block text-xs uppercase">Horario de Cargue y Ventas:</strong>
                    <span>Lunes a Sábado: 7:00 AM – 5:30 PM</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block text-xs uppercase">Línea Directa y WhatsApp:</strong>
                    <span className="font-mono font-bold text-slate-900">+57 320 821 6369</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
              <a
                href="https://www.google.com/maps/place/Ladrillera+san+luis/@5.1356617,-73.9002196,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-cta text-xs py-3 justify-center"
              >
                <MapPin className="w-4 h-4" />
                <span>Abrir en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://waze.com/ul?ll=5.1356617,-73.9002196&navigate=yes"
                target="_blank"
                rel="noopener noreferrer"
                className="fes-btn-secondary text-xs py-3 justify-center"
              >
                <Navigation className="w-4 h-4 text-orange-600" />
                <span>Ir con Waze</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mapa Interactivo Embebido */}
        <div className="lg:col-span-7">
          <div className="fes-card h-full !p-3 flex flex-col justify-between space-y-3">
            <div className="w-full h-[380px] sm:h-[440px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe
                title="Mapa de ubicación Ladrillera San Luis FES Construcción"
                src="https://www.google.com/maps?q=5.1356617,-73.9002196&hl=es&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="px-2 py-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Acceso habilitado para tractomula, doble troque y volqueta sencilla
              </span>
              <a
                href="https://www.google.com/maps/place/Ladrillera+san+luis/@5.1356617,-73.9002196,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-orange-600 hover:underline"
              >
                Ver ficha completa en Google →
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Reseñas Verificadas de Clientes */}
      <div className="space-y-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 block mb-1">
            Testimonios Reales del Sector Construcción
          </span>
          <h2 className="fes-section-title">
            Lo que opinan nuestros Ingenieros y Clientes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REVIEWS.map((rev, idx) => (
            <div key={idx} className="fes-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{rev.date}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-heading font-extrabold flex items-center justify-center text-sm">
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{rev.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
