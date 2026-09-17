import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';

const FALLBACK = [
    { id: 1, nombre: 'Ladrillo pequeño negro', precio: 300, medidas: '18*9*6', stock: 1000, categoria: 'Ladrillos', imagen: 'https://placehold.co/300x200/2d1b69/ffffff?text=Ladrillo+Negro', descripcion: 'Ladrillo artesanal de alta calidad fabricado con arcilla seleccionada. Ideal para construcciones resistentes y duraderas.' },
    { id: 2, nombre: 'Ladrillo pequeño rosado', precio: 260, medidas: '18*9*6', stock: 1200, categoria: 'Ladrillos', imagen: 'https://placehold.co/300x200/f87171/ffffff?text=Ladrillo+Rosado', descripcion: 'Ladrillo artesanal rosado de excelente calidad. Toque tradicional con resistencia moderna.' },
    { id: 3, nombre: 'Ladrillo grande negro', precio: 450, medidas: '22*12*7', stock: 800, categoria: 'Ladrillos', imagen: 'https://placehold.co/300x200/1f2937/ffffff?text=Ladrillo+Grande+Negro', descripcion: 'Ladrillo grande negro de construcción superior. Mayor resistencia estructural y menos uniones.' },
    { id: 4, nombre: 'Ladrillo grande rosado', precio: 400, medidas: '22*12*7', stock: 900, categoria: 'Ladrillos', imagen: 'https://placehold.co/300x200/fda4af/ffffff?text=Ladrillo+Grande+Rosado', descripcion: 'Ladrillo grande rosado con acabado artesanal. Equilibrio entre funcionalidad y estética.' },
    { id: 5, nombre: 'Bloque número 4', precio: 950, medidas: 'Estándar', stock: 500, categoria: 'Bloques', imagen: 'https://placehold.co/300x200/94a3b8/ffffff?text=Bloque+4', descripcion: 'Bloque de alta resistencia para muros estructurales y no estructurales.' },
    { id: 6, nombre: 'Bloque número 5', precio: 1000, medidas: 'Estándar', stock: 400, categoria: 'Bloques', imagen: 'https://placehold.co/300x200/64748b/ffffff?text=Bloque+5', descripcion: 'Bloque de máxima resistencia para proyectos estructurales de alta envergadura.' },
    { id: 7, nombre: 'Regilla', precio: 600, medidas: 'Estándar', stock: 300, categoria: 'Especiales', imagen: 'https://placehold.co/300x200/86efac/ffffff?text=Regilla', descripcion: 'Regilla de arcilla para ventilación y decoración. Diseño tradicional.' },
    { id: 8, nombre: 'Adoquín', precio: 550, medidas: 'Estándar', stock: 600, categoria: 'Especiales', imagen: 'https://placehold.co/300x200/a3a3a3/ffffff?text=Adoquin', descripcion: 'Adoquín de arcilla para pavimentación. Resistente al desgaste y clima.' },
    { id: 9, nombre: 'Teja de barro', precio: 1000, medidas: 'Estándar', stock: 450, categoria: 'Tejas', imagen: 'https://placehold.co/300x200/dc2626/ffffff?text=Teja+de+Barro', descripcion: 'Teja de barro tradicional. Excelente aislamiento térmico y durabilidad.' },
    { id: 10, nombre: 'Bloquelón', precio: 4000, medidas: 'Grande', stock: 150, categoria: 'Bloques', imagen: 'https://placehold.co/300x200/7c3aed/ffffff?text=Bloquelon', descripcion: 'Bloquelón de gran tamaño y resistencia para proyectos de alta envergadura.' },
    { id: 11, nombre: 'Ladrillo Prensado Liviano 24.5x12x6cm Santafe', precio: 1400, medidas: '24.5x12x6 cm', stock: 1000, categoria: 'Ladrillos', imagen: 'https://tse1.explicit.bing.net/th/id/OIP.tjvaRd5heYNx-pBY-hdIFwHaEx?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', descripcion: 'Ladrillo prensado liviano Santafe. 2.2 Kg, rendimiento 56 u/m2. Tipo enchape, color terracota. Código: 114940.' },
    { id: 12, nombre: 'Bloque Perf Vert DP 33x23x11.5cm', precio: 4900, medidas: '33x23x11.5 cm', stock: 600, categoria: 'Bloques', imagen: 'https://tse1.explicit.bing.net/th/id/OIP.pNBz_1pKxsYPDFmnk9nQ_wHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', descripcion: 'Bloque perforación vertical DP estructural. 7.9 Kg, rendimiento 12.25 u/m2. Color terracota. Código: 76786.' },
    { id: 13, nombre: 'Ladrillo Refractario 24x12.5x4cm 1400°C', precio: 2700, medidas: '24x12.5x4 cm', stock: 500, categoria: 'Refractarios', imagen: 'https://media.adeo.com/media/4405301/media.jpeg?width=3000&height=3000&format=jpg&quality=80&fit=bounds', descripcion: 'Ladrillo refractario de alta resistencia térmica hasta 1400°C. 1.5 Kg, rendimiento 36 u/m2, color arena. Código: 159253.' },
    { id: 14, nombre: 'Tolete #1 Perforado 24x12x6cm', precio: 660, medidas: '24x12x6 cm', stock: 1500, categoria: 'Ladrillos', imagen: 'https://imagedelivery.net/4fYuQyy-r8_rpBpcY7lH_A/sodimacCO/99717/w=1036,h=832,f=webp,fit=contain,q=85', descripcion: 'Tolete #1 perforado artesanal. 2.10 Kg, rendimiento 56 u/m2. Garantía 1 año. Código: 99717.' },
    { id: 15, nombre: 'Prensado Macizo 24.5x12x5.5cm', precio: 1900, medidas: '24.5x12x5.5 cm', stock: 800, categoria: 'Ladrillos', imagen: 'https://placehold.co/300x200/b45309/ffffff?text=Prensado+Macizo', descripcion: 'Ladrillo prensado macizo tipo enchape. Rendimiento 60 u/m2, color terracota. Código: 23209.' },
    { id: 16, nombre: 'Tableta Arcilla Cúcuta 20x20cm', precio: 23000, medidas: '20x20 cm', stock: 400, categoria: 'Tabletas', imagen: 'https://placehold.co/300x200/ea580c/ffffff?text=Tableta+Cucuta', descripcion: 'Tableta elaborada en arcilla natural tamaño 20x20 cm. Acabado tradicional para pisos y muros.' },
    { id: 17, nombre: 'Adoquín Corbatín 15x10x6cm', precio: 800, medidas: '15x10x6 cm', stock: 1200, categoria: 'Adoquines', imagen: 'https://placehold.co/300x200/78716c/ffffff?text=Adoquin+Corbatin', descripcion: 'Adoquín tipo corbatín para pavimentación exterior y senderos de alto tránsito.' },
    { id: 18, nombre: 'Tableta Rústica 25x25cm', precio: 20000, medidas: '25x25 cm', stock: 350, categoria: 'Tabletas', imagen: 'https://placehold.co/300x200/c2410c/ffffff?text=Tableta+Rustica', descripcion: 'Tableta acabado rústico en arcilla de alta resistencia, formato 25x25 cm.' },
    { id: 19, nombre: 'Ladrillo Prisma Gris 24x12x6cm', precio: 900, medidas: '24x12x6 cm', stock: 700, categoria: 'Fachadas', imagen: 'https://placehold.co/300x200/64748b/ffffff?text=Prisma+Gris', descripcion: 'Ladrillo de fachada acabado prisma gris moderno. Alta estética arquitectónica.' },
    { id: 20, nombre: 'Ladrillo Cocoa 24x12x6cm', precio: 900, medidas: '24x12x6 cm', stock: 700, categoria: 'Fachadas', imagen: 'https://placehold.co/300x200/78350f/ffffff?text=Ladrillo+Cocoa', descripcion: 'Ladrillo de fachada tono cocoa oscuro elegante. Gran durabilidad y textura.' },
    { id: 21, nombre: 'Arena de Río (m³)', precio: 100000, medidas: 'm³', stock: 100, categoria: 'Agregados', imagen: 'https://placehold.co/300x200/a8a29e/ffffff?text=Arena+de+Rio', descripcion: 'Arena de río lavada y seleccionada para mezclas de concreto y pegas de mampostería.' },
    { id: 22, nombre: 'Arena Amarilla (m³)', precio: 100000, medidas: 'm³', stock: 100, categoria: 'Agregados', imagen: 'https://placehold.co/300x200/ca8a04/ffffff?text=Arena+Amarilla', descripcion: 'Arena amarilla seleccionada para morteros de pega, acabados y revoques uniformes.' },
    { id: 23, nombre: 'Mixto de Concreto (m³)', precio: 100000, medidas: 'm³', stock: 100, categoria: 'Agregados', imagen: 'https://placehold.co/300x200/57534e/ffffff?text=Mixto+Concreto', descripcion: 'Material mixto granular (grava y arena) balanceado para fundición estructural.' },
];

