import React from 'react';

// Simplified provider - using native CSS smooth scroll instead of Lenis
// Lenis was causing scrolling issues in nested containers
export const LenisProvider = ({ children }) => {
  return <>{children}</>;
};

export const useLenis = () => null;
