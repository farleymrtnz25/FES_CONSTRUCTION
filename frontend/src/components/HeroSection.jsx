import React from 'react';
import { Truck, Award, Leaf, Users, ArrowRight, Star, CheckCircle } from 'lucide-react';

export default function HeroSection({ onNavigate }) {
    return (
        <div style={{ overflowX: 'hidden' }}>
            {/* ── Hero ── */}
            <section className="hero" aria-labelledby="hero-heading">
                <div className="hero-bg-gradient" />
                <div className="hero-orb hero-orb-1" />
                <div className="hero-orb hero-orb-2" />

                <div className="hero-inner">
                    <div className="animate-slide-up">
                        <div className="hero-badge">
                            <Star size={12} fill="currentColor" />
                            Materiales artesanales de alta calidad
                        </div>

                        <h1 id="hero-heading">
                            Construye con la{' '}
                            <span className="gradient-text">Tradición de Colombia</span>
                        </h1>

                        <p>
                            F.E.S. Construcción conecta a constructores directamente con productores artesanales de Nemocón.
                            Materiales en arcilla de primera calidad, sin intermediarios.
                        </p>

                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('productos')}>
                                Ver Catálogo <ArrowRight size={18} />
                            </button>
                            <button className="btn btn-secondary btn-lg" style={{ color: 'rgba(255,255,255,.8)', borderColor: 'rgba(255,255,255,.3)' }} onClick={() => onNavigate('nosotros')}>
                                Nuestra Historia
                            </button>
                        </div>

                        <div className="hero-stats">
                            {[
                                { num: '10+', label: 'Productos disponibles' },
                                { num: '100%', label: 'Arcilla artesanal' },
                                { num: '24h', label: 'Atención WhatsApp' },
                            ].map(stat => (
                                <div key={stat.label}>
                                    <div className="hero-stat-num">{stat.num}</div>
                                    <div className="hero-stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hero-image animate-fade-in">
                        <img
                            src="/src/assets/hero-materials.png"
                            alt="Materiales de construcción en arcilla de F.E.S."
                        />
                        <div className="hero-image-badge">
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle size={20} color="#d97706" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Calidad Garantizada</div>
                                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Certificado artesanal</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Values ── */}
            <section style={{ padding: '5rem 0', background: 'var(--color-surface)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Nuestros <span className="gradient-text">Valores</span></h2>
                        <p className="section-subtitle">Lo que nos guía en cada proyecto y entrega</p>
                    </div>
                    <div className="values-grid">
                        {[
                            {
                                icon: <Leaf size={24} color="white" />,
                                bg: 'linear-gradient(135deg,#16a34a,#15803d)',
                                title: 'Innovación con Propósito',
                                desc: 'Aplicamos herramientas digitales para modernizar un sector tradicional y generar impacto positivo en la economía local.',
                            },
                            {
                                icon: <Users size={24} color="white" />,
                                bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                                title: 'Compromiso Local',
                                desc: 'Fortalecemos la economía regional de Nemocón y representamos el potencial artesanal de nuestra comunidad.',
                            },
                            {
                                icon: <Award size={24} color="white" />,
                                bg: 'linear-gradient(135deg,#d97706,#ea580c)',
                                title: 'Calidad y Tradición',
                                desc: 'Materiales de arcilla con altos estándares de calidad que respetan la historia y dedicación artesanal de generaciones.',
                            },
                            {
                                icon: <Truck size={24} color="white" />,
                                bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                                title: 'Entrega Directa',
                                desc: 'Eliminamos intermediarios conectando directamente productores con constructores para mejores precios y calidad.',
                            },
                        ].map((v, i) => (
                            <div key={i} className="value-card" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="value-icon" style={{ background: v.bg }}>{v.icon}</div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>{v.title}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mission / Vision ── */}
            <section style={{ padding: '5rem 0', background: 'var(--color-bg)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Misión & <span className="gradient-text">Visión</span></h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {[
                            {
                                title: '🎯 Nuestra Misión',
                                text: 'Facilitamos la venta directa de materiales de construcción en arcilla a través de nuestra plataforma web, creando un canal que elimina intermediarios, mejora la rentabilidad para los productores locales y facilita a constructores el acceso a materiales de alta calidad con historia y tradición.',
                                accent: '#d97706'
                            },
                            {
                                title: '🔭 Nuestra Visión',
                                text: 'Proyectamos ser la plataforma digital líder y referente nacional para la comercialización de materiales de construcción en arcilla, expandiendo nuestras actividades para crear un ecosistema completo con soluciones logísticas y financieras para la economía artesanal colombiana.',
                                accent: '#7c3aed'
                            }
                        ].map((item, i) => (
                            <div key={i} className="card" style={{ borderTop: `4px solid ${item.accent}` }}>
                                <div className="card-body">
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 'var(--space-4)' }}>{item.title}</h3>
                                    <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Strip ── */}
            <section style={{
                background: 'linear-gradient(135deg,#d97706,#ea580c)',
                padding: '4rem 0', textAlign: 'center', color: 'white'
            }}>
                <div className="container">
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                        ¿Listo para construir con calidad?
                    </h2>
                    <p style={{ opacity: .85, marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Explora nuestro catálogo de materiales artesanales o contáctanos directamente.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-dark btn-lg" onClick={() => onNavigate('productos')}>
                            Ver Productos <ArrowRight size={18} />
                        </button>
                        <button
                            className="btn btn-lg"
                            style={{ background: 'rgba(255,255,255,.2)', color: 'white', borderColor: 'rgba(255,255,255,.5)' }}
                            onClick={() => window.open('https://wa.me/573208216369', '_blank')}
                        >
                            WhatsApp
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
