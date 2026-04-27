import { useState, useEffect } from 'react';

/**
 * Animasi angka dari 0 ke `target` dalam `duration` ms.
 * Berguna untuk menampilkan saldo dengan efek counting.
 */
export function useCounter(target, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let current = 0;
    const step  = target / (duration / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return value;
}

/**
 * Mengembalikan `true` setelah `delay` ms.
 * Berguna untuk animasi fade-in bertahap (stagger).
 */
export function useAnimateIn(delay = 0) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return visible;
}
