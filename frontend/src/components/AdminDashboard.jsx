import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  generateInvoicePDF,
  exportOrdersReportPDF,
  exportSalesReportPDF,
  exportInventoryMovementsPDF,
  exportToCSV
} from '../utils/invoiceGenerator';
import { 
  X, 
  Package, 
  TrendingUp, 
  Clock, 
  Plus, 
  Edit, 
  ShoppingBag, 
  Calendar, 
  CheckCircle, 
  RefreshCw,
  Download,
  FileText,
  Filter
} from 'lucide-react';

const TABS = [
  { id: 'productos', label: 'Inventario & Catálogo', icon: Package },
  { id: 'pedidos', label: 'Gestión de Pedidos', icon: ShoppingBag },
  { id: 'reportes', label: 'Reportes de Ventas', icon: TrendingUp },
  { id: 'movimientos', label: 'Historial de Entradas/Salidas', icon: Clock }
];

const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function extractDateParts(rawDate) {
  const d = rawDate ? new Date(rawDate) : new Date();
  if (isNaN(d.getTime())) {
    const now = new Date();
    const y = String(now.getFullYear());
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return { year: y, month: `${y}-${m}`, day: `${y}-${m}-${day}`, dateObj: now };
  }
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return {
    year: y,
    month: `${y}-${m}`,
    day: `${y}-${m}-${day}`,
    dateObj: d
  };
}

function formatMonthLabel(yyyyMm) {
  if (!yyyyMm || !yyyyMm.includes('-')) return yyyyMm;
  const [y, m] = yyyyMm.split('-');
  const idx = parseInt(m, 10) - 1;
  return `${MESES_NOMBRES[idx] || m} ${y}`;
}

