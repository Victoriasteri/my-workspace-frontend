"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, CreateUserDto } from "@/types/user";
import { authApi } from "@/services/api";
import { useConfig } from "./ConfigContext";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: CreateUserDto) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [skipAutoLoad, setSkipAutoLoad] = useState(false);
  const { config, loading: configLoading } = useConfig();

  // Load user after config is loaded (only once)
  useEffect(() => {
    // Wait for config to be loaded before making API calls
    // Skip if we've already attempted to load or if we're skipping auto-load
    if (configLoading || !config || hasAttemptedLoad || skipAutoLoad) {
      return;
    }

    const loadUser = async () => {
      setHasAttemptedLoad(true);
      try {
        const profile = await authApi.getMe();
        setUser(profile);
      } catch (error: any) {
        // If 401, user is not authenticated
        if (error.response?.status === 401) {
          setUser(null);
        } else {
          // Network error - log it
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for logout events from interceptor
    const handleLogout = () => {
      setUser(null);
      setHasAttemptedLoad(false); // Allow reloading after logout event
      setSkipAutoLoad(true); // Prevent auto-loading immediately after logout
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [configLoading, config, hasAttemptedLoad, skipAutoLoad]); // Run when config is loaded

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.user);
    setHasAttemptedLoad(true); // Mark as loaded after login
    setSkipAutoLoad(false); // Allow normal loading after login
  };

  const register = async (userData: CreateUserDto) => {
    const response = await authApi.register(userData);
    setUser(response.user);
    setHasAttemptedLoad(true); // Mark as loaded after register
    setSkipAutoLoad(false); // Allow normal loading after register
  };

  const logout = async () => {
    // Clear user state immediately and prevent auto-loading
    setUser(null);
    setHasAttemptedLoad(false); // Reset so we can load again if needed
    setSkipAutoLoad(true); // Prevent immediate auto-loading after logout

    // Then call logout API to clear server-side session
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if logout fails, we've cleared local state
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
