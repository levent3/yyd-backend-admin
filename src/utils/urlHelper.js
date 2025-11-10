/**
 * URL Helper Functions
 *
 * Centralized URL building to avoid hard-coded localhost fallbacks
 */

/**
 * Get base URL from environment
 * Throws error if BASE_URL is not set to prevent production issues
 *
 * @returns {string} Base URL
 * @throws {Error} If BASE_URL environment variable is not set
 */
function getBaseUrl() {
  const baseUrl = process.env.BASE_URL;

  if (!baseUrl) {
    throw new Error(
      'BASE_URL environment variable is not set. ' +
      'Please set it in your .env file (e.g., BASE_URL=http://localhost:5001 or https://api.yourdomain.com)'
    );
  }

  // Remove trailing slash if present
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

/**
 * Build full URL for uploaded files
 *
 * @param {string} path - Relative path (e.g., '/uploads/image.jpg')
 * @returns {string} Full URL
 */
function buildFileUrl(path) {
  const baseUrl = getBaseUrl();

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

module.exports = {
  getBaseUrl,
  buildFileUrl,
};
