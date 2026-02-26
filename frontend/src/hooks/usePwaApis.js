/**
 * PWA Web API Hooks for Narvo
 * Implements: Wake Lock, Network Info, Badging API, Vibration, Visibility
 */
import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Wake Lock API ─────────────────────────────────────
// Keeps screen awake during audio playback
export function useWakeLock() {
  const wakeLockRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsActive(true);
      wakeLockRef.current.addEventListener('release', () => setIsActive(false));
    } catch (e) {
      // Wake lock request denied (e.g., low battery)
    }
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  // Re-acquire on visibility change (screen back on)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        request();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [isActive, request]);

  return { request, release, isActive };
}

// ─── Network Information API ───────────────────────────
// Detects connection quality for adaptive behavior
export function useNetworkInfo() {
  const [info, setInfo] = useState(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return { online: navigator.onLine, effectiveType: '4g', downlink: 10, saveData: false };
    return {
      online: navigator.onLine,
      effectiveType: conn.effectiveType || '4g',
      downlink: conn.downlink || 10,
      saveData: conn.saveData || false,
    };
  });

  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const updateInfo = () => {
      setInfo({
        online: navigator.onLine,
        effectiveType: conn?.effectiveType || '4g',
        downlink: conn?.downlink || 10,
        saveData: conn?.saveData || false,
      });
    };

    window.addEventListener('online', updateInfo);
    window.addEventListener('offline', updateInfo);
    conn?.addEventListener('change', updateInfo);

    return () => {
      window.removeEventListener('online', updateInfo);
      window.removeEventListener('offline', updateInfo);
      conn?.removeEventListener('change', updateInfo);
    };
  }, []);

  // Helper: should we use reduced quality?
  const isSlowConnection = info.effectiveType === '2g' || info.effectiveType === 'slow-2g' || info.saveData;
  const isMediumConnection = info.effectiveType === '3g';

  return { ...info, isSlowConnection, isMediumConnection };
}

// ─── App Badging API ───────────────────────────────────
// Shows unread count on PWA icon
export function useAppBadge() {
  const setBadge = useCallback((count) => {
    if ('setAppBadge' in navigator) {
      if (count > 0) navigator.setAppBadge(count).catch(() => {});
      else navigator.clearAppBadge().catch(() => {});
    }
  }, []);

  const clearBadge = useCallback(() => {
    if ('clearAppBadge' in navigator) navigator.clearAppBadge().catch(() => {});
  }, []);

  return { setBadge, clearBadge };
}

// ─── Visibility API ────────────────────────────────────
// Track when user leaves/returns to the app
export function useVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handler = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return isVisible;
}

// ─── Install Prompt ────────────────────────────────────
// Captures the beforeinstallprompt event for custom install UI
export function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    const installed = () => setIsInstalled(true);

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const install = useCallback(async () => {
    if (!prompt) return false;
    prompt.prompt();
    const result = await prompt.userChoice;
    setPrompt(null);
    return result.outcome === 'accepted';
  }, [prompt]);

  return { canInstall: !!prompt && !isInstalled, isInstalled, install };
}
