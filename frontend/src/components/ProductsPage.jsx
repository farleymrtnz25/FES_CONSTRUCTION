import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { 
  Search, 
  ShoppingCart, 
  Check, 
  Layers, 
  Sparkles, 
  Ruler, 
  AlertTriangle,
  Plus,
  Minus,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  'Todos',
  'Ladrillos',
  'Bloques',
  'Fachadas',
  'Tabletas',
  'Adoquines',
  'Tejas',
  'Refractarios',
  'Agregados',
  'Especiales'
];

export const ProductsPage = ({ onAskAIAboutProduct, initialCategory = 'Todos' }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [addedAnimation, setAddedAnimation] = useState({});

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, onlyInStock]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/productos?';
      if (selectedCategory !== 'Todos') url += `categoria=${encodeURIComponent(selectedCategory)}&`;
      if (onlyInStock) url += `disponible=true&`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Permite escribir libremente con el teclado (incluso borrar el número temporalmente para escribir otro)
  const handleQuantityChange = (id, val) => {
    if (val === '') {
      setQuantities((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const clean = String(val).replace(/[^\d]/g, '');
    if (clean === '') {
      setQuantities((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const q = Math.max(1, parseInt(clean, 10));
    setQuantities((prev) => ({ ...prev, [id]: q }));
  };

  const handleQuantityBlur = (id, maxStock) => {
    setQuantities((prev) => {
      const current = prev[id];
      const parsed = parseInt(current, 10);
      if (isNaN(parsed) || parsed < 1) {
        return { ...prev, [id]: 1 };
      }
      if (maxStock && parsed > maxStock) {
        return { ...prev, [id]: maxStock };
      }
      return { ...prev, [id]: parsed };
    });
  };

  const handleAdd = (product) => {
    const rawQty = quantities[product.id];
    const qty = Math.max(1, parseInt(rawQty, 10) || 1);
    setQuantities((prev) => ({ ...prev, [product.id]: qty }));
    addToCart(product, qty);
    setAddedAnimation((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedAnimation((prev) => ({ ...prev, [product.id]: false }));
    }, 1600);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(term) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
      (p.medidas && p.medidas.toLowerCase().includes(term)) ||
      (p.categoria && p.categoria.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8">
      
      {/* 1. Banner de Cabecera del Catálogo */}
      <div className="fes-page-banner">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-xs font-extrabold text-orange-300 uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>Inventario Oficial en Tiempo Real • 23 Referencias</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
              Catálogo de Materiales y Especificaciones Técnicas
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Consulta medidas exactas en centímetros, rendimiento por m², disponibilidad en patio y precios unitarios en pesos colombianos (COP).
            </p>
          </div>

          {/* Buscador Amplio */}
          <div className="w-full lg:w-96 bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ladrillo, medida (ej. 24x12), arena..."
                className="w-full bg-white rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Filtros por Categoría y Stock */}
      <div className="fes-card !p-4 sm:!p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-orange-600" />
            Categorías:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`fes-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
          <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="w-4 h-4 rounded accent-orange-600 cursor-pointer"
            />
            <span>Solo con stock inmediato</span>
          </label>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            Mostrando <strong className="text-slate-900">{filteredProducts.length}</strong> materiales
          </span>
        </div>
      </div>

      {/* 3. Grilla de Productos */}
      {loading ? (
        <div className="fes-product-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="fes-card h-[440px] animate-pulse bg-white" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="fes-card text-center py-16 space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-xl font-extrabold text-slate-900 font-heading">
            No encontramos materiales con ese filtro
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Intenta buscar con otro término o selecciona la categoría "Todos" para ver las 23 referencias disponibles.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('Todos');
              setSearchTerm('');
              setOnlyInStock(false);
            }}
            className="fes-btn-primary text-sm"
          >
            Restablecer Catálogo Completo
          </button>
        </div>
      ) : (
        <div className="fes-product-grid">
          {filteredProducts.map((p) => {
            const qty = quantities[p.id] !== undefined ? quantities[p.id] : 1;
            const numQty = Math.max(1, parseInt(qty, 10) || 1);
            const isAdded = addedAnimation[p.id];
            const hasStock = p.stock > 0;

            return (
              <article key={p.id} className="fes-product-card">
                
                {/* Imagen y Etiquetas Superiores */}
                <div>
                  <div className="fes-product-img-wrap">
                    <img
                      src={p.imagen || '/logo.png'}
                      alt={`${p.nombre} - Medidas ${p.medidas}`}
                      className="fes-product-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/logo.png';
                      }}
                    />

                    {/* Categoría */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-lg bg-slate-900/90 text-white text-xs font-extrabold uppercase tracking-wider shadow">
                        {p.categoria}
                      </span>
                    </div>

                    {/* Stock */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold shadow ${
                          hasStock
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {hasStock ? `${Number(p.stock).toLocaleString('es-CO')} disp.` : 'Agotado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="fes-product-body">
                  
                  <div className="space-y-3">
                    {/* Título */}
                    <h3 className="font-heading font-extrabold text-lg text-slate-900 leading-snug">
                      {p.nombre}
                    </h3>

                    {/* MEDIDAS CON LETRA GRANDE Y LEGIBLE */}
                    <div>
                      <span className="fes-medidas-badge">
                        <Ruler className="w-4 h-4 text-orange-600 shrink-0" />
                        <span>Medidas: {p.medidas || 'Estándar'}</span>
                      </span>
                    </div>

                    {/* Descripción */}
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {p.descripcion || 'Material estructural de arcilla cocida de primera calidad.'}
                    </p>
                  </div>

                  {/* Precio y Controles de Compra */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          Precio Unitario Planta
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-heading text-2xl font-black text-slate-900">
                            ${Number(p.precio).toLocaleString('es-CO')}
                          </span>
                          <span className="text-xs font-extrabold text-slate-500">COP</span>
                        </div>
                      </div>

                      {/* Botón Cotizar m² con IA */}
                      <button
                        onClick={() => onAskAIAboutProduct(p)}
                        title="Calcular cuántos necesitas por m² con IA"
                        className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                        <span>Calcular m² IA</span>
                      </button>
                    </div>

                    {/* Selector de Cantidad Editable por Teclado + Botón Agregar al Carrito */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border-2 border-slate-200 focus-within:border-orange-500 rounded-xl bg-slate-50 overflow-hidden transition-colors">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(p.id, numQty - 1 >= 1 ? numQty - 1 : 1)}
                          className="px-2.5 py-2 text-slate-600 hover:bg-slate-200 font-bold text-xs cursor-pointer"
                          title="Restar 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={qty}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                          onBlur={() => handleQuantityBlur(p.id, hasStock ? p.stock : 50000)}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              handleQuantityChange(p.id, numQty + 1);
                            } else if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              handleQuantityChange(p.id, Math.max(1, numQty - 1));
                            } else if (e.key === 'Enter' && hasStock) {
                              e.preventDefault();
                              handleAdd(p);
                            }
                          }}
                          placeholder="Cant."
                          className="w-20 text-center bg-white py-2 px-1 text-sm font-extrabold text-slate-900 focus:outline-none focus:bg-orange-50/40 font-mono"
                          aria-label="Escribe la cantidad desde el teclado"
                          title="Escribe cualquier cantidad con el teclado"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(p.id, numQty + 1)}
                          className="px-2.5 py-2 text-slate-600 hover:bg-slate-200 font-bold text-xs cursor-pointer"
                          title="Sumar 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleAdd(p)}
                        disabled={!hasStock}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-heading text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          !hasStock
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : isAdded
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>¡En el Pedido!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>{hasStock ? 'Agregar' : 'Sin Stock'}</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
};
