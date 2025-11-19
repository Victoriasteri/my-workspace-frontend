/**
 * Environment Configuration
 *
 * Centralized environment variable management.
 * Provides type-safe access to environment variables with sensible defaults.
 *
 * IMPORTANT: Use getServerApiBaseUrl() for server-side code (API routes, SSR).
 * Use ConfigContext for client-side code to get the API URL at runtime.
 */

/**
 * Get the API base URL from server-side environment variables.
 *
 * This function uses API_URL (without NEXT_PUBLIC_ prefix) which is NOT
 * exposed to the client bundle, making it more secure.
 *
 * Priority:
 * 1. API_URL (server-side only, not in client bundle)
 * 2. NEXT_PUBLIC_API_URL (fallback for backwards compatibility)
 * 3. Defaults to http://localhost:3000 for local development
 *
 * For production, set API_URL in your deployment platform's environment variables.
 * Using localhost in production is a security risk and will be prevented.
 */
export const getServerApiBaseUrl = (): string => {
  const isProduction = process.env.NODE_ENV === "production";

  // Prefer API_URL (server-side only, not exposed to client)
  // Fallback to NEXT_PUBLIC_API_URL for backwards compatibility
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  // In production, require explicit API URL (no localhost allowed)
  if (isProduction) {
    if (!apiUrl) {
      throw new Error(
        "API_URL must be set in production. Please configure it in your deployment platform's environment variables."
      );
    }

    // Prevent localhost URLs in production (security risk)
    if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
      throw new Error(
        `Security Error: Cannot use localhost URL (${apiUrl}) in production. Please set API_URL to your production API URL.`
      );
    }

    return apiUrl;
  }

  // Development: use provided URL or default to localhost
  return apiUrl || "http://localhost:3000";
};

/**
 * Get the API base URL from environment variables (client-side compatible).
 *
 * @deprecated Use ConfigContext for client-side code instead.
 * This is kept for backwards compatibility but will use NEXT_PUBLIC_ prefix.
 */
export const getApiBaseUrl = (): string => {
  const isProduction = process.env.NODE_ENV === "production";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // In production, require explicit API URL (no localhost allowed)
  if (isProduction) {
    if (!apiUrl) {
      throw new Error(
        "NEXT_PUBLIC_API_URL must be set in production. Please configure it in your deployment platform's environment variables."
      );
    }

    // Prevent localhost URLs in production (security risk)
    if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
      throw new Error(
        `Security Error: Cannot use localhost URL (${apiUrl}) in production. Please set NEXT_PUBLIC_API_URL to your production API URL.`
      );
    }

    return apiUrl;
  }

  // Development: use provided URL or default to localhost
  return apiUrl || "http://localhost:3000";
};

/**
 * Environment configuration object
 */
export const env = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;
