// AOSWrapper.jsx
'use client';
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Make sure this is also accessible via global import in your main layout/entry file

const AOSWrapper = ({ children }) => {
  useEffect(() => {
    AOS.init({
      // Global settings for AOS (optional)
      duration: 1000, // values from 0 to 3000, with step 50ms
      once: true, // whether animation should happen only once - on load
      mirror: false, // whether elements should animate out while scrolling past them
      easing: 'ease-in-out', // default easing for AOS animations
    });
  }, []);

  return <>{children}</>;
};

export default AOSWrapper;