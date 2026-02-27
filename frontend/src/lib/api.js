/**
 * Central API client for backend calls.
 * Single source for REACT_APP_BACKEND_URL; use api.get / api.post instead of raw fetch.
 */

import logger from './logger';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

if (typeof window !== 'undefined' && !API_BASE && process.env.NODE_ENV === 'development') {
  logger.warn('[api] REACT_APP_BACKEND_URL is not set; backend requests will fail or target relative URLs.');
}

/**
 * GET request to the backend. Returns the fetch Response (caller should check res.ok and res.json()).
 * @param {string} path - Path without leading slash, e.g. 'api/health' or 'api/settings/123'
 * @param {RequestInit} [options] - Optional fetch options (headers, etc.)
 * @returns {Promise<Response>}
 */
export function get(path) {
  const url = path.startsWith('http') ? path : `${API_BASE}/${path.replace(/^\//, '')}`;
  return fetch(url);
}

/**
 * POST request with JSON body. Returns the fetch Response.
 * @param {string} path - Path without leading slash
 * @param {object} body - Object to send as JSON
 * @param {RequestInit} [options] - Optional fetch options (merged with Content-Type and body)
 * @returns {Promise<Response>}
 */
export function post(path, body, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}/${path.replace(/^\//, '')}`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * DELETE request. Returns the fetch Response.
 * @param {string} path - Path without leading slash (query string allowed)
 * @returns {Promise<Response>}
 */
export function del(path) {
  const url = path.startsWith('http') ? path : `${API_BASE}/${path.replace(/^\//, '')}`;
  return fetch(url, { method: 'DELETE' });
}

/** Base URL for the backend (no trailing slash). Use for building share/og URLs. */
export { API_BASE };
