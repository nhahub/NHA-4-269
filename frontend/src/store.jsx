import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { RATES } from './data/wanderly.js';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

function symbolFor(code) {
  return (RATES[code] || RATES.USD).s;
}

export function AppProvider({ children }) {
  const [curr, setCurr] = useState('EGP');
  const [toast, setToast] = useState('');
  const timer = useRef(null);

  // Convert a USD base amount to the active currency (used by static pages).
  const conv = useCallback(
    (usd) => {
      const c = RATES[curr] || RATES.USD;
      return c.s + Math.round(usd * c.r).toLocaleString('en-US');
    },
    [curr]
  );

  // Format an amount already in a given currency (used for live gateway prices).
  const fmt = useCallback(
    (amount, code = curr) => symbolFor(code) + Math.round(Number(amount)).toLocaleString('en-US'),
    [curr]
  );

  const flash = useCallback((msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  return (
    <AppCtx.Provider value={{ curr, setCurr, conv, fmt, toast, flash }}>
      {children}
    </AppCtx.Provider>
  );
}
