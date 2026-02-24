const DB_NAME = 'narvo_audio_cache';
const STORE_NAME = 'audio_files';
const DB_VERSION = 2; // Bump version for schema update

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      // Delete old store if exists and recreate with new schema
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'story_id' });
      store.createIndex('cached_at', 'cached_at');
      store.createIndex('type', 'type');
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Download and cache audio file for offline playback
 * @param {string} storyId - Unique identifier
 * @param {string} audioUrl - URL of the audio file
 * @param {object} metadata - Additional metadata (title, source, etc.)
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<boolean>}
 */
export async function downloadAndCacheAudio(storyId, audioUrl, metadata = {}, onProgress = null) {
  try {
    // Fetch audio file with progress tracking
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error('Failed to fetch audio');
    
    const contentLength = response.headers.get('Content-Length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      
      if (onProgress && total > 0) {
        onProgress(Math.round((loaded / total) * 100));
      }
    }
    
    // Create blob from chunks
    const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
    const size = audioBlob.size;
    
    // Store in IndexedDB
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const record = {
      story_id: storyId,
      audioBlob: audioBlob,
      title: metadata.title || `Audio_${storyId}`,
      source: metadata.source || '',
      duration: metadata.duration || '',
      type: metadata.type || 'audio',
      size: size,
      cached_at: new Date().toISOString()
    };
    
    store.put(record);
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Failed to download and cache audio:', e);
    return false;
  }
}

/**
 * Cache audio URL reference (without downloading blob)
 * @deprecated Use downloadAndCacheAudio for offline support
 */
export async function cacheAudio(storyId, audioUrl, metadata = {}) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    store.put({
      story_id: storyId,
      audio_url: audioUrl,
      audioBlob: null,
      title: metadata.title || `Audio_${storyId}`,
      source: metadata.source || '',
      duration: metadata.duration || '',
      type: metadata.type || 'audio',
      size: 0,
      cached_at: new Date().toISOString()
    });
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Failed to cache audio:', e);
    return false;
  }
}

/**
 * Get cached audio (returns blob URL for offline playback)
 */
export async function getCachedAudio(storyId) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(storyId);
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }
        
        // If we have a blob, create an object URL
        if (result.audioBlob) {
          const objectUrl = URL.createObjectURL(result.audioBlob);
          resolve({
            ...result,
            audio_url: objectUrl,
            isOffline: true
          });
        } else if (result.audio_url) {
          resolve({
            ...result,
            isOffline: false
          });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Check if audio is cached for offline use
 */
export async function isAudioCached(storyId) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(storyId);
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.audioBlob ? true : false);
      };
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Remove cached audio
 */
export async function removeCachedAudio(storyId) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(storyId);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Get all cached audio items with metadata
 */
export async function getAllCachedAudio() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const results = request.result || [];
        // Map results to not include the actual blob in the list (for memory efficiency)
        resolve(results.map(item => ({
          id: item.story_id,
          title: item.title,
          source: item.source,
          duration: item.duration,
          type: item.type,
          size: item.size,
          hasBlob: !!item.audioBlob,
          cached_at: item.cached_at,
          status: item.audioBlob ? 'complete' : 'url_only'
        })));
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Get just the IDs of cached items
 */
export async function getAllCachedIds() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAllKeys();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Get total size of cached audio
 */
export async function getCacheStats() {
  try {
    const items = await getAllCachedAudio();
    const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
    const offlineCount = items.filter(item => item.hasBlob).length;
    
    return {
      totalItems: items.length,
      offlineReady: offlineCount,
      totalSize: totalSize,
      formattedSize: formatBytes(totalSize)
    };
  } catch {
    return { totalItems: 0, offlineReady: 0, totalSize: 0, formattedSize: '0 B' };
  }
}

/**
 * Clear all cached audio
 */
export async function clearAllCache() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// Helper function
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
