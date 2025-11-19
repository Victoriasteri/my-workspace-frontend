"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, CreateUserDto } from "@/types/user";
import { authApi, getAuthToken, setAuthToken } from "@/services/api";

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

  useEffect(() => {
    const loadUser = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
        } catch (error) {
          console.error("Error loading user profile:", error);
          // Token might be invalid, clear it
          setAuthToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();

    // Listen for storage changes (e.g., when token is cleared by interceptor)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token" && !e.newValue) {
        // Token was removed, clear user state
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // Only run once on mount

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.user);
  };

  const register = async (userData: CreateUserDto) => {
    const response = await authApi.register(userData);
    setUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
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
