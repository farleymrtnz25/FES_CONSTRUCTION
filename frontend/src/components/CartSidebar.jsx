import React from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export const CartSidebar = ({ onOpenCheckout }) => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartTotal, 
    cartCount 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Orden de Materiales
                </h3>
                <p className="text-xs text-slate-400">
                  {cartCount} {cartCount === 1 ? 'unidad seleccionada' : 'unidades seleccionadas'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Tu pedido está vacío</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Agrega ladrillos del catálogo o usa el Cotizador de Inteligencia Artificial para cubicaciones automáticas.
                  </p>
                </div>
                <a
                  href="#cotizador-ia"
                  onClick={() => setIsCartOpen(false)}
                  className="btn-primary-cta text-xs py-2.5 px-4"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Calcular con IA
                </a>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex gap-3 items-center justify-between"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.imagen || '/logo.png'}
                    alt={item.nombre}
                    className="w-14 h-14 object-cover rounded-lg bg-slate-950 shrink-0 border border-slate-800"
                    onError={(e) => { e.target.src = '/logo.png'; }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.nombre}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      ${Number(item.precio).toLocaleString('es-CO')} c/u
                    </p>
                    <p className="text-xs font-extrabold text-orange-400 font-mono mt-0.5">
                      ${(item.cantidad * item.precio).toLocaleString('es-CO')} COP
                    </p>
                  </div>

                  {/* Stepper Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Restar"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white w-8 text-center font-mono">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Sumar"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove Item */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-900/90 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal materiales</span>
                  <span className="font-mono">${cartTotal.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Despacho / Flete</span>
                  <span className="text-emerald-400 font-medium">A coordinar según obra</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Total Estimado:</span>
                  <span className="text-orange-400 font-mono">${cartTotal.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              {/* Security guarantee */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Factura legal en PDF y despacho directo con soporte técnico.</span>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="btn-primary-cta w-full text-sm font-bold justify-center"
              >
                <span>Finalizar Pedido / Cotización</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Vaciar orden
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
