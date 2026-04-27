import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false); // ← default false, hindari SSR issue

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    
    check(); // cek langsung saat mount
    
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}