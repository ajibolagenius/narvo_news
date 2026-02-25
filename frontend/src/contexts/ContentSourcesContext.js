// Content Sources Context - Manages source data across the app
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ContentSourcesContext = createContext({});

export const useContentSources = () => useContext(ContentSourcesContext);

export const ContentSourcesProvider = ({ children }) => {
  const [sources, setSources] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch content sources on mount
  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/sources`);
      if (response.ok) {
        const data = await response.json();
        setSources(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch sources');
      }
    } catch (err) {
      console.error('[ContentSources] Error:', err);
      setError(err.message);
      setSources({
        total_sources: 23,
        local_sources: 17,
        international_sources: 6,
        categories: {},
        sources: [],
        broadcast_sources: [],
        verification_apis: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/api/sources/health`);
      if (r.ok) setHealth(await r.json());
    } catch (err) {
      console.error('[ContentSources] Health fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchSources();
    fetchHealth();
  }, [fetchSources, fetchHealth]);

  // Helper getters
  const getTotalSources = useCallback(() => sources?.total_sources || 0, [sources]);
  const getLocalSources = useCallback(() => sources?.local_sources || 0, [sources]);
  const getInternationalSources = useCallback(() => sources?.international_sources || 0, [sources]);
  const getContinentalSources = useCallback(() => sources?.continental_sources || 0, [sources]);
  const getBroadcastSources = useCallback(() => sources?.broadcast_sources || [], [sources]);
  const getVerificationAPIs = useCallback(() => sources?.verification_apis || [], [sources]);
  const getCategories = useCallback(() => sources?.categories || {}, [sources]);
  const getSourcesByCategory = useCallback((category) => {
    return (sources?.sources || []).filter(s => s.category === category);
  }, [sources]);
  const getSourcesByRegion = useCallback((region) => {
    return (sources?.sources || []).filter(s => s.region === region);
  }, [sources]);

  const getHealthForSource = useCallback((name) => {
    if (!health?.sources) return null;
    return health.sources.find(s => s.name === name) || null;
  }, [health]);

  const getHealthSummary = useCallback(() => health, [health]);

  return (
    <ContentSourcesContext.Provider value={{
      sources,
      health,
      loading,
      error,
      refreshSources: fetchSources,
      refreshHealth: fetchHealth,
      getTotalSources,
      getLocalSources,
      getInternationalSources,
      getContinentalSources,
      getBroadcastSources,
      getVerificationAPIs,
      getCategories,
      getSourcesByCategory,
      getSourcesByRegion,
      getHealthForSource,
      getHealthSummary,
    }}>
      {children}
    </ContentSourcesContext.Provider>
  );
};

export default ContentSourcesContext;
