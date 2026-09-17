import React from 'react';
import { Home, Package, ShoppingCart, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function MobileBottomNav({ activeSection, setActiveSection }) {
    const { user, isAdmin } = useAuth();
    const { totals, setIsOpen } = useCart();

    const tabs = [
        { key: 'inicio', label: 'Inicio', icon: Home },
        { key: 'productos', label: 'Productos', icon: Package },
        { key: 'carrito', label: 'Carrito', icon: ShoppingCart, isCart: true },
        ...(isAdmin ? [{ key: 'admin', label: 'Admin', icon: Shield }] : []),
        { key: user ? 'perfil' : 'auth', label: user ? 'Perfil' : 'Cuenta', icon: User },
    ];

    const handleTab = (tab) => {
        if (tab.isCart) {
            setIsOpen(true);
        } else {
            setActiveSection(tab.key);
        }
    };

    return (
        <nav className="mobile-bottom-nav" aria-label="Navegación principal móvil">
            {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = !tab.isCart && activeSection === tab.key;
                return (
                    <button
                        key={tab.key}
                        className={`mobile-bottom-tab${isActive ? ' active' : ''}`}
                        onClick={() => handleTab(tab)}
                        aria-label={tab.label}
                    >
                        <div className="mobile-bottom-tab-icon">
                            <Icon size={22} />
                            {tab.isCart && totals.count > 0 && (
                                <span className="mobile-bottom-badge">{totals.count}</span>
                            )}
                        </div>
                        <span className="mobile-bottom-tab-label">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
