import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Package, 
  TrendingUp, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';

const TABS = [
  { id: 'productos', label: 'Inventario & Catálogo', icon: Package },
  { id: 'pedidos', label: 'Gestión de Pedidos', icon: ShoppingBag },
  { id: 'reportes', label: 'Reportes de Ventas', icon: TrendingUp },
  { id: 'movimientos', label: 'Historial de Entradas/Salidas', icon: Clock }
];

export const AdminDashboard = ({ isOpen, onClose }) => {
  const { token, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('productos');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modals inside admin
  const [stockModal, setStockModal] = useState({ open: false, product: null, tipo: 'entrada', cantidad: '', nota: '' });
  const [productModal, setProductModal] = useState({ open: false, product: null, isEdit: false });
  const [productForm, setProductForm] = useState({
    nombre: '',
    precio: '',
    medidas: '18*9*6',
    descripcion: '',
    stock: 500,
    imagen: '',
    categoria: 'Ladrillos'
  });

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadData();
    }
  }, [isOpen, activeTab]);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'productos') {
        const res = await fetch('/api/admin/productos', { headers });
        const data = await res.json();
        setProducts(data);
      } else if (activeTab === 'pedidos') {
        const res = await fetch('/api/admin/pedidos', { headers });
        const data = await res.json();
        setOrders(data);
      } else if (activeTab === 'reportes') {
        const res = await fetch('/api/admin/reportes/ventas', { headers });
        const data = await res.json();
        setReports(data);
      } else if (activeTab === 'movimientos') {
        const res = await fetch('/api/admin/reportes/inventario', { headers });
        const data = await res.json();
        setMovements(data.movimientos || []);
      }
    } catch (err) {
      console.error('Error cargando datos de admin:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stock Adjustment
  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/productos/${stockModal.product.id}/stock-adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tipo: stockModal.tipo,
          cantidad: Number(stockModal.cantidad),
          nota: stockModal.nota
        })
      });

      if (!res.ok) throw new Error('Error al ajustar stock');
      showNotify(`Stock de ${stockModal.product.nombre} actualizado correctamente.`);
      setStockModal({ open: false, product: null, tipo: 'entrada', cantidad: '', nota: '' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Quick Price Update
  const handleQuickPrice = async (id, nuevoPrecio) => {
    const p = prompt('Ingrese el nuevo precio unitario (COP):', nuevoPrecio);
    if (!p || isNaN(p) || Number(p) <= 0) return;

    try {
      const res = await fetch(`/api/admin/productos/${id}/precio`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ precio: Number(p) })
      });
      if (!res.ok) throw new Error('Error al actualizar precio');
      showNotify('Precio actualizado exitosamente');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Product Save (Create or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = productModal.isEdit 
        ? `/api/admin/productos/${productModal.product.id}` 
        : `/api/admin/productos`;
      const method = productModal.isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      if (!res.ok) throw new Error('Error al guardar producto');
      showNotify(productModal.isEdit ? 'Producto modificado con éxito' : 'Nuevo producto creado');
      setProductModal({ open: false, product: null, isEdit: false });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Change Order Status
  const handleStatusChange = async (pedidoId, nuevoEstado) => {
    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (!res.ok) throw new Error('Error actualizando estado');
      showNotify(`Pedido #${pedidoId} actualizado a ${nuevoEstado}`);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" />

      {/* Main Container */}
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden">
        
        {/* Top Bar */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-white">
                Panel de Administración Central — FES Construcción
              </h2>
              <p className="text-xs text-slate-400">
                Control de inventario de patio, auditoría de ventas y despachos en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-6 flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 gap-2 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: PRODUCTOS */}
          {activeTab === 'productos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">
                  Total de referencias registradas: <strong className="text-white">{products.length}</strong>
                </span>

                <button
                  onClick={() => {
                    setProductForm({
                      nombre: '',
                      precio: '',
                      medidas: '18*9*6',
                      descripcion: '',
                      stock: 500,
                      imagen: '',
                      categoria: 'Ladrillos'
                    });
                    setProductModal({ open: true, product: null, isEdit: false });
                  }}
                  className="btn-primary-cta text-xs py-2 px-3.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Material</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Material</th>
                      <th className="p-3.5">Categoría</th>
                      <th className="p-3.5">Medidas</th>
                      <th className="p-3.5">Precio Unit. (COP)</th>
                      <th className="p-3.5">Stock en Patio</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5 font-bold text-white flex items-center gap-3">
                          <img
                            src={p.imagen || '/logo.png'}
                            alt={p.nombre}
                            className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                            onError={(e) => { e.target.src = '/logo.png'; }}
                          />
                          <span>{p.nombre}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {p.categoria}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono">{p.medidas || 'Estándar'}</td>
                        <td className="p-3.5 font-mono font-bold text-orange-400">
                          ${Number(p.precio).toLocaleString('es-CO')}
                          <button
                            onClick={() => handleQuickPrice(p.id, p.precio)}
                            className="ml-2 text-slate-500 hover:text-white p-1"
                            title="Cambiar precio directo"
                          >
                            <Edit className="w-3 h-3 inline" />
                          </button>
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            p.stock > 100 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {p.stock} unid.
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setStockModal({
                                open: true,
                                product: p,
                                tipo: 'entrada',
                                cantidad: '',
                                nota: 'Ingreso directo desde horno'
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white font-semibold transition-colors"
                          >
                            Ajustar Stock
                          </button>
                          <button
                            onClick={() => {
                              setProductForm({
                                nombre: p.nombre,
                                precio: p.precio,
                                medidas: p.medidas || '',
                                descripcion: p.descripcion || '',
                                stock: p.stock,
                                imagen: p.imagen || '',
                                categoria: p.categoria
                              });
                              setProductModal({ open: true, product: p, isEdit: true });
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            title="Editar referencia"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Historial de órdenes recibidas: <strong className="text-white">{orders.length}</strong></span>
              </div>

              <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5"># Orden</th>
                      <th className="p-3.5">Cliente</th>
                      <th className="p-3.5">Fecha</th>
                      <th className="p-3.5">Materiales Solicitados</th>
                      <th className="p-3.5">Total (COP)</th>
                      <th className="p-3.5">Estado del Despacho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5 font-bold text-orange-400 font-mono">#{o.id}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{o.cliente_nombre || 'Cliente Obra'}</div>
                          <div className="text-[11px] text-slate-400">{o.telefono || o.direccion_envio}</div>
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {new Date(o.creado_en).toLocaleString('es-CO')}
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            {(o.detalle || []).map((det, i) => (
                              <div key={i} className="text-[11px] text-slate-300">
                                • {det.cantidad}x {det.nombre_producto}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          ${Number(o.total).toLocaleString('es-CO')}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={o.estado}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:border-orange-500 text-white"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="En preparación">En preparación</option>
                            <option value="En camino">En camino</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REPORTES DE VENTAS */}
          {activeTab === 'reportes' && reports && (
            <div className="space-y-6">
              
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Ingresos Totales Brutos
                  </span>
                  <div className="text-2xl font-black text-orange-400 font-mono mt-1">
                    ${Number(reports.totalGeneral?.ingresos_totales || 0).toLocaleString('es-CO')}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Ventas facturadas</span>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Total Órdenes Concluidas
                  </span>
                  <div className="text-2xl font-black text-white font-mono mt-1">
                    {reports.totalGeneral?.total_pedidos || 0}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Despachos coordinados</span>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Ticket Promedio
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    ${reports.totalGeneral?.total_pedidos > 0 
                      ? Math.round(reports.totalGeneral.ingresos_totales / reports.totalGeneral.total_pedidos).toLocaleString('es-CO')
                      : 0}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">COP por orden</span>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Rotación de Patio
                  </span>
                  <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                    Alta
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Ladrillo tolete y bloque</span>
                </div>
              </div>

              {/* Top Products */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                  Top 5 Materiales Más Vendidos
                </h3>
                <div className="space-y-2">
                  {(reports.topProductos || []).map((tp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-orange-600/20 text-orange-400 font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white">{tp.nombre_producto}</span>
                      </div>
                      <div className="font-mono text-slate-300">
                        <strong className="text-orange-400">{Number(tp.unidades_vendidas).toLocaleString('es-CO')}</strong> unidades
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: MOVIMIENTOS DE INVENTARIO */}
          {activeTab === 'movimientos' && (
            <div className="space-y-4">
              <span className="text-xs text-slate-400 font-semibold">
                Registro de auditoría de entradas y salidas de patio:
              </span>

              <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Fecha</th>
                      <th className="p-3.5">Tipo</th>
                      <th className="p-3.5">Material</th>
                      <th className="p-3.5">Cantidad</th>
                      <th className="p-3.5">Nota de Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                    {movements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-900/40">
                        <td className="p-3.5 text-slate-400">{new Date(m.fecha).toLocaleString('es-CO')}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            m.tipo === 'entrada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white font-sans">{m.nombre_producto}</td>
                        <td className="p-3.5 font-bold">{m.cantidad} unid.</td>
                        <td className="p-3.5 text-slate-400 font-sans">{m.nota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Stock Adjustment Modal */}
      {stockModal.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div onClick={() => setStockModal({ ...stockModal, open: false })} className="fixed inset-0 bg-slate-950/80" />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 z-10 space-y-4">
            <h4 className="font-heading font-bold text-white text-sm">
              Ajustar Inventario: {stockModal.product.nombre}
            </h4>

            <form onSubmit={handleStockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tipo de Movimiento</label>
                <select
                  value={stockModal.tipo}
                  onChange={(e) => setStockModal({ ...stockModal, tipo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="entrada">Entrada (+ Lote nuevo de horno)</option>
                  <option value="salida">Salida (- Rotura o merma)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cantidad de Unidades</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockModal.cantidad}
                  onChange={(e) => setStockModal({ ...stockModal, cantidad: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  placeholder="Ej: 500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motivo / Nota</label>
                <input
                  type="text"
                  value={stockModal.nota}
                  onChange={(e) => setStockModal({ ...stockModal, nota: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  placeholder="Ej: Remesa #45 patio Vereda Patio Bonito"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStockModal({ ...stockModal, open: false })}
                  className="flex-1 py-2.5 bg-slate-800 rounded-xl text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 rounded-xl text-white font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Edit / Create Modal */}
      {productModal.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div onClick={() => setProductModal({ ...productModal, open: false })} className="fixed inset-0 bg-slate-950/80" />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 z-10 space-y-4">
            <h4 className="font-heading font-bold text-white text-base">
              {productModal.isEdit ? 'Editar Referencia' : 'Nueva Referencia de Material'}
            </h4>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={productForm.nombre}
                  onChange={(e) => setProductForm({ ...productForm, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Precio Unitario (COP)</label>
                  <input
                    type="number"
                    required
                    value={productForm.precio}
                    onChange={(e) => setProductForm({ ...productForm, precio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={productForm.categoria}
                    onChange={(e) => setProductForm({ ...productForm, categoria: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Ladrillos">Ladrillos</option>
                    <option value="Bloques">Bloques</option>
                    <option value="Fachadas">Fachadas</option>
                    <option value="Tabletas">Tabletas</option>
                    <option value="Adoquines">Adoquines</option>
                    <option value="Tejas">Tejas</option>
                    <option value="Refractarios">Refractarios</option>
                    <option value="Agregados">Agregados</option>
                    <option value="Especiales">Especiales</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Medidas (cm)</label>
                  <input
                    type="text"
                    value={productForm.medidas}
                    onChange={(e) => setProductForm({ ...productForm, medidas: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    placeholder="18*9*6"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL de la Imagen</label>
                <input
                  type="url"
                  value={productForm.imagen}
                  onChange={(e) => setProductForm({ ...productForm, imagen: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción Técnica</label>
                <textarea
                  rows="2"
                  value={productForm.descripcion}
                  onChange={(e) => setProductForm({ ...productForm, descripcion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setProductModal({ ...productModal, open: false })}
                  className="flex-1 py-2.5 bg-slate-800 rounded-xl text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 rounded-xl text-white font-bold"
                >
                  Guardar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
