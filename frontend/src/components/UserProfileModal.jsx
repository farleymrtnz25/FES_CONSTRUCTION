import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  ShoppingBag,
  ShieldCheck,
  Calendar,
  Search,
  LogOut,
  CheckCircle2,
  Save,
  LogIn
} from 'lucide-react';

export const UserProfileModal = ({ isOpen, onClose, onOpenAuth, onOpenCheckout }) => {
  const { user, token, isAdmin, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('recibos'); // 'recibos' | 'perfil'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedMsg, setSavedMsg] = useState(null);

  const [profileData, setProfileData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    ciudad: 'Vereda Patio Bonito / Sabana'
  });

  useEffect(() => {
    if (isOpen) {
      loadProfileAndOrders();
    }
  }, [isOpen, user, token]);

  const loadProfileAndOrders = async () => {
    setLoading(true);
    try {
      const savedExtra = JSON.parse(localStorage.getItem('fes_profile_extra') || '{}');
      setProfileData({
        nombre: user?.nombre || savedExtra.nombre || '',
        telefono: savedExtra.telefono || '',
        direccion: savedExtra.direccion || '',
        ciudad: savedExtra.ciudad || 'Vereda Patio Bonito / Sabana'
      });

      const localOrders = JSON.parse(localStorage.getItem('fes_mis_pedidos_locales') || '[]');
      let serverOrders = [];

      if (token) {
        try {
          const res = await fetch('/api/pedidos/mis-pedidos', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              serverOrders = data;
            }
          }
        } catch (err) {
          console.warn('Error consultando pedidos del servidor:', err);
        }
      }

      // Unificar pedidos del servidor y locales sin duplicar IDs
      const mapById = new Map();
      for (const o of serverOrders) {
        mapById.set(String(o.id), o);
      }
      for (const lo of localOrders) {
        const key = String(lo.id);
        if (!mapById.has(key)) {
          mapById.set(key, lo);
        }
      }

      const combined = Array.from(mapById.values()).sort(
        (a, b) => new Date(b.creado_en || 0) - new Date(a.creado_en || 0)
      );
      setOrders(combined);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('fes_profile_extra', JSON.stringify(profileData));
    setSavedMsg('Datos de perfil y despacho guardados correctamente');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const handleDownloadOrderReceipt = (order) => {
    const items = (order.detalle || order.productos || []).map((d) => ({
      nombre: d.nombre_producto || d.nombre || 'Material de Construcción',
      medidas: d.medidas || 'Estándar',
      cantidad: Number(d.cantidad) || 1,
      precio: Number(d.precio_unitario ?? d.precio ?? 0),
      subtotal: Number(d.subtotal ?? (Number(d.cantidad) || 1) * Number(d.precio_unitario ?? d.precio ?? 0))
    }));

    generateInvoicePDF({
      pedidoId: order.id,
      cliente: {
        nombre: order.cliente_nombre || profileData.nombre || user?.nombre || 'Cliente F.E.S.',
        telefono: order.telefono || profileData.telefono || 'No especificado',
        direccion: order.direccion_envio || profileData.direccion || 'Despacho en Obra / Planta',
        ciudad: order.ciudad || profileData.ciudad || 'Cundinamarca'
      },
      productos: items,
      total: Number(order.total || 0),
      metodoPago: order.metodo_pago || 'WhatsApp / Contraentrega',
      estado: order.estado || 'Pendiente',
      fecha: order.creado_en
    });
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const idMatch = String(o.id).toLowerCase().includes(q);
    const dateMatch = o.creado_en && new Date(o.creado_en).toLocaleDateString('es-CO').includes(q);
    const itemMatch = (o.detalle || []).some(
      (d) => (d.nombre_producto || '').toLowerCase().includes(q)
    );
    return idMatch || dateMatch || itemMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
      />

      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl z-10 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-600/20 border border-orange-500/40 text-orange-400 flex items-center justify-center font-heading font-black text-lg">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-white">
                {user ? `Perfil de ${user.nombre}` : 'Mi Perfil y Mis Recibos de Compra'}
              </h3>
              <p className="text-xs text-slate-400">
                {user ? user.email : 'Consulta tus datos de obra y descarga tus recibos de compra en PDF'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside Profile */}
        <div className="flex border-b border-slate-800 bg-slate-900/70 px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('recibos')}
            className={`py-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeSection === 'recibos'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Mis Compras y Recibos PDF ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('perfil')}
            className={`py-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeSection === 'perfil'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Datos de la Persona y Obra</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {savedMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{savedMsg}</span>
            </div>
          )}

          {/* SECCIÓN 1: MIS COMPRAS Y DESCARGA DE RECIBOS */}
          {activeSection === 'recibos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-orange-400">
                    Respaldo de Recibos y Facturas de Compra
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Si perdiste el archivo PDF de tu pedido, descárgalo nuevamente aquí en 1 clic.
                  </p>
                </div>

                {/* Buscador de recibos */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por # orden o material..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Cargando historial de recibos...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800 p-6">
                  <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto" />
                  <h4 className="font-heading font-bold text-white text-sm">
                    Aún no tienes recibos de compra registrados
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Cuando realices un pedido en <strong>Finalizar Pedido de Materiales</strong>, tu recibo se descargará automáticamente y quedará guardado aquí por si lo necesitas volver a descargar.
                  </p>
                  {!user && onOpenAuth && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Iniciar Sesión para sincronizar mi cuenta</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((o) => {
                    const items = o.detalle || o.productos || [];
                    return (
                      <div
                        key={o.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-lg bg-orange-600/20 text-orange-400 font-mono font-extrabold text-xs">
                              Orden #{o.id}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {o.creado_en ? new Date(o.creado_en).toLocaleString('es-CO') : 'Reciente'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                o.estado === 'Entregado'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : o.estado === 'Cancelado'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {o.estado || 'Pendiente'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleDownloadOrderReceipt(o)}
                              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                              title="Descargar recibo PDF de esta compra"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Descargar Recibo PDF</span>
                            </button>
                          </div>
                        </div>

                        {/* Materiales de la orden */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                          <div className="md:col-span-8 space-y-1">
                            <span className="text-[11px] font-bold uppercase text-slate-400 block">
                              Materiales incluidos:
                            </span>
                            {items.length > 0 ? (
                              items.map((det, idx) => (
                                <div key={idx} className="text-slate-300 flex items-center gap-1.5">
                                  <span className="text-orange-400 font-mono font-bold">
                                    {det.cantidad}x
                                  </span>
                                  <span>{det.nombre_producto || det.nombre}</span>
                                  <span className="text-slate-500 font-mono">
                                    (${Number(det.precio_unitario ?? det.precio ?? 0).toLocaleString('es-CO')} c/u)
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-400">Orden registrada en sistema</span>
                            )}
                          </div>

                          <div className="md:col-span-4 md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                            <span className="text-[11px] text-slate-400 block">Total Pagado / Liquidado:</span>
                            <span className="font-mono font-black text-base text-orange-400">
                              ${Number(o.total || 0).toLocaleString('es-CO')} COP
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {o.metodo_pago || 'WhatsApp / Contraentrega'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 2: DATOS DEL PERFIL DE LA PERSONA */}
          {activeSection === 'perfil' && (
            <div className="space-y-5">
              {/* Tarjeta de estado de cuenta */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {user ? user.nombre : profileData.nombre || 'Usuario Invitado'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      {isAdmin ? 'Administrador' : user ? 'Cliente Registrado' : 'Modo Local'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-400" />
                    <span>{user ? user.email : 'Sin sesión iniciada (datos guardados en este dispositivo)'}</span>
                  </p>
                </div>

                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                ) : (
                  onOpenAuth && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Iniciar Sesión / Crear Cuenta</span>
                    </button>
                  )
                )}
              </div>

              {/* Formulario de datos predeterminados de la persona */}
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <h4 className="font-heading font-bold text-white text-sm">
                  Información Personal y Dirección de Obra Predeterminada
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nombre Completo o Razón Social
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={profileData.nombre}
                        onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                        placeholder="Tu nombre o empresa"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Teléfono / WhatsApp de Contacto
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={profileData.telefono}
                        onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                        placeholder="Ej: 3208216369"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Dirección Principal de Entrega / Obra
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={profileData.direccion}
                        onChange={(e) => setProfileData({ ...profileData, direccion: e.target.value })}
                        placeholder="Vereda, Calle, Lote o Proyecto"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Municipio / Ciudad
                    </label>
                    <input
                      type="text"
                      value={profileData.ciudad}
                      onChange={(e) => setProfileData({ ...profileData, ciudad: e.target.value })}
                      placeholder="Nemocón, Zipaquirá, Chía, Bogotá..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    Estos datos agilizan tus futuros pedidos y recibos.
                  </span>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Mis Datos</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Total de compras registradas: <strong className="text-white">{orders.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            {onOpenCheckout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="px-3.5 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/30 font-bold text-xs cursor-pointer transition-colors"
              >
                Finalizar Pedido Actual
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
