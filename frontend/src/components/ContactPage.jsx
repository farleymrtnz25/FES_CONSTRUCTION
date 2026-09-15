import React from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, MessageCircle } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="animate-fade-in" style={{ padding: '4rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1rem' }}>
                    Contáctate <span style={{ color: 'var(--color-primary)' }}>Con Nosotros</span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                    Estamos listos para atenderte y ser parte de tus mejores proyectos. ¡Escríbenos o visítanos!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Info Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card hover-elevate" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                            <Phone size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Teléfono</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>+57 320 821 6369</p>
                        </div>
                    </div>

                    <div className="card hover-elevate" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: 50, height: 50, borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>WhatsApp</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>¡Escríbenos para una respuesta rápida!</p>
                            <a href="https://wa.me/573208216369" target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                                Enviar mensaje
                            </a>
                        </div>
                    </div>

                    <div className="card hover-elevate" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}>
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Correo Electrónico</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>contacto@tuproyecto.com</p>
                        </div>
                    </div>

                    <div className="card hover-elevate" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: 50, height: 50, borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Ubicación</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Calle 123 # 45 - 67<br />Bogotá, Colombia</p>
                        </div>
                    </div>
                </div>

                {/* Info / Business Hours */}
                <div>
                    <div className="card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={20} color="var(--color-primary)" /> Horarios de Atención
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.05rem', color: 'var(--color-text-muted)' }}>
                                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <span>Lunes a Viernes</span>
                                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>7:00 AM - 6:00 PM</span>
                                </li>
                                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <span>Sábados</span>
                                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>8:00 AM - 2:00 PM</span>
                                </li>
                                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                                    <span>Domingos y Festivos</span>
                                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Cerrado</span>
                                </li>
                            </ul>
                        </div>

                        <div style={{ marginTop: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Síguenos en Redes Sociales</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-ghost btn-icon" style={{ background: '#f3f4f6', color: '#1877F2' }}><Facebook size={20} /></button>
                                <button className="btn btn-ghost btn-icon" style={{ background: '#f3f4f6', color: '#E4405F' }}><Instagram size={20} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
