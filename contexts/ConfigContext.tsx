"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApiClient } from "@/services/api";

interface Config {
  apiBaseUrl: string;
}

interface ConfigContextType {
  config: Config | null;
  loading: boolean;
  error: Error | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: React.ReactNode;
}

/**
 * ConfigProvider fetches the API configuration from the internal Next.js API endpoint.
 *
 * This keeps the API URL server-side only and fetches it at runtime,
 * preventing it from being exposed in the client bundle.
 *
 * Once the config is loaded, it initializes the API client with the correct base URL.
 */
export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");

        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.statusText}`);
        }

        const data = await response.json();
        setConfig(data);

        // Initialize the API client with the fetched base URL
        initializeApiClient(data.apiBaseUrl);
      } catch (err) {
        console.error("Error fetching config:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to load configuration")
        );

        // Fallback to localhost for development if config fetch fails
        const fallbackUrl = "http://localhost:3000";
        if (process.env.NODE_ENV === "development") {
          setConfig({ apiBaseUrl: fallbackUrl });
          initializeApiClient(fallbackUrl);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * Hook to access the configuration context.
 *
 * @throws Error if used outside of ConfigProvider
 */
export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
