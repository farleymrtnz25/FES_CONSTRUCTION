import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('fes_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('fes_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    const quantity = Math.max(1, Number(qty) || 1);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          nombre: product.nombre,
          precio: Number(product.precio),
          imagen: product.imagen,
          medidas: product.medidas || 'Estándar',
          categoria: product.categoria,
          cantidad: quantity
        }
      ];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, quantity) => {
    const q = Number(quantity);
    if (q <= 0) {
      removeFromCart(id);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, cantidad: q } : item))
      );
    }
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Función especial para agregar cálculo completo de la IA directamente
  const addAIQuotationToCart = (items) => {
    if (!items || !Array.isArray(items)) return;
    setCart((prev) => {
      let updated = [...prev];
      for (const item of items) {
        const existingIdx = updated.findIndex((i) => i.id === item.id || i.nombre === item.nombre);
        if (existingIdx >= 0) {
          updated[existingIdx].cantidad += Number(item.cantidad);
        } else {
          updated.push({
            id: item.id || Math.floor(Math.random() * 9000) + 1000,
            nombre: item.nombre,
            precio: Number(item.precio_unitario || item.precio || 0),
            cantidad: Number(item.cantidad),
            medidas: 'Según cálculo IA',
            categoria: 'Cotización IA',
            imagen: item.imagen || '/logo.png'
          });
        }
      }
      return updated;
    });
    setIsCartOpen(true);
  };

  const cartCount = cart.reduce((total, item) => total + item.cantidad, 0);
  const cartTotal = cart.reduce((total, item) => total + item.cantidad * item.precio, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        addAIQuotationToCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
