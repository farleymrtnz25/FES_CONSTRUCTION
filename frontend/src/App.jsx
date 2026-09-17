import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductsPage from './components/ProductsPage';
import CartSidebar from './components/CartSidebar';
import CheckoutPage from './components/CheckoutPage';
import AuthPage from './components/AuthPage';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import LegalPage from './components/LegalPage';
import MobileBottomNav from './components/MobileBottomNav';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { isMobileApp } from './config';

export default function App() {
  const { user, isAdmin } = useAuth();
  const { setIsOpen: setMenuOpen } = useCart();
  const [activeSection, setActiveSection] = useState('inicio');

  // Scroll to top on section change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio': return <HeroSection onNavigate={setActiveSection} />;
      case 'productos': return <ProductsPage />;
      case 'nosotros': return <AboutPage />;
      case 'contacto': return <ContactPage />;
      case 'auth': return <AuthPage onSuccess={() => setActiveSection('inicio')} />;
      case 'perfil': return <UserProfile />;
      case 'checkout': return <CheckoutPage onBack={() => setActiveSection('productos')} onOrderComplete={() => setActiveSection('perfil')} />;
      case 'admin': return isAdmin ? <AdminDashboard /> : <HeroSection onNavigate={setActiveSection} />;
      case 'legal_privacidad': return <LegalPage policyId="privacidad" onBack={() => setActiveSection('inicio')} />;
      case 'legal_terminos': return <LegalPage policyId="terminos" onBack={() => setActiveSection('inicio')} />;
      case 'legal_garantia': return <LegalPage policyId="garantia" onBack={() => setActiveSection('inicio')} />;
      case 'legal_sic': return <LegalPage policyId="sic" onBack={() => setActiveSection('inicio')} />;
      default: return <HeroSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className={`app-root${isMobileApp ? ' mobile-app' : ''}`}>
      {/* En mobile app: navbar simplificado; en web: navbar completo */}
      {isMobileApp ? (
        <header className="mobile-top-bar">
          <span className="mobile-top-bar-title">F.E.S. Construcción</span>
        </header>
      ) : (
        <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      )}

      <main id="main-content" className={isMobileApp ? 'mobile-main' : ''}>
        {renderContent()}
      </main>

      <CartSidebar onCheckout={() => setActiveSection('checkout')} />

      {/* En mobile app: bottom nav en lugar de footer */}
      {isMobileApp ? (
        <MobileBottomNav activeSection={activeSection} setActiveSection={setActiveSection} />
      ) : (
        <Footer onNavigate={setActiveSection} />
      )}

      {/* Toast Container Placeholder */}
      <div className="toast-container" id="toast-root" />
    </div>
  );
}