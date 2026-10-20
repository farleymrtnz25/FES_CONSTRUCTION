import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Calculator, 
  CheckCircle, 
  ShoppingCart, 
  Loader2, 
  HelpCircle,
  Ruler,
  Layers
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  {
    label: '🧱 100 m² Ladrillo Rosado (18*9*6)',
    query: 'Quiero construir 100 metros cuadrados con ladrillo pequeño rosado (18*9*6). ¿Cuántos necesito incluyendo desperdicio y en cuánto sale?'
  },
  {
    label: '🏛️ 80 m² Prensado Santafé (24.5x12x6)',
    query: 'Necesito enchapar 80 m² de fachada con Ladrillo Prensado Liviano 24.5x12x6cm Santafe. ¿Cuántas unidades debo comprar y cuál es el costo total?'
  },
  {
    label: '🏗️ 120 m² Bloque #4 + Arena',
    query: 'Voy a levantar 120 m² de muro en Bloque número 4 y necesito también arena para la pega. ¿Cuánto material necesito y cuánto cuesta?'
  },
  {
    label: '🟫 50 m² Tableta Cúcuta 20x20cm',
    query: 'Quiero enchapar un piso de 50 metros cuadrados con Tableta Arcilla Cúcuta 20x20cm. ¿Cuántas necesito y cuánto vale?'
  },
  {
    label: '🔥 Horno con Ladrillo Refractario 1400°C',
    query: 'Necesito 15 m² de Ladrillo Refractario 24x12.5x4cm 1400°C para un horno industrial. ¿Cuántos ladrillos son y el presupuesto?'
  }
];

const RENDIMIENTOS_TABLE = [
  { material: 'Ladrillo Pequeño (Negro / Rosado)', medida: '18*9*6 cm', rendimiento: '56 u / m²', precio: '$260 - $300' },
  { material: 'Ladrillo Grande (Negro / Rosado)', medida: '22*12*7 cm', rendimiento: '36 u / m²', precio: '$400 - $450' },
  { material: 'Prensado Liviano Santafé / Tolete #1', medida: '24.5x12x6 cm', rendimiento: '56 u / m²', precio: '$660 - $1.400' },
  { material: 'Prensado Macizo Fachada', medida: '24.5x12x5.5 cm', rendimiento: '60 u / m²', precio: '$1.900' },
  { material: 'Ladrillo Prisma Gris / Cocoa', medida: '24x12x6 cm', rendimiento: '56 u / m²', precio: '$900' },
  { material: 'Bloque Perf. Vertical DP Estructural', medida: '33x23x11.5 cm', rendimiento: '12.25 u / m²', precio: '$4.900' },
  { material: 'Bloque Número 4 y Número 5', medida: 'Estándar', rendimiento: '12.5 u / m²', precio: '$1.050 - $1.100' },
  { material: 'Tableta Cúcuta / Rústica', medida: '20x20 / 25x25 cm', rendimiento: '25 / 16 u / m²', precio: '$20.000 - $23.000' },
  { material: 'Adoquín Corbatín / Peatonal', medida: '15x10x6 cm', rendimiento: '45 u / m²', precio: '$750 - $800' },
];

