const raw = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

// Empty by default -> all API calls go to the same origin as the client
// (in development the Vite server proxies /api to the backend on 5001).
// Set VITE_API_URL to the public backend origin for separated deployments,
// e.g. https://api.example.com
export const API_BASE_URL = raw;