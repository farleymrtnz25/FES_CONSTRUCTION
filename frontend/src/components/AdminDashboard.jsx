import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Package, ShoppingBag, BarChart3, Users,
    Plus, Edit, Trash2, CheckCircle, Clock, Truck,
    ShieldAlert, Download, TrendingUp, ArrowUpRight, ArrowDownRight,
    ClipboardList, MoveUp, MoveDown, History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL } from '../config';

const fmt = n => n ? n.toLocaleString('es-CO') : '0';

const STATUS_OPTIONS = ['Pendiente', 'Pagado', 'En Proceso', 'Enviado', 'Entregado', 'Finalizado', 'Cancelado'];
const STATUS_COLORS = {
    'Pendiente': 'badge-warning',
    'Pagado': 'badge-success',
    'En Proceso': 'badge-info',
    'Enviado': 'badge-primary',
    'Entregado': 'badge-success',
    'Finalizado': 'badge-dark',
    'Cancelado': 'badge-danger'
};

export default function AdminDashboard() {
    const { authFetch } = useAuth();
    const [tab, setTab] = useState('resumen');
    const [reportsTab, setReportsTab] = useState('dia'); // dia, mes, aÃ±o
    const [data, setData] = useState({ products: [], orders: [], stats: null, inventory: null });
    const [loading, setLoading] = useState(true);
    const [adjustingStock, setAdjustingStock] = useState(null); // { id, nombre, tipo }
    const [adjustForm, setAdjustForm] = useState({ cantidad: '', nota: '' });
    const [dateFilters, setDateFilters] = useState({ desde: '', hasta: '' });
    const [editingStockId, setEditingStockId] = useState(null);
    const [editingPriceId, setEditingPriceId] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [addingProduct, setAddingProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({
        nombre: '', descripcion: '', precio: '', dimensiones: '',
        imagen_url: '', categoria: 'Ladrillos', stock: '0'
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const statsParams = dateFilters.desde && dateFilters.hasta ? `?desde=${dateFilters.desde}&hasta=${dateFilters.hasta}` : '';
            
            // Safe fetch helper to avoid entire dashboard failing if one endpoint has issue
            const safeFetch = async (url, fallback) => {
                try {
                    const res = await authFetch(url);
                    if (!res.ok) return fallback;
                    return await res.json();
                } catch {
                    return fallback;
                }
            };

            const [products, orders, stats, inventory] = await Promise.all([
                safeFetch(`${API_BASE_URL}/api/admin/productos`, []),
                safeFetch(`${API_BASE_URL}/api/admin/pedidos`, []),
                safeFetch(`${API_BASE_URL}/api/admin/reportes/ventas${statsParams}`, { totalGeneral: { total_pedidos: 0, ingresos_totales: 0 }, topProductos: [] }),
                safeFetch(`${API_BASE_URL}/api/admin/reportes/inventario`, { movimientos: [], stockActual: [] })
            ]);

            setData({ 
                products: Array.isArray(products) ? products : [], 
                orders: Array.isArray(orders) ? orders : [], 
                stats: stats || { totalGeneral: { total_pedidos: 0, ingresos_totales: 0 }, topProductos: [] }, 
                inventory: inventory || { movimientos: [], stockActual: [] } 
            });
        } catch (err) {
            console.error('Error al cargar dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const updateOrderStatus = async (id, status) => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/admin/pedidos/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: status })
            });
            if (res.ok) loadData();
        } catch (err) { console.error(err); }
    };

    const handleStockAdjust = async (e) => {
        e.preventDefault();
        if (!adjustingStock) return;
        try {
            const res = await authFetch(`${API_BASE_URL}/api/admin/productos/${adjustingStock.id}/stock-adjust`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: adjustingStock.tipo,
                    cantidad: parseInt(adjustForm.cantidad),
                    nota: adjustForm.nota
                })
            });
            if (res.ok) {
                setAdjustingStock(null);
                setAdjustForm({ cantidad: '', nota: '' });
                loadData();
            }
        } catch (err) { console.error(err); }
    };

    const updateStockDirectly = async (id, stock) => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/admin/productos/${id}/stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: parseInt(stock) })
            });
            if (res.ok) {
                setEditingStockId(null);
                loadData();
            }
        } catch (err) { console.error(err); }
    };

    const updatePriceDirectly = async (id, price) => {
        const num = parseFloat(price);
        if (isNaN(num) || num < 0) return;
        try {
            const res = await authFetch(`${API_BASE_URL}/api/admin/productos/${id}/precio`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ precio: num })
            });
            if (res.ok) {
                setEditingPriceId(null);
                loadData();
            }
        } catch (err) { console.error(err); }
    };


    const createProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.nombre.trim() || !newProduct.precio) {
            alert('El nombre y el precio son obligatorios.');
            return;
        }
        setAddingProduct(true);
        try {
            const res = await authFetch(`${API_BASE_URL}/api/admin/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: newProduct.nombre.trim(),
                    descripcion: newProduct.descripcion,
                    precio: parseFloat(newProduct.precio),
                    dimensiones: newProduct.dimensiones,
                    imagen_url: newProduct.imagen_url,
                    categoria: newProduct.categoria,
                    stock: parseInt(newProduct.stock) || 0
                })
            });
            const data = await res.json();
            if (res.ok) {
                setNewProduct({ nombre: '', descripcion: '', precio: '', dimensiones: '', imagen_url: '', categoria: 'Ladrillos', stock: '0' });
                setShowAddForm(false);
                loadData();
                alert(`? Producto "${newProduct.nombre}" agregado exitosamente (ID: ${data.id})`);
            } else {
                alert('? Error: ' + (data.error || 'No se pudo crear el producto'));
            }
        } catch (err) {
            console.error(err);
            alert('? Error de conexión al crear el producto');
        } finally {
            setAddingProduct(false);
        }
    };

    const deleteProduct = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            const res = await authFetch(`${API_BASE_URL}/api/admin/productos/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                loadData();
                alert(`? ${data.message}`);
            } else {
                alert('? Error: ' + (data.error || 'No se pudo eliminar'));
            }
        } catch (err) {
            console.error(err);
            alert('? Error de conexión al eliminar');
        }
    };
    const generateAdminPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Header Helper
        const addHeader = (title) => {
            doc.setFontSize(22);
            doc.setTextColor(30, 30, 30);
            doc.setFont('helvetica', 'bold');
            doc.text('Tu Proyecto S.A.S.', 14, 20);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`, 14, 26);

            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.setFont('helvetica', 'bold');
            doc.text(title, pageWidth / 2, 40, { align: 'center' });

            // Separator line
            doc.setDrawColor(200, 200, 200);
            doc.line(14, 45, pageWidth - 14, 45);
        };

        // Footer Helper
        const addFooter = () => {
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`PÃ¡gina ${i} de ${pageCount} - Generado por F.E.S. Admin v2.1`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        };

        let startY = 55;

        switch (tab) {
            case 'resumen':
                if (!data.stats) return;
                addHeader('REPORTE GENERAL EJECUTIVO');

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Resumen Financiero', 14, startY);

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Ingresos Totales: $${fmt(data.stats.totalGeneral.ingresos_totales)}`, 14, startY + 8);
                doc.text(`Total Pedidos Completados: ${data.stats.totalGeneral.total_pedidos}`, 14, startY + 14);

                startY += 30;

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Top Productos MÃ¡s Vendidos', 14, startY);

                if (data.stats.topProductos && data.stats.topProductos.length > 0) {
                    autoTable(doc, {
                        startY: startY + 5,
                        head: [['Producto', 'Unidades Vendidas']],
                        body: data.stats.topProductos.map(p => [p.nombre_producto, `${p.unidades_vendidas} uds.`]),
                        theme: 'grid',
                        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                        styles: { fontSize: 9 }
                    });
                } else {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.text('No hay datos suficientes.', 14, startY + 8);
                }

                addFooter();
                doc.save('Reporte_General.pdf');
                break;

            case 'productos':
                if (!data.products) return;
                addHeader('REPORTE DE INVENTARIO Y STOCK');

                autoTable(doc, {
                    startY: startY,
                    head: [['ID', 'Producto', 'CategorÃ­a', 'Stock', 'Estado']],
                    body: data.products.map(p => {
                        const estado = p.stock === 0 ? 'Agotado' : (p.stock < 100 ? 'Bajo' : 'Ã“ptimo');
                        return [p.id.toString(), p.nombre, p.categoria, p.stock.toString(), estado];
                    }),
                    theme: 'striped',
                    headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: 'bold' },
                    styles: { fontSize: 9 },
                    didParseCell: function (cellData) {
                        if (cellData.section === 'body' && cellData.column.index === 4) {
                            if (cellData.cell.raw === 'Agotado') cellData.cell.styles.textColor = [231, 76, 60];
                            else if (cellData.cell.raw === 'Bajo') cellData.cell.styles.textColor = [243, 156, 18];
                            else cellData.cell.styles.textColor = [39, 174, 96];
                        }
                    }
                });

                addFooter();
                doc.save('Reporte_Inventario.pdf');
                break;

            case 'movimientos':
                if (!data.inventory || !data.inventory.movimientos) return;
                addHeader('BITÃCORA DE ENTRADAS Y SALIDAS');

                autoTable(doc, {
                    startY: startY,
                    head: [['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Motivo']],
                    body: data.inventory.movimientos.map(m => [
                        new Date(m.fecha).toLocaleString('es-CO'),
                        m.nombre_producto,
                        m.tipo.toUpperCase(),
                        m.cantidad.toString(),
                        m.nota || 'N/A'
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [142, 68, 173], textColor: 255, fontStyle: 'bold' },
                    styles: { fontSize: 8 },
                    didParseCell: function (cellData) {
                        if (cellData.section === 'body' && cellData.column.index === 2) {
                            if (cellData.cell.raw === 'ENTRADA') cellData.cell.styles.textColor = [39, 174, 96];
                            else cellData.cell.styles.textColor = [231, 76, 60];
                        }
                    }
                });

                addFooter();
                doc.save('Reporte_Movimientos.pdf');
                break;

            case 'pedidos':
                if (!data.orders) return;
                addHeader('REPORTE DE PEDIDOS Y ENVÃOS');

                autoTable(doc, {
                    startY: startY,
                    head: [['Pedido #', 'Fecha', 'Cliente', 'Estado', 'Total']],
                    body: data.orders.map(o => [
                        o.id.toString(),
                        new Date(o.creado_en).toLocaleDateString('es-CO'),
                        o.cliente_nombre || 'WhatsApp',
                        o.estado,
                        `$${fmt(o.total)}`
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [243, 156, 18], textColor: 255, fontStyle: 'bold' },
                    styles: { fontSize: 9 }
                });

                addFooter();
                doc.save('Reporte_Pedidos.pdf');
                break;

            case 'reportes':
                if (!data.stats || !data.stats.individual) return;
                const periodoName = reportsTab === 'dia' ? 'DIARIO' : (reportsTab === 'mes' ? 'MENSUAL' : 'ANUAL');
                addHeader(`ANÃLISIS DE VENTAS INDIVIDUAL - ${periodoName}`);

                // Agrupar
                const groupedSales = {};
                data.stats.individual.forEach(sale => {
                    const d = new Date(sale.creado_en);
                    let key = '';
                    if (reportsTab === 'dia') key = d.toLocaleDateString('es-CO');
                    else if (reportsTab === 'mes') key = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
                    else key = d.getFullYear().toString();

                    if (!groupedSales[key]) {
                        groupedSales[key] = { pedidos: 0, ingresos: 0, ventas: [] };
                    }
                    groupedSales[key].pedidos += 1;
                    groupedSales[key].ingresos += Number(sale.total);
                    groupedSales[key].ventas.push(sale);
                });

                Object.keys(groupedSales).forEach(k => {
                    const g = groupedSales[k];

                    // Group Header
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text(`${k.toUpperCase()} - Pedidos: ${g.pedidos} | Ingresos: $${fmt(g.ingresos)}`, 14, startY);

                    const rows = g.ventas.map(v => [
                        `#${v.id}`,
                        new Date(v.creado_en).toLocaleString('es-CO'),
                        v.cliente_nombre || 'WhatsApp',
                        v.metodo_pago,
                        `$${fmt(v.total)}`
                    ]);

                    autoTable(doc, {
                        startY: startY + 4,
                        head: [['Pedido', 'Fecha y Hora', 'Cliente', 'MÃ©todo Pago', 'Total']],
                        body: rows,
                        theme: 'grid',
                        headStyles: { fillColor: [52, 73, 94], textColor: 255, fontStyle: 'bold' },
                        styles: { fontSize: 8 },
                        columnStyles: {
                            0: { halign: 'left', fontStyle: 'bold' },
                            4: { halign: 'right', fontStyle: 'bold' }
                        }
                    });

                    startY = doc.lastAutoTable.finalY + 15;

                    if (startY > pageHeight - 40) {
                        doc.addPage();
                        startY = 20;
                    }
                });

                addFooter();
                doc.save(`Ventas_${periodoName}.pdf`);
                break;

            default:
                break;
        }
    };

    const filteredProducts = data.products ? data.products.filter(p =>
        p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.categoria.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.id.toString().includes(productSearch)
    ) : [];

    const filteredOrders = data.orders ? data.orders.filter(o =>
        o.id.toString().includes(orderSearch) ||
        (o.cliente_nombre && o.cliente_nombre.toLowerCase().includes(orderSearch.toLowerCase()))
    ) : [];

    if (loading && !data.stats) return <div className="admin-layout"><div className="admin-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div></div>;

    return (
        <div className="admin-layout animate-fade-in">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-title">F.E.S. Admin v2.1</div>
                {[
                    { id: 'resumen', label: 'Resumen', icon: <LayoutDashboard size={18} /> },
                    { id: 'productos', label: 'Inventario / Stock', icon: <Package size={18} /> },
                    { id: 'movimientos', label: 'Entradas/Salidas', icon: <History size={18} /> },
                    { id: 'pedidos', label: 'Pedidos / EnvÃ­os', icon: <ShoppingBag size={18} /> },
                    { id: 'reportes', label: 'Informes Ventas', icon: <BarChart3 size={18} /> }
                ].map(item => (
                    <button
                        key={item.id}
                        className={`admin-nav-item${tab === item.id ? ' active' : ''}`}
                        onClick={() => setTab(item.id)}
                    >
                        {item.icon} {item.label}
                    </button>
                ))}
            </aside>

            {/* Main */}
            <main className="admin-main">
                <header className="admin-header">
                    <h1>
                        {tab === 'resumen' && 'Vista General'}
                        {tab === 'productos' && 'GestiÃ³n de Stock'}
                        {tab === 'movimientos' && 'Historial de Inventario'}
                        {tab === 'pedidos' && 'Control de Pedidos'}
                        {tab === 'reportes' && 'AnÃ¡lisis de Ventas'}
                    </h1>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-secondary btn-sm" onClick={generateAdminPDF}>
                            <Download size={14} /> Informe PDF
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={loadData}>Actualizar</button>
                    </div>
                </header>

                {/* --- RESUMEN --- */}
                {tab === 'resumen' && data.stats && (
                    <div className="animate-slide-up">
                        <div className="admin-stat-cards">
                            <div className="admin-stat-card">
                                <div className="admin-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><TrendingUp size={24} /></div>
                                <div className="admin-stat-num">${fmt(data.stats.totalGeneral.ingresos_totales)}</div>
                                <div className="admin-stat-label">Ventas Totales</div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="admin-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><ShoppingBag size={24} /></div>
                                <div className="admin-stat-num">{data.stats.totalGeneral.total_pedidos}</div>
                                <div className="admin-stat-label">Pedidos Realizados</div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="admin-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><ShieldAlert size={24} /></div>
                                <div className="admin-stat-num">{data.products.filter(p => p.stock < 100).length}</div>
                                <div className="admin-stat-label">Stock bajo (&lt;100 pts)</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 card">
                                <div className="card-body">
                                    <h3 className="section-title-sm">Pedidos Urgentes (Pendientes)</h3>
                                    <div className="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr><th>ID</th><th>Cliente</th><th>Total</th><th>AcciÃ³n</th></tr>
                                            </thead>
                                            <tbody>
                                                {data.orders.filter(o => o.estado === 'Pendiente').slice(0, 6).map(o => (
                                                    <tr key={o.id}>
                                                        <td>#{o.id}</td>
                                                        <td>{o.cliente_nombre || 'WhatsApp'}</td>
                                                        <td style={{ fontWeight: 700 }}>${fmt(o.total)}</td>
                                                        <td>
                                                            <button className="btn btn-ghost btn-sm" onClick={() => setTab('pedidos')}>Gestionar</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body">
                                    <h3 className="section-title-sm">Top Ventas</h3>
                                    {data.stats.topProductos.slice(0, 5).map((p, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}>
                                            <span style={{ fontSize: '0.85rem' }}>{p.nombre_producto}</span>
                                            <span className="badge badge-primary">{p.unidades_vendidas} uds.</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PRODUCTOS / STOCK --- */}
                                {/* --- PRODUCTOS / STOCK --- */}
                {tab === 'productos' && (
                    <div className="animate-scale-in">
                        {/* Botón y Formulario para Agregar Producto */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="?? Buscar producto por nombre, categoría o ID..."
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                style={{ maxWidth: 360, width: '100%' }}
                            />
                            <button
                                className={`btn ${showAddForm ? 'btn-outline' : 'btn-primary'}`}
                                onClick={() => setShowAddForm(!showAddForm)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <Plus size={16} /> {showAddForm ? 'Cancelar' : 'Agregar Nuevo Producto'}
                            </button>
                        </div>

                        {showAddForm && (
                            <div className="card animate-fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem', border: '2px solid var(--color-primary)' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-primary)' }}>
                                    <Plus size={20} /> Nuevo Producto para el Catálogo
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                                    Ingresa los datos del producto. Se guardará directamente en la base de datos y se mostrará de inmediato en la tienda y en la app móvil.
                                </p>

                                <form onSubmit={createProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                                Nombre del Producto *
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Ej: Ladrillo Estructural 24x12x6"
                                                required
                                                value={newProduct.nombre}
                                                onChange={e => setNewProduct({ ...newProduct, nombre: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                                Categoría *
                                            </label>
                                            <select
                                                className="form-input"
                                                value={newProduct.categoria}
                                                onChange={e => setNewProduct({ ...newProduct, categoria: e.target.value })}
                                            >
                                                <option value="Ladrillos">Ladrillos</option>
                                                <option value="Bloques">Bloques</option>
                                                <option value="Fachadas">Fachadas</option>
                                                <option value="Refractarios">Refractarios</option>
                                                <option value="Tabletas">Tabletas</option>
                                                <option value="Adoquines">Adoquines</option>
                                                <option value="Tejas">Tejas</option>
                                                <option value="Agregados">Agregados</option>
                                                <option value="Especiales">Especiales</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                                Precio ($ COP) *
                                            </label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                placeholder="Ej: 1400"
                                                required
                                                min="0"
                                                step="any"
                                                value={newProduct.precio}
                                                onChange={e => setNewProduct({ ...newProduct, precio: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                                Dimensiones / Presentación
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Ej: 24.5x12x6 cm o m3"
                                                value={newProduct.dimensiones}
                                                onChange={e => setNewProduct({ ...newProduct, dimensiones: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                                Stock Inicial
                                            </label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                placeholder="0"
                                                min="0"
                                                value={newProduct.stock}
                                                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                            Enlace de la Foto del Producto (URL)
                                        </label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            placeholder="https://ejemplo.com/foto-ladrillo.jpg"
                                            value={newProduct.imagen_url}
                                            onChange={e => setNewProduct({ ...newProduct, imagen_url: e.target.value })}
                                        />
                                        {newProduct.imagen_url && (
                                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Vista previa:</span>
                                                <img
                                                    src={newProduct.imagen_url}
                                                    alt="Preview"
                                                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-border)' }}
                                                    onError={e => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                            Descripción del Producto
                                        </label>
                                        <textarea
                                            className="form-input"
                                            rows={3}
                                            placeholder="Detalles sobre características, usos recomendados, rendimiento por m2, etc."
                                            value={newProduct.descripcion}
                                            onChange={e => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setShowAddForm(false)}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-sm"
                                            disabled={addingProduct}
                                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                        >
                                            <Plus size={16} /> {addingProduct ? 'Guardando en BD...' : 'Guardar Producto en Base de Datos'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        <div className="card">
                            <div className="card-body">
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr><th style="width: 50px;">Foto</th><th>Producto</th><th>Categoría</th><th>Precio ($ COP)</th><th>Stock Actual</th><th>Acciones</th></tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map(p => (
                                                <tr key={p.id}>
                                                    <td>
                                                        {(p.imagen_url || p.imagen) ? (
                                                            <img 
                                                                src={p.imagen_url || p.imagen} 
                                                                alt={p.nombre} 
                                                                style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, border: "1px solid var(--color-border)" }}
                                                                onError={e => { e.currentTarget.style.display = "none"; }}
                                                            />
                                                        ) : (
                                                            <div style={{ width: 44, height: 44, borderRadius: 6, background: "var(--color-bg-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                                                                Sin foto
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {p.id}</div>
                                                    </td>
                                                    <td><span className="badge badge-gray">{p.categoria}</span></td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            {editingPriceId === p.id ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <span style={{ fontWeight: 700, color: '#d97706' }}>$</span>
                                                                    <input
                                                                        type="number"
                                                                        className="form-input"
                                                                        style={{ width: 110, padding: '4px 8px', fontWeight: 700 }}
                                                                        defaultValue={p.precio}
                                                                        onBlur={(e) => updatePriceDirectly(p.id, e.target.value)}
                                                                        onKeyDown={(e) => e.key === 'Enter' && updatePriceDirectly(p.id, e.target.value)}
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span
                                                                    className="badge badge-warning"
                                                                    style={{ fontSize: '0.95rem', padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                                                                    onClick={() => setEditingPriceId(p.id)}
                                                                    title="Click para cambiar precio"
                                                                >
                                                                    ${Number(p.precio).toLocaleString('es-CO')}
                                                                </span>
                                                            )}
                                                            <button className="btn btn-ghost btn-icon btn-xs" onClick={() => setEditingPriceId(p.id)} title="Cambiar precio">
                                                                <Edit size={12} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            {editingStockId === p.id ? (
                                                                <input
                                                                    type="number"
                                                                    className="form-input"
                                                                    style={{ width: 100, padding: '4px 8px' }}
                                                                    defaultValue={p.stock}
                                                                    onBlur={(e) => updateStockDirectly(p.id, e.target.value)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && updateStockDirectly(p.id, e.target.value)}
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <span
                                                                    className={`badge ${p.stock > 100 ? 'badge-success' : 'badge-danger'}`}
                                                                    style={{ fontSize: '1rem', padding: '4px 12px', cursor: 'pointer' }}
                                                                    onClick={() => setEditingStockId(p.id)}
                                                                    title="Click para editar"
                                                                >
                                                                    {p.stock}
                                                                </span>
                                                            )}
                                                            <button className="btn btn-ghost btn-icon btn-xs" onClick={() => setEditingStockId(p.id)}>
                                                                <Edit size={12} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td style={{ display: 'flex', gap: 8 }}>
                                                        <button className="btn btn-success btn-xs" onClick={() => setAdjustingStock({ ...p, tipo: 'entrada' })} title="Entrada de material">
                                                            <Plus size={14} /> Entrada
                                                        </button>
                                                        <button className="btn btn-danger btn-xs" onClick={() => setAdjustingStock({ ...p, tipo: 'salida' })} title="Salida de material">
                                                            <ArrowDownRight size={14} /> Salida
                                                        </button>
                                                        <button 
                                                            className="btn btn-ghost btn-icon btn-xs" 
                                                            onClick={() => deleteProduct(p.id, p.nombre)} 
                                                            title="Eliminar producto"
                                                            style={{ color: "var(--color-danger)" }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MOVIMIENTOS --- */}
                {tab === 'movimientos' && (
                    <div className="card animate-slide-up">
                        <div className="card-body">
                            <h3 className="section-title-sm">BitÃ¡cora de Entradas y Salidas</h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th></tr>
                                    </thead>
                                    <tbody>
                                        {data.inventory.movimientos.map((m, i) => (
                                            <tr key={i}>
                                                <td style={{ fontSize: '0.75rem' }}>{new Date(m.fecha).toLocaleString()}</td>
                                                <td style={{ fontWeight: 600 }}>{m.nombre_producto}</td>
                                                <td>
                                                    <span style={{
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                        color: m.tipo === 'entrada' ? '#16a34a' : '#dc2626',
                                                        fontWeight: 700
                                                    }}>
                                                        {m.tipo === 'entrada' ? <MoveDown size={14} /> : <MoveUp size={14} />}
                                                        {m.tipo.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 800 }}>{m.cantidad}</td>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{m.nota}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PEDIDOS / ESTADOS --- */}
                {tab === 'pedidos' && (
                    <div className="card animate-fade-in">
                        <div className="card-body">
                            <div style={{ marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="ðŸ” Buscar pedido por ID o Nombre del Cliente..."
                                    value={orderSearch}
                                    onChange={e => setOrderSearch(e.target.value)}
                                    style={{ maxWidth: 400, width: '100%' }}
                                />
                            </div>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado Actual</th><th>Cambiar Estado</th></tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map(o => (
                                            <tr key={o.id}>
                                                <td>#{o.id} <br /><span style={{ fontSize: '0.7rem' }}>{new Date(o.creado_en).toLocaleDateString()}</span></td>
                                                <td>{o.cliente_nombre || 'WhatsApp'} <br /><span style={{ fontSize: '0.7rem' }}>{o.metodo_pago}</span></td>
                                                <td style={{ fontWeight: 800 }}>${fmt(o.total)}</td>
                                                <td><span className={`badge ${STATUS_COLORS[o.estado]}`}>{o.estado}</span></td>
                                                <td>
                                                    <select
                                                        className="form-input"
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem', minWidth: 120 }}
                                                        value={o.estado}
                                                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                                    >
                                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- REPORTES GRANULARES --- */}
                {tab === 'reportes' && (
                    <div className="animate-slide-up">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div className="auth-tabs" style={{ marginBottom: 0 }}>
                                <button className={`auth-tab ${reportsTab === 'dia' ? 'active' : ''}`} onClick={() => setReportsTab('dia')}>DÃ­a</button>
                                <button className={`auth-tab ${reportsTab === 'mes' ? 'active' : ''}`} onClick={() => setReportsTab('mes')}>Mes</button>
                                <button className={`auth-tab ${reportsTab === 'aÃ±o' ? 'active' : ''}`} onClick={() => setReportsTab('aÃ±o')}>AÃ±o</button>
                            </div>

                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Desde:</label>
                                    <input type="date" className="form-input btn-sm" value={dateFilters.desde} onChange={e => setDateFilters({ ...dateFilters, desde: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Hasta:</label>
                                    <input type="date" className="form-input btn-sm" value={dateFilters.hasta} onChange={e => setDateFilters({ ...dateFilters, hasta: e.target.value })} />
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={loadData}>Filtrar</button>
                                {(dateFilters.desde || dateFilters.hasta) && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => { setDateFilters({ desde: '', hasta: '' }); setTimeout(loadData, 0); }}>Limpiar</button>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {(() => {
                                if (!data.stats || !data.stats.individual) return null;
                                const groupedData = {};
                                data.stats.individual.forEach(sale => {
                                    const d = new Date(sale.creado_en);
                                    let key = '';
                                    if (reportsTab === 'dia') key = d.toLocaleDateString('es-CO');
                                    else if (reportsTab === 'mes') key = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
                                    else key = d.getFullYear().toString();

                                    if (!groupedData[key]) {
                                        groupedData[key] = { label: key, pedidos: 0, ingresos: 0, ventas: [] };
                                    }
                                    groupedData[key].pedidos += 1;
                                    groupedData[key].ingresos += Number(sale.total);
                                    groupedData[key].ventas.push(sale);
                                });

                                return Object.keys(groupedData).map(k => {
                                    const group = groupedData[k];
                                    return (
                                        <div key={k} className="card">
                                            <div className="card-header" style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize' }}>{group.label}</h4>
                                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                                                    <span className="badge badge-gray">{group.pedidos} pedidos</span>
                                                    <span className="badge badge-success" style={{ fontWeight: 800 }}>${fmt(group.ingresos)}</span>
                                                </div>
                                            </div>
                                            <div className="card-body" style={{ padding: 0 }}>
                                                <div className="table-wrapper">
                                                    <table style={{ margin: 0 }}>
                                                        <thead>
                                                            <tr><th>#</th><th>Hora/Fecha</th><th>Cliente</th><th>Total</th></tr>
                                                        </thead>
                                                        <tbody>
                                                            {group.ventas.map((v, i) => (
                                                                <tr key={i}>
                                                                    <td>#{v.id}</td>
                                                                    <td>{new Date(v.creado_en).toLocaleString('es-CO')}</td>
                                                                    <td>{v.cliente_nombre || 'WhatsApp'} <br /><span style={{ fontSize: '0.7rem' }}>{v.metodo_pago}</span></td>
                                                                    <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>${fmt(v.total)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL AJUSTE STOCK */}
            {adjustingStock && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal animate-scale-in" style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h3 style={{ textTransform: 'capitalize' }}>{adjustingStock.tipo} de Material</h3>
                            <button className="btn btn-ghost" onClick={() => setAdjustingStock(null)}>X</button>
                        </div>
                        <form onSubmit={handleStockAdjust}>
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ fontSize: '0.85rem' }}>Producto: <strong>{adjustingStock.nombre}</strong></p>
                                <div className="form-group">
                                    <label className="form-label">Cantidad a {adjustingStock.tipo === 'entrada' ? 'sumar' : 'restar'}</label>
                                    <input
                                        type="number" className="form-input" required autoFocus
                                        value={adjustForm.cantidad} onChange={e => setAdjustForm({ ...adjustForm, cantidad: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nota / Motivo</label>
                                    <textarea
                                        className="form-input" rows="3" placeholder="Ej: Nueva producciÃ³n o DaÃ±o reportado"
                                        value={adjustForm.nota} onChange={e => setAdjustForm({ ...adjustForm, nota: e.target.value })}
                                    ></textarea>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button type="button" className="btn btn-secondary btn-full" onClick={() => setAdjustingStock(null)}>Cancelar</button>
                                    <button type="submit" className={`btn btn-full ${adjustingStock.tipo === 'entrada' ? 'btn-success' : 'btn-danger'}`}>
                                        Confirmar {adjustingStock.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
