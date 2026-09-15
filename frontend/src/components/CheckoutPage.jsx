import React, { useState } from 'react';
import { Phone, CreditCard, CheckCircle, Package, ArrowLeft, Download, ShieldCheck, Landmark } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import { API_BASE_URL } from '../config';

const fmt = n => n.toLocaleString('es-CO');

export default function CheckoutPage({ onBack, onOrderComplete }) {
    const { items, totals, clearCart } = useCart();
    const { user, authFetch } = useAuth();
    const [payMethod, setPayMethod] = useState('whatsapp');
    const [placing, setPlacing] = useState(false);
    const [done, setDone] = useState(null);
    const [simulating, setSimulating] = useState(false);
    const [tipoPersona, setTipoPersona] = useState('Natural');

    // Simulation states
    const [simData, setSimData] = useState({
        nequiPhone: '',
        daviPhone: '',
        daviPin: '',
        pseBank: 'Bancolombia',
        cardName: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: ''
    });

    if (done) {
        return (
            <div style={{ padding: '2rem 1rem', maxWidth: 800, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 1rem', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={32} color="#16a34a" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>¡Pedido Realizado con Éxito!</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Hemos generado tu factura electrónica de venta.</p>
                </div>

                <div className="card animate-scale-in" style={{ padding: '2rem', marginBottom: '2rem', border: '2px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>FACTURA ELECTRÓNICA</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No. FE-{done.id}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tu Proyecto S.A.S.</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>NIT: 900.234.567-8</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Adquiriente</p>
                            <p style={{ fontWeight: 600 }}>{user?.nombre || 'Consumidor Final'}</p>
                            <p style={{ fontSize: '0.85rem' }}>{user?.email || 'pago.simulado@example.com'}</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}><span className="badge badge-gray">{done.tipo_persona}</span></p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Detalles de Pago</p>
                            <p style={{ fontSize: '0.85rem' }}>Método: <strong>{done.metodo_pago}</strong></p>
                            <p style={{ fontSize: '0.85rem' }}>Fecha: {new Date().toLocaleDateString('es-CO')}</p>
                        </div>
                    </div>

                    <table style={{ width: '100%', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-text)' }}>
                                <th style={{ textAlign: 'left', padding: '8px 0' }}>Descripción</th>
                                <th style={{ textAlign: 'center' }}>Cant.</th>
                                <th style={{ textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {done.itemsSaved.map(i => (
                                <tr key={i.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '8px 0' }}>{i.nombre}</td>
                                    <td style={{ textAlign: 'center' }}>{i.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>${fmt(i.precio * i.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginLeft: 'auto', width: 'fit-content', minWidth: 200 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem' }}>Subtotal:</span>
                            <span style={{ fontWeight: 600 }}>${fmt(done.totalsSaved.subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            <span>IVA:</span>
                            <span>No aplica · Art. 424 E.T.</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-text)' }}>
                            <span style={{ fontWeight: 800 }}>TOTAL:</span>
                            <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.2rem' }}>${fmt(done.totalsSaved.total)}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 60, height: 60, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>QR MOCK</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            <p>CUFE: {Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}</p>
                            <p>Representación gráfica de factura electrónica.</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => generateInvoicePDF({ ...done, ...done.totalsSaved, tipo_persona: done.tipo_persona }, user, done.itemsSaved)}>
                        <Download size={20} /> Descargar Factura PDF
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={onOrderComplete}>Volver a Mis Pedidos</button>
                </div>
            </div>
        );
    }

    const placeOrder = async () => {
        if (items.length === 0 || totals.total <= 0) {
            alert('El carrito está vacío o tiene un valor inválido.');
            return;
        }

        const invalidItems = items.filter(i => !i.precio || i.precio <= 0);
        if (invalidItems.length > 0) {
            alert('Error: Hay productos con precio inválido o en $0. Por favor verifica el carrito antes de continuar.');
            return;
        }

        if (payMethod === 'whatsapp') {
            const msg = items.map(i => `${i.nombre} x${i.quantity} — $${fmt(i.precio * i.quantity)}`).join('%0A');
            window.open(`https://wa.me/573208216369?text=Hola!%20Quisiera%20hacer%20un%20pedido:%0A${msg}%0A%0ATipo:%20${tipoPersona}%0ATotal:%20$${fmt(totals.total)}%0A(Excluido%20de%20IVA%20%E2%80%93%20Art.%20424%20E.T.)`, '_blank');
            clearCart();
            onBack();
            return;
        }

        if (!user) {
            alert('Debes iniciar sesión para realizar el pago');
            return;
        }

        setSimulating(true);
    };

    const confirmPayment = async (e) => {
        e.preventDefault();
        setSimulating(false);
        setPlacing(true);

        // Simulación de proceso de pago (Wait 2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const res = await authFetch(`${API_BASE_URL}/api/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productos: items.map(i => ({ id: i.id, nombre: i.nombre, precio: i.precio, cantidad: i.quantity })),
                    metodo_pago: payMethod.toUpperCase(),
                    tipo_persona: tipoPersona
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setDone({ ...data.pedido, itemsSaved: items, totalsSaved: totals });


            clearCart();
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setPlacing(false);
        }
    };

    const simulationModalContent = (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: 16, width: '90%', maxWidth: 400 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                    <ShieldCheck color="var(--color-primary)" />
                    <h3 style={{ margin: 0 }}>Simulación de Pago</h3>
                </div>

                <form onSubmit={confirmPayment}>
                    {payMethod === 'nequi' && (
                        <div>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Ingresa tu número de celular y clave dinámica Nequi para confirmar el pago.</p>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Número Nequi</label>
                            <input
                                type="tel"
                                required
                                className="input"
                                placeholder="320 000 0000"
                                value={simData.nequiPhone}
                                onChange={e => setSimData({ ...simData, nequiPhone: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
                            />
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Clave Dinámica (6 dígitos)</label>
                            <input
                                type="password"
                                required
                                maxLength={6}
                                className="input"
                                placeholder="******"
                                value={simData.daviPin}
                                onChange={e => setSimData({ ...simData, daviPin: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem' }}
                            />
                        </div>
                    )}

                    {payMethod === 'daviplata' && (
                        <div>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Ingresa tu número de Daviplata para recibir el cobro.</p>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Número Celular</label>
                            <input
                                type="tel"
                                required
                                className="input"
                                placeholder="315 000 0000"
                                value={simData.daviPhone}
                                onChange={e => setSimData({ ...simData, daviPhone: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem' }}
                            />
                        </div>
                    )}

                    {payMethod === 'pse' && (
                        <div>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Selecciona tu entidad financiera para proceder con el pago PSE.</p>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Banco</label>
                            <select
                                className="input"
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem' }}
                                value={simData.pseBank}
                                onChange={e => setSimData({ ...simData, pseBank: e.target.value })}
                            >
                                <option>Bancolombia</option>
                                <option>Davivienda</option>
                                <option>Banco de Bogotá</option>
                                <option>BBVA</option>
                                <option>Nequi / Daviplata</option>
                            </select>
                        </div>
                    )}

                    {payMethod === 'card' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Nombre en la tarjeta</label>
                                <input type="text" required className="input" placeholder="Juan Perez" style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Número de tarjeta</label>
                                <input type="text" required className="input" placeholder="4545 0000 0000 0000" style={{ width: '100%' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Vencimiento</label>
                                    <input type="text" required className="input" placeholder="MM/YY" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>CVV</label>
                                    <input type="password" required className="input" placeholder="***" maxLength={3} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-ghost" onClick={() => setSimulating(false)} style={{ flex: 1 }}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Confirmar Pago</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="checkout-page">
            <div className="container">
                {simulating && simulationModalContent}

                <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
                    <ArrowLeft size={16} /> Volver al carrito
                </button>

                <h1 className="section-title" style={{ marginBottom: '2rem' }}>Finalizar <span className="gradient-text">Compra</span></h1>

                <div className="checkout-grid">
                    {/* Left */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Items summary */}
                        <div className="checkout-section">
                            <h2><Package size={18} style={{ display: 'inline', marginRight: 8 }} />Resumen del pedido</h2>
                            {items.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.nombre}</div>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>${fmt(item.precio)} × {item.quantity}</div>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>${fmt(item.precio * item.quantity)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Tipo de Persona */}
                        <div className="checkout-section">
                            <h2>👤 Información del Adquiriente</h2>
                            <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Selecciona el tipo de persona para la facturación electrónica.</p>
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                                    <input
                                        type="radio"
                                        name="tipoPersona"
                                        value="Natural"
                                        checked={tipoPersona === 'Natural'}
                                        onChange={() => setTipoPersona('Natural')}
                                        style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                                    />
                                    Persona Natural
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                                    <input
                                        type="radio"
                                        name="tipoPersona"
                                        value="Jurídica"
                                        checked={tipoPersona === 'Jurídica'}
                                        onChange={() => setTipoPersona('Jurídica')}
                                        style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                                    />
                                    Persona Jurídica
                                </label>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="checkout-section">
                            <h2><CreditCard size={18} style={{ display: 'inline', marginRight: 8 }} />Método de Pago</h2>
                            <div className="payment-methods">
                                {[
                                    { id: 'whatsapp', icon: '💬', label: 'WhatsApp', desc: 'Coordina el pago directamente' },
                                    { id: 'nequi', icon: '💜', label: 'Nequi', desc: 'Pago digital con celular' },
                                    { id: 'daviplata', icon: '🔴', label: 'Daviplata', desc: 'Pago rápido Davivienda' },
                                    { id: 'pse', icon: <Landmark size={20} />, label: 'PSE', desc: 'Débito desde cualquier banco' },
                                    { id: 'card', icon: '💳', label: 'Tarjeta de Crédito', desc: 'Visa / Mastercard / Amex' },
                                ].map(m => (
                                    <div
                                        key={m.id}
                                        className={`payment-card${payMethod === m.id ? ' selected' : ''}`}
                                        onClick={() => setPayMethod(m.id)}
                                        role="radio"
                                        aria-checked={payMethod === m.id}
                                        tabIndex={0}
                                        id={`payment-${m.id}`}
                                    >
                                        <div className="payment-card-icon">{m.icon}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.label}</div>
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{m.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Tax + CTA */}
                    <div>
                        <div className="checkout-section" style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1rem)' }}>
                            <h2>💰 Totales (COP)</h2>
                            <div className="tax-breakdown">
                                <div className="tax-row">
                                    <span>Subtotal</span>
                                    <span>${fmt(totals.subtotal)}</span>
                                </div>
                                <div className="tax-row" style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                                    <span>IVA</span>
                                    <span>No aplica · Art. 424 E.T.</span>
                                </div>
                                <div className="tax-row total">
                                    <span>Total a Pagar</span>
                                    <span style={{ color: 'var(--color-primary)' }}>${fmt(totals.total)}</span>
                                </div>
                            </div>
                            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                ✅ Ladrillos, bloques y materiales de construcción están <strong>excluidos de IVA</strong> según el Art. 424 del Estatuto Tributario colombiano.
                            </div>

                            <button
                                className={`btn ${payMethod === 'whatsapp' ? 'btn-success' : 'btn-primary'} btn-full btn-lg`}
                                style={{ marginTop: '1.5rem' }}
                                onClick={placeOrder}
                                disabled={placing || items.length === 0}
                                id="place-order-btn"
                            >
                                {placing ? <><span className="spinner spinner-sm" /> Procesando...</> : (payMethod === 'whatsapp' ? <><Phone size={16} /> Confirmar por WhatsApp</> : <><ShieldCheck size={16} /> Proceder al Pago</>)}
                            </button>

                            {!user && payMethod !== 'whatsapp' && (
                                <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--color-danger)', textAlign: 'center' }}>
                                    Debes iniciar sesión para usar este método de pago
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

