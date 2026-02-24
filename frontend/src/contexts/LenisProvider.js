import React from 'react';

// Lenis smooth scrolling is disabled because the app uses a nested scroll architecture
// (h-screen overflow-hidden layout with per-page scroll containers).
// Lenis targets window by default, which conflicts with this pattern.
// CSS scroll-behavior: smooth is used instead for anchor navigation.
export const LenisProvider = ({ children }) => {
  return <>{children}</>;
};

export const useLenis = () => null;
