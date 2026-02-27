/**
 * Injects build-time cache version into public/sw.js before build.
 * Reads REACT_APP_BUILD_ID or uses timestamp so each deploy gets a new cache key.
 * Run before react-scripts build (e.g. in package.json "build": "node scripts/set-sw-cache-version.js && react-scripts build").
 */
const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'public', 'sw.js');
let content = fs.readFileSync(swPath, 'utf8');

const version = process.env.REACT_APP_BUILD_ID || `v${Date.now()}`;
const cacheName = `narvo-${version}`;

content = content.replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = '${cacheName}';`);
fs.writeFileSync(swPath, content);
console.log('[Narvo] SW cache name set to:', cacheName);
