import React from 'react';
import { X, Trash2, ShoppingBag, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

const fmt = n => n.toLocaleString('es-CO');

export default function CartSidebar({ onCheckout }) {
    const { items, isOpen, setIsOpen, removeItem, updateQty, clearCart, totals } = useCart();

    if (!isOpen) return null;

    return (
        <>
            <div className="cart-overlay" onClick={() => setIsOpen(false)} aria-hidden="true" />
            <aside className="cart-sidebar" aria-label="Carrito de compras" role="complementary">
                {/* Header */}
                <div className="cart-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ShoppingBag size={22} color="var(--color-primary)" />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                            Carrito <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: '0.875rem' }}>({totals.count} ítem{totals.count !== 1 ? 's' : ''})</span>
                        </h2>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={() => setIsOpen(false)} aria-label="Cerrar carrito">
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div className="cart-items" role="list">
                    {items.length === 0 ? (
                        <div className="cart-empty">
                            <ShoppingBag size={56} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
                            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Tu carrito está vacío</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Agrega materiales para empezar tu pedido</p>
                            <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setIsOpen(false)}>
                                Ver Productos
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="cart-item" role="listitem">
                                <img className="cart-item-img" src={item.imagen} alt={item.nombre} />
                                <div className="cart-item-info">
                                    <p className="cart-item-name">{item.nombre}</p>
                                    <p className="cart-item-price">${fmt(item.precio)} / und.</p>
                                    <div className="qty-controls">
                                        <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)} aria-label="Reducir cantidad">−</button>
                                        <input
                                            type="number"
                                            className="qty-input"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val >= 1) updateQty(item.id, val);
                                            }}
                                            min="1"
                                            aria-label="Cantidad"
                                        />
                                        <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)} aria-label="Aumentar cantidad">+</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>${fmt(item.precio * item.quantity)}</span>
                                    <button
                                        className="btn btn-ghost btn-icon btn-sm"
                                        style={{ color: 'var(--color-danger)' }}
                                        onClick={() => removeItem(item.id)}
                                        aria-label={`Eliminar ${item.nombre}`}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-totals">
                            <div className="cart-total-row">
                                <span>Subtotal</span>
                                <span>${fmt(totals.subtotal)}</span>
                            </div>
                            <div className="cart-total-row" style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                <span>IVA</span>
                                <span>No aplica · Art. 424 E.T.</span>
                            </div>
                            <div className="cart-total-row grand">
                                <span>Total</span>
                                <span>${fmt(totals.total)}</span>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-full btn-lg"
                            style={{ marginBottom: '0.75rem' }}
                            onClick={() => { setIsOpen(false); onCheckout(); }}
                        >
                            Proceder al Pago
                        </button>

                        <button
                            className="btn btn-success btn-full"
                            onClick={() => {
                                const msg = items.map(i => `${i.nombre} x${i.quantity} — $${fmt(i.precio * i.quantity)}`).join('%0A');
                                window.open(`https://wa.me/573208216369?text=Hola!%20Quisiera%20hacer%20un%20pedido:%0A${msg}%0A%0ATotal:%20$${fmt(totals.total)}`, '_blank');
                            }}
                        >
                            <Phone size={16} /> Pedir por WhatsApp
                        </button>

                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ width: '100%', marginTop: '0.5rem', color: 'var(--color-danger)' }}
                            onClick={clearCart}
                        >
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
