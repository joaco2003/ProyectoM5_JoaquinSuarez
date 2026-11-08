import { useEffect, useState } from 'react';

// Recibe un valor que cambia seguido y devuelve una copia que se actualiza con retraso
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);   // Valor "retrasado"
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay); // Espera "delay" ms y recién ahí lo actualiza
    return () => clearTimeout(t);                           // Si el valor cambia antes, cancela la espera anterior
  }, [value, delay]);
  return debounced;
}