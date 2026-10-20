import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  Download, 
  MessageCircle, 
  Truck, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';

export const CheckoutModal = ({ isOpen, onClose }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    nombre: user ? user.nombre : '',
    telefono: '',
    direccion: '',
    ciudad: 'Vereda Patio Bonito / Sabana',
    metodoPago: 'WhatsApp / Contraentrega',
    notas: '',
    website_hp: '' // Anti-spam Honeypot (Requisito 17)
  });

  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Anti-spam validation
    if (formData.website_hp) {
      console.warn('Bot detectado en checkout');
      return;
    }

    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      setError('Por favor completa tu nombre y número de teléfono.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        cliente_nombre: formData.nombre,
        cliente_telefono: formData.telefono,
        cliente_direccion: formData.direccion,
        ciudad: formData.ciudad,
        metodo_pago: formData.metodoPago,
        notas: formData.notas,
        productos: cart.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          medidas: item.medidas,
          cantidad: item.cantidad
        })),
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

      // Order created! Fire celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const completedOrderData = {
        pedidoId: data.pedidoId || 'COT-101',
        cliente: {
          nombre: formData.nombre,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ciudad: formData.ciudad
        },
        productos: cart,
        total: cartTotal,
        metodoPago: formData.metodoPago,
        fecha: new Date()
      };

      // Auto-generate PDF
      generateInvoicePDF(completedOrderData);

      setOrderCompleted(completedOrderData);
      clearCart();
    } catch (err) {
      setError(err.message || 'Error en el servidor al procesar la orden.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToWhatsApp = () => {
    if (!orderCompleted) return;
    const phone = '573208216369'; // Número oficial FES Construcción / Ladrillera San Luis
    let msg = `*🏗️ NUEVA ORDEN F.E.S. CONSTRUCCIÓN # ${orderCompleted.pedidoId}*\n\n`;
    msg += `*Cliente:* ${orderCompleted.cliente.nombre}\n`;
    msg += `*Teléfono:* ${orderCompleted.cliente.telefono}\n`;
    msg += `*Destino:* ${orderCompleted.cliente.direccion} (${orderCompleted.cliente.ciudad})\n`;
    msg += `*Forma de pago:* ${orderCompleted.metodoPago}\n\n`;
    msg += `*MATERIALES SOLICITADOS:*\n`;
    orderCompleted.productos.forEach((p, idx) => {
      msg += `• ${p.cantidad}x ${p.nombre} ($${(p.cantidad * p.precio).toLocaleString('es-CO')} COP)\n`;
    });
    msg += `\n*TOTAL A LIQUIDAR:* $${orderCompleted.total.toLocaleString('es-CO')} COP\n`;
    msg += `\n_Generado automáticamente con Asesoría de IA en fesconstruccion.com_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" 
      />

      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-white">
              {orderCompleted ? '¡Orden Confirmada!' : 'Finalizar Pedido de Materiales'}
            </h3>
            <p className="text-xs text-slate-400">
              {orderCompleted 
                ? 'Tu pedido quedó registrado en el sistema' 
                : 'Coordinación de despacho y liquidación oficial'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
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
                Hemos generado tu orden y tu factura en PDF se ha descargado automáticamente.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Cliente:</span>
                <span className="text-white">{orderCompleted.cliente.nombre}</span>
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
                onClick={handleSendToWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Confirmar Despacho por WhatsApp</span>
              </button>

              <button
                onClick={() => generateInvoicePDF(orderCompleted)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Volver a descargar PDF de la Orden</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            
            {/* Anti-spam Honeypot field (Requisito 17) */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Tu nombre o empresa"
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
                  placeholder="Chía, Zipaquirá, Bogotá, Patio Bonito..."
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
                placeholder="Ej: Acceso para camión doble troque, requerimos descargue manual..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none resize-none"
              />
            </div>

            {/* Total Box */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Total a Pagar ({cart.length} productos):</span>
              <span className="text-orange-400 font-mono text-sm">${cartTotal.toLocaleString('es-CO')} COP</span>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-cta w-full text-sm font-bold justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando Orden...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Confirmar y Descargar Factura PDF</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Tus datos están protegidos conforme a la Ley 1581 de Protección de Datos.
            </p>

          </form>
        )}

      </div>
    </div>
  );
};
