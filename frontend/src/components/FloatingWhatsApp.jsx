import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

export const FloatingWhatsApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const phone = '573208216369';

  const handleQuickSend = (text) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  const handleCustomSend = (e) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    handleQuickSend(customMsg.trim());
    setCustomMsg('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {isOpen && (
        <div className="mb-3 w-80 p-4 rounded-2xl border-2 border-emerald-500 shadow-2xl bg-slate-900 text-white space-y-3 text-xs">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs font-heading">Despacho FES Construcción</h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  +57 320 821 6369 • En línea
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            ¡Hola! 👋 Comunícate directo con Ladrillera San Luis:
          </p>

          <div className="space-y-1.5">
            <button
              onClick={() => handleQuickSend('¡Hola F.E.S. Construcción! Quiero cotizar ladrillo tolete y bloque puesto en obra.')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer text-xs font-medium"
            >
              🧱 Cotizar Ladrillo y Bloque
            </button>
            <button
              onClick={() => handleQuickSend('Hola, necesito consultar disponibilidad y transporte en volqueta/tractomula.')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer text-xs font-medium"
            >
              🚚 Consultar Flete a mi Municipio
            </button>
            <button
              onClick={() => handleQuickSend('Hola, ya calculé mi material en el Cotizador de IA y quiero confirmar el pedido.')}
              className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              Confirmar cotización de IA
            </button>
          </div>

          <form onSubmit={handleCustomSend} className="pt-1 flex items-center gap-1.5">
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir chat de WhatsApp"
        className="relative p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2 font-heading font-bold text-sm"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline pr-1">WhatsApp Ventas</span>
      </button>

    </div>
  );
};
