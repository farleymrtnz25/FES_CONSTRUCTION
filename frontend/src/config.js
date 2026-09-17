export const isCapacitor = typeof window !== 'undefined' && (
  Boolean(window.Capacitor?.isNativePlatform?.()) ||
  window.location.protocol === 'capacitor:' ||
  (window.location.hostname === 'localhost' && window.location.port === '' && !import.meta.env.DEV)
);

const urlParams = typeof window !== 'undefined' && window.location ? new URLSearchParams(window.location.search) : null;
export const isMobileApp = isCapacitor || urlParams?.get('app') === 'true';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  isCapacitor
    ? 'https://fes-construccion.onrender.com'
    : (import.meta.env.DEV ? 'http://localhost:5000' : '')
);


