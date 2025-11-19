/**
 * Environment Configuration
 *
 * Server-side only configuration. These values are NEVER exposed to the client bundle.
 * The client fetches configuration at runtime from /api/config endpoint.
 */

/**
 * Get the API base URL from server-side environment variables.
 *
 * This function ONLY uses API_URL (without NEXT_PUBLIC_ prefix) which is
 * NOT exposed to the client bundle.
 *
 * Priority:
 * 1. API_URL (server-side only)
 * 2. Defaults to http://localhost:3000 for local development
 *
 * For production, set API_URL in your deployment platform's environment variables.
 */
export const getServerApiBaseUrl = (): string => {
  const apiUrl = process.env.API_URL;

  // In production, require explicit API URL
  if (process.env.NODE_ENV === "production") {
    if (!apiUrl) {
      throw new Error(
        "API_URL must be set in production. Please configure it in your deployment platform's environment variables."
      );
    }

    // Prevent localhost URLs in production
    if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
      throw new Error(
        `Security Error: Cannot use localhost URL in production. Please set API_URL to your production API URL.`
      );
    }

    return apiUrl;
  }

  // Development: use API_URL if set, otherwise default to localhost
  return apiUrl || "http://localhost:3000";
};
