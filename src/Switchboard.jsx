import React, { useState, useEffect } from 'react';
import AppDesktop from './AppDesktop';
import AppMobile from './AppMobile';

export default function Switchboard() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <AppMobile /> : <AppDesktop />;
}