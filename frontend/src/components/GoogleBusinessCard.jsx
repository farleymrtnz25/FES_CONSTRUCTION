import React, { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  ExternalLink,
  Clock,
  Phone,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  MessageSquarePlus,
  Send,
  Trash2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ladrilleraImg from '../assets/ladrillera-san-luis.png';

export const GoogleBusinessCard = () => {
  const { user } = useAuth();
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estado del formulario para crear reseña
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [cargo, setCargo] = useState('');
  const [estrellas, setEstrellas] = useState(5);
  const [hoverEstrellas, setHoverEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [websiteHp, setWebsiteHp] = useState('');

  const cargarResenas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resenas');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setResenas(data);
        }
      }
    } catch (err) {
      console.warn('Error cargando reseñas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarResenas();
  }, []);

  const handleCrearResena = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMensajeExito('');

    if (!nombre.trim() || !comentario.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y escribe tu reseña.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          cargo: cargo.trim() || 'Cliente F.E.S. Construcción',
          estrellas,
          comentario: comentario.trim(),
          website_hp: websiteHp
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo publicar la reseña');
      }

      if (data.resena) {
        setResenas((prev) => [data.resena, ...prev]);
      } else {
        await cargarResenas();
      }

      setComentario('');
      setCargo('');
      setEstrellas(5);
      setMensajeExito('¡Tu reseña ha sido publicada exitosamente!');
      setTimeout(() => setMensajeExito(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Error al publicar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarResena = async (id) => {
    try {
      const res = await fetch(`/api/resenas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResenas((prev) => prev.filter((r) => Number(r.id) !== Number(id)));
      }
    } catch (err) {
      console.error('Error eliminando reseña:', err);
    }
  };

  const promedioEstrellas =
    resenas.length > 0
      ? (resenas.reduce((acc, r) => acc + Number(r.estrellas || 5), 0) / resenas.length).toFixed(1)
      : '5.0';

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return 'Reciente';
    try {
      const d = new Date(fechaIso);
      return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Reciente';
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Cabecera de Ficha Google & Reseñas */}
      <div className="fes-page-banner">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-xs font-extrabold text-orange-300 uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>Ficha Oficial Verificada en Google Maps</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
              Ficha de Google Business & Reseñas
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Consulta nuestra ubicación georreferenciada en Ladrillera San Luis (Vereda Patio Bonito, Nemocón) y comparte tu experiencia con nuestros materiales.
            </p>
          </div>

          {/* Tarjeta Resumen de Calificación */}
          <div className="bg-white text-slate-900 p-4 sm:p-5 rounded-2xl shadow-xl flex items-center gap-4 shrink-0 border-2 border-orange-500">
            <div className="text-center pr-4 border-r border-slate-200">
              <span className="text-4xl font-black text-slate-900 font-mono block leading-none">
                {promedioEstrellas}
              </span>
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
              <span className="text-xs text-slate-600 block font-medium">
                {resenas.length === 0
                  ? 'Calificación oficial en planta'
                  : `${resenas.length} ${resenas.length === 1 ? 'reseña publicada' : 'reseñas publicadas'}`}
              </span>
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
                    <span>Vereda Patio Bonito, Nemocón — Ladrillera San Luis (5.13566, -73.90021)</span>
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

      {/* 3. Sección para Crear Reseñas y Ver Reseñas Publicadas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario para Crear Reseña */}
        <div className="lg:col-span-5">
          <div className="fes-card space-y-5 border-2 border-orange-500/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 block">
                  Tu Opinión Cuenta
                </span>
                <h2 className="text-xl font-black text-slate-900 font-heading">
                  Escribir una Reseña
                </h2>
              </div>
            </div>

            <form onSubmit={handleCrearResena} className="space-y-4">
              {/* Selector de Estrellas */}
              <div>
                <label className="fes-label">Calificación General *</label>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const active = (hoverEstrellas || estrellas) >= starValue;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setEstrellas(starValue)}
                          onMouseEnter={() => setHoverEstrellas(starValue)}
                          onMouseLeave={() => setHoverEstrellas(0)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          title={`${starValue} estrellas`}
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              active ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-extrabold text-slate-700 ml-2">
                    {estrellas} de 5 estrellas
                  </span>
                </div>
              </div>

              <div>
                <label className="fes-label" htmlFor="resena-nombre">
                  Tu Nombre o Empresa *
                </label>
                <input
                  id="resena-nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Ing. Juan Pérez / Constructora..."
                  className="fes-input"
                />
              </div>

              <div>
                <label className="fes-label" htmlFor="resena-cargo">
                  Profesión, Obra o Municipio (Opcional)
                </label>
                <input
                  id="resena-cargo"
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ej: Maestro de Obra — Zipaquirá"
                  className="fes-input"
                />
              </div>

              {/* Honeypot oculto anti-spam */}
              <input
                type="text"
                name="website_hp"
                value={websiteHp}
                onChange={(e) => setWebsiteHp(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div>
                <label className="fes-label" htmlFor="resena-comentario">
                  Tu Experiencia con Nuestros Materiales *
                </label>
                <textarea
                  id="resena-comentario"
                  rows={4}
                  required
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Cuéntanos qué material compraste y cómo te pareció la calidad y el servicio..."
                  className="fes-input resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                  {errorMsg}
                </div>
              )}

              {mensajeExito && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{mensajeExito}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary-cta w-full py-3.5 justify-center text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Publicando...' : 'Publicar Reseña'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Listado de Reseñas Creadas */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 block mb-1">
              Opiniones de Clientes
            </span>
            <h2 className="fes-section-title">
              Reseñas Publicadas ({resenas.length})
            </h2>
          </div>

          {loading ? (
            <div className="fes-card text-center py-12 text-slate-500 text-sm font-semibold">
              Cargando reseñas...
            </div>
          ) : resenas.length === 0 ? (
            <div className="fes-card text-center py-12 px-6 space-y-3 border-dashed border-2 border-slate-300 bg-slate-50/60">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                Aún no hay reseñas registradas
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Sé el primero en calificar la calidad de nuestros ladrillos, bloques y agregados utilizando el formulario de la izquierda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {resenas.map((rev) => (
                <div key={rev.id} className="fes-card flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-500">
                        {[...Array(Number(rev.estrellas) || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-400">
                          {formatearFecha(rev.creado_en)}
                        </span>
                        {user?.rol === 'admin' && (
                          <button
                            onClick={() => handleEliminarResena(rev.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Eliminar reseña"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                      "{rev.comentario}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-heading font-extrabold flex items-center justify-center text-sm uppercase">
                      {(rev.nombre || 'C').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{rev.nombre}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {rev.cargo || 'Cliente F.E.S. Construcción'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
