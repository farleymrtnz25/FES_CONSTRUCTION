import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import { 
  ShoppingCart, 
  Sparkles, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X, 
  Home,
  Layers,
  Building2,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Mail,
  Phone,
  FileText,
  CheckCircle2
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'catalogo', label: 'Catálogo (23)', icon: Layers },
  { id: 'cotizador', label: 'Cotizador IA', icon: Sparkles, isAI: true },
  { id: 'planta', label: 'Nuestra Planta', icon: Building2 },
  { id: 'resenas', label: 'Ficha Google & Reseñas', icon: MapPin },
  { id: 'contacto', label: 'Contacto y Despachos', icon: PhoneCall },
];

export const Navbar = ({ currentTab, onSelectTab, onOpenAuth, onOpenAdmin, onOpenProfile, onOpenCheckout }) => {
  const { cartCount, cartTotal, setIsCartOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tabId) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fes-header">
      {/* 1. Barra Institucional Superior */}
      <div className="fes-topbar">
        <div className="fes-container flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              Fábrica Directa • Norma NSR-10
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Ladrillera San Luis — Vereda Patio Bonito
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="tel:+573208216369" className="hover:text-white inline-flex items-center gap-1 text-slate-300 font-medium">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              +57 320 821 6369
            </a>
            <a href="mailto:frlmrtnz@gmail.com" className="hidden sm:inline-flex items-center gap-1 hover:text-white text-slate-300 font-medium">
              <Mail className="w-3.5 h-3.5 text-orange-400" />
              frlmrtnz@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* 2. Encabezado Principal */}
      <div className="fes-container fes-header-main">
        {/* Marca y Logo */}
        <button 
          onClick={() => handleTabClick('home')} 
          className="flex items-center gap-3.5 text-left cursor-pointer group bg-transparent border-0"
        >
          <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0 overflow-hidden border-2 border-orange-500">
            <img 
              src={logoImg} 
              alt="Logo FES Construcción" 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">
                F.E.S. CONSTRUCCIÓN
              </span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/40">
                Ingeniería IA
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Materiales Estructurales de Arcilla Cocida y Agregados
            </p>
          </div>
        </button>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Botón Carrito con Total */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir carrito de compras"
            className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-all cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-orange-400" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white font-extrabold text-[11px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Tu Carrito</span>
              <span className="text-xs font-mono font-extrabold text-white">
                ${cartTotal.toLocaleString('es-CO')}
              </span>
            </div>
          </button>

          {/* Botón Directo: Finalizar Pedido de Materiales */}
          <button
            onClick={onOpenCheckout}
            title="Finalizar Pedido de Materiales y Descargar Recibo PDF"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalizar Pedido</span>
          </button>

          {/* Botón Directo: Mi Perfil y Recibos PDF */}
          <button
            onClick={onOpenProfile}
            title="Ver Mi Perfil y Descargar Recibos de Compra"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline truncate max-w-[120px]">
              {user ? `Perfil (${user.nombre.split(' ')[0]})` : 'Perfil y Recibos'}
            </span>
          </button>

          {/* Usuario / Admin */}
          {user ? (
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  }`}
                  title="Abrir Panel de Administración"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden lg:inline">Panel Admin</span>
                </button>
              )}
              <button
                onClick={logout}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-orange-400" />
              <span>Ingresar</span>
            </button>
          )}

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Barra de Pestañas Independientes (Desktop & Tablet) */}
      <div className="fes-tabbar-wrapper">
        <div className="fes-container">
          <nav className="fes-tabbar" aria-label="Pestañas principales del sitio">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`fes-tab-btn ${active ? 'active' : ''} ${item.isAI ? 'ai-tab' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={onOpenCheckout}
              className="fes-tab-btn text-orange-300 hover:text-white"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-orange-400" />
              <span>Finalizar Pedido</span>
            </button>
            <button
              onClick={onOpenProfile}
              className="fes-tab-btn text-slate-200 hover:text-white"
            >
              <FileText className="w-4 h-4 shrink-0 text-orange-400" />
              <span>Mi Perfil y Recibos</span>
            </button>
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className={`fes-tab-btn ${currentTab === 'admin' ? 'active' : ''}`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Administración</span>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b-2 border-orange-500 px-6 py-5 space-y-3 shadow-2xl">
          <div className="grid grid-cols-1 gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                    active ? 'bg-orange-600 text-white' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => {
                onOpenCheckout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 bg-orange-600/20 text-orange-300 border border-orange-500/40"
            >
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <span>Finalizar Pedido de Materiales</span>
            </button>

            <button
              onClick={() => {
                onOpenProfile();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 bg-slate-800 text-slate-200 border border-slate-700"
            >
              <FileText className="w-4 h-4 text-orange-400" />
              <span>Mi Perfil y Descargar Recibos PDF</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <span>Panel de Administración Central</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
