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
 * ConfigProvider
 *
 * Fetches API configuration from the internal /api/config endpoint at runtime.
 * This ensures the API URL is never embedded in the client bundle.
 *
 * Once config is loaded, initializes the global axios instance.
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

        // Initialize global axios instance with the fetched API URL
        initializeApiClient(data.apiBaseUrl);

        setConfig(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load configuration";
        console.error("Error fetching config:", err);
        setError(new Error(errorMessage));
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
 */
export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
