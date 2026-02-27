import { useEffect, useRef } from 'react';
import * as api from '../lib/api';

const prefetchedIds = new Set();

/**
 * useAudioPrefetch — Prefetches TTS audio for news articles in idle time.
 * Caches results in memory and triggers server-side caching.
 * @param {Array} articles - Array of { id, title, summary }
 * @param {string} voiceId - Voice model ID
 * @param {number} limit - Max articles to prefetch (default 3)
 */
export const useAudioPrefetch = (articles = [], voiceId = 'nova', limit = 3) => {
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!articles.length) return;

    const toPrefetch = articles.filter(a => !prefetchedIds.has(a.id)).slice(0, limit);
    if (!toPrefetch.length) return;

    const controller = new AbortController();
    controllerRef.current = controller;

    const prefetch = async () => {
      for (const article of toPrefetch) {
        if (controller.signal.aborted) break;
        try {
          // Use requestIdleCallback if available, else setTimeout
          await new Promise(resolve => {
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(resolve, { timeout: 5000 });
            } else {
              setTimeout(resolve, 2000);
            }
          });
          if (controller.signal.aborted) break;

          const text = (article.narrative || article.summary || article.title || '').slice(0, 500);
          if (!text) continue;

          await api.post('api/tts/generate', { text, voice_id: voiceId, language: 'en' }, { signal: controller.signal });
          prefetchedIds.add(article.id);
        } catch {
          // Abort or network error — silently skip
        }
      }
    };

    prefetch();
    return () => { controller.abort(); };
  }, [articles, voiceId, limit]);
};
