import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  Download, 
  MessageCircle, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  FileText,
  UserCheck,
  ShoppingBag
} from 'lucide-react';

export const CheckoutModal = ({ isOpen, onClose, onOpenProfile }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    nombre: user ? user.nombre : '',
    telefono: '',
    direccion: '',
    ciudad: 'Vereda Patio Bonito / Sabana',
    metodoPago: 'WhatsApp / Contraentrega',
    notas: '',
    website_hp: ''
  });

  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(null);
  const [error, setError] = useState(null);

  // Autocompletar datos del usuario y perfil guardado
  useEffect(() => {
    try {
      const savedProfile = JSON.parse(localStorage.getItem('fes_profile_extra') || '{}');
      setFormData((prev) => ({
        ...prev,
        nombre: user?.nombre || prev.nombre || savedProfile.nombre || '',
        telefono: prev.telefono || savedProfile.telefono || '',
        direccion: prev.direccion || savedProfile.direccion || '',
        ciudad: savedProfile.ciudad || prev.ciudad || 'Vereda Patio Bonito / Sabana'
      }));
    } catch {
      // ignore
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setOrderCompleted(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.website_hp) {
      console.warn('Bot detectado en checkout');
      return;
    }

    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      setError('Por favor completa tu nombre y número de teléfono.');
      return;
    }

    if (cart.length === 0) {
      setError('Tu carrito está vacío. Agrega materiales del catálogo antes de finalizar.');
      return;
    }

    setLoading(true);

    try {
      const itemsSnapshot = cart.map(item => ({
        id: item.id,
        nombre: item.nombre,
        precio: Number(item.precio),
        medidas: item.medidas || 'Estándar',
        cantidad: Number(item.cantidad)
      }));

      const payload = {
        cliente_nombre: formData.nombre.trim(),
        cliente_telefono: formData.telefono.trim(),
        cliente_direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        metodo_pago: formData.metodoPago,
        notas: formData.notas.trim(),
        productos: itemsSnapshot,
        total: cartTotal
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error procesando pedido');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore confetti error
      }

      const completedOrderData = {
        pedidoId: data.pedidoId || Math.floor(1000 + Math.random() * 9000),
        cliente: {
          nombre: formData.nombre.trim(),
          telefono: formData.telefono.trim(),
          direccion: formData.direccion.trim() || 'Despacho en Obra / Patio',
          ciudad: formData.ciudad.trim() || 'Cundinamarca'
        },
        productos: itemsSnapshot,
        total: cartTotal,
        metodoPago: formData.metodoPago,
        estado: 'Pendiente',
        fecha: new Date().toISOString()
      };

      // Guardar perfil rápido y respaldo local del recibo para "Mi Perfil y Mis Recibos"
      try {
        localStorage.setItem('fes_profile_extra', JSON.stringify({
          nombre: formData.nombre.trim(),
          telefono: formData.telefono.trim(),
          direccion: formData.direccion.trim(),
          ciudad: formData.ciudad.trim()
        }));

        const localHistory = JSON.parse(localStorage.getItem('fes_mis_pedidos_locales') || '[]');
        localHistory.unshift({
          id: completedOrderData.pedidoId,
          usuario_email: user?.email || null,
          cliente_nombre: completedOrderData.cliente.nombre,
          telefono: completedOrderData.cliente.telefono,
          direccion_envio: `${completedOrderData.cliente.direccion} (${completedOrderData.cliente.ciudad})`,
          ciudad: completedOrderData.cliente.ciudad,
          metodo_pago: completedOrderData.metodoPago,
          total: completedOrderData.total,
          estado: 'Pendiente',
          creado_en: completedOrderData.fecha,
          detalle: itemsSnapshot.map(i => ({
            producto_id: i.id,
            nombre_producto: i.nombre,
            medidas: i.medidas,
            cantidad: i.cantidad,
            precio_unitario: i.precio,
            subtotal: i.cantidad * i.precio
          }))
        });
        localStorage.setItem('fes_mis_pedidos_locales', JSON.stringify(localHistory.slice(0, 50)));
      } catch (storageErr) {
        console.warn('No se pudo guardar historial local:', storageErr);
      }

      setOrderCompleted(completedOrderData);
      clearCart();

      // Descarga automática inmediata del recibo PDF
      try {
        generateInvoicePDF(completedOrderData);
      } catch (pdfErr) {
        console.error('Error generando PDF automático:', pdfErr);
      }
    } catch (err) {
      setError(err.message || 'Error en el servidor al procesar la orden.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToWhatsApp = () => {
    if (!orderCompleted) return;
    const phone = '573208216369';
    let msg = `*🏗️ NUEVA ORDEN F.E.S. CONSTRUCCIÓN #${orderCompleted.pedidoId}*\n\n`;
    msg += `*Cliente:* ${orderCompleted.cliente.nombre}\n`;
    msg += `*Teléfono:* ${orderCompleted.cliente.telefono}\n`;
    msg += `*Destino:* ${orderCompleted.cliente.direccion} (${orderCompleted.cliente.ciudad})\n`;
    msg += `*Forma de pago:* ${orderCompleted.metodoPago}\n\n`;
    msg += `*MATERIALES SOLICITADOS:*\n`;
    orderCompleted.productos.forEach((p) => {
      msg += `• ${p.cantidad}x ${p.nombre} ($${(p.cantidad * p.precio).toLocaleString('es-CO')} COP)\n`;
    });
    msg += `\n*TOTAL A LIQUIDAR:* $${orderCompleted.total.toLocaleString('es-CO')} COP\n`;
    msg += `\n_Recibo generado en F.E.S. Construcción_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={handleClose} 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" 
      />

      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-white">
              {orderCompleted ? '¡Orden Confirmada y Recibo Generado!' : 'Finalizar Pedido de Materiales'}
            </h3>
            <p className="text-xs text-slate-400">
              {orderCompleted 
                ? 'Tu recibo PDF se descargó y quedó respaldado en tu perfil' 
                : 'Coordinación de despacho y emisión de recibo en PDF'}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {orderCompleted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-white font-heading">
                Orden #{orderCompleted.pedidoId} Registrada
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
                Tu recibo en PDF se ha descargado automáticamente. También puedes volver a descargarlo cuando quieras desde la sección <strong>Mi Perfil y Recibos</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Cliente:</span>
                <span className="text-white font-bold">{orderCompleted.cliente.nombre}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Teléfono:</span>
                <span className="text-white">{orderCompleted.cliente.telefono}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total materiales:</span>
                <span className="text-orange-400 font-bold">${orderCompleted.total.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Despacho:</span>
                <span className="text-white">{orderCompleted.cliente.direccion}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => generateInvoicePDF(orderCompleted)}
                className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Descargar Recibo de Compra (PDF)</span>
              </button>

              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Confirmar Despacho por WhatsApp</span>
              </button>

              {onOpenProfile && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenProfile();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-orange-400" />
                  <span>Ir a Mi Perfil y Mis Recibos Guardados</span>
                </button>
              )}
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-base">
                No tienes materiales en el pedido actual
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Agrega ladrillos, bloques o agregados desde el catálogo para finalizar tu pedido.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold cursor-pointer"
              >
                Ir al Catálogo de Materiales
              </button>
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenProfile();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4 text-orange-400" />
                  <span>Ver Mi Perfil y Recibos Anteriores</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            
            <input
              type="text"
              name="website_hp"
              value={formData.website_hp}
              onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
              className="hp-field"
              tabIndex="-1"
              autoComplete="off"
            />

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Resumen rápido de productos a comprar */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 max-h-32 overflow-y-auto space-y-1.5 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Detalle de materiales en tu pedido ({cart.length}):
              </div>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-slate-300">
                  <span className="truncate pr-2">
                    <strong className="text-orange-400 font-mono">{item.cantidad}x</strong> {item.nombre}
                  </span>
                  <span className="font-mono font-semibold text-white shrink-0">
                    ${(item.cantidad * item.precio).toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo / Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Tu nombre o constructora"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ej: 3105558899"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dirección de Entrega / Obra
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Calle, Vereda o Punto de obra"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Municipio / Ciudad
                </label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  placeholder="Chía, Zipaquirá, Bogotá, Nemocón..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Método de Pago Preferido
              </label>
              <select
                value={formData.metodoPago}
                onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="WhatsApp / Contraentrega">WhatsApp / Coordinación contraentrega en obra</option>
                <option value="Transferencia Bancaria">Transferencia Bancolombia / Nequi / Daviplata</option>
                <option value="Pago en Patio">Pago directo en patio de despacho</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Indicaciones especiales de descargue (Opcional)
              </label>
              <textarea
                rows="2"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Ej: Acceso para camión doble troque, requerimos descargue en obra..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none resize-none"
              />
            </div>

            {/* Total Box */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Total a Pagar ({cart.length} referencias):</span>
              <span className="text-orange-400 font-mono text-sm">${cartTotal.toLocaleString('es-CO')} COP</span>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-cta w-full text-sm font-bold justify-center cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando Orden y Recibo...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Confirmar Pedido y Descargar Recibo PDF</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              El recibo se descargará en PDF y quedará guardado en tu perfil.
            </p>

          </form>
        )}

      </div>
    </div>
  );
};
