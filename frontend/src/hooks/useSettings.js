import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const LS_KEY = 'narvo_settings_cache';

const getLocalSettings = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const setLocalSettings = (settings) => {
  try {
    const existing = getLocalSettings() || {};
    const merged = { ...existing, ...settings };
    localStorage.setItem(LS_KEY, JSON.stringify(merged));
  } catch { /* ignore */ }
};

/**
 * useSettings — Loads from localStorage instantly, syncs with MongoDB in background.
 * @param {Object} defaults - Default settings shape
 * @param {Function} mapFromApi - (apiData) => localShape
 * @param {Function} mapToApi - (localShape) => apiPayload
 * @returns {{ settings, updateSetting, saveAll, loading, saving, hasChanges }}
 */
export const useSettings = (defaults, mapFromApi, mapToApi) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => {
    const cached = getLocalSettings();
    if (cached) {
      return mapFromApi ? mapFromApi(cached) : { ...defaults, ...cached };
    }
    return defaults;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const saveTimerRef = useRef(null);

  // Fetch from MongoDB on mount
  useEffect(() => {
    const userId = user?.id || 'guest';
    fetch(`${API_URL}/api/settings/${userId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setLocalSettings(data);
          const mapped = mapFromApi ? mapFromApi(data) : { ...defaults, ...data };
          setSettings(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [user?.id]);

  // Save to MongoDB (debounced)
  const saveToServer = useCallback(async (settingsToSave) => {
    const userId = user?.id || 'guest';
    const payload = mapToApi ? mapToApi(settingsToSave) : settingsToSave;
    setLocalSettings(payload);
    try {
      const res = await fetch(`${API_URL}/api/settings/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [user?.id, mapToApi]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      setHasChanges(true);
      // Auto-save with debounce
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        setSaving(true);
        const ok = await saveToServer(next);
        if (ok) setHasChanges(false);
        setSaving(false);
      }, 800);
      return next;
    });
  }, [saveToServer]);

  const saveAll = useCallback(async () => {
    setSaving(true);
    const ok = await saveToServer(settings);
    if (ok) setHasChanges(false);
    setSaving(false);
    return ok;
  }, [settings, saveToServer]);

  // Cleanup
  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  return { settings, setSettings, updateSetting, saveAll, loading, saving, hasChanges, setHasChanges };
};
