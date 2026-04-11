import React, { useState, useEffect } from 'react';
import AppDesktop from './Appdesktop'; // Matches your Appdesktop.jsx filename
import AppMobile from './Appmobile';   // Matches your Appmobile.jsx filename

export default function Switchboard() {
  // Check for screen width - 768px is the industry standard for mobile/tablet flip
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Listen for orientation changes or window resizing
    window.addEventListener('resize', handleResize);
    
    // Cleanup the listener when the component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // serve the correct terminal based on device detection
  return isMobile ? <AppMobile /> : <AppDesktop />;
}