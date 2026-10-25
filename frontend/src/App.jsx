import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomeTab } from './components/HomeTab';
import { ProductsPage } from './components/ProductsPage';
import { AICivilQuoter } from './components/AICivilQuoter';
import { PlantTab } from './components/PlantTab';
import { GoogleBusinessCard } from './components/GoogleBusinessCard';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { CookieBanner } from './components/CookieBanner';
import { LegalModals } from './components/LegalModals';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { NotFoundPage } from './components/NotFoundPage';

const VALID_TABS = ['home', 'catalogo', 'cotizador', 'planta', 'resenas', 'contacto'];

function MainApp() {
  const { isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('Todos');
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  
  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState({ open: false, type: null });
  const [is404, setIs404] = useState(false);

  // Sync tab with URL hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') {
        setIs404(false);
        if (isAdmin) {
          setAdminModalOpen(true);
        } else {
          setAuthModalOpen(true);
        }
      } else if (hash === 'perfil' || hash === 'recibos') {
        setIs404(false);
        setProfileModalOpen(true);
      } else if (hash === 'finalizar' || hash === 'checkout') {
        setIs404(false);
        setCheckoutModalOpen(true);
      } else if (hash === '404') {
        setIs404(true);
      } else if (VALID_TABS.includes(hash)) {
        setIs404(false);
        setCurrentTab(hash);
      } else if (!hash) {
        setIs404(false);
        setCurrentTab('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isAdmin]);

  const handleSelectTab = (tabId) => {
    if (tabId === 'admin') {
      if (isAdmin) {
        setAdminModalOpen(true);
      } else {
        setAuthModalOpen(true);
      }
      return;
    }
    if (tabId === 'perfil') {
      setProfileModalOpen(true);
      return;
    }
    if (tabId === 'checkout') {
      setCheckoutModalOpen(true);
      return;
    }
    setIs404(false);
    setCurrentTab(tabId);
    window.location.hash = tabId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskAIAboutProduct = (product) => {
    setAiInitialQuery(
      `Quiero calcular cantidades y presupuesto para ${product.nombre} (Medidas: ${product.medidas}, Precio: $${product.precio} COP). ¿Cuántas unidades necesito para 100 metros cuadrados y en cuánto sale en total?`
    );
    handleSelectTab('cotizador');
  };

  if (is404) {
    return (
      <div className="fes-app-shell">
        <Navbar 
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenAdmin={() => setAdminModalOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
          onOpenCheckout={() => setCheckoutModalOpen(true)}
        />
        <main className="fes-main-content fes-container">
          <NotFoundPage onGoHome={() => handleSelectTab('home')} />
        </main>
        <Footer 
          onOpenLegal={(type) => setLegalModal({ open: true, type })} 
          onNavigate={handleSelectTab}
        />
      </div>
    );
  }

  return (
    <div className="fes-app-shell">
      
      {/* 1. Encabezado y Barra de Pestañas Independientes */}
      <Navbar 
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'catalogo') {
            setSelectedCatalogCategory('Todos');
          }
          handleSelectTab(tab);
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenCheckout={() => setCheckoutModalOpen(true)}
      />

      {/* 2. Área Principal de la Pestaña Activa */}
      <main className="fes-main-content">
        <div className="fes-container">
          {currentTab === 'home' && (
            <HomeTab 
              onNavigate={handleSelectTab} 
              onSelectCategory={(cat) => setSelectedCatalogCategory(cat)}
            />
          )}

          {currentTab === 'catalogo' && (
            <ProductsPage 
              onAskAIAboutProduct={handleAskAIAboutProduct} 
              initialCategory={selectedCatalogCategory}
            />
          )}

          {currentTab === 'cotizador' && (
            <AICivilQuoter initialQuery={aiInitialQuery} />
          )}

          {currentTab === 'planta' && (
            <PlantTab onNavigate={handleSelectTab} />
          )}

          {currentTab === 'resenas' && (
            <GoogleBusinessCard />
          )}

          {currentTab === 'contacto' && (
            <ContactSection />
          )}
        </div>
      </main>

      {/* 3. Pie de Página */}
      <Footer 
        onOpenLegal={(type) => setLegalModal({ open: true, type })} 
        onNavigate={handleSelectTab}
      />

      {/* 4. Panel Lateral de Carrito y Modales */}
      <CartSidebar onOpenCheckout={() => setCheckoutModalOpen(true)} />
      
      <CheckoutModal 
        isOpen={checkoutModalOpen} 
        onClose={() => setCheckoutModalOpen(false)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCheckout={() => setCheckoutModalOpen(true)}
      />

      <AdminDashboard 
        isOpen={adminModalOpen} 
        onClose={() => setAdminModalOpen(false)} 
      />

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />

      <LegalModals 
        type={legalModal.type} 
        isOpen={legalModal.open} 
        onClose={() => setLegalModal({ open: false, type: null })} 
      />

      <CookieBanner onOpenPrivacy={() => setLegalModal({ open: true, type: 'privacidad' })} />

      {/* 5. Botón Flotante de WhatsApp */}
      <FloatingWhatsApp />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
