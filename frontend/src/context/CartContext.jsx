import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const addItem = useCallback((product) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            return existing
                ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { ...product, quantity: 1 }];
        });
        setIsOpen(true);
    }, []);

    const removeItem = useCallback((id) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const updateQty = useCallback((id, qty) => {
        if (qty < 1) { removeItem(id); return; }
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }, [removeItem]);

    const clearCart = useCallback(() => setItems([]), []);

    const totals = React.useMemo(() => {
        // Ladrillos, bloques y materiales de construcción están EXCLUIDOS de IVA
        // según el Art. 424 del Estatuto Tributario colombiano. No aplica ICA al cliente.
        const subtotal = items.reduce((s, i) => s + i.precio * i.quantity, 0);
        const total = subtotal;
        const count = items.reduce((s, i) => s + i.quantity, 0);
        return { subtotal, total, count };
    }, [items]);

    return (
        <CartContext.Provider value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart, totals }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
