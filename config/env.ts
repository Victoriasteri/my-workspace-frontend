/**
 * Environment Configuration
 *
 * Centralized environment variable management.
 * Provides type-safe access to environment variables with sensible defaults.
 */

/**
 * Get the API base URL from environment variables.
 *
 * Priority:
 * 1. NEXT_PUBLIC_API_URL (if set)
 * 2. Defaults to http://localhost:3000 for local development
 *
 * For production, set NEXT_PUBLIC_API_URL in your environment variables.
 */
export const getApiBaseUrl = (): string => {
  // In Next.js, environment variables prefixed with NEXT_PUBLIC_ are exposed to the browser
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    return apiUrl;
  }

  // Default to local development URL
  return "http://localhost:3000";
};

/**
 * Current API base URL
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * Environment configuration object
 */
export const env = {
  apiBaseUrl: API_BASE_URL,
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;
