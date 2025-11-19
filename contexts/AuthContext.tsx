"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, CreateUserDto } from "@/types/user";
import { authApi } from "@/services/api";

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

const USER_STORAGE_KEY = "user";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to save user to sessionStorage (for quick display before backend verification)
  const saveUser = (userData: User | null) => {
    if (userData) {
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } else {
      sessionStorage.removeItem(USER_STORAGE_KEY);
    }
    setUser(userData);
  };

  // Load user on mount - try backend first, fallback to sessionStorage for quick display
  useEffect(() => {
    const loadUser = async () => {
      // First, try to restore from sessionStorage for immediate display
      try {
        const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData); // Show user immediately
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        sessionStorage.removeItem(USER_STORAGE_KEY);
      }

      // Then verify with backend
      try {
        const profile = await authApi.getMe();
        setUser(profile);
        // Update sessionStorage with fresh data
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      } catch (error: any) {
        // If 401, user is not authenticated
        if (error.response?.status === 401) {
          setUser(null);
          sessionStorage.removeItem(USER_STORAGE_KEY);
        } else {
          // Network error - keep sessionStorage user if exists
          console.error("Error fetching user profile:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for logout events from interceptor
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []); // Only run once on mount

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    saveUser(response.user);
  };

  const register = async (userData: CreateUserDto) => {
    const response = await authApi.register(userData);
    saveUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    saveUser(null);
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
