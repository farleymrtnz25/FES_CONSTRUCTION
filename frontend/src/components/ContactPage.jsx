import React, { useState } from 'react';
import {
    Phone, Mail, MapPin, Clock, MessageCircle,
    Send, ExternalLink, Truck, Sparkles, Navigation
} from 'lucide-react';
import { isMobileApp } from '../config';
import ladrilleraImg from '../assets/ladrillera-san-luis.png';

const googleMapsUrl = "https://www.google.com/maps/place/Ladrillera+san+luis/@5.1356617,-73.9002196,17z/data=!3m1!4b1!4m6!3m5!1s0x8e406b8231369cef:0xdb3afe55f8012005!8m2!3d5.1356617!4d-73.9002196!16s%2Fg%2F11tk2c7twq!18m1!1e1?entry=ttu";
const wazeUrl = "https://waze.com/ul?ll=5.1356617,-73.9002196&navigate=yes";
const mapThumbnailUrl = "https://maps.googleapis.com/maps/api/staticmap?center=5.1356617,-73.9002196&zoom=15&size=640x320&markers=color:red%7C5.1356617,-73.9002196&key=AIzaSyBFw0Qbyul-6tgPKgl5HQ2PQTF5zFcWdvg";
// fallback thumbnail via OpenStreetMap (no API key needed)
const osmThumbnailUrl = "https://staticmap.openstreetmap.de/staticmap.php?center=5.1356617,-73.9002196&zoom=15&size=640x300&markers=5.1356617,-73.9002196,lightblue";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        ciudad: '',
        material: 'Ladrillos Prensados y Toletes',
        mensaje: ''
    });

    const px = isMobileApp ? '1rem' : '2rem';
    const outerPad = isMobileApp ? '1rem 1rem 5rem' : '3rem 5% 5rem';

    const handleWhatsAppSubmit = (e) => {
        e.preventDefault();
        const texto =
            `Hola F.E.S. Construcción, deseo cotizar materiales:\n\n` +
            `👤 *Nombre:* ${formData.nombre || 'No especificado'}\n` +
            `📱 *Teléfono:* ${formData.telefono || 'No especificado'}\n` +
            `📍 *Destino:* ${formData.ciudad || 'No especificado'}\n` +
            `🧱 *Línea de Interés:* ${formData.material}\n` +
            `💬 *Detalle / Cantidad:* ${formData.mensaje || 'Deseo asesoría de precios y disponibilidad.'}`;
        window.open(`https://wa.me/573208216369?text=${encodeURIComponent(texto)}`, '_blank');
    };

    const handleEmailSubmit = () => {
        const subject = encodeURIComponent(`Cotización de Materiales - ${formData.nombre || 'Cliente'}`);
        const body = encodeURIComponent(
            `Nombre: ${formData.nombre}\nTeléfono: ${formData.telefono}\nCiudad / Destino: ${formData.ciudad}\nMaterial: ${formData.material}\nMensaje:\n${formData.mensaje}`
        );
        window.open(`mailto:ysnfrl0@gmail.com?subject=${subject}&body=${body}`, '_blank');
    };

    // Quick contact cards data
    const cards = [
        {
            icon: <Phone size={22} />,
            bg: '#fef3c7', color: '#d97706',
            label: 'Línea Directa',
            value: '+57 320 821 6369',
            btnText: 'Llamar ahora',
            btnClass: 'btn btn-outline btn-sm',
            href: 'tel:+573208216369',
        },
        {
            icon: <MessageCircle size={22} />,
            bg: '#dcfce7', color: '#16a34a',
            label: 'WhatsApp Ventas',
            value: 'Respuesta Rápida',
            valueColor: '#16a34a',
            btnText: 'Chatear en WhatsApp',
            btnClass: 'btn btn-success btn-sm',
            href: 'https://wa.me/573208216369',
        },
        {
            icon: <Mail size={22} />,
            bg: '#e0e7ff', color: '#4f46e5',
            label: 'Correo Electrónico',
            value: 'ysnfrl0@gmail.com',
            btnText: 'Enviar Correo',
            btnClass: 'btn btn-outline btn-sm',
            href: 'mailto:ysnfrl0@gmail.com',
        },
        {
            icon: <MapPin size={22} />,
            bg: '#fee2e2', color: '#dc2626',
            label: 'Planta y Despachos',
            value: 'Ladrillera San Luis',
            btnText: 'Ver en Maps',
            btnClass: 'btn btn-primary btn-sm',
            href: googleMapsUrl,
        },
    ];

    return (
        <div className="animate-fade-in" style={{ padding: outerPad, maxWidth: '860px', margin: '0 auto' }}>

            {/* ── Header ── */}
            <div style={{ textAlign: 'center', marginBottom: isMobileApp ? '2rem' : '3rem' }}>
                <span className="badge badge-warning" style={{ fontSize: '0.82rem', padding: '5px 12px', marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={13} /> Atención Directa de Fábrica
                </span>
                <h1 style={{ fontSize: isMobileApp ? '1.7rem' : '2.4rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Contáctanos y Visita<br /><span style={{ color: 'var(--color-primary)' }}>Nuestra Planta</span>
                </h1>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                    Fabricación y venta directa de ladrillos, bloques, adoquines, tabletas y agregados.
                    Despachos a toda la Sabana de Bogotá y Cundinamarca.
                </p>
            </div>

            {/* ── Quick Contact Cards (2-col grid on mobile, 4 on desktop) ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobileApp ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '0.85rem',
                marginBottom: '1.75rem'
            }}>
                {cards.map((c, i) => (
                    <a key={i} href={c.href} target={c.href.startsWith('tel:') || c.href.startsWith('mailto:') ? '_self' : '_blank'} rel="noopener noreferrer"
                        className="card hover-elevate"
                        style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '10px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                            {c.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</div>
                            <div style={{ fontSize: isMobileApp ? '0.82rem' : '0.95rem', fontWeight: 800, color: c.valueColor || 'var(--color-text)', wordBreak: 'break-word', marginTop: 2 }}>{c.value}</div>
                        </div>
                        <span className={c.btnClass} style={{ fontSize: '0.78rem', padding: '6px 10px', textAlign: 'center', justifyContent: 'center', display: 'flex' }}>
                            {c.btnText}
                        </span>
                    </a>
                ))}
            </div>

            {/* ── Plant Photo ── */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
                <img
                    src={ladrilleraImg}
                    alt="Instalaciones Ladrillera San Luis"
                    style={{ width: '100%', height: isMobileApp ? '180px' : '260px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.82))', color: '#fff', padding: '1rem' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>Planta Ladrillera San Luis</div>
                    <div style={{ fontSize: '0.8rem', color: '#fef3c7' }}>Hornos artesanales de arcilla · Nemocón, Cundinamarca</div>
                </div>
            </div>

            {/* ── Cotización Form ── */}
            <div className="card" style={{ padding: px, marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Send size={19} color="var(--color-primary)" /> Solicita tu Cotización
                </h2>
                <p style={{ fontSize: '0.87rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    Completa el formulario y te enviamos cotización con transporte hasta tu obra.
                </p>

                <form onSubmit={handleWhatsAppSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                            Nombre o Empresa *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Carlos Rodríguez / Constructora del Norte"
                            required
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                WhatsApp *
                            </label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="320 000 0000"
                                required
                                value={formData.telefono}
                                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                Municipio / Obra *
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Chía / Bogotá / Zipaquirá"
                                required
                                value={formData.ciudad}
                                onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                            Material principal
                        </label>
                        <select
                            className="form-input"
                            value={formData.material}
                            onChange={e => setFormData({ ...formData, material: e.target.value })}
                        >
                            <option value="Ladrillos Prensados y Toletes">Ladrillos Prensados y Toletes</option>
                            <option value="Bloques Estructurales y No Estructurales">Bloques (N° 4, N° 5, Bloquelón)</option>
                            <option value="Refractarios de Alta Temperatura">Ladrillos Refractarios</option>
                            <option value="Tabletas y Rústicos">Tabletas y Acabados Rústicos</option>
                            <option value="Adoquines de Arcilla">Adoquines (Corbatín y Estándar)</option>
                            <option value="Agregados (Arena de Río, Amarilla, Mixto)">Agregados (Arena, Mixto)</option>
                            <option value="Varios Materiales / Obra Completa">Varios / Obra Completa</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                            Cantidad y detalles
                        </label>
                        <textarea
                            className="form-input"
                            rows={3}
                            placeholder="Ej: 2.500 ladrillos y 10 m³ arena de río para entregar en Chía..."
                            value={formData.mensaje}
                            onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                        <button type="submit" className="btn btn-success" style={{ justifyContent: 'center', gap: 6 }}>
                            <MessageCircle size={17} /> WhatsApp
                        </button>
                        <button type="button" onClick={handleEmailSubmit} className="btn btn-outline" style={{ justifyContent: 'center', gap: 6 }}>
                            <Mail size={17} /> Correo
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Horarios ── */}
            <div className="card" style={{ padding: px, marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} color="var(--color-primary)" /> Horarios de Atención y Despacho
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.1rem 0', fontSize: '0.92rem' }}>
                    {[
                        ['Lunes a Viernes', '6:00 AM – 6:00 PM'],
                        ['Sábados', '6:00 AM – 2:00 PM'],
                        ['Domingos y Festivos', 'Despachos Programados'],
                    ].map(([day, hours], i, arr) => (
                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>{day}</span>
                            <span style={{ fontWeight: 700, color: i === 2 ? 'var(--color-primary)' : 'var(--color-text)' }}>{hours}</span>
                        </li>
                    ))}
                </ul>
                <div style={{ background: '#fffbeb', padding: '0.9rem', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: 10, border: '1px solid #fde68a' }}>
                    <Truck size={22} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--color-text)' }}>Flota de Transporte:</strong> Volquetas sencillas, dobletroques y mulas para entrega directa en pie de obra.
                    </div>
                </div>
            </div>

            {/* ── Mapa (mobile-safe: imagen + botón) ── */}
            <div className="card" style={{ padding: px, overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.2rem' }}>
                            <MapPin size={20} color="#dc2626" /> Cómo Llegar
                        </h2>
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                            Ladrillera San Luis · Nemocón, Cundinamarca
                        </p>
                    </div>
                </div>

                {/* Map preview image — works on Capacitor WebView */}
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', marginBottom: '0.9rem', position: 'relative' }}>
                    {/* Static OSM map tile */}
                    <img
                        src={`https://staticmap.openstreetmap.de/staticmap.php?center=5.1356617,-73.9002196&zoom=15&size=640x280&markers=5.1356617,-73.9002196,lightblue`}
                        alt="Mapa Ladrillera San Luis"
                        style={{ width: '100%', height: isMobileApp ? '160px' : '240px', objectFit: 'cover', display: 'block' }}
                        onError={e => {
                            // fallback to colored placeholder
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                    />
                    {/* Fallback when map tile fails */}
                    <div style={{
                        display: 'none', height: isMobileApp ? '160px' : '240px',
                        background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8
                    }}>
                        <MapPin size={36} color="#dc2626" />
                        <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.95rem' }}>Ladrillera San Luis</span>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Nemocón, Cundinamarca</span>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>5.1356617, -73.9002196</span>
                    </div>

                    {/* Tap to open overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '0.6rem' }}>
                        <span style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ExternalLink size={12} /> Toca para abrir
                        </span>
                    </div>
                </a>

                {/* Open in Maps / Waze buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ justifyContent: 'center', gap: 6 }}>
                        <Navigation size={15} /> Google Maps
                    </a>
                    <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ justifyContent: 'center', gap: 6 }}>
                        <ExternalLink size={15} /> Waze
                    </a>
                </div>
            </div>

        </div>
    );
}
