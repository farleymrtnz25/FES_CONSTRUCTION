import React, { useState } from 'react';
import { 
    Phone, Mail, MapPin, Clock, MessageCircle, 
    Send, ExternalLink, ShieldCheck, Truck, Sparkles, Navigation 
} from 'lucide-react';
import ladrilleraImg from '../assets/ladrillera-san-luis.png';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        ciudad: '',
        material: 'Ladrillos',
        mensaje: ''
    });

    const googleMapsUrl = "https://www.google.com/maps/place/Ladrillera+san+luis/@5.1356617,-73.9002196,17z/data=!3m1!4b1!4m6!3m5!1s0x8e406b8231369cef:0xdb3afe55f8012005!8m2!3d5.1356617!4d-73.9002196!16s%2Fg%2F11tk2c7twq!18m1!1e1?entry=ttu";
    const googleMapsEmbedUrl = "https://maps.google.com/maps?q=5.1356617,-73.9002196&hl=es&z=16&output=embed";

    const handleWhatsAppSubmit = (e) => {
        e.preventDefault();
        const texto = `Hola F.E.S. Construcción, deseo cotizar materiales:\n\n` +
            `👤 *Nombre:* ${formData.nombre || 'No especificado'}\n` +
            `📱 *Teléfono:* ${formData.telefono || 'No especificado'}\n` +
            `📍 *Destino:* ${formData.ciudad || 'No especificado'}\n` +
            `🧱 *Línea de Interés:* ${formData.material}\n` +
            `💬 *Detalle / Cantidad:* ${formData.mensaje || 'Deseo asesoría de precios y disponibilidad.'}`;
        
        const url = `https://wa.me/573208216369?text=${encodeURIComponent(texto)}`;
        window.open(url, '_blank');
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        const subject = encodeURIComponent(`Cotización de Materiales - ${formData.nombre || 'Cliente'}`);
        const body = encodeURIComponent(
            `Nombre: ${formData.nombre}\n` +
            `Teléfono: ${formData.telefono}\n` +
            `Ciudad / Destino: ${formData.ciudad}\n` +
            `Material: ${formData.material}\n` +
            `Mensaje:\n${formData.mensaje}`
        );
        window.location.href = `mailto:ysnfrl0@gmail.com?subject=${subject}&body=${body}`;
    };

    return (
        <div className="animate-fade-in" style={{ padding: '3rem 5% 5rem', maxWidth: '1280px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '6px 14px', marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} /> Atención Directa de Fábrica
                </span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                    Contáctanos y Visita Nuestra <span style={{ color: 'var(--color-primary)' }}>Planta</span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '720px', margin: '0 auto', lineHeight: 1.7 }}>
                    Fabricación y venta directa de ladrillos, bloques, adoquines, tabletas y agregados. 
                    Despachos certificados a toda la Sabana de Bogotá y Cundinamarca.
                </p>
            </div>

            {/* Quick Contact Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
                {/* Teléfono */}
                <div className="card hover-elevate" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                            <Phone size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Línea Directa</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>+57 320 821 6369</div>
                        </div>
                    </div>
                    <a href="tel:+573208216369" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                        Llamar ahora
                    </a>
                </div>

                {/* WhatsApp */}
                <div className="card hover-elevate" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                            <MessageCircle size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>WhatsApp Ventas</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a' }}>Respuesta Rápida</div>
                        </div>
                    </div>
                    <a href="https://wa.me/573208216369" target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm" style={{ width: '100%', justifyContent: 'center', gap: 6 }}>
                        <MessageCircle size={16} /> Chatear en WhatsApp
                    </a>
                </div>

                {/* Correo */}
                <div className="card hover-elevate" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                            <Mail size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Correo Electrónico</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)', wordBreak: 'break-all' }}>ysnfrl0@gmail.com</div>
                        </div>
                    </div>
                    <a href="mailto:ysnfrl0@gmail.com" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                        Enviar Correo
                    </a>
                </div>

                {/* Ubicación */}
                <div className="card hover-elevate" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                            <MapPin size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Planta y Despachos</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)' }}>Ladrillera San Luis</div>
                        </div>
                    </div>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', gap: 6 }}>
                        <Navigation size={14} /> Ver en Maps
                    </a>
                </div>
            </div>

            {/* Main Content: Form + Plant Image & Map */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '3.5rem' }}>
                {/* Cotización Rápida Form */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Send size={20} color="var(--color-primary)" /> Solicita tu Cotización
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                            Ingresa tus requerimientos y te enviaremos la cotización formal con transporte incluido hasta tu obra.
                        </p>
                    </div>

                    <form onSubmit={handleWhatsAppSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                                Nombre completo o Empresa *
                            </label>
                            <input 
                                type="text"
                                className="form-input"
                                placeholder="Ej: Carlos Rodríguez / Constructora del Norte"
                                required
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                                    Teléfono / WhatsApp *
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
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                                    Municipio / Obra *
                                </label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Nemocón / Chía / Bogotá"
                                    required
                                    value={formData.ciudad}
                                    onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                                Tipo de Material Principal
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
                                <option value="Agregados (Arena de Río, Amarilla, Mixto)">Agregados (Arena de Río, Amarilla, Mixto)</option>
                                <option value="Varios Materiales / Obra Completa">Varios Materiales / Obra Completa</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                                Cantidad estimada y detalles de la entrega
                            </label>
                            <textarea 
                                className="form-input"
                                rows={3}
                                placeholder="Ej: Necesito 2.500 ladrillos prensados y 10 m³ de arena de río para entregar en Chía..."
                                value={formData.mensaje}
                                onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button type="submit" className="btn btn-success" style={{ width: '100%', justifyContent: 'center', gap: 6 }}>
                                <MessageCircle size={18} /> Cotizar por WhatsApp
                            </button>
                            <button type="button" onClick={handleEmailSubmit} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', gap: 6 }}>
                                <Mail size={18} /> Enviar Correo
                            </button>
                        </div>
                    </form>
                </div>

                {/* Plant Photo + Business Hours & Dispatch Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Plant Facility Photo */}
                    <div className="card overflow-hidden" style={{ padding: 0, position: 'relative' }}>
                        <img 
                            src={ladrilleraImg} 
                            alt="Instalaciones de Ladrillera San Luis - Nemocón"
                            style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ 
                            position: 'absolute', bottom: 0, left: 0, right: 0, 
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', 
                            color: '#ffffff', padding: '1.25rem' 
                        }}>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>Planta Ladrillera San Luis</div>
                            <div style={{ fontSize: '0.85rem', color: '#fef3c7' }}>
                                Hornos artesanales de arcilla y patio de acopio · Nemocón, Cundinamarca
                            </div>
                        </div>
                    </div>

                    {/* Hours & Dispatch Info */}
                    <div className="card" style={{ padding: '1.75rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={18} color="var(--color-primary)" /> Horarios de Despacho y Atención
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', fontSize: '0.95rem' }}>
                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Lunes a Viernes</span>
                                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>6:00 AM – 6:00 PM</span>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Sábados</span>
                                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>6:00 AM – 2:00 PM</span>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Domingos y Festivos</span>
                                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Despachos Programados</span>
                            </li>
                        </ul>

                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--color-border)' }}>
                            <Truck size={24} color="#d97706" style={{ flexShrink: 0 }} />
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                                <strong style={{ color: 'var(--color-text)' }}>Flota de Transporte:</strong> Contamos con servicio de volquetas sencillas, dobletroques y mulas para entrega directa en pie de obra.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Google Maps Section */}
            <div className="card" style={{ padding: '2rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.35rem' }}>
                            <MapPin size={22} color="#dc2626" /> Ubicación en Google Maps
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                            Ladrillera San Luis · Coordenadas: 5.1356617, -73.9002196 · Nemocón, Cundinamarca, Colombia
                        </p>
                    </div>
                    <a 
                        href={googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary btn-sm"
                        style={{ gap: 8 }}
                    >
                        <ExternalLink size={16} /> Abrir en Google Maps / Waze
                    </a>
                </div>

                {/* Map iframe */}
                <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <iframe
                        title="Ubicación Ladrillera San Luis"
                        src={googleMapsEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </div>
    );
}
