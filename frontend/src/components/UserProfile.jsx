import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, ExternalLink, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const fmt = n => n.toLocaleString('es-CO');

const STATUS_COLORS = {
    'Pendiente': 'badge-warning',
    'En Proceso': 'badge-info',
    'Enviado': 'badge-primary',
    'Entregado': 'badge-success',
    'Cancelado': 'badge-danger'
};

export default function UserProfile() {
    const { user, authFetch } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const res = await authFetch(`${API_BASE_URL}/api/pedidos/mis-pedidos`);
                if (res.ok) {
                    const data = await res.json();
                    setPedidos(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPedidos();
    }, [authFetch]);

    if (!user) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Por favor inicia sesión para ver tu perfil.</div>;

    return (
        <div className="profile-page">
            <div className="container">
                {/* Profile Header */}
                <div className="profile-header animate-fade-in">
                    <div className="profile-avatar">
                        {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="profile-name">{user.nombre}</h1>
                        <p className="profile-email">{user.email}</p>
                        <div style={{ marginTop: '0.5rem' }}>
                            <span className={`badge ${user.rol === 'admin' ? 'badge-warning' : 'badge-primary'}`}>
                                {user.rol === 'admin' ? '🛡️ Administrador' : '👤 Cliente'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Orders History */}
                    <div className="lg:col-span-2">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Clock size={20} color="var(--color-primary)" />
                            Historial de Pedidos
                        </h2>

                        {loading ? (
                            <div style={{ padding: '2rem 0', textAlign: 'center' }}><div className="spinner" /></div>
                        ) : pedidos.length === 0 ? (
                            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                <Package size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
                                <p style={{ color: 'var(--color-text-muted)' }}>Aún no has realizado ningún pedido.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pedidos.map((p, i) => (
                                    <div key={p.id} className="order-card animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="order-header">
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>Pedido #{p.id}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                    {new Date(p.creado_en).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <span className={`badge ${STATUS_COLORS[p.estado]}`}>{p.estado}</span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 12 }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Productos</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.detalle.length} ítem(s)</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total</div>
                                                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>${fmt(p.total)}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Pago</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.metodo_pago}</div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '1rem' }}>
                                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Detalle:</h4>
                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                {p.detalle.map((item, idx) => (
                                                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0', borderBottom: idx < p.detalle.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                                        <span>{item.nombre_producto} <span style={{ color: 'var(--color-text-muted)' }}>× {item.cantidad}</span></span>
                                                        <span style={{ fontWeight: 600 }}>${fmt(item.subtotal)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-1">
                        <div className="card" style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' }}>
                            <div className="card-body">
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <MapPin size={18} color="var(--color-primary)" />
                                    Información de la Cuenta
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Registrado el:</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                            {new Date(user.creado_en || Date.now()).toLocaleDateString('es-CO')}
                                        </div>
                                    </div>

                                    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

                                    <div className="alert-info" style={{ padding: '1rem', background: 'var(--color-primary-light)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}>
                                        <strong>¿Necesitas ayuda?</strong>
                                        <p style={{ marginTop: 4 }}>Si tienes dudas sobre tus pedidos, contáctanos por WhatsApp para asistencia rápida.</p>
                                        <button className="btn btn-primary btn-sm btn-full" style={{ marginTop: 10 }} onClick={() => window.open('https://wa.me/573208216369', '_blank')}>
                                            WhatsApp Soporte
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
