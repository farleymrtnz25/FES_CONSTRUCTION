import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, ShieldCheck, ArrowUp } from 'lucide-react';

export default function Footer({ onNavigate }) {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="footer" role="contentinfo">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <div className="footer-logo-text">F.E.S. Construcción</div>
                        <p style={{ marginBottom: '1.5rem', lineHeight: 1.7, maxWidth: 300 }}>
                            Facilitando la venta directa de materiales de construcción en arcilla,
                            conectando la tradición de Nemocón con la construcción moderna de Colombia.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-ghost btn-icon btn-sm" aria-label="Facebook"><Facebook size={18} /></button>
                            <button className="btn btn-ghost btn-icon btn-sm" aria-label="Instagram"><Instagram size={18} /></button>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <h4>Explorar</h4>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <button className="footer-link" onClick={() => onNavigate('inicio')}>Inicio</button>
                            <button className="footer-link" onClick={() => onNavigate('productos')}>Catálogo</button>
                            <button className="footer-link" onClick={() => onNavigate('nosotros')}>Nosotros</button>
                            <button className="footer-link" onClick={() => onNavigate('contacto')}>Contacto</button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <h4>Legal</h4>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <button className="footer-link" onClick={() => onNavigate('legal_privacidad')}>Política de Privacidad</button>
                            <button className="footer-link" onClick={() => onNavigate('legal_terminos')}>Términos del Servicio</button>
                            <button className="footer-link" onClick={() => onNavigate('legal_garantia')}>Garantía de Calidad</button>
                            <button className="footer-link" onClick={() => onNavigate('legal_sic')}>SIC Proteccion</button>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <h4>Contacto</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'var(--space-2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                                <Phone size={16} color="var(--color-primary)" />
                                <span>+57 320 821 6369</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                                <Mail size={16} color="var(--color-primary)" />
                                <span>info@fesconstruccion.com</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem' }}>
                                <MapPin size={16} color="var(--color-primary)" />
                                <span>Región de Nemocón, Cundinamarca, CO</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldCheck size={14} />
                        <span>&copy; {new Date().getFullYear()} F.E.S. Construcción. Transacciones seguras.</span>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={scrollToTop} style={{ gap: 6, fontSize: '0.75rem' }}>
                        Subir <ArrowUp size={12} />
                    </button>
                </div>
            </div>
        </footer>
    );
}