export const AdminDashboard = ({ isOpen, onClose }) => {
  const { token, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('productos');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Categorization / Period Filter States for the 3 Admin Sections
  // mode: 'todos' | 'dia' | 'mes' | 'anio'
  const [ordersFilterMode, setOrdersFilterMode] = useState('todos');
  const [ordersSelectedPeriod, setOrdersSelectedPeriod] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('Todos');

  const [salesPeriodMode, setSalesPeriodMode] = useState('dia'); // 'dia' | 'mes' | 'anio'
  const [salesFilterValue, setSalesFilterValue] = useState('');

  const [movFilterMode, setMovFilterMode] = useState('todos'); // 'todos' | 'dia' | 'mes' | 'anio'
  const [movSelectedPeriod, setMovSelectedPeriod] = useState('');
  const [movTypeFilter, setMovTypeFilter] = useState('Todos'); // 'Todos' | 'entrada' | 'salida'

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
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'productos') {
        const res = await fetch('/api/admin/productos', { headers });
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } else if (activeTab === 'pedidos') {
        const res = await fetch('/api/admin/pedidos', { headers });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else if (activeTab === 'reportes') {
        const [resRep, resOrd] = await Promise.all([
          fetch('/api/admin/reportes/ventas', { headers }),
          fetch('/api/admin/pedidos', { headers })
        ]);
        const dataRep = await resRep.json();
        const dataOrd = await resOrd.json();
        setReports(dataRep || {});
        setOrders(Array.isArray(dataOrd) ? dataOrd : []);
      } else if (activeTab === 'movimientos') {
        const res = await fetch('/api/admin/reportes/inventario', { headers });
        const data = await res.json();
        setMovements(Array.isArray(data?.movimientos) ? data.movimientos : []);
      }
    } catch (err) {
      console.error('Error cargando datos de admin:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // 1. GESTIÓN DE PEDIDOS: Categorización por Día, Mes y Año
  // ============================================================================
  const ordersCategorized = useMemo(() => {
    const byDay = {};
    const byMonth = {};
    const byYear = {};

    orders.forEach((o) => {
      const { day, month, year } = extractDateParts(o.creado_en);
      const val = Number(o.total || 0);

      if (!byDay[day]) byDay[day] = { period: day, label: day, count: 0, total: 0, items: [] };
      byDay[day].count += 1;
      byDay[day].total += val;
      byDay[day].items.push(o);

      if (!byMonth[month]) byMonth[month] = { period: month, label: formatMonthLabel(month), count: 0, total: 0, items: [] };
      byMonth[month].count += 1;
      byMonth[month].total += val;
      byMonth[month].items.push(o);

      if (!byYear[year]) byYear[year] = { period: year, label: `Año ${year}`, count: 0, total: 0, items: [] };
      byYear[year].count += 1;
      byYear[year].total += val;
      byYear[year].items.push(o);
    });

    return {
      dia: Object.values(byDay).sort((a, b) => b.period.localeCompare(a.period)),
      mes: Object.values(byMonth).sort((a, b) => b.period.localeCompare(a.period)),
      anio: Object.values(byYear).sort((a, b) => b.period.localeCompare(a.period))
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (ordersStatusFilter !== 'Todos' && o.estado !== ordersStatusFilter) return false;
      if (ordersFilterMode === 'todos' || !ordersSelectedPeriod) return true;
      const { day, month, year } = extractDateParts(o.creado_en);
      if (ordersFilterMode === 'dia') return day === ordersSelectedPeriod;
      if (ordersFilterMode === 'mes') return month === ordersSelectedPeriod;
      if (ordersFilterMode === 'anio') return year === ordersSelectedPeriod;
      return true;
    });
  }, [orders, ordersFilterMode, ordersSelectedPeriod, ordersStatusFilter]);

  const getOrdersFilterLabel = () => {
    let base = 'Todos los periodos';
    if (ordersFilterMode === 'dia') base = ordersSelectedPeriod ? `Día: ${ordersSelectedPeriod}` : 'Categorizado por Día';
    if (ordersFilterMode === 'mes') base = ordersSelectedPeriod ? `Mes: ${formatMonthLabel(ordersSelectedPeriod)}` : 'Categorizado por Mes';
    if (ordersFilterMode === 'anio') base = ordersSelectedPeriod ? `Año: ${ordersSelectedPeriod}` : 'Categorizado por Año';
    if (ordersStatusFilter !== 'Todos') base += ` (${ordersStatusFilter})`;
    return base;
  };

  // ============================================================================
  // 2. REPORTES DE VENTAS: Categorización por Día, Mes y Año
  // ============================================================================
  const salesBreakdowns = useMemo(() => {
    const validOrders = orders.filter((o) => o.estado !== 'Cancelado');
    const dayMap = {};
    const monthMap = {};
    const yearMap = {};

    validOrders.forEach((o) => {
      const { day, month, year } = extractDateParts(o.creado_en);
      const val = Number(o.total || 0);

      if (!dayMap[day]) dayMap[day] = { periodo: day, label: day, total_pedidos: 0, ingresos: 0 };
      dayMap[day].total_pedidos += 1;
      dayMap[day].ingresos += val;

      if (!monthMap[month]) monthMap[month] = { periodo: month, label: formatMonthLabel(month), total_pedidos: 0, ingresos: 0 };
      monthMap[month].total_pedidos += 1;
      monthMap[month].ingresos += val;

      if (!yearMap[year]) yearMap[year] = { periodo: year, label: `Año ${year}`, total_pedidos: 0, ingresos: 0 };
      yearMap[year].total_pedidos += 1;
      yearMap[year].ingresos += val;
    });

    // Fallback to backend reports if orders list is empty
    if (Object.keys(dayMap).length === 0 && reports) {
      (reports.porDia || []).forEach((d) => {
        const key = typeof d.fecha === 'string' ? d.fecha.slice(0, 10) : extractDateParts(d.fecha).day;
        dayMap[key] = { periodo: key, label: key, total_pedidos: Number(d.total_pedidos || 0), ingresos: Number(d.ingresos || 0) };
      });
      (reports.porMes || []).forEach((m) => {
        const key = m.periodo || `${m.anio}-${String(m.mes).padStart(2, '0')}`;
        monthMap[key] = { periodo: key, label: formatMonthLabel(key), total_pedidos: Number(m.total_pedidos || 0), ingresos: Number(m.ingresos || 0) };
      });
      (reports.porAnio || []).forEach((a) => {
        const key = String(a.anio);
        yearMap[key] = { periodo: key, label: `Año ${key}`, total_pedidos: Number(a.total_pedidos || 0), ingresos: Number(a.ingresos || 0) };
      });
    }

    return {
      dia: Object.values(dayMap).sort((a, b) => b.periodo.localeCompare(a.periodo)),
      mes: Object.values(monthMap).sort((a, b) => b.periodo.localeCompare(a.periodo)),
      anio: Object.values(yearMap).sort((a, b) => b.periodo.localeCompare(a.periodo))
    };
  }, [orders, reports]);

  const currentSalesRows = useMemo(() => {
    const list = salesBreakdowns[salesPeriodMode] || [];
    if (!salesFilterValue) return list;
    return list.filter((r) => r.periodo === salesFilterValue);
  }, [salesBreakdowns, salesPeriodMode, salesFilterValue]);

  // ============================================================================
  // 3. HISTORIAL DE ENTRADAS / SALIDAS: Categorización por Día, Mes y Año
  // ============================================================================
  const movementsCategorized = useMemo(() => {
    const byDay = {};
    const byMonth = {};
    const byYear = {};

    movements.forEach((m) => {
      const { day, month, year } = extractDateParts(m.fecha);
      const cant = Number(m.cantidad || 0);
      const isEntrada = m.tipo === 'entrada';

      if (!byDay[day]) byDay[day] = { period: day, label: day, count: 0, entradas: 0, salidas: 0 };
      byDay[day].count += 1;
      if (isEntrada) byDay[day].entradas += cant;
      else byDay[day].salidas += cant;

      if (!byMonth[month]) byMonth[month] = { period: month, label: formatMonthLabel(month), count: 0, entradas: 0, salidas: 0 };
      byMonth[month].count += 1;
      if (isEntrada) byMonth[month].entradas += cant;
      else byMonth[month].salidas += cant;

      if (!byYear[year]) byYear[year] = { period: year, label: `Año ${year}`, count: 0, entradas: 0, salidas: 0 };
      byYear[year].count += 1;
      if (isEntrada) byYear[year].entradas += cant;
      else byYear[year].salidas += cant;
    });

    return {
      dia: Object.values(byDay).sort((a, b) => b.period.localeCompare(a.period)),
      mes: Object.values(byMonth).sort((a, b) => b.period.localeCompare(a.period)),
      anio: Object.values(byYear).sort((a, b) => b.period.localeCompare(a.period))
    };
  }, [movements]);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (movTypeFilter !== 'Todos' && m.tipo !== movTypeFilter) return false;
      if (movFilterMode === 'todos' || !movSelectedPeriod) return true;
      const { day, month, year } = extractDateParts(m.fecha);
      if (movFilterMode === 'dia') return day === movSelectedPeriod;
      if (movFilterMode === 'mes') return month === movSelectedPeriod;
      if (movFilterMode === 'anio') return year === movSelectedPeriod;
      return true;
    });
  }, [movements, movFilterMode, movSelectedPeriod, movTypeFilter]);

  const getMovementsFilterLabel = () => {
    let base = 'Todos los periodos';
    if (movFilterMode === 'dia') base = movSelectedPeriod ? `Día: ${movSelectedPeriod}` : 'Categorizado por Día';
    if (movFilterMode === 'mes') base = movSelectedPeriod ? `Mes: ${formatMonthLabel(movSelectedPeriod)}` : 'Categorizado por Mes';
    if (movFilterMode === 'anio') base = movSelectedPeriod ? `Año: ${movSelectedPeriod}` : 'Categorizado por Año';
    if (movTypeFilter !== 'Todos') base += ` (${movTypeFilter.toUpperCase()})`;
    return base;
  };

  // ============================================================================
  // HANDLERS DE DESCARGA (PDF & CSV)
  // ============================================================================
  const handleDownloadSingleOrderReceipt = (order) => {
    generateInvoicePDF({
      pedidoId: order.id,
      fecha: order.creado_en,
      cliente: {
        nombre: order.cliente_nombre || 'Cliente F.E.S.',
        telefono: order.telefono || 'No especificado',
        direccion: order.direccion_envio || 'Recogida en planta / Acordado',
        notas: order.notas || ''
      },
      items: (order.detalle || []).map((d) => ({
        nombre: d.nombre_producto || d.nombre,
        medidas: d.medidas || 'Estándar',
        cantidad: Number(d.cantidad),
        precio: Number(d.precio_unitario || d.precio || 0)
      })),
      total: Number(order.total || 0),
      metodoPago: order.metodo_pago || 'Acordado'
    });
    showNotify(`Recibo del Pedido #${order.id} descargado en PDF.`);
  };

  const handleDownloadOrdersPDF = () => {
    exportOrdersReportPDF({
      orders: filteredOrders,
      filterLabel: getOrdersFilterLabel()
    });
    showNotify('Reporte de Gestión de Pedidos descargado en PDF.');
  };

  const handleDownloadOrdersCSV = () => {
    const rows = filteredOrders.map((o) => {
      const { day, month, year } = extractDateParts(o.creado_en);
      return {
        ID_Pedido: o.id,
        Fecha_Hora: new Date(o.creado_en).toLocaleString('es-CO'),
        Dia: day,
        Mes: month,
        Anio: year,
        Cliente: o.cliente_nombre || 'Cliente Obra',
        Telefono: o.telefono || '',
        Direccion_Entrega: o.direccion_envio || '',
        Materiales: (o.detalle || []).map((d) => `${d.cantidad}x ${d.nombre_producto}`).join('; '),
        Total_COP: Number(o.total || 0),
        Estado: o.estado || 'Pendiente'
      };
    });
    exportToCSV(`FES_Gestion_Pedidos_${ordersFilterMode}`, rows);
    showNotify('Registro de pedidos exportado a Excel (CSV).');
  };

  const handleDownloadSalesPDF = () => {
    const modeTitle = salesPeriodMode === 'dia' ? 'Categorizado por Día' : salesPeriodMode === 'mes' ? 'Categorizado por Mes' : 'Categorizado por Año';
    const totalPedidosPeriodo = currentSalesRows.reduce((acc, r) => acc + Number(r.total_pedidos || 0), 0);
    const ingresosPeriodo = currentSalesRows.reduce((acc, r) => acc + Number(r.ingresos || 0), 0);

    exportSalesReportPDF({
      periodMode: salesPeriodMode,
      periodLabel: salesFilterValue ? `${modeTitle} (${salesFilterValue})` : modeTitle,
      summary: {
        ingresos_totales: ingresosPeriodo || reports?.totalGeneral?.ingresos_totales || 0,
        total_pedidos: totalPedidosPeriodo || reports?.totalGeneral?.total_pedidos || 0
      },
      rows: currentSalesRows,
      topProductos: reports?.topProductos || []
    });
    showNotify('Reporte de Ventas descargado en PDF.');
  };

  const handleDownloadSalesCSV = () => {
    const rows = currentSalesRows.map((r) => ({
      Categoria_Temporal: salesPeriodMode.toUpperCase(),
      Periodo: r.label || r.periodo,
      Ordenes_Facturadas: Number(r.total_pedidos || 0),
      Ingresos_Totales_COP: Number(r.ingresos || 0),
      Ticket_Promedio_COP: r.total_pedidos > 0 ? Math.round(r.ingresos / r.total_pedidos) : 0
    }));
    exportToCSV(`FES_Reporte_Ventas_Por_${salesPeriodMode}`, rows);
    showNotify('Reporte de Ventas exportado a Excel (CSV).');
  };

  const handleDownloadMovementsPDF = () => {
    exportInventoryMovementsPDF({
      movements: filteredMovements,
      filterLabel: getMovementsFilterLabel()
    });
    showNotify('Historial de Entradas y Salidas descargado en PDF.');
  };

  const handleDownloadMovementsCSV = () => {
    const rows = filteredMovements.map((m) => {
      const { day, month, year } = extractDateParts(m.fecha);
      return {
        ID_Movimiento: m.id,
        Fecha_Hora: new Date(m.fecha).toLocaleString('es-CO'),
        Dia: day,
        Mes: month,
        Anio: year,
        Tipo_Movimiento: (m.tipo || '').toUpperCase(),
        Material: m.nombre_producto || '',
        Cantidad_Unidades: Number(m.cantidad || 0),
        Nota_Control: m.nota || ''
      };
    });
    exportToCSV(`FES_Historial_Inventario_${movFilterMode}`, rows);
    showNotify('Historial de Entradas/Salidas exportado a Excel (CSV).');
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
                Control de inventario, gestión de pedidos, reportes categorizados (Día/Mes/Año) y descarga de registros
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
          
          {/* ============================================================== */}
          {/* TAB 1: PRODUCTOS                                               */}
          {/* ============================================================== */}
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
              <div className="glass-panel rounded-xl overflow-x-auto border border-slate-800">
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
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white font-semibold transition-colors cursor-pointer"
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
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
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

          {/* ============================================================== */}
          {/* TAB 2: GESTIÓN DE PEDIDOS (CATEGORIZADO DÍA / MES / AÑO)       */}
          {/* ============================================================== */}
          {activeTab === 'pedidos' && (
            <div className="space-y-5">
              {/* Barra de categorización y descarga */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mr-1">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    Ver por:
                  </span>
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'dia', label: 'Por Día' },
                    { id: 'mes', label: 'Por Mes' },
                    { id: 'anio', label: 'Por Año' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setOrdersFilterMode(m.id);
                        setOrdersSelectedPeriod('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        ordersFilterMode === m.id
                          ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}

                  {/* Selector de periodo específico según modo */}
                  {ordersFilterMode !== 'todos' && (
                    <select
                      value={ordersSelectedPeriod}
                      onChange={(e) => setOrdersSelectedPeriod(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs font-semibold text-white rounded-lg px-3 py-1.5 focus:border-orange-500"
                    >
                      <option value="">
                        -- Todos los {ordersFilterMode === 'dia' ? 'días' : ordersFilterMode === 'mes' ? 'meses' : 'años'} --
                      </option>
                      {(ordersCategorized[ordersFilterMode] || []).map((g) => (
                        <option key={g.period} value={g.period}>
                          {g.label} ({g.count} ped. — ${g.total.toLocaleString('es-CO')})
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Filtro de Estado */}
                  <div className="flex items-center gap-1.5 ml-1">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={ordersStatusFilter}
                      onChange={(e) => setOrdersStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:border-orange-500"
                    >
                      <option value="Todos">Todos los estados</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="En preparación">En preparación</option>
                      <option value="En camino">En camino</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* Botones de Descarga */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadOrdersPDF}
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadOrdersCSV}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Exportar Excel (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Tarjetas de resumen categorizadas (cuando se elige Por Día, Por Mes o Por Año) */}
              {ordersFilterMode !== 'todos' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Resumen de Pedidos Agrupados por {ordersFilterMode === 'dia' ? 'Día' : ordersFilterMode === 'mes' ? 'Mes' : 'Año'} (Haz clic en una tarjeta para filtrar)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(ordersCategorized[ordersFilterMode] || []).map((grp) => {
                      const isSelected = ordersSelectedPeriod === grp.period;
                      return (
                        <button
                          key={grp.period}
                          onClick={() => setOrdersSelectedPeriod(isSelected ? '' : grp.period)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-orange-600/20 border-orange-500 shadow-lg'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-white">{grp.label}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-orange-400">
                              {grp.count} {grp.count === 1 ? 'pedido' : 'pedidos'}
                            </span>
                          </div>
                          <div className="mt-2 font-mono font-black text-sm text-emerald-400">
                            ${grp.total.toLocaleString('es-CO')} COP
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>
                  Mostrando <strong className="text-white">{filteredOrders.length}</strong> de <strong className="text-white">{orders.length}</strong> órdenes ({getOrdersFilterLabel()})
                </span>
                <span className="font-mono text-slate-300">
                  Suma en vista: <strong className="text-orange-400">${filteredOrders.reduce((acc, o) => acc + Number(o.total || 0), 0).toLocaleString('es-CO')} COP</strong>
                </span>
              </div>

              <div className="glass-panel rounded-xl overflow-x-auto border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5"># Orden</th>
                      <th className="p-3.5">Cliente / Obra</th>
                      <th className="p-3.5">Fecha (Día / Mes / Año)</th>
                      <th className="p-3.5">Materiales Solicitados</th>
                      <th className="p-3.5">Total (COP)</th>
                      <th className="p-3.5">Estado del Despacho</th>
                      <th className="p-3.5 text-right">Recibo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-500">
                          No hay pedidos registrados para el filtro seleccionado.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const { day, month } = extractDateParts(o.creado_en);
                        return (
                          <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3.5 font-bold text-orange-400 font-mono">#{o.id}</td>
                            <td className="p-3.5">
                              <div className="font-bold text-white">{o.cliente_nombre || 'Cliente Obra'}</div>
                              <div className="text-[11px] text-slate-400">{o.telefono || o.direccion_envio}</div>
                            </td>
                            <td className="p-3.5 text-slate-300">
                              <div className="font-semibold">{new Date(o.creado_en).toLocaleString('es-CO')}</div>
                              <div className="text-[10px] text-slate-500 font-mono">Día: {day} | Mes: {month}</div>
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
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleDownloadSingleOrderReceipt(o)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title="Descargar Recibo PDF de este pedido"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: REPORTES DE VENTAS (CATEGORIZADO DÍA / MES / AÑO)       */}
          {/* ============================================================== */}
          {activeTab === 'reportes' && (
            <div className="space-y-6">
              {/* Barra de categorización Día / Mes / Año y Descarga */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mr-1">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    Categorizar Ventas por:
                  </span>
                  {[
                    { id: 'dia', label: 'Por Día' },
                    { id: 'mes', label: 'Por Mes' },
                    { id: 'anio', label: 'Por Año' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSalesPeriodMode(m.id);
                        setSalesFilterValue('');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        salesPeriodMode === m.id
                          ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}

                  <select
                    value={salesFilterValue}
                    onChange={(e) => setSalesFilterValue(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-xs font-semibold text-white rounded-lg px-3 py-1.5 focus:border-orange-500"
                  >
                    <option value="">
                      -- Ver todos los {salesPeriodMode === 'dia' ? 'días' : salesPeriodMode === 'mes' ? 'meses' : 'años'} --
                    </option>
                    {(salesBreakdowns[salesPeriodMode] || []).map((row) => (
                      <option key={row.periodo} value={row.periodo}>
                        {row.label} (${Number(row.ingresos).toLocaleString('es-CO')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSalesPDF}
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Reporte PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadSalesCSV}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Exportar Excel (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Ingresos Totales Brutos
                  </span>
                  <div className="text-2xl font-black text-orange-400 font-mono mt-1">
                    ${Number(
                      currentSalesRows.reduce((s, r) => s + Number(r.ingresos || 0), 0) ||
                      reports?.totalGeneral?.ingresos_totales ||
                      0
                    ).toLocaleString('es-CO')}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Ventas facturadas en vista</span>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Total Órdenes Concluidas
                  </span>
                  <div className="text-2xl font-black text-white font-mono mt-1">
                    {currentSalesRows.reduce((s, r) => s + Number(r.total_pedidos || 0), 0) ||
                      reports?.totalGeneral?.total_pedidos ||
                      0}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Despachos coordinados</span>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Ticket Promedio
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    ${(() => {
                      const totIng = currentSalesRows.reduce((s, r) => s + Number(r.ingresos || 0), 0);
                      const totPed = currentSalesRows.reduce((s, r) => s + Number(r.total_pedidos || 0), 0);
                      return totPed > 0 ? Math.round(totIng / totPed).toLocaleString('es-CO') : 0;
                    })()}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">COP por orden</span>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Periodos Registrados ({salesPeriodMode === 'dia' ? 'Días' : salesPeriodMode === 'mes' ? 'Meses' : 'Años'})
                  </span>
                  <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                    {currentSalesRows.length}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Con facturación activa</span>
                </div>
              </div>

              {/* Tabla Categorizada por Día / Mes / Año */}
              <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                    Desglose de Ventas Categorizado por {salesPeriodMode === 'dia' ? 'Día (YYYY-MM-DD)' : salesPeriodMode === 'mes' ? 'Mes (YYYY-MM)' : 'Año (YYYY)'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {currentSalesRows.length} {currentSalesRows.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">
                        {salesPeriodMode === 'dia' ? 'Fecha (Día)' : salesPeriodMode === 'mes' ? 'Mes y Año' : 'Año Fiscal'}
                      </th>
                      <th className="p-3.5">Órdenes Facturadas</th>
                      <th className="p-3.5">Ticket Promedio (COP)</th>
                      <th className="p-3.5 text-right">Ingresos Totales (COP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                    {currentSalesRows.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500 font-sans">
                          No hay ventas registradas para este periodo.
                        </td>
                      </tr>
                    ) : (
                      currentSalesRows.map((row) => (
                        <tr key={row.periodo} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3.5 font-bold text-white font-sans flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-orange-400" />
                            <span>{row.label || row.periodo}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 font-bold">
                              {row.total_pedidos} órdenes
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300">
                            ${row.total_pedidos > 0 ? Math.round(row.ingresos / row.total_pedidos).toLocaleString('es-CO') : 0}
                          </td>
                          <td className="p-3.5 text-right font-bold text-emerald-400">
                            ${Number(row.ingresos || 0).toLocaleString('es-CO')} COP
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Top Products */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                  Top Materiales Más Vendidos
                </h3>
                <div className="space-y-2">
                  {(reports?.topProductos || []).map((tp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-orange-600/20 text-orange-400 font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white">{tp.nombre_producto}</span>
                      </div>
                      <div className="font-mono text-slate-300 flex items-center gap-4">
                        <span>
                          <strong className="text-orange-400">{Number(tp.unidades_vendidas).toLocaleString('es-CO')}</strong> unidades
                        </span>
                        {tp.ingresos_generados !== undefined && (
                          <span className="text-emerald-400 font-bold">
                            ${Number(tp.ingresos_generados).toLocaleString('es-CO')} COP
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: HISTORIAL DE ENTRADAS/SALIDAS (DÍA / MES / AÑO)         */}
          {/* ============================================================== */}
          {activeTab === 'movimientos' && (
            <div className="space-y-5">
              {/* Barra de categorización y descarga */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mr-1">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    Categorizar por:
                  </span>
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'dia', label: 'Por Día' },
                    { id: 'mes', label: 'Por Mes' },
                    { id: 'anio', label: 'Por Año' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMovFilterMode(m.id);
                        setMovSelectedPeriod('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        movFilterMode === m.id
                          ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}

                  {movFilterMode !== 'todos' && (
                    <select
                      value={movSelectedPeriod}
                      onChange={(e) => setMovSelectedPeriod(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs font-semibold text-white rounded-lg px-3 py-1.5 focus:border-orange-500"
                    >
                      <option value="">
                        -- Todos los {movFilterMode === 'dia' ? 'días' : movFilterMode === 'mes' ? 'meses' : 'años'} --
                      </option>
                      {(movementsCategorized[movFilterMode] || []).map((g) => (
                        <option key={g.period} value={g.period}>
                          {g.label} (+{g.entradas} / -{g.salidas} unid.)
                        </option>
                      ))}
                    </select>
                  )}

                  <select
                    value={movTypeFilter}
                    onChange={(e) => setMovTypeFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:border-orange-500"
                  >
                    <option value="Todos">Entradas y Salidas</option>
                    <option value="entrada">Solo Entradas (+)</option>
                    <option value="salida">Solo Salidas (-)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadMovementsPDF}
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadMovementsCSV}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Exportar Excel (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Resumen categorizado de movimientos por Día, Mes o Año */}
              {movFilterMode !== 'todos' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Resumen de Entradas y Salidas por {movFilterMode === 'dia' ? 'Día' : movFilterMode === 'mes' ? 'Mes' : 'Año'} (Haz clic para filtrar)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(movementsCategorized[movFilterMode] || []).map((grp) => {
                      const isSelected = movSelectedPeriod === grp.period;
                      return (
                        <button
                          key={grp.period}
                          onClick={() => setMovSelectedPeriod(isSelected ? '' : grp.period)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-orange-600/20 border-orange-500 shadow-lg'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-white">{grp.label}</span>
                            <span className="text-[10px] font-bold text-slate-400">{grp.count} mov.</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs font-mono">
                            <span className="text-emerald-400 font-bold">+{grp.entradas} ent.</span>
                            <span className="text-rose-400 font-bold">-{grp.salidas} sal.</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>
                  Mostrando <strong className="text-white">{filteredMovements.length}</strong> movimientos de inventario ({getMovementsFilterLabel()})
                </span>
              </div>

              <div className="glass-panel rounded-xl overflow-x-auto border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Fecha (Día / Mes / Año)</th>
                      <th className="p-3.5">Tipo</th>
                      <th className="p-3.5">Material</th>
                      <th className="p-3.5">Cantidad</th>
                      <th className="p-3.5">Nota de Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                    {filteredMovements.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500 font-sans">
                          No hay movimientos de inventario registrados para el filtro seleccionado.
                        </td>
                      </tr>
                    ) : (
                      filteredMovements.map((m) => {
                        const { day, month } = extractDateParts(m.fecha);
                        return (
                          <tr key={m.id} className="hover:bg-slate-900/40">
                            <td className="p-3.5 text-slate-300">
                              <div>{new Date(m.fecha).toLocaleString('es-CO')}</div>
                              <div className="text-[10px] text-slate-500">Día: {day} | Mes: {month}</div>
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                                m.tipo === 'entrada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {m.tipo}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-white font-sans">{m.nombre_producto}</td>
                            <td className="p-3.5 font-bold">
                              {m.tipo === 'entrada' ? '+' : '-'}{m.cantidad} unid.
                            </td>
                            <td className="p-3.5 text-slate-400 font-sans">{m.nota}</td>
                          </tr>
                        );
                      })
                    )}
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
