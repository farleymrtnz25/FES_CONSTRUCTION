import React, { useState } from 'react';
import { 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  MessageCircle,
  Building2,
  Clock
} from 'lucide-react';
import ladrilleraImg from '../assets/ladrillera-san-luis.png';

const TARGET_EMAIL = 'frlmrtnz@gmail.com';

export const ContactSection = () => {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    municipio: '',
    mensaje: '',
    website_hp: '' // Anti-spam Honeypot (Requisito 17)
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    if (form.website_hp) {
      setStatus({ loading: false, success: true, error: null });
      return;
    }

    const subject = `Solicitud de Cotización y Flete - ${form.nombre || 'Cliente Obra'}`;
    const bodyText =
      `SOLICITUD DE COTIZACIÓN Y FLETE - F.E.S. CONSTRUCCIÓN\n` +
      `====================================================\n` +
      `Nombre o Constructora: ${form.nombre}\n` +
      `Teléfono / WhatsApp: ${form.telefono}\n` +
      `Correo del Cliente: ${form.email || 'No especificado'}\n` +
      `Municipio / Destino de Entrega: ${form.municipio}\n\n` +
      `Materiales y Cantidades Requeridas:\n${form.mensaje}\n`;

    try {
      // 1. Registrar en backend y enviar por FormSubmit hacia frlmrtnz@gmail.com
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          mensaje: `[Municipio: ${form.municipio || 'Vereda Patio Bonito / Sabana'}] ${form.mensaje}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar solicitud');

      // 2. Abrir cliente de correo dirigido a frlmrtnz@gmail.com con la solicitud lista
      window.location.href = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

      setStatus({ loading: false, success: true, error: null });
      setForm({ nombre: '', telefono: '', email: '', municipio: '', mensaje: '', website_hp: '' });
    } catch (err) {
      // Fallback directo por mailto si hubiera corte de red
      window.location.href = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
      setStatus({ loading: false, success: true, error: null });
    }
  };

  const handleDirectWhatsApp = () => {
    const phone = '573208216369';
    const text = `Hola F.E.S. Construcción, mi nombre es *${form.nombre || 'Cliente de Obra'}* (${form.telefono || ''}).\nNecesito cotizar materiales para entrega en *${form.municipio || 'Cundinamarca'}*:\n${form.mensaje || 'Solicito lista de precios y disponibilidad.'}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Cabecera de Contacto */}
      <div className="fes-page-banner">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-xs font-extrabold text-orange-300 uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Atención Comercial • Vereda Patio Bonito</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Contacto Directo y Coordinación de Despachos
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Comunícate sin intermediarios con nuestro equipo de despacho en Ladrillera San Luis (Vereda Patio Bonito) o envíanos tu solicitud al correo oficial.
          </p>
        </div>
      </div>

      {/* 2. Tarjetas de Canales Directos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <a
          href="https://wa.me/573208216369?text=Hola%20F.E.S.%20Construcci%C3%B3n,%20deseo%20cotizar%20materiales%20puestos%20en%20obra."
          target="_blank"
          rel="noopener noreferrer"
          className="fes-card fes-card-interactive flex items-center gap-4 no-underline"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block">
              WhatsApp Oficial 24/7
            </span>
            <strong className="font-heading text-xl font-black text-slate-900 block">
              +57 320 821 6369
            </strong>
            <span className="text-xs text-slate-500">Clic para chatear con despacho →</span>
          </div>
        </a>

        <a
          href={`mailto:${TARGET_EMAIL}`}
          className="fes-card fes-card-interactive flex items-center gap-4 no-underline"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-700 block">
              Correo Licitaciones y Ventas
            </span>
            <strong className="font-heading text-lg font-black text-slate-900 block">
              {TARGET_EMAIL}
            </strong>
            <span className="text-xs text-slate-500">Recepción directa de solicitudes</span>
          </div>
        </a>

        <a
          href="https://www.google.com/maps/place/Ladrillera+san+luis/@5.1356617,-73.9002196,17z"
          target="_blank"
          rel="noopener noreferrer"
          className="fes-card fes-card-interactive flex items-center gap-4 no-underline"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <MapPin className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 block">
              Planta de Producción
            </span>
            <strong className="font-heading text-lg font-black text-slate-900 block">
              Vereda Patio Bonito
            </strong>
            <span className="text-xs text-slate-500">Ladrillera San Luis • Cundinamarca</span>
          </div>
        </a>

      </div>

      {/* 3. Formulario + Información de Planta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Columna Izquierda: Resumen Logístico */}
        <div className="lg:col-span-5 space-y-6">
          <div className="fes-card space-y-4">
            <img
              src={ladrilleraImg}
              alt="Patio de cargue Ladrillera San Luis Vereda Patio Bonito"
              className="w-full h-52 object-cover rounded-xl border border-slate-200"
            />
            <h3 className="font-heading font-extrabold text-xl text-slate-900">
              Cobertura de Entrega a Pie de Obra
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Coordinamos transporte desde <strong>Vereda Patio Bonito</strong> en volqueta sencilla, doble troque y tractomula hacia:
            </p>
            <ul className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bogotá D.C.</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chía y Cajicá</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zipaquirá y Tocancipá</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Nemocón y Suesca</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sabana Norte y Centro</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cundinamarca y Boyacá</li>
            </ul>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-700">
              <Clock className="w-5 h-5 text-orange-600 shrink-0" />
              <span>
                <strong>Horario de Atención en Planta:</strong> Lunes a Sábado de 6:00 AM a 6:00 PM.
              </span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Cotización */}
        <div className="lg:col-span-7">
          <div className="fes-card space-y-6 border-t-4 border-t-orange-600">
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                Formulario de Solicitud de Cotización y Flete
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Tu solicitud se envía directamente a nuestro correo oficial <strong>{TARGET_EMAIL}</strong>.
              </p>
            </div>

            {status.success && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  ¡Solicitud enviada a <strong>{TARGET_EMAIL}</strong>! Nuestro equipo de despacho te responderá a la brevedad.
                </span>
              </div>
            )}

            {status.error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{status.error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot anti-spam (Requisito 17) */}
              <input
                type="text"
                name="website_hp"
                value={form.website_hp}
                onChange={(e) => setForm({ ...form, website_hp: e.target.value })}
                className="hp-field"
                tabIndex="-1"
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="fes-label">Nombre o Constructora *</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Ing. Juan Pérez / Constructora"
                    className="fes-input"
                  />
                </div>

                <div>
                  <label className="fes-label">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Ej: 320 821 6369"
                    className="fes-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="fes-label">Tu Correo Electrónico</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="compras@constructora.com"
                    className="fes-input"
                  />
                </div>

                <div>
                  <label className="fes-label">Municipio o Ciudad de Entrega *</label>
                  <input
                    type="text"
                    required
                    value={form.municipio}
                    onChange={(e) => setForm({ ...form, municipio: e.target.value })}
                    placeholder="Ej: Chía, Zipaquirá, Bogotá..."
                    className="fes-input"
                  />
                </div>
              </div>

              <div>
                <label className="fes-label">Materiales y Cantidades Requeridas *</label>
                <textarea
                  required
                  rows="4"
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  placeholder="Ej: Solicito cotización de 8.000 ladrillos pequeños rosados (18*9*6) y 14 m³ de arena de río puestos en obra..."
                  className="fes-input resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="submit"
                  disabled={status.loading}
                  className="btn-primary-cta w-full justify-center py-3.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>{status.loading ? 'Enviando...' : `Enviar Solicitud a ${TARGET_EMAIL}`}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="fes-btn-secondary w-full justify-center py-3.5 !border-emerald-600 !text-emerald-700 hover:!bg-emerald-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar también por WhatsApp</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Envío directo a {TARGET_EMAIL} protegido con filtro anti-spam Honeypot.</span>
              </div>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
