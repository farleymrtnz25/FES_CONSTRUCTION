import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logoImg from '../assets/logo.png';

export default function Navbar({ activeSection, setActiveSection }) {
    const { user, logout, isAdmin } = useAuth();
    const { totals, setIsOpen } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const navItems = [
        { key: 'inicio', label: 'Inicio' },
        { key: 'productos', label: 'Productos' },
        { key: 'nosotros', label: 'Nosotros' },
        { key: 'contacto', label: 'Contacto' },
    ];

    const navigate = (section) => {
        setActiveSection(section);
        setMobileOpen(false);
        setUserMenuOpen(false);
    };

    const handleLogout = () => { logout(); navigate('inicio'); };

    return (
        <>
            <header className={`navbar${scrolled ? ' scrolled' : ''}`} id="main-navbar">
                <div className="navbar-inner">
                    {/* Logo */}
                    <button className="navbar-logo" onClick={() => navigate('inicio')} aria-label="Inicio">
                        <img src={logoImg} alt="F.E.S. Construcción" onError={e => { e.target.style.display = 'none'; }} />
                        <span className="navbar-logo-text">F.E.S. Construcción</span>
                    </button>

                    {/* Desktop Nav */}
                    <nav className="navbar-nav" aria-label="Navegación principal">
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                className={`nav-link${activeSection === item.key ? ' active' : ''}`}
                                onClick={() => navigate(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                        {isAdmin && (
                            <button
                                className={`nav-link${activeSection === 'admin' ? ' active' : ''}`}
                                onClick={() => navigate('admin')}
                                style={{ color: '#d97706', fontWeight: 700 }}
                            >
                                <Shield size={14} style={{ marginRight: 4, display: 'inline' }} />
                                Admin
                            </button>
                        )}
                    </nav>

                    {/* Actions */}
                    <div className="navbar-actions">
                        {/* Cart */}
                        <button className="cart-btn" onClick={() => setIsOpen(true)} aria-label="Abrir carrito">
                            <ShoppingCart size={22} />
                            {totals.count > 0 && (
                                <span className="cart-badge" aria-live="polite">{totals.count}</span>
                            )}
                        </button>

                        {/* User Menu */}
                        {user ? (
                            <div style={{ position: 'relative' }}>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    style={{ gap: 6 }}
                                    onClick={() => setUserMenuOpen(p => !p)}
                                    aria-expanded={userMenuOpen}
                                >
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#d97706,#ea580c)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '.8rem', fontWeight: 800
                                    }}>
                                        {user.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.nombre.split(' ')[0]}
                                    </span>
                                    <ChevronDown size={14} />
                                </button>

                                {userMenuOpen && (
                                    <div style={{
                                        position: 'absolute', right: 0, top: '110%',
                                        background: 'white', borderRadius: 12,
                                        boxShadow: '0 10px 40px rgba(0,0,0,.15)', border: '1px solid #e5e7eb',
                                        minWidth: 180, zIndex: 200, padding: '6px',
                                        animation: 'slideDown 200ms ease both'
                                    }}>
                                        <button className="mobile-nav-link" onClick={() => navigate('perfil')} style={{ borderRadius: 8 }}>
                                            <User size={16} /> Mi Perfil
                                        </button>
                                        {isAdmin && (
                                            <button className="mobile-nav-link" onClick={() => navigate('admin')} style={{ borderRadius: 8, color: '#d97706' }}>
                                                <Shield size={16} /> Panel Admin
                                            </button>
                                        )}
                                        <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                                        <button className="mobile-nav-link" onClick={handleLogout} style={{ borderRadius: 8, color: '#dc2626' }}>
                                            <LogOut size={16} /> Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => navigate('auth')}>
                                Ingresar
                            </button>
                        )}

                        {/* Mobile toggle */}
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileOpen(p => !p)}
                            aria-label="Menú"
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Nav */}
            {mobileOpen && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 97 }} onClick={() => setMobileOpen(false)} />
                    <nav className="mobile-nav" aria-label="Navegación móvil">
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                className={`mobile-nav-link${activeSection === item.key ? ' active' : ''}`}
                                onClick={() => navigate(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                        {isAdmin && (
                            <button className="mobile-nav-link" onClick={() => navigate('admin')} style={{ color: '#d97706' }}>
                                <Shield size={16} /> Panel Admin
                            </button>
                        )}
                        <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
                        {user ? (
                            <>
                                <button className="mobile-nav-link" onClick={() => navigate('perfil')}>
                                    <User size={16} /> Mi Perfil
                                </button>
                                <button className="mobile-nav-link" onClick={handleLogout} style={{ color: '#dc2626' }}>
                                    <LogOut size={16} /> Cerrar sesión
                                </button>
                            </>
                        ) : (
                            <button className="mobile-nav-link" onClick={() => navigate('auth')}>
                                <User size={16} /> Ingresar / Registrarse
                            </button>
                        )}
                        <button className="mobile-nav-link" onClick={() => { setIsOpen(true); setMobileOpen(false); }}>
                            <ShoppingCart size={16} /> Carrito ({totals.count})
                        </button>
                    </nav>
                </>
            )}
        </>
    );
}
