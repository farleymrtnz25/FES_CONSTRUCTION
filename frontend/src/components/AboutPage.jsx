import React from 'react';
import { Building2, HardHat, Award, Target, Phone, Mail, MapPin } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="animate-fade-in" style={{ padding: '4rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1rem' }}>
                    Nuestra <span style={{ color: 'var(--color-primary)' }}>Historia</span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                    Construyendo el futuro con la solidez de nuestras raíces.
                </p>
            </div>

            {/* Story Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ alignItems: 'center', marginBottom: '4rem' }}>
                <div className="card" style={{ padding: '2rem', background: 'var(--color-bg)', border: 'none', boxShadow: 'none' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                        De Raíces Fuertes a Innovación Constante
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.8 }}>
                        Toda mi vida he estado inmerso en el mundo de la construcción. Crecí viendo el esfuerzo, la dedicación y el detalle que requiere la creación y venta de materiales de construcción. Ese entorno formó mi carácter y mi visión empresarial desde muy joven.
                    </p>
                    <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.8 }}>
                        Hoy, complementando esa experiencia vital de primera mano con mis estudios profesionales en ingeniería, he decidido dar un paso más allá. F.E.S. Construcción nace de esa profunda convicción: el deseo de honrar mis raíces, aplicando tecnología, eficiencia y estándares modernos a la industria con la que crecí.
                    </p>
                    <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                        Nuestra misión no es solo vender materiales, sino ser el aliado estratégico en cada uno de tus proyectos. Entendemos tus necesidades porque hablamos tu mismo idioma, fusionando la sabiduría de la experiencia tradicional con la innovación de las nuevas herramientas de gestión.
                    </p>
                </div>
                <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    {/* Placeholder for an image or graphic */}
                    <div style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={120} color="white" opacity={0.8} />
                    </div>
                </div>
            </div>

            {/* Values / Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginTop: '3rem' }}>
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--color-primary)' }}>
                        <HardHat size={30} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Experiencia Genuina</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Conocemos los materiales desde su origen. Nuestra asesoría no es teórica, es fruto de años en el terreno.</p>
                </div>
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--color-primary)' }}>
                        <Award size={30} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Calidad Asegurada</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Seleccionamos los mejores insumos porque sabemos que la seguridad de tu obra depende de nuestra calidad.</p>
                </div>
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--color-primary)' }}>
                        <Target size={30} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Modernización</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Integrando tecnología actual para optimizar procesos, entregas y ofrecerte una experiencia de compra superior.</p>
                </div>
            </div>
        </div>
    );
}
