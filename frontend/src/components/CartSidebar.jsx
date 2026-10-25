import React, { useState } from 'react';
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

  // Estado temporal para permitir borrar y escribir números desde el teclado en el carrito
  const [editingQty, setEditingQty] = useState({});

  if (!isCartOpen) return null;

  const handleInputChange = (id, rawVal) => {
    if (rawVal === '') {
      setEditingQty((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const clean = String(rawVal).replace(/[^\d]/g, '');
    if (clean === '') {
      setEditingQty((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const parsed = parseInt(clean, 10);
    setEditingQty((prev) => ({ ...prev, [id]: parsed }));
    if (parsed >= 1) {
      updateQuantity(id, parsed);
    }
  };

  const handleInputBlur = (id, currentCantidad) => {
    const val = editingQty[id];
    const parsed = parseInt(val, 10);
    if (val !== undefined) {
      if (isNaN(parsed) || parsed < 1) {
        updateQuantity(id, currentCantidad >= 1 ? currentCantidad : 1);
      } else {
        updateQuantity(id, parsed);
      }
      setEditingQty((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

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
                  href="#cotizador"
                  onClick={() => setIsCartOpen(false)}
                  className="btn-primary-cta text-xs py-2.5 px-4"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Calcular con IA
                </a>
              </div>
            ) : (
              cart.map((item) => {
                const displayVal = editingQty[item.id] !== undefined ? editingQty[item.id] : item.cantidad;
                return (
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

                    {/* Stepper Controls + Keyboard Input */}
                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 focus-within:border-orange-500 rounded-lg p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Restar 1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={displayVal}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        onBlur={() => handleInputBlur(item.id, item.cantidad)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            updateQuantity(item.id, item.cantidad + 1);
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (item.cantidad > 1) updateQuantity(item.id, item.cantidad - 1);
                          } else if (e.key === 'Enter') {
                            e.target.blur();
                          }
                        }}
                        className="w-14 text-xs font-bold text-white text-center font-mono bg-transparent focus:outline-none focus:bg-slate-900 rounded py-0.5"
                        aria-label="Cantidad del producto"
                        title="Escribe la cantidad con el teclado"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Sumar 1"
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
                );
              })
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
                <span>Recibo oficial en PDF descargable y respaldo en tu perfil.</span>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="btn-primary-cta w-full text-sm font-bold justify-center"
              >
                <span>Finalizar Pedido de Materiales</span>
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
