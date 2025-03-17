// Utility functions for handling paths in the application

/**
 * Get the base URL from Vite's configuration
 * This is used to prefix absolute paths when deployed to a subdomain
 * @returns {string} The base URL
 */
export function getBaseUrl() {
  // In development, this will be '/youtube/'
  // In production, this will also be '/youtube/' as configured in vite.config.js
  return import.meta.env.BASE_URL || '/';
}

/**
 * Prepend the base URL to an absolute path
 * @param {string} path - The absolute path (starting with '/')
 * @returns {string} The path with the base URL prepended
 */
export function getAssetUrl(path) {
  if (!path) return '';
  
  // If the path is already a full URL (starts with http:// or https://), return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If the path is already relative (doesn't start with /), return it as is
  if (!path.startsWith('/')) {
    return path;
  }
  
  // Get the base URL (e.g., '/youtube/')
  const baseUrl = getBaseUrl();
  
  // Remove the leading slash from the path if the baseUrl ends with a slash
  const normalizedPath = path.startsWith('/') && baseUrl.endsWith('/') 
    ? path.substring(1) 
    : path;
  
  // Combine the base URL with the path
  return `${baseUrl}${normalizedPath}`;
}