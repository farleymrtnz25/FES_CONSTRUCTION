const isCapacitor = typeof window !== 'undefined' && (window.location.protocol === 'capacitor:' || window.location.hostname === 'localhost' && !import.meta.env.DEV);

export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  isCapacitor
    ? 'https://fes-construccion.onrender.com'
    : (import.meta.env.DEV ? 'http://localhost:5000' : '')
);