export const AICivilQuoter = ({ initialQuery }) => {
  const { addAIQuotationToCart } = useCart();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: '¡Bienvenido al Departamento de Ingeniería de F.E.S. Construcción! Soy el Ing. FES (conectado en tiempo real a nuestro catálogo de 23 materiales).\n\nIndícame cuántos metros cuadrados (m²) deseas construir o usa la Calculadora Guiada de la izquierda para obtener cantidades exactas, desperdicio técnico NSR-10 y presupuesto en pesos colombianos (COP).',
      calculo: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedItemName, setAddedItemName] = useState(null);

  // Estado para la Calculadora Guiada Izquierda
  const [products, setProducts] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('Ladrillo pequeño rosado (18*9*6)');
  const [areaM2, setAreaM2] = useState('100');
  const [desperdicio, setDesperdicio] = useState('7');

  const chatBottomRef = useRef(null);

  useEffect(() => {
    fetch('/api/productos')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setSelectedMaterial(`${data[1]?.nombre || data[0].nombre} (${data[1]?.medidas || data[0].medidas})`);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setInputMessage(initialQuery);
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ia/consultar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: text,
          historial: messages.slice(-6)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo conectar con el asesor de IA');

      setMessages([
        ...newMessages,
        {
          role: 'bot',
          content: data.respuesta,
          calculo: data.calculo
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'bot',
          content: `Nota técnica: ${err.message}. Por favor intenta nuevamente en unos segundos o contáctanos al WhatsApp +57 320 821 6369.`,
          calculo: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGuidedCalculation = (e) => {
    e.preventDefault();
    const prompt = `Quiero construir ${areaM2} metros cuadrados usando ${selectedMaterial}, considerando un ${desperdicio}% de desperdicio técnico de obra. ¿Cuántas unidades exactas necesito comprar y cuál es el presupuesto total en pesos colombianos?`;
    handleSend(prompt);
  };

  const handleAddToCart = (calculo) => {
    if (!calculo || !calculo.items) return;
    addAIQuotationToCart(calculo.items);
    setAddedItemName(calculo.material_principal || 'Materiales');
    setTimeout(() => setAddedItemName(null), 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Cabecera del Cotizador IA */}
      <div className="fes-page-banner">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-xs font-extrabold text-orange-300 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Motor Gemini IA + Base de Datos Real (23 Productos)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Cotizador de Ingeniería Civil y Cálculo por m²
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Calcula al instante la cantidad exacta de ladrillos, bloques, tabletas o metros cúbicos de arena que requiere tu proyecto, con factor de desperdicio NSR-10 y carga directa al carrito.
          </p>
        </div>
      </div>

      {/* 2. Layout de Ingeniería en 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: Calculadora Guiada + Tabla Técnica NSR-10 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tarjeta A: Formulario de Cálculo Rápido */}
          <div className="fes-card space-y-4 border-t-4 border-t-orange-600">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-lg text-slate-900">
                  Calculadora Rápida por m²
                </h2>
                <p className="text-xs text-slate-500">
                  Selecciona el material y el área para que la IA liquide tu obra
                </p>
              </div>
            </div>

            <form onSubmit={handleGuidedCalculation} className="space-y-4">
              <div>
                <label className="fes-label">1. Material del Catálogo (con Medidas)</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="fes-input font-semibold"
                >
                  {products.length > 0 ? (
                    products.map((p) => (
                      <option key={p.id} value={`${p.nombre} (Medidas: ${p.medidas})`}>
                        {p.nombre} — [{p.medidas}] (${Number(p.precio).toLocaleString('es-CO')})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Ladrillo pequeño rosado (18*9*6)">Ladrillo pequeño rosado — [18*9*6] ($260)</option>
                      <option value="Ladrillo grande negro (22*12*7)">Ladrillo grande negro — [22*12*7] ($450)</option>
                      <option value="Ladrillo Prensado Liviano 24.5x12x6cm Santafe">Prensado Liviano Santafé — [24.5x12x6 cm] ($1.400)</option>
                      <option value="Bloque número 4">Bloque número 4 — [Estándar] ($1.050)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="fes-label">2. Área / Cantidad (m² o m³)</label>
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    required
                    value={areaM2}
                    onChange={(e) => setAreaM2(e.target.value)}
                    className="fes-input font-mono font-bold"
                    placeholder="Ej: 100"
                  />
                </div>
                <div>
                  <label className="fes-label">3. Desperdicio Técnico</label>
                  <select
                    value={desperdicio}
                    onChange={(e) => setDesperdicio(e.target.value)}
                    className="fes-input font-semibold"
                  >
                    <option value="5">5% (Mampostería limpia)</option>
                    <option value="7">7% (Estándar NSR-10)</option>
                    <option value="10">10% (Con cortes / Fachada)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary-cta w-full justify-center py-3 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calcular Cantidad y Costo con IA</span>
              </button>
            </form>
          </div>

          {/* Tarjeta B: Tabla de Rendimientos Oficiales */}
          <div className="fes-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-orange-600" />
                <span>Tabla de Rendimiento Técnico por m²</span>
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                Norma NSR-10
              </span>
            </div>

            <div className="table-wrapper !max-h-[340px]">
              <table className="fes-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Medidas</th>
                    <th>Unid./m²</th>
                  </tr>
                </thead>
                <tbody>
                  {RENDIMIENTOS_TABLE.map((row, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-slate-900 text-xs">{row.material}</td>
                      <td className="font-mono text-xs text-orange-700 font-bold">{row.medidas}</td>
                      <td className="font-mono text-xs font-extrabold text-emerald-700">{row.rendimiento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: Chat Interactivo con el Ing. FES */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Botones de Consultas Rápidas */}
          <div className="fes-card !p-4 space-y-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-orange-600" />
              Ejemplos de cotización en 1 clic:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sq.query)}
                  disabled={loading}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-800 hover:text-orange-700 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  {sq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ventana de Conversación y Resultados */}
          <div className="fes-card !p-0 overflow-hidden flex flex-col h-[620px] border-2 border-slate-200 shadow-lg">
            
            {/* Encabezado del Asistente */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white font-heading">
                      Ing. FES — Asesor de Cubicación y Presupuesto
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      En Línea
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Responde preguntas técnicas, calcula ladrillos por m² y arma tu pedido
                  </p>
                </div>
              </div>
            </div>

            {/* Historial de Mensajes */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center shrink-0 mt-1 shadow">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`max-w-[88%] space-y-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-orange-600 text-white font-medium rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-line'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Tarjeta de Resultado de Cálculo Estructurado */}
                    {msg.calculo && (
                      <div className="p-5 rounded-2xl bg-slate-900 text-white border-2 border-orange-500 shadow-xl space-y-4 text-left">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
                          <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Calculator className="w-4 h-4" />
                            Liquidación Oficial de Materiales
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-extrabold border border-emerald-500/30">
                            {Number(msg.calculo.unidades_estimadas).toLocaleString('es-CO')} unidades totales
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                            <span className="text-xs text-slate-400 block">Material Seleccionado:</span>
                            <strong className="text-white font-heading text-base">
                              {msg.calculo.material_principal}
                            </strong>
                          </div>
                          <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                            <span className="text-xs text-slate-400 block">Costo Total Estimado:</span>
                            <strong className="text-orange-400 font-mono text-lg font-black">
                              ${Number(msg.calculo.costo_total_cop).toLocaleString('es-CO')} COP
                            </strong>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(msg.calculo)}
                          className="btn-primary-cta w-full justify-center py-3 text-sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>
                            Agregar {Number(msg.calculo.unidades_estimadas).toLocaleString('es-CO')} unidades al Carrito de Compra
                          </span>
                        </button>

                        {addedItemName && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            <span>¡Materiales agregados al carrito! Puedes finalizar tu orden arriba a la derecha.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-1 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center p-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm">
                  <Loader2 className="w-5 h-5 text-orange-600 animate-spin shrink-0" />
                  <span>El Ing. FES está calculando las cantidades por m², desperdicio y presupuesto...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Barra de Escritura */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu pregunta (ej: Necesito construir 100 m2 con ladrillo pequeño rosado, ¿cuántos son y cuánto vale?)"
                  className="fes-input flex-1"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="btn-primary-cta px-6 py-3 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Consultar IA</span>
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
