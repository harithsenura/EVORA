/**
 * Dynamically determines the API Base URL based on the environment.
 * If running on localhost, it uses the local backend on port 9700.
 * Otherwise, it uses the production backend on Railway.
 */
export const getApiBaseUrl = () => {
  // 1. Priority: Explicit environment variable (Works on both SSR and Client)
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 2. Browser detection (Client-side only)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:9700';
    }
  }

  // 3. Fallback for production if no env var is set
  return 'https://evorabackend-production.up.railway.app';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Ensures an image path is a full URL.
 * If the path is relative, it prepends the API_BASE_URL.
 */
export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith('http')) return path;

  // Clean up the base URL and path to avoid double slashes
  const base = API_BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${cleanPath}`;
};