const CATEGORIES = ['Todos', 'Ladrillos', 'Bloques', 'Fachadas', 'Refractarios', 'Tabletas', 'Adoquines', 'Tejas', 'Agregados', 'Especiales'];

export default function ProductsPage() {
    const { addItem } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todos');
    const [soloDisponibles, setSoloDisponibles] = useState(false);
    const [added, setAdded] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const params = new URLSearchParams();
                if (category !== 'Todos') params.set('categoria', category);
                if (search) params.set('buscar', search);
                if (soloDisponibles) params.set('disponible', 'true');
                const res = await fetch(`${API_BASE_URL}/api/productos?${params}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setProducts(data.length ? data : FALLBACK);
            } catch {
                // Apply filters client-side on fallback
                let data = [...FALLBACK];
                if (category !== 'Todos') data = data.filter(p => p.categoria === category);
                if (search) data = data.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));
                if (soloDisponibles) data = data.filter(p => p.stock > 0);
                setProducts(data);
            } finally {
                setLoading(false);
            }
        };
        const timer = setTimeout(load, 300);
        return () => clearTimeout(timer);
    }, [search, category, soloDisponibles]);

    const handleAdd = (product) => {
        addItem(product);
        setAdded(prev => ({ ...prev, [product.id]: true }));
        setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500);
    };

    return (
        <div className="products-page">
            <div className="container">
                {/* Page Header */}
                <div className="section-header">
                    <h1 className="section-title">Nuestros <span className="gradient-text">Productos</span></h1>
                    <p className="section-subtitle">Materiales de construcción en arcilla directamente del productor artesanal</p>
                </div>

                {/* Category Pills */}
                <div className="category-pills">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`category-pill${category === cat ? ' active' : ''}${cat === 'Agregados' ? ' category-pill-agregados' : ''}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="products-filters">
                    <div className="search-box">
                        <Search size={16} className="search-box-icon" />
                        <input
                            type="search"
                            className="form-input"
                            placeholder="Buscar materiales..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            aria-label="Buscar productos"
                            id="product-search"
                        />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <input
                            type="checkbox"
                            checked={soloDisponibles}
                            onChange={e => setSoloDisponibles(e.target.checked)}
                            style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                        />
                        Solo disponibles
                    </label>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        <SlidersHorizontal size={16} />
                        {loading ? 'Cargando...' : `${products.length} producto${products.length !== 1 ? 's' : ''}`}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                        <div className="spinner" />
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <Package size={64} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sin resultados</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>Intenta cambiar los filtros de búsqueda</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product, i) => (
                            <article
                                key={product.id}
                                className="product-card animate-slide-up"
                                style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
                            >
                                <div className="product-card-image">
                                    <img src={product.imagen} alt={product.nombre} loading="lazy" />
                                    <div className="product-card-overlay">
                                        <button
                                            className={`btn btn-sm ${added[product.id] ? 'btn-success' : 'btn-primary'}`}
                                            onClick={() => handleAdd(product)}
                                            style={{ width: '100%' }}
                                            id={`add-to-cart-${product.id}`}
                                        >
                                            {added[product.id] ? '✓ Agregado' : 'Agregar al Carrito'}
                                        </button>
                                    </div>
                                    <div className="stock-badge-overlay">
                                        <span className={`badge ${product.stock > 100 ? 'badge-success' : product.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                                            {product.stock > 0 ? `${product.stock} uds.` : 'Sin stock'}
                                        </span>
                                    </div>
                                </div>

                                <div className="product-card-body">
                                    <h2 className="product-card-name">{product.nombre}</h2>
                                    <p className="product-card-measures">Medidas: {product.medidas}</p>
                                    <p className="product-card-desc">{product.descripcion}</p>

                                    <div className="product-card-footer">
                                        <div>
                                            <div className="product-price">
                                                ${product.precio.toLocaleString('es-CO')}
                                                <span className="product-price-unit"> / unidad</span>
                                            </div>
                                        </div>
                                        <button
                                            className={`btn btn-sm ${added[product.id] ? 'btn-success' : 'btn-primary'}`}
                                            onClick={() => handleAdd(product)}
                                            id={`add-card-${product.id}`}
                                        >
                                            {added[product.id] ? '✓' : '+'}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
